"use client";

import { cn } from "@/src/lib/utils";
import { Button, ButtonProps } from "@nextui-org/react";
import { useRouter } from "next/navigation";

function GoBackButton({ className, ...props }: ButtonProps) {
    const router = useRouter();

    return (
        <Button
            aria-label="Go back to the previous page"
            radius="sm"
            className={cn( className)}
            onPress={() => router.back()}
            {...props}
        >
            Go back
        </Button>
    );
}

export default GoBackButton;
