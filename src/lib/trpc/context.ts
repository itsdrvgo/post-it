import { inferAsyncReturnType } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { db } from "../drizzle";
import { posts, users } from "../drizzle/schema";

type ContextProps = {
    req: Request;
};

export const createContextInner = ({ req }: ContextProps) => {
    return {
        db,
        posts,
        users,
        req,
    };
};

export const createContext = ({ req }: FetchCreateContextFnOptions) => {
    return createContextInner({
        req,
    });
};

export type Context = inferAsyncReturnType<typeof createContextInner>;
