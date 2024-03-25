import HomeFetch from "@/components/home/home-fetch";
import Loader from "@/components/ui/loader";
import { Suspense } from "react";

function Page() {
    return (
        <section className="flex w-full justify-center p-5">
            <Suspense fallback={<Loader />}>
                <HomeFetch />
            </Suspense>
        </section>
    );
}

export default Page;
