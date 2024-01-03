import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
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
    createUser: publicProcedure
        .input(z.object(userCreateSchema.shape))
        .use(async ({ input, ctx, next }) => {
            const { username } = input;
            const { db, users } = ctx;

            const user = await db.query.users.findFirst({
                where: eq(users.username, username),
            });

            if (user)
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "User already exists",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input, ctx }) => {
            const { username } = input;
            const { db, users } = ctx;

            await db.insert(users).values({
                username,
            });

            const user = await db.query.users.findFirst({
                where: eq(users.username, username),
            });

            return {
                user,
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
            const { db, users } = ctx;

            await db.delete(users).where(eq(users.id, id));

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
