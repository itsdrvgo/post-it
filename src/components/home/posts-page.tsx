"use client";

import { trpc } from "@/lib/trpc/client";
import { UserClientData } from "@/lib/validation/user";
import { useIntersection } from "@mantine/hooks";
import { useEffect, useMemo, useRef } from "react";
import { Link } from "../ui/link";
import { Loader } from "../ui/loader";
import { Separator } from "../ui/separator";
import PostCard from "./post-card";

interface PageProps {
    user: UserClientData;
}

function PostsPage({ user }: PageProps) {
    const {
        data: postsRaw,
        isLoading,
        fetchNextPage,
        isFetchingNextPage,
    } = trpc.posts.getInfinitePosts.useInfiniteQuery(
        {},
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            refetchInterval: 1000 * 60 * 10,
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
        <div className="relative space-y-4">
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
                                    id={post.id}
                                    className="w-full"
                                    href={`/posts?p=${post.id}`}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <PostCard post={post} user={user} />
                                </Link>
                            ) : (
                                <Link
                                    type="link"
                                    key={post.id}
                                    id={post.id}
                                    className="w-full"
                                    href={`/posts?p=${post.id}`}
                                    onClick={(e) => e.preventDefault()}
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
                    <p className="text-sm text-white/60">No posts to show</p>
                </div>
            )}
        </div>
    );
}

export default PostsPage;
