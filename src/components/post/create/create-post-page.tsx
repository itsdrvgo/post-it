"use client";

import { DEFAULT_IMAGE_URL } from "@/src/config/const";
import { UploadEvent, useDropzone } from "@/src/hooks/useDropzone";
import { trpc } from "@/src/lib/trpc/client";
import {
    cFetch,
    cn,
    extractYTVideoId,
    handleClientError,
    isYouTubeVideo,
} from "@/src/lib/utils";
import { ResponseData } from "@/src/lib/validation/response";
import { DefaultProps } from "@/src/types";
import { Avatar, Button, Image, Spinner, Textarea } from "@nextui-org/react";
import { createId } from "@paralleldrive/cuid2";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { Icons } from "../../icons/icons";
import { SafeUser } from "../../providers/user";

interface PageProps extends DefaultProps {
    user: SafeUser;
}

function CreatePostPage({ user, className, ...props }: PageProps) {
    const router = useRouter();

    const { processFiles, uploadConfig } = useDropzone();
    const [isDragging, setIsDragging] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [toastId, setToastId] = useState<string | undefined>(undefined);

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

    const { data: linkPreview, isLoading: isLinkLoading } =
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
            handleClientError(err, toastId);
        },
        onSettled: () => {
            setIsLoading(false);
            setToastId(undefined);
        },
    });

    const handleCreatePost = async () => {
        setIsLoading(true);
        setToastId(toast.loading("Creating post..."));

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
                }
            );

            if (res.message !== "OK") return toast.error(res.longMessage!);
            if (!res.data) return toast.error("No data returned");

            uploadedImages.push(...res.data);
        }

        createPost({
            content,
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
                <Avatar
                    src={DEFAULT_IMAGE_URL}
                    alt={user!.username}
                    showFallback
                />
            </div>

            <div className="flex w-full flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-sm text-white/60">@postit</p>
                    </div>

                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        radius="full"
                        isDisabled={isLoading}
                        startContent={
                            <Icons.media className="h-5 w-5 text-primary" />
                        }
                        onPress={() => fileInputRef.current?.click()}
                    />
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
                        variant="underlined"
                        placeholder={
                            "What are you thinking, @" + user.username + "?"
                        }
                        fullWidth
                        ref={textareaRef}
                        isDisabled={isLoading}
                        value={content}
                        onValueChange={setContent}
                    />

                    {isLinkLoading ? (
                        <div className="flex justify-center py-2">
                            <Spinner size="sm" />
                        </div>
                    ) : (
                        linkPreview &&
                        Object.keys(linkPreview).length > 0 &&
                        (isPreviewVisible ? (
                            <div
                                className={cn(
                                    "relative flex h-min gap-2 rounded-xl bg-default-100 p-2",
                                    isYouTubeVideo(linkPreview.url)
                                        ? "flex-col"
                                        : "flex-row-reverse"
                                )}
                            >
                                {isYouTubeVideo(linkPreview.url) ? (
                                    <div className="overflow-hidden rounded-lg">
                                        <LiteYouTubeEmbed
                                            id={
                                                extractYTVideoId(
                                                    linkPreview.url
                                                ) ?? ""
                                            }
                                            title={
                                                linkPreview.title ??
                                                "video_" + createId()
                                            }
                                        />
                                    </div>
                                ) : (
                                    linkPreview.image && (
                                        <div className="basis-1/5">
                                            <Image
                                                radius="sm"
                                                src={linkPreview.image}
                                                alt={
                                                    linkPreview.title ??
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
                                        <p className="text-sm opacity-60">
                                            {linkPreview.description}
                                        </p>
                                    )}
                                </div>

                                <div className="absolute right-2 top-0 z-10">
                                    <Button
                                        isIconOnly
                                        radius="full"
                                        size="sm"
                                        variant="shadow"
                                        className="h-6 w-6 min-w-0"
                                        isDisabled={isLoading}
                                        startContent={
                                            <Icons.close className="h-[14px] w-[14px]" />
                                        }
                                        onPress={() =>
                                            setIsPreviewVisible(false)
                                        }
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-2 rounded-xl bg-default-100 p-2">
                                <p className="text-sm opacity-80">
                                    Link preview has been disabled
                                </p>
                                <Button
                                    size="sm"
                                    color="primary"
                                    isDisabled={isLoading}
                                    className="font-semibold text-white dark:text-black"
                                    onPress={() => setIsPreviewVisible(true)}
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
                                    className="group relative overflow-hidden"
                                >
                                    <Image
                                        src={image.url}
                                        alt={image.file.name}
                                        radius="sm"
                                        className="aspect-video object-cover"
                                    />

                                    <div className="absolute right-0 top-2 z-10 h-full translate-x-full transition-all ease-in-out group-hover:right-2 group-hover:translate-x-0">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            className="h-6 w-6 min-w-unit-0"
                                            radius="full"
                                            isDisabled={isLoading}
                                            startContent={
                                                <Icons.close className="h-4 w-4 text-white" />
                                            }
                                            onPress={() =>
                                                setImages((prev) =>
                                                    prev.filter(
                                                        (prevImage) =>
                                                            prevImage.id !==
                                                            image.id
                                                    )
                                                )
                                            }
                                        />
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
                        radius="sm"
                        size="sm"
                        className="font-semibold"
                        isDisabled={!content || isLoading}
                        onPress={() => {
                            handleReset();
                            textareaRef.current?.focus();
                        }}
                    >
                        Reset
                    </Button>

                    <Button
                        radius="sm"
                        size="sm"
                        color="primary"
                        className="font-semibold text-black"
                        isDisabled={!content || isLoading}
                        isLoading={isLoading}
                        onPress={handleCreatePost}
                    >
                        Post
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default CreatePostPage;
