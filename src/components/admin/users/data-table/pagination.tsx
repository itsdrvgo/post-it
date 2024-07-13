import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTablePageStore } from "@/lib/store/table-page";
import { Table } from "@tanstack/react-table";

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
    userCount: number;
    pageCount: number;
    isFetchingNextPage: boolean;
    handleLoadMore: () => void;
}

export function DataTablePagination<TData>({
    table,
    userCount,
    pageCount,
    isFetchingNextPage,
    handleLoadMore,
}: DataTablePaginationProps<TData>) {
    const currentPage = useTablePageStore((state) => state.currentPage);
    const setCurrentPage = useTablePageStore((state) => state.setCurrentPage);

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of {userCount}{" "}
                row(s) selected.
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {currentPage} of {pageCount}
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="size-8 p-0"
                        onClick={() => {
                            table.setPageIndex(currentPage - 2);
                            setCurrentPage(currentPage - 1);
                        }}
                        disabled={currentPage === 1 || isFetchingNextPage}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <Icons.chevronLeft className="size-4" />
                    </Button>

                    <Button
                        variant="outline"
                        className="size-8 p-0"
                        onClick={() => {
                            handleLoadMore();
                            setCurrentPage(currentPage + 1);
                            table.setPageIndex(currentPage - 1);
                        }}
                        disabled={
                            currentPage === pageCount || isFetchingNextPage
                        }
                    >
                        <span className="sr-only">Go to next page</span>
                        {isFetchingNextPage ? (
                            <Spinner className="size-4" />
                        ) : (
                            <Icons.chevronRight className="size-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
