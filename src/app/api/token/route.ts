import { TOKENS } from "@/config/const";
import {
    decodeAuthToken,
    generateAccessToken,
    verifyAccessToken,
} from "@/lib/jwt";
import { CResponse } from "@/lib/utils";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = cookies();

    const authToken = cookieStore.get(TOKENS.AUTH_COOKIE_NAME)?.value;
    if (!authToken)
        return CResponse({
            message: "UNAUTHORIZED",
            longMessage: "You are not authorized",
        });

    const { sub: userId } = decodeAuthToken(authToken);
    if (!userId)
        return CResponse({
            message: "UNAUTHORIZED",
            longMessage: "You are not authorized",
        });

    let accessToken = cookieStore.get(TOKENS.ACCESS_COOKIE_NAME)?.value;
    if (!accessToken) {
        accessToken = await generateAccessToken(userId);

        cookieStore.set(TOKENS.ACCESS_COOKIE_NAME, accessToken, {
            httpOnly: true,
            sameSite: "strict",
            path: "/",
        });

        return CResponse({
            message: "OK",
            longMessage: "Access token generated",
            data: {
                token: accessToken,
            },
        });
    }

    const accessTokenData = await verifyAccessToken(accessToken);
    if (!accessTokenData)
        return CResponse({
            message: "UNAUTHORIZED",
            longMessage: "You are not authorized",
        });

    switch (accessTokenData.error) {
        case "EXPIRED":
            accessToken = await generateAccessToken(userId);

            cookieStore.set(TOKENS.ACCESS_COOKIE_NAME, accessToken, {
                httpOnly: true,
                sameSite: "strict",
                path: "/",
            });

            return CResponse({
                message: "OK",
                longMessage: "Access token regenerated",
                data: {
                    token: accessToken,
                },
            });

        case "INVALID":
            return CResponse({
                message: "UNAUTHORIZED",
                longMessage: "You are not authorized",
            });
    }

    return CResponse({
        message: "OK",
        longMessage: "Access token verified",
        data: {
            token: accessToken,
        },
    });
}
