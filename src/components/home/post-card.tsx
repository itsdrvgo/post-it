"use client";

import { DEFAULT_IMAGE_URL } from "@/src/config/const";
import { Post } from "@/src/lib/drizzle/schema";
import { trpc } from "@/src/lib/trpc/client";
import {
    cn,
    convertMstoTimeElapsed,
    extractYTVideoId,
    handleClientError,
    isYouTubeVideo,
} from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import {
    Avatar,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Image,
    Link,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@nextui-org/react";
import { createId } from "@paralleldrive/cuid2";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import ImageViewModal from "../global/modals/image-view-modal";
import { Icons } from "../icons/icons";
import { SafeUser } from "../providers/user";

interface PageProps extends DefaultProps {
    post: Post & {
        author: SafeUser;
    };
    user: SafeUser;
}

function PostCard({ post, user, className, ...props }: PageProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [image, setImage] = useState<string | null>(null);

    const {
        isOpen: isDeleteModalOpen,
        onClose: onDeleteModalClose,
        onOpen: onDeleteModalOpen,
        onOpenChange: onDeleteModalOpenChange,
    } = useDisclosure();

    const {
        isOpen: isImageViewModalOpen,
        onClose: onImageViewModalClose,
        onOpen: onImageViewModalOpen,
        onOpenChange: onImageViewModalOpenChange,
    } = useDisclosure();

    const { mutate: deletePost, isLoading: isDeleting } =
        trpc.posts.deletePost.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Deleting post...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                onDeleteModalClose();
                toast.success("Post deleted!", {
                    id: ctx?.toastId,
                });
                router.refresh();
            },
            onError: (err, _, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
        });

    return (
        <>
            <div className={cn("flex gap-3 md:gap-4", className)} {...props}>
                <div>
                    <Avatar
                        src={DEFAULT_IMAGE_URL}
                        alt={post.author.username}
                        showFallback
                    />
                </div>

                <div className="flex w-full flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <p className="font-semibold">
                                {post.author.username}
                            </p>
                            <p className="space-x-1 text-sm text-white/60">
                                <span>@postit</span>
                                <span>•</span>
                                <span>
                                    {convertMstoTimeElapsed(
                                        post.createdAt.getTime()
                                    )}
                                </span>
                            </p>
                        </div>

                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    isIconOnly
                                    radius="full"
                                    size="sm"
                                    variant="light"
                                    startContent={
                                        <Icons.moreVert className="h-4 w-4" />
                                    }
                                />
                            </DropdownTrigger>

                            <DropdownMenu>
                                <DropdownSection
                                    aria-label="Public actions"
                                    showDivider={
                                        !!user && user.id === post.author.id
                                    }
                                >
                                    <DropdownItem
                                        key="copy_link"
                                        onPress={() => {
                                            navigator.clipboard.writeText(
                                                window.location.href +
                                                    "posts?p=" +
                                                    post.id
                                            );
                                            toast.success(
                                                "Copied link to clipboard"
                                            );
                                        }}
                                    >
                                        Copy Link
                                    </DropdownItem>
                                </DropdownSection>

                                <DropdownSection
                                    aria-label="Private actions"
                                    className={cn(
                                        !!user && user.id === post.author.id
                                            ? "block"
                                            : "hidden"
                                    )}
                                >
                                    <DropdownItem
                                        key="delete"
                                        color="danger"
                                        onPress={onDeleteModalOpen}
                                    >
                                        Delete
                                    </DropdownItem>
                                </DropdownSection>
                            </DropdownMenu>
                        </Dropdown>
                    </div>

                    <p className="text-sm md:text-base">
                        {post.content.split("\n").map((line, i) => (
                            <span key={i}>{sanitizeContent(line)}</span>
                        ))}
                    </p>

                    {post.metadata &&
                        Object.keys(post.metadata).length > 0 &&
                        post.metadata.isVisible && (
                            <div
                                className={cn(
                                    "flex h-min gap-2 rounded-xl bg-default-100 p-2",
                                    isYouTubeVideo(post.metadata.url)
                                        ? "flex-col"
                                        : "flex-row-reverse"
                                )}
                            >
                                {isYouTubeVideo(post.metadata.url) ? (
                                    <div className="overflow-hidden rounded-lg">
                                        <LiteYouTubeEmbed
                                            id={
                                                extractYTVideoId(
                                                    post.metadata.url
                                                ) ?? ""
                                            }
                                            title={
                                                post.metadata.title ??
                                                "video_" + createId()
                                            }
                                        />
                                    </div>
                                ) : (
                                    post.metadata.image && (
                                        <div className="basis-1/5">
                                            <Image
                                                radius="sm"
                                                src={post.metadata.image}
                                                alt={
                                                    post.metadata.title ??
                                                    "image_" + createId()
                                                }
                                                className="aspect-square object-cover"
                                            />
                                        </div>
                                    )
                                )}

                                <div
                                    className={cn(
                                        "basis-4/5 px-1",
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
                                        <p className="text-sm opacity-60">
                                            {post.metadata.description}
                                        </p>
                                    )}
                                </div>
                            </div>
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
                                    className="overflow-hidden"
                                >
                                    <Image
                                        as={NextImage}
                                        src={attachment?.url}
                                        alt={attachment?.name}
                                        radius="sm"
                                        className="aspect-video cursor-pointer object-cover"
                                        width={700}
                                        height={700}
                                        onClick={() => {
                                            if (pathname === "/") return;
                                            setImage(attachment?.url ?? "");
                                            onImageViewModalOpen();
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ImageViewModal
                image={image ?? ""}
                isOpen={isImageViewModalOpen}
                onClose={onImageViewModalClose}
                onOpenChange={onImageViewModalOpenChange}
            />

            <Modal
                isOpen={isDeleteModalOpen}
                onOpenChange={onDeleteModalOpenChange}
                onClose={onDeleteModalClose}
            >
                <ModalContent>
                    {(close) => (
                        <>
                            <ModalHeader>Delete Post</ModalHeader>

                            <ModalBody>
                                Are you sure you want to delete this post? This
                                action is irreversible.
                            </ModalBody>

                            <ModalFooter>
                                <Button
                                    radius="sm"
                                    variant="light"
                                    isDisabled={isDeleting}
                                    onPress={close}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    color="primary"
                                    variant="faded"
                                    radius="sm"
                                    isLoading={isDeleting}
                                    isDisabled={isDeleting}
                                    onPress={() =>
                                        deletePost({
                                            id: post.id,
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

export default PostCard;

export function sanitizeContent(content: string) {
    return content.split(/(https?:\/\/[^\s]+)/g).map((part) => {
        if (part.match(/(https?:\/\/[^\s]+)/g)) {
            return (
                <Link key={createId()} href={part} underline="hover" isExternal>
                    {part}
                </Link>
            );
        } else if (part.match(/(@[^\s]+)/g)) {
            return (
                <Link
                    key={createId()}
                    href={`/u/${part.slice(1)}`}
                    underline="hover"
                >
                    {part}
                </Link>
            );
        } else if (part.match(/(#[^\s]+)/g)) {
            return (
                <Link
                    key={createId()}
                    href={`/t/${part.slice(1)}`}
                    underline="hover"
                >
                    {part}
                </Link>
            );
        } else {
            return part;
        }
    });
}
