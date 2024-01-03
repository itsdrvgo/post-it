import { init } from "@paralleldrive/cuid2";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import {
    json,
    mysqlTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { PostAttachment, PostMetadata } from "../validation/post";

const createId = init({
    length: 25,
});

// SCHEMAS

export const users = mysqlTable("post_it__users", {
    id: varchar("id", { length: 25 })
        .primaryKey()
        .notNull()
        .$defaultFn(() => createId()),
    username: varchar("username", { length: 50 }).notNull().unique(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const posts = mysqlTable("post_it__posts", {
    id: varchar("id", { length: 25 })
        .primaryKey()
        .notNull()
        .$defaultFn(() => createId()),
    content: text("content").notNull(),
    metadata: json("metadata").$type<PostMetadata>().default(null),
    attachments: json("attachments")
        .$type<PostAttachment[]>()
        .default([])
        .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
    authorId: varchar("author_id", { length: 50 }).notNull(),
});

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
