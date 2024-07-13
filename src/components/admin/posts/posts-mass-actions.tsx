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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { POST_STATUS } from "@/config/const";
import { Post } from "@/lib/drizzle/schema";
import { trpc } from "@/lib/trpc/client";
import { getAccessToken, handleClientError } from "@/lib/utils";
import { UserClientData } from "@/lib/validation";
import { useState } from "react";
import { toast } from "sonner";

interface PageProps {
    posts: (Post & {
        author: UserClientData;
    })[];
}

export function PostsMassActions({ posts }: PageProps) {
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

    const { mutate: updatePosts, isPending: isUpdating } =
        trpc.posts.massUpdatePosts.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating posts...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Posts updated!", {
                    id: ctx.toastId,
                });

                setAllowModalOpen(false);
                refetch();
            },
            onError: (err, __, ctx) => {
                return handleClientError(err, ctx?.toastId);
            },
        });

    const { mutate: deletePosts, isPending: isDeleting } =
        trpc.posts.massDeletePosts.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Removing posts...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Posts removed!", {
                    id: ctx.toastId,
                });

                setRemoveModalOpen(false);
                refetch();
            },
            onError: (err, __, ctx) => {
                return handleClientError(err, ctx?.toastId);
            },
        });

    const handleAllowPosts = async () => {
        const accessToken = await getAccessToken();
        setToken(accessToken);

        updatePosts({
            status: POST_STATUS.APPROVED,
        });
    };

    const handleRemovePosts = async () => {
        const accessToken = await getAccessToken();
        setToken(accessToken);

        deletePosts();
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-5">
                <h2 className="text-2xl font-bold md:text-4xl">Manage Posts</h2>

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
                                setAllowModalOpen(true);
                            }}
                            disabled={!posts.length}
                        >
                            Allow All
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onSelect={() => {
                                setRemoveModalOpen(true);
                            }}
                            disabled={!posts.length}
                        >
                            Remove All
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialog
                    open={isAllowModalOpen}
                    onOpenChange={setAllowModalOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Allow all posts</AlertDialogTitle>

                            <AlertDialogDescription>
                                Are you sure you want to allow all posts?
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
                                onClick={handleAllowPosts}
                                classNames={{
                                    startContent: "text-background",
                                }}
                            >
                                Allow Posts
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
                            <AlertDialogTitle>
                                Remove all posts
                            </AlertDialogTitle>

                            <AlertDialogDescription>
                                Are you sure you want to remove all posts?
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
                                className="font-semibold"
                                isDisabled={isUpdating}
                                isLoading={isUpdating}
                                onClick={handleRemovePosts}
                            >
                                Remove Posts
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <p className="text-balance text-sm text-muted-foreground md:text-base">
                Manage posts that are pending approval, approve or remove them
                here.
            </p>
        </div>
    );
}
