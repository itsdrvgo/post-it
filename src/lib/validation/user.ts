import { z } from "zod";

export const cachedUserSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    username: z.string(),
    email: z.string().email(),
    image: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const clerkUserSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    username: z.string(),
    emailAddresses: z.array(
        z.object({
            id: z.string(),
            emailAddress: z.string().email(),
        })
    ),
    imageUrl: z.string().url(),
    lastSignInAt: z.number().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
});

export const clerkUserWithoutEmailSchema = clerkUserSchema.omit({
    emailAddresses: true,
});
export const cachedUserWithoutEmailSchema = cachedUserSchema.omit({
    email: true,
});

export type ClerkUser = z.infer<typeof clerkUserSchema>;
export type ClerkUserWithoutEmail = z.infer<typeof clerkUserWithoutEmailSchema>;

export type CachedUser = z.infer<typeof cachedUserSchema>;
export type CachedUserWithoutEmail = z.infer<
    typeof cachedUserWithoutEmailSchema
>;
