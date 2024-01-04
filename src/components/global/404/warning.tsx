import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import Link from "next/link";

interface PageProps extends DefaultProps {
    content: string;
}

function Warning({ content, className, ...props }: PageProps) {
    return (
        <div
            className={cn(
                "w-full text-balance bg-red-600 p-1 text-center text-xs md:text-sm",
                className
            )}
            {...props}
        >
            <p>
                {content}{" "}
                <Link
                    href="https://github.com/itsdrvgo/post-it/blob/master/README.md#--warning-"
                    className="text-blue-200 underline"
                    target="_blank"
                >
                    READ MORE.
                </Link>
            </p>
        </div>
    );
}

export default Warning;
