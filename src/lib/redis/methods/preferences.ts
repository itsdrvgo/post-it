import { CACHED_PREFERENCES_KEY } from "@/config/const";
import { PreferencesData } from "@/lib/validation";
import { redis } from "..";

export async function setPreferences({
    isAuthEnabled = true,
    isPostCreateEnabled = true,
}: PreferencesData) {
    return await redis.set(
        CACHED_PREFERENCES_KEY,
        JSON.stringify({ isAuthEnabled, isPostCreateEnabled })
    );
}

export async function getPreferences() {
    return await redis.get<PreferencesData>(CACHED_PREFERENCES_KEY);
}
