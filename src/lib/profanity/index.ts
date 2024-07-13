import { POST_STATUS } from "@/config/const";
import { ProfanityResponse } from "@/types";
import { cFetch } from "../utils";

const PROFANITY_API = "https://vector.profanity.dev";

export async function checkProfanity(content: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const data = await cFetch<ProfanityResponse>(PROFANITY_API, {
            method: "POST",
            body: JSON.stringify({ message: content }),
            headers: {
                "Content-Type": "application/json",
            },
            signal: controller.signal,
        });

        if (data.isProfanity && data.score === 1) return POST_STATUS.REJECTED;
        if (data.isProfanity && data.score < 1) return POST_STATUS.PENDING;
        return POST_STATUS.APPROVED;
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
            return POST_STATUS.PENDING;
        else throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}
