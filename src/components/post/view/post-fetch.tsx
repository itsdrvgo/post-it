import { db } from "@/src/lib/drizzle";
import { posts } from "@/src/lib/drizzle/schema";
import { DefaultProps } from "@/src/types";
import { eq } from "drizzle-orm";
import NoPostPage from "../../global/404/no-post";
import PostPage from "./post-page";

interface PageProps extends DefaultProps {
    searchParams: {
        p: string;
    };
}

async function PostFetch({ searchParams, className, ...props }: PageProps) {
    const post = await db.query.posts.findFirst({
        where: eq(posts.id, searchParams.p),
        with: {
            author: true,
        },
    });
    if (!post) return <NoPostPage />;

    const parsedPost = {
        ...post,
        author: {
            ...post.author,
            password: undefined,
        },
    };

    return <PostPage post={parsedPost} className={className} {...props} />;
}

export default PostFetch;
