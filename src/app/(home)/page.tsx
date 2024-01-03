"use client";

import PostsPage from "@/src/components/home/posts-page";
import { useUser } from "@/src/components/providers/user";
import Loader from "@/src/components/ui/loader";
import { useRouter } from "next/navigation";

function Page() {
    const router = useRouter();

    const { isLoaded, isSignedIn, user } = useUser();

    if (!isLoaded) return <Loader />;
    if (!isSignedIn) router.push("/auth");

    return (
        <section className="flex w-full justify-center p-5">
            <PostsPage user={user!} />
        </section>
    );
}

export default Page;
