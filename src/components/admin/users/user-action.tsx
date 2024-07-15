import { Icons } from "@/components/icons";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES } from "@/config/const";
import { trpc } from "@/lib/trpc/client";
import { handleClientError } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { TableUser } from "./users-page";

interface PageProps {
    user: TableUser;
}

export function UserAction({ user }: PageProps) {
    const { refetch } = trpc.users.getInfiniteUsers.useInfiniteQuery(
        {},
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            refetchOnMount: false,
        }
    );

    const [action, setAction] = useState<"promote" | "demote">("promote");

    const [isUpdateRoleModalOpen, setIsUpdateRoleModalOpen] = useState(false);
    const [isRestrictRoleModalOpen, setIsRestrictRoleModalOpen] =
        useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { data: currentUserData, isPending: isCurrentUserFetching } =
        trpc.users.currentUser.useQuery();

    const { mutate: updateRole, isPending: isUpdatingRole } =
        trpc.users.updateUserRole.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating user role...");
                return { toastId };
            },
            onSuccess: (data, __, { toastId }) => {
                toast.success(
                    `User role updated to ${data.user.role.toUpperCase()}`,
                    { id: toastId }
                );

                refetch();
                setIsUpdateRoleModalOpen(false);
            },
            onError: (err, _, ctx) => {
                return handleClientError(err, ctx?.toastId);
            },
        });

    const {
        mutate: manageUserRestriction,
        isPending: isUserRestrictionUpdating,
    } = trpc.users.manageUserRestriction.useMutation({
        onMutate: () => {
            const toastId = toast.loading("Updating user restriction...");
            return { toastId };
        },
        onSuccess: (data, __, { toastId }) => {
            toast.success(
                `User is now ${data.user.isRestricted ? "restricted" : "unrestricted"}`,
                { id: toastId }
            );

            refetch();
            setIsRestrictRoleModalOpen(false);
        },
        onError: (err, _, ctx) => {
            return handleClientError(err, ctx?.toastId);
        },
    });

    const { mutate: deleteUser, isPending: isDeletingUser } =
        trpc.users.deleteUserById.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Deleting user...");
                return { toastId };
            },
            onSuccess: (_, __, { toastId }) => {
                toast.success("User deleted!", { id: toastId });

                refetch();
                setIsDeleteModalOpen(false);
            },
            onError: (err, _, ctx) => {
                return handleClientError(err, ctx?.toastId);
            },
        });

    const handleUpdateRole = () => {
        const updatedRole = getUpdatedUserRole(user.role as ROLES, action);
        if (!updatedRole) {
            setIsUpdateRoleModalOpen(false);
            return toast.error("Invalid action");
        }

        updateRole({ id: user.id, role: updatedRole });
    };

    return (
        <>
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

                    <DropdownMenuItem
                        disabled={
                            isCurrentUserFetching ||
                            !currentUserData ||
                            user.role === ROLES.MOD ||
                            user.id === currentUserData.user.id ||
                            currentUserData.user.role !== ROLES.ADMIN
                        }
                        onClick={() => {
                            setAction("promote");
                            setIsUpdateRoleModalOpen(true);
                        }}
                    >
                        Promote
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        disabled={
                            isCurrentUserFetching ||
                            !currentUserData ||
                            user.role === ROLES.USER ||
                            user.id === currentUserData.user.id ||
                            currentUserData.user.role !== ROLES.ADMIN
                        }
                        onClick={() => {
                            setAction("demote");
                            setIsUpdateRoleModalOpen(true);
                        }}
                    >
                        Demote
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        className="focus:bg-destructive"
                        disabled={
                            isCurrentUserFetching ||
                            !currentUserData ||
                            user.id === currentUserData.user.id ||
                            currentUserData.user.role !== ROLES.ADMIN
                        }
                        onClick={() => setIsRestrictRoleModalOpen(true)}
                    >
                        {user.isRestricted ? "Unrestrict" : "Restrict"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        className="focus:bg-destructive"
                        disabled={
                            isCurrentUserFetching ||
                            !currentUserData ||
                            user.id === currentUserData.user.id ||
                            currentUserData.user.role !== ROLES.ADMIN
                        }
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog
                open={isUpdateRoleModalOpen}
                onOpenChange={setIsUpdateRoleModalOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            <span className="capitalize">{action}</span> @
                            {user.username}
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Are you sure you want to {action} @{user.username}{" "}
                            to{" "}
                            {getUpdatedUserRole(
                                user.role as ROLES,
                                action
                            )?.toUpperCase()}
                            ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <Button
                            size="sm"
                            variant="outline"
                            isDisabled={isUpdatingRole}
                            onClick={() => setIsUpdateRoleModalOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            size="sm"
                            className="font-semibold capitalize"
                            isDisabled={isUpdatingRole}
                            isLoading={isUpdatingRole}
                            onClick={handleUpdateRole}
                            classNames={{
                                startContent: "text-background",
                            }}
                        >
                            {action} User
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={isRestrictRoleModalOpen}
                onOpenChange={setIsRestrictRoleModalOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {user.isRestricted ? "Unrestrict" : "Restrict"} @
                            {user.username}
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Are you sure you want to{" "}
                            {user.isRestricted ? "unrestrict" : "restrict"} @
                            {user.username}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <Button
                            size="sm"
                            variant="outline"
                            isDisabled={isUserRestrictionUpdating}
                            onClick={() => setIsRestrictRoleModalOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            className="capitalize"
                            isDisabled={isUserRestrictionUpdating}
                            isLoading={isUserRestrictionUpdating}
                            onClick={() =>
                                manageUserRestriction({
                                    id: user.id,
                                    isRestricted: !user.isRestricted,
                                })
                            }
                        >
                            {user.isRestricted ? "Unrestrict" : "Restrict"} User
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>

                        <AlertDialogDescription>
                            Are you sure you want to delete @{user.username}?
                            This action is irreversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <Button
                            size="sm"
                            variant="outline"
                            isDisabled={isDeletingUser}
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            isDisabled={isDeletingUser}
                            isLoading={isDeletingUser}
                            onClick={() =>
                                deleteUser({
                                    id: user.id,
                                })
                            }
                        >
                            Delete User
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function getUpdatedUserRole(currentRole: ROLES, action: "promote" | "demote") {
    if (action === "promote") {
        if (currentRole === ROLES.USER) return ROLES.MOD;
        else return null;
    } else {
        if (currentRole === ROLES.MOD) return ROLES.USER;
        else return null;
    }
}
