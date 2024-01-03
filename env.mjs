import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_HOST: z.string(),
        DATABASE_USERNAME: z.string(),
        DATABASE_PASSWORD: z.string(),

        UPLOADTHING_SECRET: z.string(),
        UPLOADTHING_APP_ID: z.string(),
    },
    runtimeEnv: {
        DATABASE_HOST: process.env.DATABASE_HOST,
        DATABASE_USERNAME: process.env.DATABASE_USERNAME,
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,

        UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
        UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    },
});
