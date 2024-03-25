import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import TextArea, { TextareaAutosizeProps } from "react-textarea-autosize";

export interface TextareaProps extends TextareaAutosizeProps {
    isDisabled?: boolean;
    onValueChange?: (value: string) => void;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, isDisabled = false, onValueChange, ...props }, ref) => {
        return (
            <TextArea
                className={cn(
                    "flex min-h-[60px] w-full min-w-0 rounded-md bg-input px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors ease-in-out placeholder:text-muted-foreground hover:bg-input/80 focus:bg-input/80 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                disabled={isDisabled}
                ref={ref}
                onChange={(e) => {
                    onValueChange?.(e.target.value);
                }}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };
