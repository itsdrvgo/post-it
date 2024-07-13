"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Skeleton from "@/components/ui/skeleton";
import { ROLES } from "@/config/const";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { UserClientData } from "@/lib/validation";
import { GenericProps } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { DataTableColumnHeader } from "./data-table";
import { UsersTable } from "./users-table";

type User = Pick<
    UserClientData,
    "id" | "username" | "role" | "isRestricted" | "createdAt"
>;

const columns: ColumnDef<User>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "username",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Username" />
        ),
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const value = row.original.role;
            return <span className="uppercase">{value}</span>;
        },
    },
    {
        accessorKey: "restricted",
        header: "Restricted",
        cell: ({ row }) => {
            const value = row.original.isRestricted;
            return value ? "Yes" : "No";
        },
    },
    {
        accessorKey: "Joined At",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Joined At" />
        ),
        cell: ({ row }) => {
            const value = row.original.createdAt;
            return new Date(value).toLocaleDateString();
        },
        enableColumnFilter: false,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <Icons.moreHor className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        <DropdownMenuItem
                            onClick={() => {
                                navigator.clipboard.writeText(user.id);
                                toast.success("User ID copied to clipboard");
                            }}
                        >
                            Copy User ID
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => {
                                navigator.clipboard.writeText(user.username);
                                toast.success("Username copied to clipboard");
                            }}
                        >
                            Copy Username
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem disabled={user.role === ROLES.MOD}>
                            Promote
                        </DropdownMenuItem>

                        <DropdownMenuItem disabled={user.role === ROLES.USER}>
                            Demote
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="focus:bg-destructive">
                            {user.isRestricted ? "Unrestrict" : "Restrict"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="focus:bg-destructive">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

interface PageProps extends GenericProps {
    user: UserClientData;
}

export function UsersPage({ className, ...props }: PageProps) {
    const { data: userCount } = trpc.users.getUsersCount.useQuery(undefined, {
        initialData: 0,
    });

    const {
        data: usersRaw,
        isLoading,
        fetchNextPage,
        isFetchingNextPage,
        hasNextPage,
    } = trpc.users.getInfiniteUsers.useInfiniteQuery(
        {},
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    const pageCount = useMemo(
        () => (userCount ? Math.ceil(userCount / 10) : 1),
        [userCount]
    );

    const users = useMemo(
        () =>
            usersRaw?.pages
                .flatMap((page) => page.data)
                .filter((user): user is User => user !== undefined) ?? [],
        [usersRaw]
    );

    const handleLoadMore = () => {
        if (hasNextPage) fetchNextPage();
    };

    useEffect(() => {
        console.log(users);
    }, [users]);

    return (
        <div
            className={cn("flex flex-col justify-center gap-10", className)}
            {...props}
        >
            <div className="text-center md:space-y-2">
                <h2 className="text-2xl font-bold md:text-4xl">Users Table</h2>
                <p className="text-sm text-muted-foreground md:text-base">
                    List of all users on the platform and their details
                </p>
            </div>

            {isLoading ? (
                <UsersTableSkeleton />
            ) : (
                <UsersTable
                    userCount={userCount}
                    pageCount={pageCount}
                    columns={columns}
                    data={users}
                    hasNextPage={hasNextPage}
                    handleLoadMore={handleLoadMore}
                    isFetchingNextPage={isFetchingNextPage}
                />
            )}
        </div>
    );
}

function UsersTableSkeleton() {
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-5">
                <Skeleton className="h-10 w-full max-w-96" />
                <Skeleton className="h-8 w-full max-w-[4.5rem]" />
            </div>

            <Skeleton className="h-96 w-full" />

            <div className="flex items-center justify-between gap-5">
                <Skeleton className="h-5 w-full max-w-48" />

                <div className="flex items-center gap-6">
                    <Skeleton className="h-5 w-32" />

                    <div className="flex gap-2">
                        <Skeleton className="size-9" />
                        <Skeleton className="size-9" />
                    </div>
                </div>
            </div>
        </div>
    );
}
