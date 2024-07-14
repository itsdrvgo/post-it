import { db } from "@/lib/drizzle";
import { users } from "@/lib/drizzle/schema";
import { verifyAccessToken } from "@/lib/jwt";
import { getPreferences } from "@/lib/redis/methods";
import { CResponse } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { utapi } from "../uploadthing/core";

export async function POST(req: NextRequest) {
    const preferences = await getPreferences();
    if (preferences && !preferences.isPostCreateEnabled)
        return CResponse({
            message: "FORBIDDEN",
            longMessage: "Post creation is disabled",
        });

    const accessToken = req.headers.get("Authorization")?.split(" ")[1];
    if (!accessToken)
        return CResponse({
            message: "UNAUTHORIZED",
            longMessage: "You are not authorized",
        });

    const accessTokenData = await verifyAccessToken(accessToken);
    if (!accessTokenData || !accessTokenData.userId)
        return CResponse({
            message: "UNAUTHORIZED",
            longMessage: "You are not authorized",
        });

    const user = await db.query.users.findFirst({
        where: eq(users.id, accessTokenData.userId),
    });
    if (!user)
        return CResponse({
            message: "UNAUTHORIZED",
            longMessage: "You are not authorized",
        });

    if (user.isRestricted)
        return CResponse({
            message: "FORBIDDEN",
            longMessage:
                "Your account is restricted from creating posts. Please contact the administrator for more information.",
        });

    const body = await req.formData();

    const images = body.getAll("image") as File[];
    if (!images?.length)
        return CResponse({
            message: "BAD_REQUEST",
            longMessage: "No images were uploaded",
        });

    const res = await utapi.uploadFiles(images, {
        metadata: {
            userId: accessTokenData.userId,
        },
    });
    if (!res?.length)
        return CResponse({
            message: "BAD_REQUEST",
            longMessage: "Images could not be uploaded",
        });

    return CResponse({
        message: "OK",
        data: res,
    });
}
