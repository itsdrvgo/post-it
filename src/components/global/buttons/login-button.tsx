"use client";

import { cn } from "@/src/lib/utils";
import { Button, ButtonProps } from "@nextui-org/react";
import { useRouter } from "next/navigation";

interface LoginButtonProps extends ButtonProps {
    text?: string;
}

function LoginButton({ className, text, ...props }: LoginButtonProps) {
    const router = useRouter();

    return (
        <Button
            className={cn("text-sm font-semibold dark:text-black", className)}
            color="primary"
            radius="full"
            onPress={() => router.push("/signin")}
            {...props}
        >
            {text || "Sign In"}
        </Button>
    );
}

export default LoginButton;
