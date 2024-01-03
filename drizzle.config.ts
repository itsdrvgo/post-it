import type { Config } from "drizzle-kit";

export default {
    schema: "./src/lib/drizzle/schema.ts",
    out: "./drizzle",
    driver: "mysql2",
    dbCredentials: {
        database: process.env.DATABASE_NAME ?? "",
        host: process.env.DATABASE_HOST ?? "",
        uri: process.env.DATABASE_URI ?? "",
    },
    verbose: true,
    strict: true,
} satisfies Config;
