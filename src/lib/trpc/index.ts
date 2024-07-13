import {
    linkRouter,
    postRouter,
    preferenceRouter,
    userRouter,
} from "./routers";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
    posts: postRouter,
    users: userRouter,
    links: linkRouter,
    preferences: preferenceRouter,
});

export type AppRouter = typeof appRouter;
