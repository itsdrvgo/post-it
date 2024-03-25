import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ClassValue } from "class-variance-authority/types";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { Spinner } from "./spinner";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 transition-all ease-in-out",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-md hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                outline:
                    "border border-border/20 bg-transparent shadow-sm hover:bg-white/20 dark:hover:bg-accent",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 min-w-16 rounded-md px-3 text-xs",
                lg: "h-12 rounded-md px-8",
                icon: "h-8 w-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    startContent?: ReactNode;
    endContent?: ReactNode;
    isDisabled?: boolean;
    isLoading?: boolean;
    classNames?: {
        startContent?: ClassValue;
        endContent?: ClassValue;
    };
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            classNames,
            startContent,
            isDisabled = false,
            isLoading = false,
            endContent,
            variant,
            size,
            asChild = false,
            children,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isDisabled || isLoading}
                {...props}
            >
                {startContent && isLoading ? (
                    <span className="mr-2">
                        <Spinner
                            className={cn(
                                "size-4 text-foreground",
                                classNames?.startContent
                            )}
                        />
                    </span>
                ) : isLoading ? (
                    <span className="mr-2">
                        <Spinner
                            className={cn(
                                "size-4 text-foreground",
                                classNames?.startContent
                            )}
                        />
                    </span>
                ) : startContent ? (
                    <span className="mr-1">{startContent}</span>
                ) : null}
                {children}
                {endContent && (
                    <span className={cn("ml-1", classNames?.endContent)}>
                        {endContent}
                    </span>
                )}
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
