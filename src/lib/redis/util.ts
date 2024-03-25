import { TOKENS } from "@/config/const";

export function generateAuthTokenCacheKey(userId: string) {
    return TOKENS.CACHED_AUTH_KEY + "::" + userId;
}
