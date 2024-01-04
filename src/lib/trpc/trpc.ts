import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
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
    const ip =
        ctx.req.headers.get("x-real-ip") ??
        ctx.req.headers.get("x-forwarded-for") ??
        "";

    if (ip === "")
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "No IP address found",
        });

    const now = Date.now();
    const requests = map.get(ip) ?? [];

    while (requests.length > 0 && requests[0] < now - WINDOW_SIZE)
        requests.shift();

    if (requests.length >= MAX_REQUESTS)
        throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests",
        });

    requests.push(now);
    map.set(ip, requests);

    return next({
        ctx,
    });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(ratelimiter);
