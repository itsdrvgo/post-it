import { NextRequest, NextResponse } from "next/server";
import { PAGES, TOKENS } from "./config/const";
import { decodeAuthToken, verifyAuthToken } from "./lib/jwt";
import { isAuthTokenInCache } from "./lib/redis/methods";
import { CResponse } from "./lib/utils";

export async function middleware(req: NextRequest) {
    const url = new URL(req.url);
    const res = NextResponse.next();

    const authToken = req.cookies.get(TOKENS.AUTH_COOKIE_NAME)?.value;
    if (url.pathname === PAGES.AUTH_PAGE && authToken)
        return NextResponse.redirect(new URL("/", req.url));

    if (url.pathname.startsWith("/api")) {
        if (!authToken)
            return CResponse({
                message: "UNAUTHORIZED",
                longMessage: "You are not authorized",
            });

        const authTokenData = await verifyAuthToken(authToken);
        if (
            !authTokenData ||
            authTokenData.error === "INVALID" ||
            !authTokenData.userId
        )
            return deleteBrowserCookiesApi();

        const isTokenValid = await isAuthTokenInCache(
            authTokenData.userId,
            authToken
        );
        if (!isTokenValid) return deleteBrowserCookiesApi();

        return res;
    }

    if (!authToken) {
        if (url.pathname !== PAGES.AUTH_PAGE)
            return NextResponse.redirect(new URL(PAGES.AUTH_PAGE, req.url));

        return res;
    }

    const { sub: userId } = decodeAuthToken(authToken);
    if (!userId) return deleteBrowserCookiesGeneral(req);

    const isTokenValid = await isAuthTokenInCache(userId, authToken);
    if (!isTokenValid) return deleteBrowserCookiesGeneral(req);

    if (url.pathname === PAGES.ADMIN_PAGE)
        return NextResponse.redirect(new URL("/admin/users", req.url));

    return res;
}

export const config = {
    matcher: ["/", "/profile", "/auth", "/admin", "/api/token", "/api/uploads"],
};

function deleteBrowserCookiesGeneral(req: NextRequest) {
    const newRes = NextResponse.redirect(new URL(PAGES.AUTH_PAGE, req.url));
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    newRes.cookies.delete(TOKENS.AUTH_COOKIE_NAME);
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    newRes.cookies.delete(TOKENS.ACCESS_COOKIE_NAME);

    return newRes;
}

function deleteBrowserCookiesApi() {
    const newRes = CResponse({
        message: "UNAUTHORIZED",
        longMessage: "You are not authorized",
    });

    // eslint-disable-next-line drizzle/enforce-delete-with-where
    newRes.cookies.delete(TOKENS.AUTH_COOKIE_NAME);
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    newRes.cookies.delete(TOKENS.ACCESS_COOKIE_NAME);

    return newRes;
}
