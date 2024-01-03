"use client";

import PostCard from "@/src/components/home/post-card";
import { useUser } from "@/src/components/providers/user";
import Loader from "@/src/components/ui/loader";
import { trpc } from "@/src/lib/trpc/client";
import { useIntersection } from "@mantine/hooks";
import { Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

function Page() {
    const router = useRouter();

    const { isLoaded, isSignedIn, user } = useUser();

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

    if (!isLoaded) return <Loader />;
    if (!isSignedIn) router.push("/auth");

    return (
        <section className="flex w-full justify-center p-5">
            <div className="w-full max-w-2xl space-y-4">
                {isLoading ? (
                    <div className="flex justify-center">
                        <Loader />
                    </div>
                ) : !!posts.length ? (
                    <>
                        {posts.map((post, i) =>
                            i === posts.length - 1 ? (
                                <div ref={ref} key={post.id}>
                                    <PostCard post={post} user={user!} />
                                </div>
                            ) : (
                                <div key={post.id}>
                                    <PostCard post={post} user={user!} />
                                </div>
                            )
                        )}

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
        </section>
    );
}

export default Page;
