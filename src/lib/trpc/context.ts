import { TOKENS } from "@/config/const";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "../drizzle";
import { posts, User, users } from "../drizzle/schema";
import { verifyAuthToken } from "../jwt";
import { isAuthTokenInCache } from "../redis/methods/token";

type ContextProps = {
    user: User | null;
    req: Request;
    authToken: string | null;
};

export const createContextInner = ({ req, user, authToken }: ContextProps) => {
    return {
        db,
        posts,
        users,
        user,
        req,
        authToken,
    };
};

export const createContext = async ({ req }: FetchCreateContextFnOptions) => {
    let user: User | null = null;

    const authToken = cookies().get(TOKENS.AUTH_COOKIE_NAME)?.value;

    if (authToken) {
        const data = await verifyAuthToken(authToken);
        if (data) {
            const { userId } = data;
            if (userId) {
                const isTokenInCache = await isAuthTokenInCache(
                    userId,
                    authToken
                );

                if (isTokenInCache)
                    user =
                        (await db.query.users.findFirst({
                            where: eq(users.id, userId),
                        })) || null;
            }
        }
    }

    return createContextInner({
        req,
        user,
        authToken: authToken || null,
    });
};

export type Context = ReturnType<typeof createContextInner>;
