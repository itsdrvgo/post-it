import { POST_STATUS, ROLES } from "@/config/const";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import {
    boolean,
    index,
    json,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { generateId } from "../utils";
import { PostAttachment, PostMetadata } from "../validation/post";

// SCHEMAS

export const users = pgTable(
    "post_it__users",
    {
        id: text("id")
            .primaryKey()
            .notNull()
            .$defaultFn(() => generateId()),
        username: text("username").notNull().unique(),
        password: text("password").notNull(),
        isFirstTime: boolean("is_first_time").notNull().default(true),
        role: text("role").$type<ROLES>().notNull().default(ROLES.USER),
        isRestricted: boolean("is_restricted").notNull().default(false),
        createdAt: timestamp("created_at").notNull().defaultNow(),
    },
    (table) => {
        return {
            usernameIdx: uniqueIndex("username_idx").on(table.username),
        };
    }
);

export const posts = pgTable(
    "post_it__posts",
    {
        id: text("id")
            .primaryKey()
            .notNull()
            .$defaultFn(() => generateId()),
        content: text("content").notNull(),
        metadata: json("metadata").$type<PostMetadata>().default(null),
        attachments: json("attachments")
            .$type<PostAttachment[]>()
            .default([])
            .notNull(),
        status: text("status")
            .$type<POST_STATUS>()
            .notNull()
            .default(POST_STATUS.PENDING),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        authorId: text("author_id").notNull(),
    },
    (table) => {
        return {
            authorIdIdx: index("author_id_idx").on(table.authorId),
            createdAtIdx: index("created_at_idx").on(table.createdAt),
        };
    }
);

// RELATIONS

export const userRelations = relations(users, ({ many }) => ({
    posts: many(posts),
}));

export const postRelations = relations(posts, ({ one }) => ({
    author: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
}));

// TYPES

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

// ZOD SCHEMA

export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users);

export const selectPostSchema = createSelectSchema(posts);
export const insertPostSchema = createInsertSchema(posts);
