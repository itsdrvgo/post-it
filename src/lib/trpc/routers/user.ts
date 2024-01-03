import { utapi } from "@/src/app/api/uploadthing/core";
import { TRPCError } from "@trpc/server";
import { compareSync, hashSync } from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { insertUserSchema, selectUserSchema } from "../../drizzle/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

const userCreateSchema = insertUserSchema.omit({
    id: true,
    createdAt: true,
});

const userUpdateSchema = selectUserSchema.omit({
    createdAt: true,
});

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
                    user,
                },
            });
        })
        .query(async ({ ctx }) => {
            const { user } = ctx;
            return user;
        }),
    authenticateUser: publicProcedure
        .input(z.object(userCreateSchema.shape))
        .use(async ({ input, ctx, next }) => {
            const { username } = input;
            const { db, users } = ctx;

            const user = await db.query.users.findFirst({
                where: and(eq(users.username, username)),
            });

            return next({
                ctx: {
                    ...ctx,
                    user,
                },
            });
        })
        .mutation(async ({ ctx, input }) => {
            const { username, password } = input;
            const { db, users } = ctx;

            if (ctx.user) {
                const isPasswordValid = compareSync(
                    password,
                    ctx.user.password
                );

                if (!isPasswordValid)
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "Invalid password",
                    });

                return {
                    user: ctx.user,
                    firstTimeLogin: false,
                };
            }

            const hashedPassword = hashSync(password);

            await db.insert(users).values({
                username,
                password: hashedPassword,
            });

            const user = await db.query.users.findFirst({
                where: and(
                    eq(users.username, username),
                    eq(users.password, hashedPassword)
                ),
            });

            return {
                user,
                firstTimeLogin: true,
            };
        }),
    deleteUser: publicProcedure
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
                ctx,
            });
        })
        .mutation(async ({ input, ctx }) => {
            const { id } = input;
            const { db, users, posts } = ctx;

            const postsData = await db.query.posts.findMany({
                where: eq(posts.authorId, id),
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

            await db.delete(users).where(eq(users.id, id));
            await db.delete(posts).where(eq(posts.authorId, id));

            return {
                success: true,
            };
        }),
    updateUser: publicProcedure
        .input(z.object(userUpdateSchema.shape))
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
                ctx,
            });
        })
        .mutation(async ({ input, ctx }) => {
            const { id, username } = input;
            const { db, users } = ctx;

            await db
                .update(users)
                .set({
                    username,
                })
                .where(eq(users.id, id));

            return {
                success: true,
            };
        }),
});
