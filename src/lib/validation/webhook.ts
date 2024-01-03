import { z } from "zod";

export const webhookSchema = z.object({
    data: z.any(),
    object: z.literal("event"),
    type: z.enum(["user.created", "user.updated", "user.deleted"]),
});

export const userCreateWebhookSchema = z.object({
    id: z.string(),
    username: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    image_url: z.string(),
    primary_email_address_id: z.string(),
    email_addresses: z.array(
        z.object({
            email_address: z.string().email(),
            id: z.string(),
        })
    ),
});

export const userUpdateWebhookSchema = z.object({
    id: z.string(),
    username: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    image_url: z.string(),
    primary_email_address_id: z.string(),
    email_addresses: z.array(
        z.object({
            email_address: z.string().email(),
            id: z.string(),
        })
    ),
});

export const userDeleteWebhookSchema = z.object({
    id: z.string(),
    delete: z.boolean().optional(),
    object: z.string(),
});

export type WebhookData = z.infer<typeof webhookSchema>;
export type UserCreateWebhookData = z.infer<typeof userCreateWebhookSchema>;
export type UserDeleteWebhookData = z.infer<typeof userDeleteWebhookSchema>;
