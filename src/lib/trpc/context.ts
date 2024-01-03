import { inferAsyncReturnType } from "@trpc/server";
import { db } from "../drizzle";
import { posts, users } from "../drizzle/schema";

export const createContextInner = () => {
    return {
        db,
        posts,
        users,
    };
};

export const createContext = () => {
    return createContextInner();
};

export type Context = inferAsyncReturnType<typeof createContextInner>;
