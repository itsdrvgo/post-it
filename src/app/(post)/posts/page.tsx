import NoPostPage from "@/components/global/404/no-post";
import PostFetch from "@/components/post/view/post-fetch";
import Loader from "@/components/ui/loader";
import { siteConfig } from "@/config/site";
import { db } from "@/lib/drizzle";
import { posts } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { Suspense } from "react";

interface PageProps {
    searchParams: {
        p: string;
    };
}

export async function generateMetadata({
    searchParams,
}: PageProps): Promise<Metadata> {
    if (!searchParams || !searchParams?.p)
        return {
            title: "Not Found",
            description: "No post was found.",
        };

    const post = await db.query.posts.findFirst({
        where: eq(posts.id, searchParams.p),
        with: {
            author: true,
        },
    });
    if (!post)
        return {
            title: "Not Found",
            description: "No post was found.",
        };

    return {
        title:
            "@" +
            post.author.username +
            " on " +
            siteConfig.name +
            ' / "' +
            post.content.slice(0, 20) +
            '..."',
        description: post.content,
    };
}

function Page({ searchParams }: PageProps) {
    if (!searchParams || !searchParams?.p) return <NoPostPage />;

    return (
        <section className="flex justify-center p-5">
            <div className="w-full max-w-2xl">
                <Suspense fallback={<Loader />}>
                    <PostFetch searchParams={searchParams} />
                </Suspense>
            </div>
        </section>
    );
}

export default Page;
