"use client";

import { Icons } from "@/components/icons";
import { setToken } from "@/components/providers";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { POST_STATUS, ROLES } from "@/config/const";
import { Post } from "@/lib/drizzle/schema";
import { trpc } from "@/lib/trpc/client";
import {
    generatePostURL,
    getAccessToken,
    handleClientError,
} from "@/lib/utils";
import { UserClientData } from "@/lib/validation/user";
import { useState } from "react";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { toast } from "sonner";

interface PageProps {
    post: Post & {
        author: UserClientData;
    };
    user: UserClientData;
}

export function PostActions({ post, user }: PageProps) {
    const { refetch } = trpc.posts.getInfinitePosts.useInfiniteQuery(
        {
            status: POST_STATUS.PENDING,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    const [isAllowModalOpen, setAllowModalOpen] = useState(false);
    const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);

    const { mutate: allowPost, isPending: isUpdating } =
        trpc.posts.updatePost.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating post...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Post updated!", {
                    id: ctx.toastId,
                });

                setAllowModalOpen(false);
                refetch();
            },
            onError: (err, _, ctx) => {
                return handleClientError(err, ctx?.toastId);
            },
        });

    const { mutate: deletePost, isPending: isDeleting } =
        trpc.posts.deletePost.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Removing post...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Post deleted!", {
                    id: ctx.toastId,
                });

                setRemoveModalOpen(false);
                refetch();
            },
            onError: (err, _, ctx) => {
                return handleClientError(err, ctx?.toastId);
            },
        });

    const handleAllowPost = async () => {
        const accessToken = await getAccessToken();
        setToken(accessToken);

        allowPost({
            id: post.id,
            status: POST_STATUS.APPROVED,
        });
    };

    const handleRemovePost = async () => {
        const accessToken = await getAccessToken();
        setToken(accessToken);

        deletePost({
            id: post.id,
        });
    };

    return (
        <>
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
                            toast.success("Copied link to clipboard");
                        }}
                    >
                        Copy Link
                    </DropdownMenuItem>

                    {(user.id === post.author.id ||
                        user.role !== ROLES.USER) && (
                        <>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onSelect={() => setAllowModalOpen(true)}
                            >
                                Allow
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onSelect={() => setRemoveModalOpen(true)}
                            >
                                Remove
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog
                open={isAllowModalOpen}
                onOpenChange={setAllowModalOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Allow Post</AlertDialogTitle>

                        <AlertDialogDescription>
                            Are you sure you want to allow this post?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <Button
                            size="sm"
                            variant="outline"
                            isDisabled={isDeleting}
                            onClick={() => setAllowModalOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            size="sm"
                            className="font-semibold"
                            isDisabled={isUpdating}
                            isLoading={isUpdating}
                            onClick={handleAllowPost}
                            classNames={{
                                startContent: "text-background",
                            }}
                        >
                            Allow Post
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={isRemoveModalOpen}
                onOpenChange={setRemoveModalOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Post</AlertDialogTitle>

                        <AlertDialogDescription>
                            Are you sure you want to remove this post? This
                            action is irreversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <Button
                            size="sm"
                            variant="outline"
                            isDisabled={isDeleting}
                            onClick={() => setRemoveModalOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            isDisabled={isDeleting}
                            isLoading={isDeleting}
                            onClick={handleRemovePost}
                        >
                            Remove Post
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
