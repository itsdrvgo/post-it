"use client";

import { DEFAULT_IMAGE_URL } from "@/src/config/const";
import { trpc } from "@/src/lib/trpc/client";
import { cn, handleClientError } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { useIntersection } from "@mantine/hooks";
import {
    Avatar,
    Button,
    Divider,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    useDisclosure,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import PostCard from "../home/post-card";
import { SafeUser } from "../providers/user";
import Loader from "../ui/loader";

interface PageProps extends DefaultProps {
    user: SafeUser;
    setUser: Dispatch<SetStateAction<SafeUser | null>>;
}

function ProfilePage({ user, setUser, className, ...props }: PageProps) {
    const router = useRouter();

    const {
        isOpen: isAccountDeleteModalOpen,
        onOpen: onAccountDeleteModalOpen,
        onClose: onAccountDeleteModalClose,
        onOpenChange: onAccountDeleteModalOpenChange,
    } = useDisclosure();

    const { mutate: deleteUser, isLoading: isUserDeleting } =
        trpc.users.deleteUser.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Deleting account...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Account deleted successfully!", {
                    id: ctx?.toastId,
                });
                setUser(null);
                onAccountDeleteModalClose();
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

    const viewportRef = useRef<HTMLDivElement>(null);
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

    return (
        <>
            <div
                className={cn("w-full max-w-2xl space-y-5", className)}
                {...props}
            >
                <div className="flex items-center justify-between rounded-lg border border-primary bg-default-100 p-4">
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={DEFAULT_IMAGE_URL}
                            alt={user.username}
                            showFallback
                        />

                        <p className="text-sm">@{user.username}</p>
                    </div>

                    <div>
                        <Button
                            color="danger"
                            size="sm"
                            radius="sm"
                            onPress={onAccountDeleteModalOpen}
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>

                <Divider />

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
                                        <div
                                            ref={ref}
                                            key={post.id}
                                            className="cursor-pointer"
                                            onClick={() =>
                                                router.push(
                                                    `/posts?p=${post.id}`
                                                )
                                            }
                                        >
                                            <PostCard post={post} user={user} />
                                        </div>
                                    ) : (
                                        <div
                                            key={post.id}
                                            className="cursor-pointer"
                                            onClick={() =>
                                                router.push(
                                                    `/posts?p=${post.id}`
                                                )
                                            }
                                        >
                                            <PostCard post={post} user={user} />
                                        </div>
                                    )}

                                    <Divider />
                                </>
                            ))}

                            {isFetchingNextPage && (
                                <div className="flex justify-center">
                                    <Spinner />
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

            <Modal
                isOpen={isAccountDeleteModalOpen}
                onOpenChange={onAccountDeleteModalOpenChange}
                onClose={onAccountDeleteModalClose}
            >
                <ModalContent>
                    {(close) => (
                        <>
                            <ModalHeader>Delete Account</ModalHeader>

                            <ModalBody>
                                Are you sure you want to delete your account?
                                This action is irreversible.
                            </ModalBody>

                            <ModalFooter>
                                <Button
                                    radius="sm"
                                    variant="light"
                                    isDisabled={isUserDeleting}
                                    onPress={close}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    color="primary"
                                    variant="faded"
                                    radius="sm"
                                    isDisabled={isUserDeleting}
                                    isLoading={isUserDeleting}
                                    onPress={() =>
                                        deleteUser({
                                            id: user.id,
                                        })
                                    }
                                >
                                    Delete
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default ProfilePage;
