import { getPreferences, setPreferences } from "@/lib/redis/methods";
import { preferencesSchema } from "@/lib/validation";
import { adminOnlyProcedure, createTRPCRouter } from "../trpc";

export const preferenceRouter = createTRPCRouter({
    updatePreferences: adminOnlyProcedure
        .input(preferencesSchema.partial())
        .mutation(async ({ input }) => {
            const { isAuthEnabled, isPostCreateEnabled } = input;

            const existingPreferences = await getPreferences();
            if (!existingPreferences) {
                await setPreferences({
                    isAuthEnabled: isAuthEnabled ?? true,
                    isPostCreateEnabled: isPostCreateEnabled ?? true,
                });

                return {
                    isAuthEnabled: isAuthEnabled ?? true,
                    isPostCreateEnabled: isPostCreateEnabled ?? true,
                };
            }

            await setPreferences({
                isAuthEnabled:
                    isAuthEnabled ?? existingPreferences.isAuthEnabled,
                isPostCreateEnabled:
                    isPostCreateEnabled ??
                    existingPreferences.isPostCreateEnabled,
            });

            return {
                isAuthEnabled:
                    isAuthEnabled ?? existingPreferences.isAuthEnabled,
                isPostCreateEnabled:
                    isPostCreateEnabled ??
                    existingPreferences.isPostCreateEnabled,
            };
        }),
});
