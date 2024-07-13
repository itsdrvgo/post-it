"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_IMAGE_URL } from "@/config/const";
import { UploadEvent, useDropzone } from "@/hooks/useDropzone";
import { trpc } from "@/lib/trpc/client";
import {
    cFetch,
    cn,
    extractYTVideoId,
    generateId,
    getAccessToken,
    handleClientError,
    isYouTubeVideo,
} from "@/lib/utils";
import { ResponseData } from "@/lib/validation/response";
import { UserClientData } from "@/lib/validation/user";
import { GenericProps } from "@/types";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { setToken } from "@/components/providers/client";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { Icons } from "../../icons";

interface PageProps extends GenericProps {
    user: UserClientData;
}

export function CreatePostPage({ user, className, ...props }: PageProps) {
    const router = useRouter();

    const { processFiles, uploadConfig } = useDropzone();
    const [isDragging, setIsDragging] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [toastId, setToastId] = useState<string | number>();

    const [content, setContent] = useState("");
    const [images, setImages] = useState<ExtendedFile[]>([]);
    const [link, setLink] = useState("");
    const [isPreviewVisible, setIsPreviewVisible] = useState(true);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    useEffect(() => {
        const isLink = content.match(/https?:\/\/[^\s]+/g);
        if (isLink) {
            setLink(isLink[0]);
            setIsPreviewVisible(true);
        } else {
            setLink("");
            setIsPreviewVisible(false);
        }
    }, [content]);

    const { data: linkPreview, isPending: isLinkLoading } =
        trpc.links.getMetadata.useQuery({
            link,
        });

    const handleUpload = (e: UploadEvent) => {
        const { message, type, data, isError } = processFiles(e);

        if (isError) return toast.error(message);
        if (!type) return toast.error("No file selected");

        setIsDragging(false);

        switch (type) {
            case "image":
                if (data) {
                    if (
                        data.acceptedFiles.length + images.length >
                        uploadConfig.maxImageCount
                    )
                        return toast.error(
                            "You can only upload up to " +
                                uploadConfig.maxImageCount +
                                " images"
                        );

                    setImages((prev) => [...prev, ...data.acceptedFiles]);
                }
                break;

            case "text":
                const textarea = textareaRef.current;
                if (textarea) {
                    const { selectionStart, selectionEnd, value } = textarea;
                    const text = message;
                    if (selectionStart !== selectionEnd) {
                        setContent(
                            value.slice(0, selectionStart) +
                                text +
                                value.slice(selectionEnd)
                        );
                    } else {
                        setContent(value + text);
                    }
                }
                break;
        }
    };

    const handleReset = () => {
        setContent("");
        setImages([]);
        setIsPreviewVisible(true);
    };

    const { mutate: createPost } = trpc.posts.createPost.useMutation({
        onSuccess: () => {
            toast.success("Post created", {
                id: toastId,
            });
            router.push("/");
        },
        onError: (err) => {
            return handleClientError(err, toastId);
        },
        onSettled: () => {
            setIsLoading(false);
            setToastId(undefined);
        },
    });

    const handleCreatePost = async () => {
        try {
            setIsLoading(true);
            const tId = toast.loading("Creating post...");
            setToastId(tId);

            const accessToken = await getAccessToken();
            setToken(accessToken);

            const formData = new FormData();

            const uploadedImages: UploadFileResponse[] = [];

            if (images.length) {
                await Promise.all(
                    images.map((image) => {
                        formData.append("image", image.file);
                    })
                );

                const res = await cFetch<ResponseData<UploadFileResponse[]>>(
                    "/api/uploads",
                    {
                        method: "POST",
                        body: formData,
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                if (res.message !== "OK") throw new Error(res.longMessage!);
                if (!res.data) throw new Error("No image data returned");

                uploadedImages.push(...res.data);
            }

            createPost({
                content: content.trim(),
                authorId: user.id,
                metadata: {
                    ...linkPreview,
                    url: link,
                    isVisible: isPreviewVisible,
                },
                attachments: uploadedImages.map((image) => {
                    return {
                        type: "image",
                        url: image.data?.url!,
                        id: image.data?.key!,
                        name: image.data?.name!,
                    };
                }),
            });
        } catch (err) {
            setIsLoading(false);
            return handleClientError(err, toastId);
        }
    };

    return (
        <div
            className={cn(
                "flex gap-3 rounded-lg border border-dashed border-primary/0 p-1 md:gap-4",
                isDragging && "border-primary/100",
                className
            )}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
            }}
            onDrop={handleUpload}
            onPaste={handleUpload}
            {...props}
        >
            <div>
                <Avatar>
                    <AvatarImage src={DEFAULT_IMAGE_URL} alt={user.username} />
                    <AvatarFallback>
                        {user.username[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </div>

            <div className="flex w-full flex-col gap-5">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-sm text-white/60">@postit</p>
                    </div>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full"
                        isDisabled={isLoading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Icons.media className="size-5 text-primary" />
                    </Button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    className="hidden"
                    accept={uploadConfig.acceptedImageTypes.join(",")}
                    multiple
                />

                <div className="z-10 space-y-4 bg-background">
                    <Textarea
                        placeholder={
                            "What are you thinking, @" + user.username + "?"
                        }
                        ref={textareaRef}
                        isDisabled={isLoading}
                        minRows={4}
                        className="resize-none rounded-none border-b bg-transparent p-0 hover:bg-transparent focus:border-b-white focus:bg-transparent"
                        value={content}
                        onValueChange={setContent}
                    />

                    {isLinkLoading ? (
                        <Loader />
                    ) : (
                        linkPreview &&
                        Object.keys(linkPreview).length > 0 &&
                        (isPreviewVisible ? (
                            <div
                                className={cn(
                                    "relative grid gap-2 overflow-hidden rounded-lg border bg-card",
                                    isYouTubeVideo(linkPreview.url)
                                        ? "grid-flow-row"
                                        : "grid-cols-5"
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-4",
                                        "col-span-full",
                                        !isYouTubeVideo(linkPreview.url) &&
                                            "md:col-span-3",
                                        isYouTubeVideo(linkPreview.url) &&
                                            "order-2",
                                        linkPreview.title &&
                                            linkPreview.description &&
                                            "space-y-1"
                                    )}
                                >
                                    {linkPreview.title && (
                                        <p className="font-semibold">
                                            {linkPreview.title}
                                        </p>
                                    )}
                                    {linkPreview.description && (
                                        <p className="text-sm text-foreground/60">
                                            {linkPreview.description.length >
                                            120
                                                ? linkPreview.description.slice(
                                                      0,
                                                      120
                                                  ) + "..."
                                                : linkPreview.description}
                                        </p>
                                    )}
                                </div>

                                {isYouTubeVideo(linkPreview.url) ? (
                                    <LiteYouTubeEmbed
                                        id={
                                            extractYTVideoId(linkPreview.url) ??
                                            ""
                                        }
                                        title={
                                            linkPreview.title ??
                                            "video_" + generateId()
                                        }
                                    />
                                ) : (
                                    linkPreview.image && (
                                        <div
                                            className={cn(
                                                "h-full justify-end md:flex",
                                                "col-span-2 hidden"
                                            )}
                                        >
                                            <div className="aspect-square basis-1/2">
                                                <NextImage
                                                    src={linkPreview.image}
                                                    alt={
                                                        linkPreview.title ??
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

                                <div className="absolute right-0 top-0 z-10">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full"
                                        isDisabled={isLoading}
                                        onClick={() =>
                                            setIsPreviewVisible(false)
                                        }
                                    >
                                        <Icons.close className="size-[14px]" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-2 rounded-xl border bg-card p-2 pl-4">
                                <p className="text-sm opacity-80">
                                    Link preview has been disabled
                                </p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    isDisabled={isLoading}
                                    onClick={() => setIsPreviewVisible(true)}
                                >
                                    Show
                                </Button>
                            </div>
                        ))
                    )}

                    {!!images.length && (
                        <div
                            className={cn(
                                "grid",
                                images.length > 1
                                    ? "grid-cols-2 gap-2"
                                    : "grid-cols-1"
                            )}
                        >
                            {images.map((image) => (
                                <div
                                    key={image.id}
                                    className="group relative aspect-video overflow-hidden rounded-lg"
                                >
                                    <NextImage
                                        src={image.url}
                                        alt={image.file.name}
                                        className="size-full object-cover"
                                        width={500}
                                        height={500}
                                    />

                                    <div className="absolute right-0 top-2 z-10 h-full translate-x-full transition-all ease-in-out group-hover:right-2 group-hover:translate-x-0">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="rounded-full"
                                            isDisabled={isLoading}
                                            onClick={() =>
                                                setImages((prev) =>
                                                    prev.filter(
                                                        (prevImage) =>
                                                            prevImage.id !==
                                                            image.id
                                                    )
                                                )
                                            }
                                        >
                                            <Icons.close className="size-4 drop-shadow-md" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div
                    className={cn(
                        "pointer-events-none z-0 flex -translate-y-full justify-end gap-2 opacity-0 transition-all ease-in-out",
                        content &&
                            "pointer-events-auto translate-y-0 opacity-100"
                    )}
                >
                    <Button
                        size="sm"
                        variant="ghost"
                        isDisabled={!content || isLoading}
                        onClick={() => {
                            handleReset();
                            textareaRef.current?.focus();
                        }}
                    >
                        Reset
                    </Button>

                    <Button
                        size="sm"
                        isDisabled={!content || isLoading}
                        isLoading={isLoading}
                        className="font-semibold"
                        classNames={{
                            startContent: "text-background",
                        }}
                        onClick={handleCreatePost}
                    >
                        Post
                    </Button>
                </div>
            </div>
        </div>
    );
}
