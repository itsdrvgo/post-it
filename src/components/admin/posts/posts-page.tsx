"use client";

import { PostCard } from "@/components/global/cards";
import { Loader } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { POST_STATUS } from "@/config/const";
import { trpc } from "@/lib/trpc/client";
import { UserClientData } from "@/lib/validation";
import { useIntersection } from "@mantine/hooks";
import { ElementRef, useEffect, useMemo, useRef } from "react";
import { PostActions } from "./post-actions";
import { PostsMassActions } from "./posts-mass-actions";

interface PageProps {
    user: UserClientData;
}

export function PostsPage({ user }: PageProps) {
    const {
        data: postsRaw,
        isLoading,
        fetchNextPage,
        isFetchingNextPage,
    } = trpc.posts.getInfinitePosts.useInfiniteQuery(
        {
            status: POST_STATUS.PENDING,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    const viewportRef = useRef<ElementRef<"div">>(null);
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
            <PostsMassActions posts={posts} />

            <Separator />

            {isLoading ? (
                <div className="flex justify-center">
                    <Loader />
                </div>
            ) : !!posts.length ? (
                <div className="space-y-4">
                    {posts.map((post, i) => (
                        <>
                            {i === posts.length - 1 ? (
                                <div ref={ref} key={post.id} className="w-full">
                                    <PostCard
                                        post={post}
                                        dropdown={
                                            <PostActions
                                                post={post}
                                                user={user}
                                            />
                                        }
                                    />
                                </div>
                            ) : (
                                <div key={post.id} className="w-full">
                                    <PostCard
                                        post={post}
                                        dropdown={
                                            <PostActions
                                                post={post}
                                                user={user}
                                            />
                                        }
                                    />
                                </div>
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
                </div>
            ) : (
                <div className="flex justify-center">
                    <p className="text-sm text-white/60">No posts to show</p>
                </div>
            )}
        </>
    );
}
