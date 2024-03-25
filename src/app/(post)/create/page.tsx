import CreateFetch from "@/components/post/create/create-fetch";
import Loader from "@/components/ui/loader";
import { Suspense } from "react";

function Page() {
    return (
        <section className="flex justify-center p-5">
            <div className="w-full max-w-2xl">
                <Suspense fallback={<Loader />}>
                    <CreateFetch />
                </Suspense>
            </div>
        </section>
    );
}

export default Page;
