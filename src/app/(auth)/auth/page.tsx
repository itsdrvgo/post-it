"use client";

import AuthPage from "@/src/components/auth/auth-page";
import { useUser } from "@/src/components/providers/user";
import Loader from "@/src/components/ui/loader";
import { useRouter } from "next/navigation";

function Page() {
    const router = useRouter();

    const { isLoaded, isSignedIn, setUser, user } = useUser();

    if (!isLoaded) return <Loader />;
    if (isSignedIn) router.push("/");

    return (
        <section className="flex h-screen w-full items-center justify-center p-5">
            <div className="w-full max-w-md">
                <AuthPage user={user} setUser={setUser} />
            </div>
        </section>
    );
}

export default Page;
