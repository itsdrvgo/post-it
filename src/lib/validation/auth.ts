import { z } from "zod";

export const signinSchema = z.object({
    username: z
        .string()
        .min(3, "Username is too short")
        .max(32, "Username is too long")
        .regex(
            /^[a-z0-9_]+$/,
            "Username can only contain lowercase letters, numbers, underscores"
        ),
    password: z
        .string()
        .min(8, "Password is too short")
        .max(64, "Password is too long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).*$/,
            "Password must contain at least one lowercase letter, one uppercase letter, and one number"
        ),
});

export type SignInData = z.infer<typeof signinSchema>;
