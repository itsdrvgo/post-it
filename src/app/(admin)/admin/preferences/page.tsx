import { PreferencesFetch } from "@/components/admin/preferences";
import { AdminShell, NavbarDash, Sidebar } from "@/components/global/layouts";
import { Loader } from "@/components/ui/loader";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Preferences",
    description: "Manage preferences for the platform",
};

function Page() {
    return (
        <>
            <Sidebar />

            <div className="ml-14 flex flex-1 flex-col md:ml-[4.5rem]">
                <NavbarDash />

                <AdminShell>
                    <Suspense fallback={<Loader />}>
                        <PreferencesFetch />
                    </Suspense>
                </AdminShell>
            </div>
        </>
    );
}

export default Page;
