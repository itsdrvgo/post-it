import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { verifyAccessToken } from "../jwt";
import { Context } from "./context";

const map = new Map<string, number[]>();
const MAX_REQUESTS = 100;
const WINDOW_SIZE = 60 * 1000;

export const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof ZodError
                        ? error.cause.flatten()
                        : null,
            },
        };
    },
});

const ratelimiter = t.middleware(({ ctx, next }) => {
    const { req } = ctx;

    const identifier = req.headers.get("x-forwarded-for");
    if (!identifier) return next({ ctx });

    const now = Date.now();
    const requests = map.get(identifier) ?? [];

    while (requests.length > 0 && requests[0] < now - WINDOW_SIZE)
        requests.shift();

    if (requests.length >= MAX_REQUESTS)
        throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests",
        });

    requests.push(now);
    map.set(identifier, requests);

    return next({
        ctx,
    });
});

const isAuth = t.middleware(async ({ ctx, next }) => {
    if (!ctx.user || !ctx.authToken)
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You're not authorized",
        });

    return next({
        ctx: {
            ...ctx,
            user: ctx.user,
            authToken: ctx.authToken,
        },
    });
});

const isAccessTokenValid = t.middleware(async ({ ctx, next }) => {
    const { req, user, authToken } = ctx;

    if (!user || !authToken)
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You're not authorized",
        });

    const accessToken = req.headers.get("Authorization")?.split(" ")[1];
    if (!accessToken || accessToken === "undefined")
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You're not authorized",
        });

    const data = await verifyAccessToken(accessToken);
    if (!data)
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You're not authorized",
        });

    return next({
        ctx: {
            ...ctx,
            accessToken,
            user,
            authToken,
        },
    });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(ratelimiter);
export const protectedProcedure = publicProcedure.use(isAuth);
export const protectedProcedureWithAccessToken =
    protectedProcedure.use(isAccessTokenValid);
