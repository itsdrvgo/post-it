"use client";

import { Checkbox } from "@/components/ui/checkbox";
import Skeleton from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { UserClientData } from "@/lib/validation";
import { GenericProps } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTableColumnHeader } from "./data-table";
import { UserAction } from "./user-action";
import { UsersTable } from "./users-table";

export type TableUser = Pick<
    UserClientData,
    "id" | "username" | "role" | "isRestricted" | "createdAt"
>;

const columns: ColumnDef<TableUser>[] = [
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

            return <UserAction user={user} />;
        },
    },
];

interface PageProps extends GenericProps {
    user: UserClientData;
}

export function UsersPage({ className, ...props }: PageProps) {
    const { data: usersRaw, isLoading } =
        trpc.users.getInfiniteUsers.useInfiniteQuery(
            {},
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            }
        );

    const users = useMemo(
        () =>
            usersRaw?.pages
                .flatMap((page) => page.data)
                .filter((user): user is TableUser => user !== undefined) ?? [],
        [usersRaw]
    );

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
                <UsersTable columns={columns} data={users} />
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
