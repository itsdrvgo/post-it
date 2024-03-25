import { generateId } from "@/lib/utils";
import { ChangeEvent, ClipboardEvent, DragEvent } from "react";
import {
    ACCEPTED_IMAGE_TYPES,
    MAX_IMAGE_COUNT,
    MAX_IMAGE_FILE_SIZE,
} from "../config/const";

export type UploadEvent<T = HTMLDivElement> =
    | DragEvent<T>
    | ClipboardEvent<T>
    | ChangeEvent<T>;

type FileReturnType = {
    status: "idle" | "error" | "success";
    message: string;
    isError: boolean;
    isSuccess: boolean;
    data?: {
        acceptedFiles: ExtendedFile[];
        rejectedFiles: ExtendedFile[];
    };
    type?: "image" | "text";
};

export function useDropzone() {
    const processFiles = (e: UploadEvent): FileReturnType => {
        if (e.type === "drop")
            return handleDrop(e as DragEvent<HTMLDivElement>);
        else if (e.type === "paste")
            return handlePaste(e as ClipboardEvent<HTMLDivElement>);
        else return handleInputChange(e as ChangeEvent<HTMLInputElement>);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>): FileReturnType => {
        event.preventDefault();

        const files = event.dataTransfer.files;
        const isImageUploaded = isFileTypeSelected(files, ACCEPTED_IMAGE_TYPES);

        if (isImageUploaded) return handleImageFiles(files);

        return {
            status: "error",
            message: "No files were uploaded!",
            isError: true,
            isSuccess: false,
        };
    };

    const handlePaste = (
        event: ClipboardEvent<HTMLDivElement>
    ): FileReturnType => {
        event.preventDefault();

        const files = event.clipboardData.files;
        const text = event.clipboardData.getData("text/plain");

        if (text)
            return {
                status: "success",
                type: "text",
                message: text,
                isSuccess: true,
                isError: false,
            };

        const isImageUploaded = isFileTypeSelected(files, ACCEPTED_IMAGE_TYPES);

        if (isImageUploaded) return handleImageFiles(files);

        return {
            status: "error",
            message: "No files were uploaded!",
            isError: true,
            isSuccess: false,
        };
    };

    const handleInputChange = (
        event: ChangeEvent<HTMLInputElement>
    ): FileReturnType => {
        event.preventDefault();

        const files = event.target.files;

        const isImageUploaded = isFileTypeSelected(
            files!,
            ACCEPTED_IMAGE_TYPES
        );

        if (isImageUploaded) return handleImageFiles(files!);

        return {
            status: "error",
            message: "No files were uploaded!",
            isError: true,
            isSuccess: false,
        };
    };

    const handleImageFiles = (files: FileList): FileReturnType => {
        const acceptedFiles: ExtendedFile[] = [];
        const rejectedFiles: ExtendedFile[] = [];

        if (files.length > MAX_IMAGE_COUNT) {
            return {
                status: "error",
                message:
                    "You can only upload maximum " +
                    MAX_IMAGE_COUNT +
                    " images.",
                isError: true,
                isSuccess: false,
            };
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (
                ACCEPTED_IMAGE_TYPES.includes(file.type) &&
                file.size <= MAX_IMAGE_FILE_SIZE
            ) {
                acceptedFiles.push({
                    id: generateId(),
                    file,
                    url: URL.createObjectURL(file),
                });
            } else {
                rejectedFiles.push({
                    id: generateId(),
                    file,
                    url: URL.createObjectURL(file),
                });
            }
        }

        if (rejectedFiles.length > 0) {
            return {
                status: "error",
                message:
                    "Could not upload " +
                    rejectedFiles.length +
                    " images. Please check the file types and sizes, " +
                    rejectedFiles.map((file) => file.file.name).join(", "),
                isError: true,
                isSuccess: false,
            };
        } else
            return {
                status: "success",
                message: "Image files uploaded",
                isSuccess: true,
                isError: false,
                data: {
                    acceptedFiles,
                    rejectedFiles,
                },
                type: "image",
            };
    };

    return {
        processFiles,
        uploadConfig: {
            maxImageCount: MAX_IMAGE_COUNT,
            maxImageFileSize: MAX_IMAGE_FILE_SIZE,
            acceptedImageTypes: ACCEPTED_IMAGE_TYPES,
        },
    };
}

const isFileTypeSelected = (
    files: FileList,
    acceptedTypes: string[]
): boolean => {
    for (let i = 0; i < files.length; i++) {
        if (acceptedTypes.includes(files[i].type)) {
            return true;
        }
    }
    return false;
};
