"use client";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { UserClientData } from "@/lib/validation/user";
import { GenericProps } from "@/types";
import { useIntersection } from "@mantine/hooks";
import { useEffect, useMemo, useRef } from "react";
import { Link } from "../ui/link";
import Loader from "../ui/loader";
import { Separator } from "../ui/separator";
import PostCard from "./post-card";

interface PageProps extends GenericProps {
    user: UserClientData;
}

function PostsPage({ user, className, ...props }: PageProps) {
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
                                <Link
                                    type="link"
                                    ref={ref}
                                    key={post.id}
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
