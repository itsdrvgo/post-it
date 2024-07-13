"use client";

import { ViewImageModal } from "@/components/global/modals";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/components/ui/link";
import { DEFAULT_IMAGE_URL } from "@/config/const";
import { Post } from "@/lib/drizzle/schema";
import {
    cn,
    convertMstoTimeElapsed,
    extractYTVideoId,
    generateId,
    isYouTubeVideo,
    wait,
} from "@/lib/utils";
import { UserClientData } from "@/lib/validation/user";
import { GenericProps } from "@/types";
import NextImage from "next/image";
import React, { useState } from "react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

interface PageProps extends GenericProps {
    post: Post & {
        author: UserClientData;
    };
    dropdown: React.ReactNode;
}

export function PostCard({ post, dropdown, className, ...props }: PageProps) {
    const [image, setImage] = useState<string | null>(null);
    const [isImageViewModalOpen, setImageViewModalOpen] = useState(false);

    return (
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
                        <p className="font-semibold">{post.author.username}</p>
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

                    {dropdown}
                </div>

                <p className="text-sm md:text-base">
                    {post.content.split("\n").map((line, i) => {
                        const isLongWord =
                            line.indexOf(" ") === -1 && line.length > 20;

                        return (
                            <span
                                key={i}
                                className={cn(isLongWord && "break-all")}
                            >
                                {sanitizeContent(line)}
                                <br />
                            </span>
                        );
                    })}
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
                                        {post.metadata.description.length > 120
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
                                        extractYTVideoId(post.metadata.url) ??
                                        ""
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
                                <ViewImageModal
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
                                                setImage(attachment?.url ?? "");

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
    );
}

function sanitizeContent(content: string) {
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
