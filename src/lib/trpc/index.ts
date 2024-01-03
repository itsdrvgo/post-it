import { linkRouter } from "./routers/link";
import { postRouter } from "./routers/post";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
    posts: postRouter,
    users: userRouter,
    links: linkRouter,
});

export type AppRouter = typeof appRouter;
