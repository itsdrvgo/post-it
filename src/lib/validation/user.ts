import { z } from "zod";
import { insertUserSchema } from "../drizzle/schema";

export const userClientSchema = insertUserSchema.required().omit({
    password: true,
});

export type UserClientData = z.infer<typeof userClientSchema>;
