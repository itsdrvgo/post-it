import { Metadata } from "next";
import GoBackButton from "../components/global/buttons/go-back-button";
import { EmptyPlaceholder } from "../components/ui/empty-placeholder";

export const metadata: Metadata = {
    title: "Page not found",
    description: "The page you are looking for does not exist.",
};

function Page() {
    return (
        <section className="flex h-screen w-full items-center justify-center p-5">
            <EmptyPlaceholder
                className="max-w-md"
                title="Page not found"
                description="The page you are looking for does not exist. Please check the URL or go back to the previous page."
                icon="construction"
                endContent={<GoBackButton color="danger" />}
            />
        </section>
    );
}

export default Page;
