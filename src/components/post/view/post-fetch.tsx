import PostCard from "@/components/home/post-card";
import { PAGES, TOKENS } from "@/config/const";
import { db } from "@/lib/drizzle";
import { Post, posts, users } from "@/lib/drizzle/schema";
import { decodeAuthToken } from "@/lib/jwt";
import { UserClientData, userClientSchema } from "@/lib/validation/user";
import { GenericProps } from "@/types";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NoPostPage from "../../global/404/no-post";

interface PageProps extends GenericProps {
    searchParams: {
        p: string;
    };
}

async function PostFetch({ searchParams, className, ...props }: PageProps) {
    const cookieStore = cookies();
    const authToken = cookieStore.get(TOKENS.AUTH_COOKIE_NAME)?.value;
    if (!authToken) redirect(PAGES.AUTH_PAGE);

    const { sub: userId } = decodeAuthToken(authToken);
    if (!userId) redirect(PAGES.AUTH_PAGE);

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });
    if (!user) redirect(PAGES.AUTH_PAGE);

    const post = await db.query.posts.findFirst({
        where: eq(posts.id, searchParams.p),
        with: {
            author: true,
        },
    });
    if (!post) return <NoPostPage />;

    const parsedPost: Post & {
        author: UserClientData;
    } = {
        ...post,
        author: {
            id: post.author.id,
            username: post.author.username,
            isFirstTime: post.author.isFirstTime,
            createdAt: post.author.createdAt,
        },
    };

    const parsedUser = userClientSchema.parse(user);

    return (
        <PostCard
            post={parsedPost}
            user={parsedUser}
            className={className}
            {...props}
        />
    );
}

export default PostFetch;
