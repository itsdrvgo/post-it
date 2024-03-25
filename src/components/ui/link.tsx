"use client";

import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { ClassValue } from "class-variance-authority/types";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { forwardRef, ReactNode } from "react";
import { Icons } from "../icons/icons";
import { buttonVariants } from "./button";

type ButtonLinkProps = {
    type: "button";
    variant?: VariantProps<typeof buttonVariants>["variant"];
    size?: VariantProps<typeof buttonVariants>["size"];
};

type AnchorLinkProps = {
    type: "link";
    isUnderlined?: boolean;
};

type LinkProps = NextLinkProps &
    (ButtonLinkProps | AnchorLinkProps) & {
        className?: ClassValue;
        isExternal?: boolean;
        showAnchorIcon?: boolean;
        children: ReactNode;
    };

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
    (
        {
            className,
            isExternal = false,
            children,
            showAnchorIcon = false,
            ...props
        },
        ref
    ) => {
        return (
            <NextLink
                ref={ref}
                className={cn(
                    "inline-flex items-center transition-all ease-in-out",
                    props.type === "button" &&
                        buttonVariants({
                            variant: props.variant,
                            size: props.size,
                            className,
                        }),
                    props.type === "link" &&
                        props.isUnderlined &&
                        "underline underline-offset-2",
                    className
                )}
                target={isExternal ? "_blank" : undefined}
                {...props}
            >
                {children}
                {showAnchorIcon && (
                    <Icons.externalLink className="ml-[6px] size-4" />
                )}
            </NextLink>
        );
    }
);
Link.displayName = "Link";

export { Link, type LinkProps };
