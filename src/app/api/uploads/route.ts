import { verifyAccessToken } from "@/lib/jwt";
import { CResponse } from "@/lib/utils";
import { NextRequest } from "next/server";
import { utapi } from "../uploadthing/core";

export async function POST(req: NextRequest) {
    const accessToken = req.headers.get("Authorization")?.split(" ")[1];
    if (!accessToken)
        return CResponse({
            message: "UNAUTHORIZED",
            longMessage: "You are not authorized",
        });

    const accessTokenData = await verifyAccessToken(accessToken);
    if (!accessTokenData)
        return CResponse({
            message: "UNAUTHORIZED",
            longMessage: "You are not authorized",
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
