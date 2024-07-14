import { utapi } from "@/app/api/uploadthing/core";
import { ROLES, TOKENS } from "@/config/const";
import { generateAccessToken, generateAuthToken } from "@/lib/jwt";
import {
    addAuthTokenToCache,
    getPreferences,
    removeAuthTokenFromCache,
    updateAuthTokenInCache,
} from "@/lib/redis/methods";
import { signinSchema, userClientSchema } from "@/lib/validation";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { and, eq, sql } from "drizzle-orm";
import { withCursorPagination } from "drizzle-pagination";
import { cookies } from "next/headers";
import { z } from "zod";
import {
    adminOnlyProcedure,
    createTRPCRouter,
    protectedProcedure,
    protectedProcedureWithAccessToken,
    publicProcedure,
} from "../trpc";

export const userRouter = createTRPCRouter({
    getUser: publicProcedure
        .input(z.object({ id: z.string() }))
        .use(async ({ input, ctx, next }) => {
            const { id } = input;
            const { db, users } = ctx;

            const user = await db.query.users.findFirst({
                where: eq(users.id, id),
            });
            if (!user)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });

            return next({
                ctx: {
                    ...ctx,
                    user: {
                        ...user,
                        password: undefined,
                    },
                },
            });
        })
        .query(async ({ ctx }) => {
            const { user } = ctx;
            return user;
        }),
    getUsersCount: protectedProcedure.query(async ({ ctx }) => {
        const { db, users } = ctx;

        const usersCount = await db
            .select({
                count: sql`COUNT(*)`,
            })
            .from(users);

        return Number(usersCount[0].count);
    }),
    getInfiniteUsers: protectedProcedure
        .input(
            z.object({
                cursor: z.string().nullish(),
                limit: z.number().min(1).max(50).default(10),
            })
        )
        .query(async ({ input, ctx }) => {
            const { cursor, limit } = input;
            const { db, users } = ctx;

            const data = await db.query.users.findMany(
                withCursorPagination({
                    limit,
                    cursors: [
                        [
                            users.createdAt,
                            "desc",
                            cursor ? new Date(cursor) : undefined,
                        ],
                    ],
                })
            );

            if (!data.length) return { users: [], nextCursor: null };

            const filteredData = userClientSchema
                .pick({
                    id: true,
                    username: true,
                    role: true,
                    isRestricted: true,
                    createdAt: true,
                })
                .array()
                .parse(data);

            return {
                data: filteredData.length ? filteredData : [],
                nextCursor: filteredData.length
                    ? filteredData[
                          filteredData.length - 1
                      ].createdAt.toISOString()
                    : null,
            };
        }),
    authenticateUser: publicProcedure
        .input(signinSchema)
        .use(async ({ ctx, next }) => {
            const preferences = await getPreferences();
            if (preferences && !preferences.isAuthEnabled)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "We are currently not accepting new users, try again later",
                });

            return next({ ctx });
        })
        .use(async ({ input, ctx, next }) => {
            const { username } = input;
            const { db, users } = ctx;

            const dbUser = await db.query.users.findFirst({
                where: and(eq(users.username, username)),
            });

            return next({
                ctx: {
                    ...ctx,
                    dbUser,
                },
            });
        })
        .use(async ({ input, ctx, next }) => {
            const { dbUser } = ctx;
            const { password } = input;

            if (!dbUser)
                return next({
                    ctx,
                });

            const isPasswordValid = await bcrypt.compare(
                password,
                dbUser.password
            );
            if (!isPasswordValid)
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid password",
                });

            return next({
                ctx: {
                    ...ctx,
                    dbUser,
                },
            });
        })
        .mutation(async ({ ctx, input }) => {
            const { username, password } = input;
            const { db, users, dbUser } = ctx;

            const cookieStore = cookies();

            if (dbUser) {
                const updatedUser = (
                    await db
                        .update(users)
                        .set({
                            isFirstTime: false,
                        })
                        .where(eq(users.id, dbUser.id))
                        .returning()
                )[0];

                const authToken = await generateAuthToken(updatedUser.id);
                const accessToken = await generateAccessToken(updatedUser.id);

                await updateAuthTokenInCache(authToken, updatedUser.id);

                cookieStore.set(TOKENS.AUTH_COOKIE_NAME, authToken, {
                    httpOnly: true,
                    sameSite: "strict",
                    path: "/",
                });

                cookieStore.set(TOKENS.ACCESS_COOKIE_NAME, accessToken, {
                    httpOnly: true,
                    sameSite: "strict",
                    path: "/",
                });

                return {
                    user: {
                        ...updatedUser,
                        password: undefined,
                    },
                };
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newDbUser = (
                await db
                    .insert(users)
                    .values({
                        username,
                        password: hashedPassword,
                        isFirstTime: true,
                    })
                    .returning()
            )[0];

            const authToken = await generateAuthToken(newDbUser.id);
            const accessToken = await generateAccessToken(newDbUser.id);

            await addAuthTokenToCache(authToken, newDbUser.id);

            cookieStore.set(TOKENS.AUTH_COOKIE_NAME, authToken, {
                httpOnly: true,
                sameSite: "strict",
                path: "/",
            });

            cookieStore.set(TOKENS.ACCESS_COOKIE_NAME, accessToken, {
                httpOnly: true,
                sameSite: "strict",
                path: "/",
            });

            return {
                user: {
                    ...newDbUser,
                    password: undefined,
                },
            };
        }),
    signOutUser: protectedProcedureWithAccessToken.mutation(async ({ ctx }) => {
        const { user } = ctx;

        await removeAuthTokenFromCache(user.id);
        const cookieStore = cookies();

        // eslint-disable-next-line drizzle/enforce-delete-with-where
        cookieStore.delete(TOKENS.AUTH_COOKIE_NAME);
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        cookieStore.delete(TOKENS.ACCESS_COOKIE_NAME);
    }),
    updateUsername: protectedProcedureWithAccessToken
        .input(
            z.object({
                username: signinSchema.shape.username,
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { username } = input;
            const { db, users, user } = ctx;

            const updatedUser = (
                await db
                    .update(users)
                    .set({
                        username,
                    })
                    .where(eq(users.id, user.id))
                    .returning()
            )[0];

            return {
                user: {
                    ...updatedUser,
                    password: undefined,
                },
            };
        }),
    updatePassword: protectedProcedureWithAccessToken
        .input(
            z
                .object({
                    currentPassword: signinSchema.shape.password,
                    newPassword: signinSchema.shape.password,
                    confirmPassword: signinSchema.shape.password,
                })
                .refine((data) => data.newPassword === data.confirmPassword, {
                    message: "Passwords do not match",
                    path: ["confirmPassword"],
                })
                .refine((data) => data.currentPassword !== data.newPassword, {
                    message:
                        "New password must be different from the current password",
                    path: ["newPassword"],
                })
        )
        .use(async ({ input, ctx, next }) => {
            const { currentPassword } = input;
            const { user } = ctx;

            const isPasswordValid = await bcrypt.compare(
                currentPassword,
                user.password
            );
            if (!isPasswordValid)
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid password",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input, ctx }) => {
            const { newPassword } = input;
            const { db, users, user } = ctx;

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updatedUser = (
                await db
                    .update(users)
                    .set({
                        password: hashedPassword,
                    })
                    .where(eq(users.id, user.id))
                    .returning()
            )[0];

            return {
                user: {
                    ...updatedUser,
                    password: undefined,
                },
            };
        }),
    deleteUser: protectedProcedureWithAccessToken.mutation(async ({ ctx }) => {
        const { db, users, posts, user } = ctx;

        const postsData = await db.query.posts.findMany({
            where: eq(posts.authorId, user.id),
        });

        if (postsData.length)
            await Promise.all(
                postsData.map(async (post) => {
                    if (post.attachments.length) {
                        await utapi.deleteFiles(
                            post.attachments
                                .filter(
                                    (attachment) => attachment?.type !== "text"
                                )
                                .map((attachment) => attachment!.id)
                        );
                    }
                })
            );

        await db.delete(users).where(eq(users.id, user.id));
        await db.delete(posts).where(eq(posts.authorId, user.id));
        await removeAuthTokenFromCache(user.id);

        const cookieStore = cookies();

        // eslint-disable-next-line drizzle/enforce-delete-with-where
        cookieStore.delete(TOKENS.AUTH_COOKIE_NAME);
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        cookieStore.delete(TOKENS.ACCESS_COOKIE_NAME);
    }),
    currentUser: protectedProcedure.query(async ({ ctx }) => {
        const { user } = ctx;

        return {
            user: {
                ...user,
                password: undefined,
            },
        };
    }),
    updateUserRole: adminOnlyProcedure
        .input(
            z.object({
                id: z.string(),
                role: z.nativeEnum(ROLES),
            })
        )
        .use(async ({ input, ctx, next }) => {
            const { id } = input;
            const { db, users } = ctx;

            const existingUser = await db.query.users.findFirst({
                where: eq(users.id, id),
            });
            if (!existingUser)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });

            return next({
                ctx: {
                    ...ctx,
                    existingUser,
                },
            });
        })
        .mutation(async ({ ctx, input }) => {
            const { id, role } = input;
            const { db, users } = ctx;

            const updatedUser = (
                await db
                    .update(users)
                    .set({
                        role,
                    })
                    .where(eq(users.id, id))
                    .returning()
            )[0];

            return {
                user: {
                    ...updatedUser,
                    password: undefined,
                },
            };
        }),
    manageUserRestriction: adminOnlyProcedure
        .input(
            z.object({
                id: z.string(),
                isRestricted: z.boolean(),
            })
        )
        .use(async ({ input, ctx, next }) => {
            const { id } = input;
            const { db, users } = ctx;

            const existingUser = await db.query.users.findFirst({
                where: eq(users.id, id),
            });
            if (!existingUser)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });

            if (existingUser.role === ROLES.ADMIN)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Cannot restrict an admin",
                });

            if (existingUser.isRestricted === input.isRestricted)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `User is already ${
                        input.isRestricted ? "restricted" : "unrestricted"
                    }`,
                });

            return next({
                ctx: {
                    ...ctx,
                    existingUser,
                },
            });
        })
        .mutation(async ({ ctx, input }) => {
            const { id, isRestricted } = input;
            const { db, users } = ctx;

            const updatedUser = (
                await db
                    .update(users)
                    .set({
                        isRestricted,
                    })
                    .where(eq(users.id, id))
                    .returning()
            )[0];

            return {
                user: {
                    ...updatedUser,
                    password: undefined,
                },
            };
        }),
    deleteUserById: adminOnlyProcedure
        .input(z.object({ id: z.string() }))
        .use(async ({ input, ctx, next }) => {
            const { id } = input;
            const { db, users } = ctx;

            const existingUser = await db.query.users.findFirst({
                where: eq(users.id, id),
            });
            if (!existingUser)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });

            if (existingUser.role === ROLES.ADMIN)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Cannot delete an admin",
                });

            return next({
                ctx: {
                    ...ctx,
                    existingUser,
                },
            });
        })
        .mutation(async ({ ctx }) => {
            const { db, users, posts, existingUser } = ctx;

            const postsData = await db.query.posts.findMany({
                where: eq(posts.authorId, existingUser.id),
            });

            if (postsData.length)
                await Promise.all(
                    postsData.map(async (post) => {
                        if (post.attachments.length) {
                            await utapi.deleteFiles(
                                post.attachments
                                    .filter(
                                        (attachment) =>
                                            attachment?.type !== "text"
                                    )
                                    .map((attachment) => attachment!.id)
                            );
                        }
                    })
                );

            await db.delete(users).where(eq(users.id, existingUser.id));
            await db.delete(posts).where(eq(posts.authorId, existingUser.id));
            await removeAuthTokenFromCache(existingUser.id);
        }),
});
