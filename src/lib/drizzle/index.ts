import { env } from "@/env.mjs";
import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import * as Schema from "./schema";

const connection = connect({
    username: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,
    host: env.DATABASE_HOST,
});

export const db = drizzle(connection, { schema: Schema });
