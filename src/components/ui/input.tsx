"use client";

import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { ClassValue } from "class-variance-authority/types";
import {
    ElementRef,
    forwardRef,
    InputHTMLAttributes,
    ReactNode,
    useImperativeHandle,
    useRef,
} from "react";

const inputVariants = cva(
    "flex w-full rounded-md px-3 py-1 cursor-text shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    {
        variants: {
            variant: {
                default:
                    "bg-input text-foreground hover:bg-input-hover focus-visible:bg-input-hover",
                outline: "border border-border bg-background",
            },
            sizes: {
                default: "h-10 text-sm",
                sm: "h-9 text-xs px-3",
                lg: "h-12",
            },
        },
        defaultVariants: {
            sizes: "default",
            variant: "default",
        },
    }
);

export interface InputProps
    extends InputHTMLAttributes<HTMLInputElement>,
        VariantProps<typeof inputVariants> {
    startContent?: ReactNode;
    endContent?: ReactNode;
    classNames?: {
        container?: ClassValue;
        input?: ClassValue;
    };
    type?: InputHTMLAttributes<HTMLInputElement>["type"];
    isDisabled?: boolean;
    onValueChange?: (value: string) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            classNames,
            startContent,
            endContent,
            type,
            sizes,
            variant,
            isDisabled = false,
            onValueChange,
            ...props
        },
        forwardedRef
    ) => {
        const inputRef = useRef<ElementRef<"input">>(null);

        useImperativeHandle(forwardedRef, () => inputRef.current!);

        return (
            <div
                className={cn(
                    "flex items-center gap-2",
                    inputVariants({
                        variant,
                        sizes,
                        className: cn(className, classNames?.container),
                    }),
                    isDisabled && "cursor-not-allowed opacity-50 hover:bg-input"
                )}
                aria-disabled={isDisabled}
                onClick={() => inputRef.current?.focus()}
            >
                {startContent && <div>{startContent}</div>}

                <input
                    type={type}
                    className={cn(
                        "w-full min-w-0 bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-50",
                        classNames?.input
                    )}
                    ref={inputRef}
                    disabled={isDisabled}
                    onChange={(e) => onValueChange?.(e.target.value)}
                    {...props}
                />

                {endContent && <div>{endContent}</div>}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input, inputVariants };
