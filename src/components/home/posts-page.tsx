"use client";

import { trpc } from "@/src/lib/trpc/client";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { useIntersection } from "@mantine/hooks";
import { Divider, Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { SafeUser } from "../providers/user";
import Loader from "../ui/loader";
import PostCard from "./post-card";

interface PageProps extends DefaultProps {
    user: SafeUser;
}

function PostsPage({ user, className, ...props }: PageProps) {
    const router = useRouter();

    const {
        data: postsRaw,
        isLoading,
        fetchNextPage,
        isFetchingNextPage,
    } = trpc.posts.getInfinitePosts.useInfiniteQuery(
        {},
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
        <div className={cn("w-full max-w-2xl space-y-4", className)} {...props}>
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
                                        router.push(`/posts?p=${post.id}`)
                                    }
                                >
                                    <PostCard post={post} user={user} />
                                </div>
                            ) : (
                                <div
                                    key={post.id}
                                    className="cursor-pointer"
                                    onClick={() =>
                                        router.push(`/posts?p=${post.id}`)
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
                    <p className="text-sm text-white/60">No posts to show</p>
                </div>
            )}
        </div>
    );
}

export default PostsPage;
