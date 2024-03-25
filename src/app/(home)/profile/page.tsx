import ProfileFetch from "@/components/profile/profile-fetch";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile | Post It",
    description: "View and manage your profile and your posts.",
};

function Page() {
    return (
        <section className="flex w-full justify-center p-5">
            <ProfileFetch />
        </section>
    );
}

export default Page;
