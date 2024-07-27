import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { wait } from "@/lib/utils";
import { Table } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
}

export function DataTablePagination<TData>({
    table,
}: DataTablePaginationProps<TData>) {
    const { isFetchingNextPage, fetchNextPage, hasNextPage } =
        trpc.users.getInfiniteUsers.useInfiniteQuery(
            {},
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
                refetchOnMount: false,
            }
        );

    const [currentPage, setCurrentPage] = useState(1);
    const [lastLoadedPage, setLastLoadedPage] = useState(1);

    useEffect(() => {
        async function waitAndSetPage() {
            await wait(50);
            table.setPageIndex(currentPage - 1);
        }

        if (!isFetchingNextPage) waitAndSetPage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFetchingNextPage]);

    const goNextPage = () => {
        if (currentPage === lastLoadedPage) {
            if (hasNextPage) {
                fetchNextPage();
                setLastLoadedPage(lastLoadedPage + 1);
                setCurrentPage(currentPage + 1);
            }
        } else {
            setCurrentPage(currentPage + 1);
            table.setPageIndex(currentPage);
        }
    };

    const goPreviousPage = () => {
        setCurrentPage(currentPage - 1);
        table.setPageIndex(currentPage - 2);
    };

    const { data: userCount } = trpc.users.getUsersCount.useQuery(undefined, {
        initialData: 0,
    });

    const pageCount = useMemo(
        () => (userCount ? Math.ceil(userCount / 10) : 1),
        [userCount]
    );

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
                        type="button"
                        variant="outline"
                        className="size-8 p-0"
                        onClick={goPreviousPage}
                        disabled={currentPage === 1 || isFetchingNextPage}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <Icons.chevronLeft className="size-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="size-8 p-0"
                        onClick={goNextPage}
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
