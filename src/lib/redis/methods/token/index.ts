import { redis } from "../..";
import { generateAuthTokenCacheKey } from "../../util";

export async function addAuthTokenToCache(token: string, userId: string) {
    const key = generateAuthTokenCacheKey(userId);
    return await redis.set(key, token);
}

export async function updateAuthTokenInCache(token: string, userId: string) {
    const key = generateAuthTokenCacheKey(userId);
    return await redis.set(key, token);
}

export async function removeAuthTokenFromCache(userId: string) {
    const key = generateAuthTokenCacheKey(userId);
    return await redis.del(key);
}

export async function isAuthTokenInCache(userId: string, token: string) {
    const key = generateAuthTokenCacheKey(userId);
    const authToken = await redis.get(key);

    return authToken === token;
}
