import { utapi } from "@/src/app/api/uploadthing/core";
import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";
import { withCursorPagination } from "drizzle-pagination";
import { z } from "zod";
import { insertPostSchema, selectPostSchema } from "../../drizzle/schema";
import {
    postAttachmentSchema,
    postMetadataSchema,
} from "../../validation/post";
import { createTRPCRouter, publicProcedure } from "../trpc";

const postCreateSchema = insertPostSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

const postUpdateSchema = selectPostSchema.omit({
    createdAt: true,
    updatedAt: true,
    authorId: true,
});

export const postRouter = createTRPCRouter({
    getPost: publicProcedure
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
    getInfinitePosts: publicProcedure
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
                .select()
                .from(users)
                .where(
                    inArray(
                        users.id,
                        data.map((post) => post.authorId)
                    )
                );

            const parsedAuthors = authors.map((author) => ({
                ...author,
                password: undefined,
            }));

            return {
                data: data.length
                    ? data.map((post) => ({
                          ...post,
                          author: parsedAuthors.find(
                              (author) => author.id === post.authorId
                          )!,
                      }))
                    : [],
                nextCursor: data.length
                    ? data[data.length - 1].createdAt.toISOString()
                    : null,
            };
        }),
    createPost: publicProcedure
        .input(
            z.object({
                ...postCreateSchema.shape,
                attachments: z.array(postAttachmentSchema),
                metadata: postMetadataSchema,
            })
        )
        .use(async ({ input, ctx, next }) => {
            const { authorId } = input;
            const { db, users } = ctx;

            const user = await db.query.users.findFirst({
                where: eq(users.id, authorId),
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
            const { db, posts } = ctx;

            await db.insert(posts).values(input);

            return {
                success: true,
            };
        }),
    deletePost: publicProcedure
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

            return {
                success: true,
            };
        }),
    updatePost: publicProcedure
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

            return {
                success: true,
            };
        }),
});
