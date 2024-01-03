"use client";

import CreatePostPage from "@/src/components/post/create/create-post-page";
import { useUser } from "@/src/components/providers/user";
import Loader from "@/src/components/ui/loader";
import { useRouter } from "next/navigation";

function Page() {
    const router = useRouter();

    const { isLoaded, isSignedIn, user } = useUser();

    if (!isLoaded) return <Loader />;
    if (!isSignedIn) router.push("/auth");

    return (
        <section className="flex justify-center p-5">
            <div className="w-full max-w-2xl">
                <CreatePostPage user={user!} />
            </div>
        </section>
    );
}

export default Page;
