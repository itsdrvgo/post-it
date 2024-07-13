import { PostsFetch } from "@/components/admin/posts";
import { AdminShell, NavbarDash, Sidebar } from "@/components/global/layouts";
import { Loader } from "@/components/ui/loader";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Posts",
    description: "Allow or remove pending posts",
};

function Page() {
    return (
        <>
            <Sidebar />

            <div className="ml-14 flex flex-1 flex-col md:ml-[4.5rem]">
                <NavbarDash />

                <AdminShell>
                    <Suspense fallback={<Loader />}>
                        <PostsFetch />
                    </Suspense>
                </AdminShell>
            </div>
        </>
    );
}

export default Page;
