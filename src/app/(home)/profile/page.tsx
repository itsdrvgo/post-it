import { GeneralShell } from "@/components/global/layouts";
import ProfileFetch from "@/components/profile/profile-fetch";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile | Post It",
    description: "View and manage your profile and your posts.",
};

function Page() {
    return (
        <GeneralShell>
            <ProfileFetch />
        </GeneralShell>
    );
}

export default Page;
