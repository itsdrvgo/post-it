"use client";

import { cn } from "@/src/lib/utils";
import { Button, ButtonProps } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Icons } from "../../icons/icons";

function LogoutButton({ className, ...props }: ButtonProps) {
    const router = useRouter();

    const handleLogout = () => {
        const toastId = toast.loading("Logging out...");

    };

    return (
        <Button
            className={cn("text-sm font-semibold", className)}
            variant="light"
            isIconOnly
            onPress={handleLogout}
            startContent={<Icons.logout className="h-5 w-5" />}
            {...props}
        />
    );
}

export default LogoutButton;
