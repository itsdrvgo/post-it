import { utapi } from "@/app/api/uploadthing/core";
import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";
import { withCursorPagination } from "drizzle-pagination";
import { z } from "zod";
import { insertPostSchema, selectPostSchema } from "../../drizzle/schema";
import {
    postAttachmentSchema,
    postMetadataSchema,
} from "../../validation/post";
import {
    createTRPCRouter,
    protectedProcedure,
    protectedProcedureWithAccessToken,
} from "../trpc";

const postUpdateSchema = selectPostSchema.omit({
    createdAt: true,
    updatedAt: true,
    authorId: true,
});

export const postRouter = createTRPCRouter({
    getPost: protectedProcedure
        .input(z.object({ id: z.string() }))
        .use(async ({ input, ctx, next }) => {
            const { id } = input;
            const { db, posts } = ctx;

            const post = await db.query.posts.findFirst({
                where: eq(posts.id, id),
            });

            if (!post)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                });

            return next({
                ctx: {
                    ...ctx,
                    post,
                },
            });
        })
        .query(async ({ ctx }) => {
            const { post } = ctx;
            return post;
        }),
    getInfinitePosts: protectedProcedure
        .input(
            z.object({
                userId: z.string().optional(),
                cursor: z.string().nullish(),
                limit: z.number().min(1).max(50).default(10),
            })
        )
        .query(async ({ input, ctx }) => {
            const { cursor, limit, userId } = input;
            const { db, posts, users } = ctx;

            const data = await db.query.posts.findMany(
                withCursorPagination({
                    where: userId ? eq(posts.authorId, userId) : undefined,
                    limit,
                    cursors: [
                        [
                            posts.createdAt,
                            "desc",
                            cursor ? new Date(cursor) : undefined,
                        ],
                    ],
                })
            );

            if (!data.length) return { data: [], nextCursor: null };

            const authors = await db
                .select({
                    id: users.id,
                    username: users.username,
                    isFirstTime: users.isFirstTime,
                    createdAt: users.createdAt,
                })
                .from(users)
                .where(
                    inArray(
                        users.id,
                        data.map((post) => post.authorId)
                    )
                );

            return {
                data: data.length
                    ? data.map((post) => ({
                          ...post,
                          author: authors.find(
                              (author) => author.id === post.authorId
                          )!,
                      }))
                    : [],
                nextCursor: data.length
                    ? data[data.length - 1].createdAt.toISOString()
                    : null,
            };
        }),
    createPost: protectedProcedureWithAccessToken
        .input(
            z.object({
                ...insertPostSchema.shape,
                attachments: z.array(postAttachmentSchema),
                metadata: postMetadataSchema,
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { db, posts } = ctx;
            await db.insert(posts).values(input);
        }),
    deletePost: protectedProcedureWithAccessToken
        .input(z.object({ id: z.string() }))
        .use(async ({ input, ctx, next }) => {
            const { id } = input;
            const { db, posts } = ctx;

            const post = await db.query.posts.findFirst({
                where: eq(posts.id, id),
            });

            if (!post)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                });

            return next({
                ctx: {
                    ...ctx,
                    post,
                },
            });
        })
        .mutation(async ({ input, ctx }) => {
            const { id } = input;
            const { db, posts, post } = ctx;

            if (post.attachments.length) {
                await utapi.deleteFiles(
                    post.attachments
                        .filter((attachment) => attachment?.type !== "text")
                        .map((attachment) => attachment!.id)
                );
            }

            await db.delete(posts).where(eq(posts.id, id));
        }),
    updatePost: protectedProcedureWithAccessToken
        .input(
            z.object({
                ...postUpdateSchema.shape,
                attachments: z.array(postAttachmentSchema),
                metadata: postMetadataSchema,
            })
        )
        .use(async ({ input, ctx, next }) => {
            const { id } = input;
            const { db, posts } = ctx;

            const post = await db.query.posts.findFirst({
                where: eq(posts.id, id),
            });

            if (!post)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input, ctx }) => {
            const { id, ...rest } = input;
            const { db, posts } = ctx;

            await db.update(posts).set(rest).where(eq(posts.id, id));
        }),
});
