import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z
            .string()
            .url("DATABASE_URL is required")
            .regex(/postgres/),

        UPLOADTHING_SECRET: z
            .string()
            .regex(/^sk_live_/, "UPLOADTHING_SECRET is required"),
        UPLOADTHING_APP_ID: z.string().min(1, "UPLOADTHING_APP_ID is required"),

        ACCESS_TOKEN_SECRET: z
            .string()
            .min(1, "ACCESS_TOKEN_SECRET is required"),
        REFRESH_TOKEN_SECRET: z
            .string()
            .min(1, "REFRESH_TOKEN_SECRET is required"),

        UPSTASH_REDIS_REST_URL: z
            .string()
            .url("UPSTASH_REDIS_REST_URL is required"),
        UPSTASH_REDIS_REST_TOKEN: z
            .string()
            .min(1, "UPSTASH_REDIS_REST_TOKEN is required"),
    },
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,

        UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
        UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,

        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,

        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    },
});
