import { GeneralShell } from "@/components/global/layouts";
import { HomeFetch } from "@/components/home";
import { Loader } from "@/components/ui/loader";
import { Suspense } from "react";

function Page() {
    return (
        <GeneralShell>
            <Suspense fallback={<Loader />}>
                <HomeFetch />
            </Suspense>
        </GeneralShell>
    );
}

export default Page;
