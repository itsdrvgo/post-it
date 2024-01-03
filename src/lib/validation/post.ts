import { z } from "zod";

export const postAttachmentSchema = z
    .object({
        type: z.enum(["image", "text"]),
        url: z.string().url(),
        id: z.string(),
        name: z.string(),
    })
    .nullable();

export const postMetadataSchema = z
    .object({
        title: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        url: z.string(),
        isVisible: z.boolean().default(true).optional(),
    })
    .nullable();

export type PostAttachment = z.infer<typeof postAttachmentSchema>;
export type PostMetadata = z.infer<typeof postMetadataSchema>;
