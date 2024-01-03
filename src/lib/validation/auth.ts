import { z } from "zod";

// SHAPES

export const nameSchema = z.object({
    firstName: z
        .string()
        .min(1, "First name must be at least 1 characters long")
        .max(191, "First name must be at most 191 characters long"),
    lastName: z
        .string()
        .min(1, "Last name must be at least 1 characters long")
        .max(191, "Last name must be at most 191 characters long"),
});

export const emailSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export const passwordSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).*$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        ),
});

export const verificationCodeSchema = z.object({
    verificationCode: z
        .string()
        .length(6, "Verification code must be 6 digits long"),
});

export const usernameSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(20, "Username must be at most 20 characters long")
        .regex(/^\S*$/, "Username must not contain spaces"),
});

// SCHEMAS

export const loginSchema = z.object({
    email: emailSchema.shape.email,
    password: passwordSchema.shape.password,
});

export const signupSchema = z
    .object({
        email: emailSchema.shape.email,
        username: usernameSchema.shape.username,
        firstName: nameSchema.shape.firstName,
        lastName: nameSchema.shape.lastName,
        password: passwordSchema.shape.password,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords must match",
        path: ["confirmPassword"],
    });

export const resetPasswordSchema = z
    .object({
        password: passwordSchema.shape.password,
        confirmPassword: z.string(),
        verificationCode: verificationCodeSchema.shape.verificationCode,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords must match",
        path: ["confirmPassword"],
    });

// TYPES

export type NameData = z.infer<typeof nameSchema>;
export type PasswordData = z.infer<typeof passwordSchema>;
export type UsernameData = z.infer<typeof usernameSchema>;
export type EmailData = z.infer<typeof emailSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type SignUpData = z.infer<typeof signupSchema>;
export type VerificationCodeData = z.infer<typeof verificationCodeSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
