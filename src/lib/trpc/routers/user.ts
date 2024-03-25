import { utapi } from "@/app/api/uploadthing/core";
import { TOKENS } from "@/config/const";
import { generateAccessToken, generateAuthToken } from "@/lib/jwt";
import {
    addAuthTokenToCache,
    removeAuthTokenFromCache,
    updateAuthTokenInCache,
} from "@/lib/redis/methods/token";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { insertUserSchema } from "../../drizzle/schema";
import {
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
    authenticateUser: publicProcedure
        .input(insertUserSchema)
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
});
