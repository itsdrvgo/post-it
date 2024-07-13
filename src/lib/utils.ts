import { init } from "@paralleldrive/cuid2";
import { clsx, type ClassValue } from "clsx";
import { DrizzleError } from "drizzle-orm";
import { NextResponse } from "next/server";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import { DEFAULT_ERROR_MESSAGE } from "../config/const";
import { ResponseData, ResponseMessages } from "./validation/response";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export function handleClientError(error: unknown, toastId?: string | number) {
    if (error instanceof DrizzleError) {
        return toast.error(error.message, {
            id: toastId,
        });
    } else if (error instanceof ZodError) {
        return toast.error(error.issues.map((x) => x.message).join(", "), {
            id: toastId,
        });
    } else if (error instanceof Error) {
        return toast.error(error.message, {
            id: toastId,
        });
    } else {
        console.error(error);
        return toast.error(DEFAULT_ERROR_MESSAGE, {
            id: toastId,
        });
    }
}

export function handleError(err: unknown) {
    console.error(err);
    if (err instanceof ZodError)
        return CResponse({
            message: "UNPROCESSABLE_ENTITY",
            longMessage: err.issues.map((x) => x.message).join(", "),
        });
    else if (err instanceof DrizzleError)
        return CResponse({
            message: "UNKNOWN_ERROR",
            longMessage: err.message,
        });
    else
        return CResponse({
            message: "UNKNOWN_ERROR",
            longMessage: (err as Error).message,
        });
}

export function CResponse<T>({
    message,
    longMessage,
    data,
}: {
    message: ResponseMessages;
    longMessage?: string;
    data?: T;
}) {
    let code: number;
    let success = false;

    switch (message) {
        case "OK":
            code = 200;
            success = true;
            break;
        case "CREATED":
            code = 201;
            success = true;
            break;
        case "ERROR":
        case "BAD_REQUEST":
            code = 400;
            break;
        case "UNAUTHORIZED":
            code = 401;
            break;
        case "FORBIDDEN":
            code = 403;
            break;
        case "NOT_FOUND":
            code = 404;
            break;
        case "CONFLICT":
            code = 409;
            break;
        case "UNPROCESSABLE_ENTITY":
            code = 422;
            break;
        case "TOO_MANY_REQUESTS":
            code = 429;
            break;
        case "NOT_IMPLEMENTED":
            code = 501;
            break;
        case "BAD_GATEWAY":
            code = 502;
            break;
        case "SERVICE_UNAVAILABLE":
            code = 503;
            break;
        case "GATEWAY_TIMEOUT":
            code = 504;
            break;
        default:
            code = 500;
            break;
    }

    return NextResponse.json(
        {
            success,
            message,
            longMessage,
            data,
        },
        {
            status: code,
            statusText: message,
        }
    );
}

export async function cFetch<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
}

export function convertMstoTimeElapsed(input: number) {
    const currentTimestamp = Date.now();
    const elapsed = currentTimestamp - input;

    if (elapsed < 60000) return "just now";
    else if (elapsed < 3600000) {
        const minutes = Math.floor(elapsed / 60000);
        return minutes + "m";
    } else if (elapsed < 86400000) {
        const hours = Math.floor(elapsed / 3600000);
        return hours + "h";
    } else {
        const date = new Date(input);
        const currentDate = new Date();
        const isSameYear = date.getFullYear() === currentDate.getFullYear();
        const month = date.toLocaleString("default", { month: "short" });
        const day = date.getDate();
        const year = date.getFullYear();
        return month + " " + day + (isSameYear ? "" : ", " + year);
    }
}

export function isYouTubeVideo(url: string) {
    const regex =
        /https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return regex.test(url);
}

export function extractYTVideoId(url: string) {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    return params.get("v");
}

export function getAbsoluteURL(path: string = "/") {
    const DEPLOYMENT_URL = "https://post-it-itsdrvgo.vercel.app";

    if (process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL)
        return `${DEPLOYMENT_URL}${path}`;
    return `http://localhost:${process.env.NEXT_PUBLIC_PORT ?? 3000}${path}`;
}

export function generateId(length: number = 16) {
    return init({ length })();
}

export async function getAccessToken() {
    const res = await cFetch<
        ResponseData<{
            token: string;
        }>
    >("/api/token");

    if (res.message !== "OK") throw new Error(res.longMessage);
    if (!res.data?.token) throw new Error("Access token not found");
    return res.data.token;
}

export function generatePostURL(postId: string) {
    return getAbsoluteURL(`/posts?p=${postId}`);
}

export function generatePathTitle(path: string = "/admin/users") {
    const split = path.split("/");
    const title = split[split.length - 1];
    return title.charAt(0).toUpperCase() + title.slice(1);
}

export function shortenNumber(num: number): string {
    const units = ["", "K", "M", "B", "T"];
    let unitIndex = 0;
    while (num >= 1000 && unitIndex < units.length - 1) {
        num /= 1000;
        unitIndex++;
    }
    const formattedNum = num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
    return formattedNum + units[unitIndex];
}
