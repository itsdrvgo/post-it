import { cn } from "@/lib/utils";
import { GenericProps } from "@/types";
import { ClassValue } from "class-variance-authority/types";
import { forwardRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

interface UserProps extends GenericProps {
    name: string;
    description?: string;
    avatar: {
        src: string;
        alt?: string;
    };
    classNames?: {
        container?: ClassValue;
        info?: ClassValue;
        name?: ClassValue;
        description?: ClassValue;
    };
}

const User = forwardRef<HTMLDivElement, UserProps>(
    (
        {
            className,
            classNames,
            name,
            description,
            avatar,
            ...props
        }: UserProps,
        ref
    ) => {
        return (
            <div
                className={cn(
                    "flex items-center gap-3",
                    className,
                    classNames?.container
                )}
                ref={ref}
                {...props}
            >
                <Avatar>
                    <AvatarImage src={avatar.src} />
                    <AvatarFallback>
                        {avatar.alt
                            ? avatar.alt.slice(0, 2).toUpperCase()
                            : name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className={cn(classNames?.info)}>
                    <p className={cn("text-sm", classNames?.name)}>{name}</p>
                    <p
                        className={cn(
                            "text-xs text-muted-foreground",
                            classNames?.description
                        )}
                    >
                        {description}
                    </p>
                </div>
            </div>
        );
    }
);
User.displayName = "User";

export { User, type UserProps };
