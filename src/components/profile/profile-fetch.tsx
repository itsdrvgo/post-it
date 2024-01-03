"use client";

import { DefaultProps } from "@/src/types";
import { useRouter } from "next/navigation";
import { useUser } from "../providers/user";
import Loader from "../ui/loader";
import ProfilePage from "./profile-page";

function ProfileFetch(props: DefaultProps) {
    const router = useRouter();

    const { isLoaded, isSignedIn, user, setUser } = useUser();

    if (!isLoaded) return <Loader />;
    if (!isSignedIn) router.push("/auth");

    return <ProfilePage user={user!} setUser={setUser} {...props} />;
}

export default ProfileFetch;
