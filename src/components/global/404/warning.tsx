import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";
import { GenericProps } from "@/types";

interface PageProps extends GenericProps {
    content: string;
}

function Warning({ content, className, ...props }: PageProps) {
    return (
        <div
            className={cn(
                "w-full text-balance bg-destructive p-1 text-center text-xs md:text-sm",
                className
            )}
            {...props}
        >
            <p>
                {content}{" "}
                <Link
                    type="link"
                    href="https://github.com/itsdrvgo/post-it/blob/master/README.md#--warning-"
                    className="text-blue-200 underline"
                    isExternal
                >
                    READ MORE.
                </Link>
            </p>
        </div>
    );
}

export default Warning;
