"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button, ButtonProps } from "../../ui/button";

export function GoBackButton({ className, ...props }: ButtonProps) {
    const router = useRouter();

    return (
        <Button
            aria-label="Go back to the previous page"
            size="sm"
            className={cn("text-primary", className)}
            onClick={() => router.back()}
            {...props}
        >
            Go back
        </Button>
    );
}
