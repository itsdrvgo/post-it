"use client";

import { DEFAULT_IMAGE_URL } from "@/config/const";
import { Post } from "@/lib/drizzle/schema";
import { trpc } from "@/lib/trpc/client";
import {
    cn,
    convertMstoTimeElapsed,
    extractYTVideoId,
    generateId,
    generatePostURL,
    getAccessToken,
    handleClientError,
    isYouTubeVideo,
    wait,
} from "@/lib/utils";
import { UserClientData } from "@/lib/validation/user";
import { GenericProps } from "@/types";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { toast } from "sonner";
import ImageViewModal from "../global/modals/image-view-modal";
import { Icons } from "../icons/icons";
import { setToken } from "../providers/client";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Link } from "../ui/link";

interface PageProps extends GenericProps {
    post: Post & {
        author: UserClientData;
    };
    user: UserClientData;
}

function PostCard({ post, user, className, ...props }: PageProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [image, setImage] = useState<string | null>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isImageViewModalOpen, setImageViewModalOpen] = useState(false);

    const { mutate: deletePost, isPending: isDeleting } =
        trpc.posts.deletePost.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Deleting post...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Post deleted!", {
                    id: ctx.toastId,
                });

                setDeleteModalOpen(false);
                router.push("/");
            },
            onError: (err, _, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
        });

    const handleDeletePost = async () => {
        const accessToken = await getAccessToken();
        setToken(accessToken);

        deletePost({
            id: post.id,
        });
    };

    return (
        <>
            <div
                className={cn(
                    "flex w-full justify-between gap-3 md:gap-4",
                    className
                )}
                {...props}
            >
                <div>
                    <Avatar>
                        <AvatarImage
                            src={DEFAULT_IMAGE_URL}
                            alt={post.author.username}
                        />
                        <AvatarFallback>
                            {post.author.username[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="flex w-full flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <p className="font-semibold">
                                {post.author.username}
                            </p>
                            <p className="space-x-1 text-sm text-muted-foreground">
                                <span>@postit</span>
                                <span>•</span>
                                <span>
                                    {convertMstoTimeElapsed(
                                        post.createdAt.getTime()
                                    )}
                                </span>
                            </p>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="rounded-full"
                                >
                                    <Icons.moreVert className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="z-50">
                                <DropdownMenuItem
                                    onSelect={() => {
                                        navigator.clipboard.writeText(
                                            generatePostURL(post.id)
                                        );
                                        toast.success(
                                            "Copied link to clipboard"
                                        );
                                    }}
                                >
                                    Copy Link
                                </DropdownMenuItem>

                                {user.id === post.author.id && (
                                    <>
                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            onSelect={() =>
                                                setDeleteModalOpen(true)
                                            }
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialog
                            open={isDeleteModalOpen}
                            onOpenChange={setDeleteModalOpen}
                        >
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Delete Post
                                    </AlertDialogTitle>

                                    <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        post? This action is irreversible.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        isDisabled={isDeleting}
                                        onClick={() =>
                                            setDeleteModalOpen(false)
                                        }
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        isDisabled={isDeleting}
                                        isLoading={isDeleting}
                                        onClick={handleDeletePost}
                                    >
                                        Delete Post
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    <p className="text-sm md:text-base">
                        {post.content.split("\n").map((line, i) => (
                            <span key={i}>
                                {sanitizeContent(line)}
                                <br />
                            </span>
                        ))}
                    </p>

                    {post.metadata &&
                        Object.keys(post.metadata).length > 0 &&
                        post.metadata.isVisible && (
                            <Link
                                type="link"
                                isExternal
                                href={post.metadata.url}
                                className={cn(
                                    "relative grid gap-2 overflow-hidden rounded-lg border bg-card",
                                    isYouTubeVideo(post.metadata.url)
                                        ? "grid-flow-row"
                                        : "grid-cols-5"
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-4",
                                        "col-span-full",
                                        !isYouTubeVideo(post.metadata.url) &&
                                            "md:col-span-3",
                                        isYouTubeVideo(post.metadata.url) &&
                                            "order-2",
                                        post.metadata.title &&
                                            post.metadata.description &&
                                            "space-y-1"
                                    )}
                                >
                                    {post.metadata.title && (
                                        <p className="font-semibold">
                                            {post.metadata.title}
                                        </p>
                                    )}
                                    {post.metadata.description && (
                                        <p className="text-sm text-foreground/60">
                                            {post.metadata.description.length >
                                            120
                                                ? post.metadata.description.slice(
                                                      0,
                                                      120
                                                  ) + "..."
                                                : post.metadata.description}
                                        </p>
                                    )}
                                </div>

                                {isYouTubeVideo(post.metadata.url) ? (
                                    <LiteYouTubeEmbed
                                        id={
                                            extractYTVideoId(
                                                post.metadata.url
                                            ) ?? ""
                                        }
                                        title={
                                            post.metadata.title ??
                                            "video_" + generateId()
                                        }
                                    />
                                ) : (
                                    post.metadata.image && (
                                        <div
                                            className={cn(
                                                "h-full justify-end md:flex",
                                                "col-span-2 hidden"
                                            )}
                                        >
                                            <div className="aspect-square basis-1/2">
                                                <NextImage
                                                    src={post.metadata.image}
                                                    alt={
                                                        post.metadata.title ??
                                                        "image_" + generateId()
                                                    }
                                                    className="size-full object-cover"
                                                    width={500}
                                                    height={500}
                                                />
                                            </div>
                                        </div>
                                    )
                                )}
                            </Link>
                        )}

                    {post.attachments && post.attachments.length > 0 && (
                        <div
                            className={cn(
                                "grid",
                                post.attachments.length > 1
                                    ? "grid-cols-2 gap-2"
                                    : "grid-cols-1"
                            )}
                        >
                            {post.attachments.map((attachment) => (
                                <div
                                    key={attachment?.id}
                                    className="group relative aspect-video overflow-hidden rounded-lg"
                                >
                                    <ImageViewModal
                                        image={image ?? ""}
                                        isOpen={isImageViewModalOpen}
                                        setIsOpen={setImageViewModalOpen}
                                        trigger={
                                            <NextImage
                                                src={attachment?.url!}
                                                alt={
                                                    attachment?.name ??
                                                    "image_" + generateId()
                                                }
                                                className="size-full object-cover"
                                                width={700}
                                                height={700}
                                                onClick={async () => {
                                                    if (pathname === "/")
                                                        return;
                                                    setImage(
                                                        attachment?.url ?? ""
                                                    );

                                                    await wait(100);
                                                    setImageViewModalOpen(true);
                                                }}
                                            />
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default PostCard;

export function sanitizeContent(content: string) {
    return content.split(/(https?:\/\/[^\s]+)/g).map((part) => {
        if (part.match(/(https?:\/\/[^\s]+)/g)) {
            return (
                <Link
                    type="link"
                    className="text-primary underline"
                    key={generateId()}
                    href={part}
                    isExternal
                >
                    {part}
                </Link>
            );
        } else if (part.match(/(@[^\s]+)/g)) {
            return (
                <Link
                    type="link"
                    className="text-primary"
                    key={generateId()}
                    href={`/u/${part.slice(1)}`}
                >
                    {part}
                </Link>
            );
        } else if (part.match(/(#[^\s]+)/g)) {
            return (
                <Link
                    type="link"
                    className="text-primary"
                    key={generateId()}
                    href={`/t/${part.slice(1)}`}
                >
                    {part}
                </Link>
            );
        } else {
            return part;
        }
    });
}
