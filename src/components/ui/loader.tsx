import { cn } from "@/lib/utils";
import { GenericProps } from "@/types";
import { Spinner } from "./spinner";

export function Loader({ className, ...props }: GenericProps) {
    return (
        <div
            className={cn("flex w-full justify-center p-5", className)}
            {...props}
        >
            <Spinner />
        </div>
    );
}
