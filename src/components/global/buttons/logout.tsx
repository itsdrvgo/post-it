"use client";

import { setToken } from "@/components/providers";
import { trpc } from "@/lib/trpc/client";
import { cn, getAccessToken, handleClientError } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { HTMLAttributes } from "react";
import { toast } from "sonner";

interface LogoutButtonProps extends HTMLAttributes<HTMLButtonElement> {
    text?: string;
    redirectURL?: string;
    queryParams?: {
        [key: string]: string;
    };
}

export function LogoutButton({ className, text, ...props }: LogoutButtonProps) {
    const router = useRouter();

    const { mutate: signOut, isPending: isSigningOut } =
        trpc.users.signOutUser.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Logging out...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Good bye!", {
                    id: ctx.toastId,
                });
                router.push("/auth");
            },
            onError: (err, _, ctx) => {
                return handleClientError(err, ctx?.toastId);
            },
        });

    const handleSignout = async () => {
        try {
            const accessToken = await getAccessToken();
            setToken(accessToken);

            signOut();
        } catch (err) {
            return handleClientError(err);
        }
    };
    return (
        <button
            className={cn("p-2 py-1 text-sm", className)}
            onClick={handleSignout}
            disabled={isSigningOut}
            {...props}
        >
            {text || "Logout"}
        </button>
    );
}
