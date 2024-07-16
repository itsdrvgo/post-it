"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_IMAGE_URL } from "@/config/const";
import { trpc } from "@/lib/trpc/client";
import {
    cn,
    getAccessToken,
    handleClientError,
    handleError,
    shortenNumber,
} from "@/lib/utils";
import { UserClientData } from "@/lib/validation/user";
import { GenericProps } from "@/types";
import { useIntersection } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { UpdatePasswordForm, UpdateUsernameForm } from "../global/forms";
import PostCard from "../home/post-card";
import { setToken } from "../providers";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
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
import { Loader } from "../ui/loader";
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
                return handleClientError(err, ctx?.toastId);
            },
        });

    const { data: postCount } = trpc.posts.getPostCount.useQuery({
        authorId: user.id,
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
        <>
            <div
                className={cn(
                    "flex flex-col items-center justify-between gap-5 md:flex-row",
                    className
                )}
                {...props}
            >
                <Avatar className="size-32">
                    <AvatarImage src={DEFAULT_IMAGE_URL} alt={user.username} />
                    <AvatarFallback>
                        {user.username[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex w-full basis-2/3 flex-col-reverse items-center justify-between gap-8 md:flex-row md:items-start">
                    <div className="w-full space-y-2 md:space-y-4">
                        <p className="flex flex-col text-center text-xl font-semibold md:text-start">
                            <span>{user.username}</span>
                        </p>

                        <div className="flex justify-center md:justify-start">
                            <p>
                                <span className="mr-1 font-semibold">
                                    {shortenNumber(postCount ?? 0)}
                                </span>
                                Posts
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="h-auto w-full rounded-none bg-transparent p-0">
                    {["account", "posts"].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            className="w-full rounded-none border-b border-transparent py-2 capitalize data-[state=active]:border-white data-[state=active]:bg-transparent"
                            value={tab}
                        >
                            {tab}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="account">
                    <div className="mt-4 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Update Username</CardTitle>
                                <CardDescription>
                                    Update your username here
                                </CardDescription>
                            </CardHeader>

                            <UpdateUsernameForm username={user.username} />
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Danger Zone</CardTitle>
                                <CardDescription>
                                    Access sensitive information here
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between gap-5">
                                    <div className="space-y-1">
                                        <h4 className="font-semibold">
                                            Change Password
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            This will change your password. You
                                            will have to log in using your new
                                            password next time.
                                        </p>
                                    </div>

                                    <UpdatePasswordForm />
                                </div>

                                <div className="flex items-center justify-between gap-5">
                                    <div className="space-y-1">
                                        <h4 className="font-semibold">
                                            Delete Account
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            This will permanently delete your
                                            account. This action is
                                            irreversible.
                                        </p>
                                    </div>

                                    <Dialog
                                        open={isAccountDeleteModalOpen}
                                        onOpenChange={
                                            setIsAccountDeleteModalOpen
                                        }
                                    >
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="min-w-28"
                                            >
                                                Delete Account
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Delete Account
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Are you sure you want to
                                                    delete your account? This
                                                    action is irreversible.
                                                </DialogDescription>
                                            </DialogHeader>

                                            <DialogFooter className="justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    isDisabled={isUserDeleting}
                                                    type="button"
                                                    onClick={() =>
                                                        setIsAccountDeleteModalOpen(
                                                            false
                                                        )
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
                    </div>
                </TabsContent>

                <TabsContent value="posts">
                    <div className="mt-4 space-y-4">
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
                                                <PostCard
                                                    post={post}
                                                    user={user}
                                                />
                                            </Link>
                                        ) : (
                                            <Link
                                                type="link"
                                                key={post.id}
                                                className="w-full"
                                                href={`/posts?p=${post.id}`}
                                            >
                                                <PostCard
                                                    post={post}
                                                    user={user}
                                                />
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
                </TabsContent>
            </Tabs>
        </>
    );
}

export default ProfilePage;
