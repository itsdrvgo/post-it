"use client";

import { DEFAULT_IMAGE_URL } from "@/config/const";
import { trpc } from "@/lib/trpc/client";
import {
    cn,
    getAccessToken,
    handleClientError,
    handleError,
} from "@/lib/utils";
import { UserClientData } from "@/lib/validation/user";
import { GenericProps } from "@/types";
import { useIntersection } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import PostCard from "../home/post-card";
import { setToken } from "../providers/client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Link } from "../ui/link";
import Loader from "../ui/loader";
import { Separator } from "../ui/separator";

interface PageProps extends GenericProps {
    user: UserClientData;
}

function ProfilePage({ className, user, ...props }: PageProps) {
    const router = useRouter();
    const [isAccountDeleteModalOpen, setIsAccountDeleteModalOpen] =
        useState(false);

    const { mutate: deleteUser, isPending: isUserDeleting } =
        trpc.users.deleteUser.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Deleting account...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Account deleted successfully!", {
                    id: ctx.toastId,
                });

                setIsAccountDeleteModalOpen(false);
                router.push("/auth");
            },
            onError: (err, _, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
        });

    const {
        data: postsRaw,
        isLoading,
        fetchNextPage,
        isFetchingNextPage,
    } = trpc.posts.getInfinitePosts.useInfiniteQuery(
        {
            userId: user.id,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    const viewportRef = useRef<HTMLAnchorElement>(null);
    const { entry, ref } = useIntersection({
        root: viewportRef.current,
        threshold: 1,
    });

    useEffect(() => {
        if (
            entry?.isIntersecting &&
            postsRaw?.pages.length &&
            postsRaw?.pages[postsRaw.pages.length - 1].nextCursor
        )
            fetchNextPage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entry]);

    const posts = useMemo(
        () => postsRaw?.pages.flatMap((page) => page.data) ?? [],
        [postsRaw]
    );

    const handleDeleteUser = async () => {
        try {
            const token = await getAccessToken();
            setToken(token);

            deleteUser();
        } catch (err) {
            return handleError(err);
        } finally {
            setIsAccountDeleteModalOpen(false);
        }
    };

    return (
        <div className={cn("w-full max-w-2xl space-y-5", className)} {...props}>
            <Card>
                <CardContent className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage
                                src={DEFAULT_IMAGE_URL}
                                alt={user.username}
                            />
                            <AvatarFallback>
                                {user.username[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <p className="text-sm">@{user.username}</p>
                    </div>

                    <div>
                        <Dialog
                            open={isAccountDeleteModalOpen}
                            onOpenChange={setIsAccountDeleteModalOpen}
                        >
                            <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    Delete Account
                                </Button>
                            </DialogTrigger>

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Account</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete your
                                        account? This action is irreversible.
                                    </DialogDescription>
                                </DialogHeader>

                                <DialogFooter className="justify-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        isDisabled={isUserDeleting}
                                        type="button"
                                        onClick={() =>
                                            setIsAccountDeleteModalOpen(false)
                                        }
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        isDisabled={isUserDeleting}
                                        isLoading={isUserDeleting}
                                        onClick={handleDeleteUser}
                                    >
                                        Delete Account
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center">
                        <Loader />
                    </div>
                ) : !!posts.length ? (
                    <>
                        {posts.map((post, i) => (
                            <>
                                {i === posts.length - 1 ? (
                                    <Link
                                        type="link"
                                        ref={ref}
                                        key={post.id}
                                        className="w-full"
                                        href={`/posts?p=${post.id}`}
                                    >
                                        <PostCard post={post} user={user} />
                                    </Link>
                                ) : (
                                    <Link
                                        type="link"
                                        key={post.id}
                                        className="w-full"
                                        href={`/posts?p=${post.id}`}
                                    >
                                        <PostCard post={post} user={user} />
                                    </Link>
                                )}

                                <Separator />
                            </>
                        ))}

                        {isFetchingNextPage && (
                            <div className="flex justify-center">
                                <Loader />
                            </div>
                        )}

                        {!isFetchingNextPage &&
                            postsRaw?.pages.length &&
                            !postsRaw.pages[postsRaw.pages.length - 1]
                                .nextCursor && (
                                <div className="text-center opacity-60">
                                    <p className="text-xs md:text-sm">
                                        No more posts to load
                                    </p>
                                </div>
                            )}
                    </>
                ) : (
                    <div className="flex justify-center">
                        <p className="text-sm text-white/60">
                            No posts to show
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;
