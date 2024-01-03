"use client";

import { DEFAULT_IMAGE_URL } from "@/src/config/const";
import { Post, User } from "@/src/lib/drizzle/schema";
import {
    cn,
    convertMstoTimeElapsed,
    extractYTVideoId,
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
} from "@nextui-org/react";
import { createId } from "@paralleldrive/cuid2";
import { Icons } from "../icons/icons";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import LiteYouTubeEmbed from "react-lite-youtube-embed";

interface PageProps extends DefaultProps {
    post: Post & {
        author: User;
    };
    user: User;
}

function PostCard({ post, user, className, ...props }: PageProps) {
    return (
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
                        <p className="font-semibold">{post.author.username}</p>
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
                                    <Icons.moreVert className="h-5 w-5" />
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
                                <DropdownItem key="copy_link">
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
                                <DropdownItem key="delete" color="danger">
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
                                    src={attachment?.url}
                                    alt={attachment?.name}
                                    radius="sm"
                                    className="aspect-video object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
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
