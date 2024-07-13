import { utapi } from "@/app/api/uploadthing/core";
import { POST_STATUS, ROLES } from "@/config/const";
import { checkProfanity } from "@/lib/profanity";
import { getPreferences } from "@/lib/redis/methods";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, or, sql } from "drizzle-orm";
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
    attachments: true,
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
    getPostCount: protectedProcedure
        .input(z.object({ authorId: z.string() }))
        .query(async ({ input, ctx }) => {
            const { authorId } = input;
            const { db, posts } = ctx;

            const data = await db
                .select({
                    count: sql`COUNT(*)`,
                })
                .from(posts)
                .where(eq(posts.authorId, authorId));

            return Number(data[0].count);
        }),
    getInfinitePosts: protectedProcedure
        .input(
            z.object({
                cursor: z.string().nullish(),
                limit: z.number().min(1).max(50).default(10),
                status: z.nativeEnum(POST_STATUS).optional(),
                userId: z.string().optional(),
            })
        )
        .query(async ({ input, ctx }) => {
            const { cursor, limit, userId, status } = input;
            const { db, posts, users } = ctx;

            const data = await db.query.posts.findMany(
                withCursorPagination({
                    where: or(
                        userId
                            ? eq(posts.authorId, userId)
                            : status
                              ? eq(posts.status, status)
                              : undefined,
                        userId && status
                            ? and(
                                  eq(posts.authorId, userId),
                                  eq(posts.status, status)
                              )
                            : undefined
                    ),
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
                    role: users.role,
                    isFirstTime: users.isFirstTime,
                    isRestricted: users.isRestricted,
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
        .use(async ({ ctx, next }) => {
            const preferences = await getPreferences();
            if (preferences && !preferences.isPostCreateEnabled)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "Post creation is disabled by the administrator. Please try again later.",
                });

            return next({ ctx });
        })
        .mutation(async ({ input, ctx }) => {
            const { db, posts } = ctx;

            const profaneState = await checkProfanity(input.content);
            if (profaneState === POST_STATUS.REJECTED)
                throw new TRPCError({
                    code: "UNPROCESSABLE_CONTENT",
                    message: "Post contains profanity and cannot be submitted",
                });

            await db.insert(posts).values({
                ...input,
                status: profaneState,
            });
        }),
    updatePost: protectedProcedureWithAccessToken
        .input(
            z
                .object({
                    ...postUpdateSchema.shape,
                    metadata: postMetadataSchema,
                })
                .partial()
                .merge(z.object({ id: z.string() }))
        )
        .use(async ({ input, ctx, next }) => {
            const { id } = input;
            const { db, posts, user } = ctx;

            const post = await db.query.posts.findFirst({
                where:
                    user.role === ROLES.USER
                        ? and(eq(posts.id, id), eq(posts.authorId, user.id))
                        : eq(posts.id, id),
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
            const { id, status, ...rest } = input;
            const { db, posts } = ctx;

            await db
                .update(posts)
                .set({
                    ...rest,
                    status: status as POST_STATUS,
                })
                .where(eq(posts.id, id));
        }),
    massUpdatePosts: protectedProcedureWithAccessToken
        .input(
            z.object({
                status: z.nativeEnum(POST_STATUS),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { status } = input;
            const { db, posts } = ctx;

            await db
                .update(posts)
                .set({
                    status,
                })
                .where(inArray(posts.status, [POST_STATUS.PENDING]));
        }),
    deletePost: protectedProcedureWithAccessToken
        .input(z.object({ id: z.string() }))
        .use(async ({ input, ctx, next }) => {
            const { id } = input;
            const { db, posts, user } = ctx;

            const post = await db.query.posts.findFirst({
                where:
                    user.role === ROLES.USER
                        ? and(eq(posts.id, id), eq(posts.authorId, user.id))
                        : eq(posts.id, id),
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
    massDeletePosts: protectedProcedureWithAccessToken.mutation(
        async ({ ctx }) => {
            const { db, posts } = ctx;

            const data = await db.query.posts.findMany({
                where: inArray(posts.status, [POST_STATUS.PENDING]),
            });
            if (!data.length)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Posts not found",
                });

            const attachments = data.flatMap((post) =>
                post.attachments
                    .filter((attachment) => attachment?.type !== "text")
                    .map((attachment) => attachment!.id)
            );

            if (attachments.length) await utapi.deleteFiles(attachments);

            await db
                .delete(posts)
                .where(inArray(posts.status, [POST_STATUS.PENDING]));
        }
    ),
});
