import { env } from "@/../env.mjs";
import { decodeJwt, errors, jwtVerify, SignJWT } from "jose";
import { generateId } from "../utils";

export function generateAccessToken(userId: string) {
    const jwt = new SignJWT()
        .setProtectedHeader({ alg: "HS256" })
        .setJti(generateId())
        .setIssuedAt()
        .setExpirationTime("15m")
        .setSubject(userId)
        .sign(new TextEncoder().encode(env.ACCESS_TOKEN_SECRET));

    return jwt;
}

export function generateAuthToken(userId: string) {
    const jwt = new SignJWT({})
        .setProtectedHeader({ alg: "HS256" })
        .setJti(generateId())
        .setIssuedAt()
        .setSubject(userId)
        .sign(new TextEncoder().encode(env.REFRESH_TOKEN_SECRET));

    return jwt;
}

export async function verifyAuthToken(token: string) {
    try {
        const payload = await jwtVerify(
            token,
            new TextEncoder().encode(env.REFRESH_TOKEN_SECRET)
        );
        if (!payload.payload.sub)
            return {
                error: "INVALID" as const,
                message: "Invalid token",
            };

        return { token, userId: payload.payload.sub };
    } catch (err) {
        if (err instanceof errors.JWTExpired)
            return {
                error: "EXPIRED" as const,
                message: "Token has expired",
            };

        return {
            error: "INVALID" as const,
            message: "Invalid token",
        };
    }
}

export async function verifyAccessToken(accessToken: string) {
    try {
        const payload = await jwtVerify(
            accessToken,
            new TextEncoder().encode(env.ACCESS_TOKEN_SECRET)
        );
        if (!payload.payload.sub)
            return {
                error: "INVALID" as const,
                message: "Invalid token",
            };

        return { accessToken, userId: payload.payload.sub };
    } catch (err) {
        if (err instanceof errors.JWTExpired)
            return {
                error: "EXPIRED" as const,
                message: "Token has expired",
            };

        return {
            error: "INVALID" as const,
            message: "Invalid token",
        };
    }
}

export function decodeAuthToken(token: string) {
    return decodeJwt(token);
}

export function decodeAccessToken(token: string) {
    return decodeJwt(token);
}
