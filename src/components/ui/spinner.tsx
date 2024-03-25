import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";
import { Icons } from "../icons/icons";

export function Spinner({ className, ...props }: LucideProps) {
    return (
        <Icons.spinner
            className={cn(
                "size-7 animate-spin text-primary dark:text-foreground",
                className
            )}
            {...props}
        />
    );
}
