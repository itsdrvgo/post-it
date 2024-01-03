"use client";

import { Post, User } from "@/src/lib/drizzle/schema";
import { DefaultProps } from "@/src/types";
import { useRouter } from "next/navigation";
import PostCard from "../../home/post-card";
import { useUser } from "../../providers/user";
import Loader from "../../ui/loader";

interface PageProps extends DefaultProps {
    post: Post & {
        author: Omit<User, "password">;
    };
}

function PostPage({ post, className, ...props }: PageProps) {
    const router = useRouter();

    const { isLoaded, isSignedIn, user } = useUser();

    if (!isLoaded) return <Loader />;
    if (!isSignedIn) router.push("/auth");

    return (
        <PostCard post={post} user={user!} className={className} {...props} />
    );
}

export default PostPage;
