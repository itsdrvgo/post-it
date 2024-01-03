import { CResponse } from "@/src/lib/utils";
import { NextRequest } from "next/server";
import { utapi } from "../uploadthing/core";

export async function POST(req: NextRequest) {
    const body = await req.formData();

    const images = body.getAll("image") as File[];
    if (!images?.length)
        return CResponse({
            message: "BAD_REQUEST",
            longMessage: "No images were uploaded",
        });

    const res = await utapi.uploadFiles(images);
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
