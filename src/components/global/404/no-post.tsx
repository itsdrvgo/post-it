import { EmptyPlaceholder } from "@/components/ui/empty-placeholder";

function NoPostPage() {
    return (
        <div className="flex justify-center p-5">
            <EmptyPlaceholder
                title="No Post Found"
                description="The post you are looking for does not exist."
                isBackgroundVisible={false}
            />
        </div>
    );
}

export default NoPostPage;
