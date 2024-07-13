import { z } from "zod";

export const preferencesSchema = z.object({
    isAuthEnabled: z.boolean().default(true),
    isPostCreateEnabled: z.boolean().default(true),
});

export type PreferencesData = z.infer<typeof preferencesSchema>;
