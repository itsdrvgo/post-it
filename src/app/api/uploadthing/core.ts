import { NextResponse } from "next/server";
import { createUploadthing, UTApi } from "uploadthing/server";

const f = createUploadthing();
export const utapi = new UTApi();

export const customFileRouter = {
    myRoute: f({
        image: {
            maxFileCount: 1,
            maxFileSize: "2MB",
        },
    })
        .onUploadError((err) => {
            console.log(err);

            return NextResponse.json({
                code: err.error.code,
                message: err.error.message,
            });
        })
        .onUploadComplete(({ file, metadata }) => {
            console.log(file, metadata);
        }),
};

export type CustomFileRouter = typeof customFileRouter;
