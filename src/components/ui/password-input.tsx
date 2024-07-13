import { cn } from "@/lib/utils";
import * as React from "react";
import { Icons } from "../icons";
import { Button } from "./button";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

        return (
            <div className="relative col-span-4">
                <input
                    type={isPasswordVisible ? "text" : "password"}
                    className={cn(
                        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                    placeholder={isPasswordVisible ? "Password" : "••••••••"}
                    ref={ref}
                    {...props}
                />

                <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-1 top-1/2 size-7 -translate-y-1/2 rounded-sm"
                    size="icon"
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                >
                    {isPasswordVisible ? (
                        <Icons.hide className="size-4" />
                    ) : (
                        <Icons.view className="size-4" />
                    )}
                </Button>
            </div>
        );
    }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
