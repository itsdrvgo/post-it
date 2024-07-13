"use client";

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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ROLES } from "@/config/const";
import { trpc } from "@/lib/trpc/client";
import { cn, handleClientError } from "@/lib/utils";
import { PreferencesData, UserClientData } from "@/lib/validation";
import { GenericProps } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

interface PageProps extends GenericProps {
    user: UserClientData;
    preferences: PreferencesData | null;
}

export function PreferencesPage({
    user,
    preferences,
    className,
    ...props
}: PageProps) {
    const [isAuthEnabled, setIsAuthEnabled] = useState(
        preferences?.isAuthEnabled ?? true
    );
    const [isPostCreateEnabled, setIsPostCreateEnabled] = useState(
        preferences?.isPostCreateEnabled ?? true
    );

    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isPostCreateModalOpen, setPostCreateModalOpen] = useState(false);

    const { mutate: updatePreferences, isPending } =
        trpc.preferences.updatePreferences.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating preferences...");
                return { toastId };
            },
            onSuccess: (data, __, { toastId }) => {
                setIsAuthEnabled(data.isAuthEnabled);
                setIsPostCreateEnabled(data.isPostCreateEnabled);

                setAuthModalOpen(false);
                setPostCreateModalOpen(false);

                toast.success("Preferences updated successfully", {
                    id: toastId,
                });
            },
            onError: (err, _, ctx) => {
                return handleClientError(err, ctx?.toastId);
            },
        });

    return (
        <div className={cn("space-y-5", className)} {...props}>
            <div className="md:space-y-1">
                <h2 className="text-2xl font-bold md:text-4xl">Preferences</h2>
                <p className="text-sm text-muted-foreground md:text-base">
                    Manage the site preferences from here
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Site Settings</CardTitle>
                    <CardDescription>
                        Manage the site preferences from here
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Separator className="mb-4" />

                    <div className="flex items-center justify-between gap-5">
                        <div>
                            <h4 className="font-semibold">Authentication</h4>
                            <p className="text-sm text-muted-foreground">
                                Allow new users to create an account. Disable
                                this to prevent new users from signing up.
                            </p>
                        </div>

                        <div>
                            <Switch
                                disabled={
                                    user.role !== ROLES.ADMIN || isPending
                                }
                                checked={isAuthEnabled}
                                onCheckedChange={() => setAuthModalOpen(true)}
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-5">
                        <div>
                            <h4 className="font-semibold">Post Creation</h4>
                            <p className="text-sm text-muted-foreground">
                                Allow users to create new posts. Disable this to
                                prevent users from creating new posts.
                            </p>
                        </div>

                        <div>
                            <Switch
                                disabled={
                                    user.role !== ROLES.ADMIN || isPending
                                }
                                checked={isPostCreateEnabled}
                                onCheckedChange={() =>
                                    setPostCreateModalOpen(true)
                                }
                            />
                        </div>
                    </div>

                    <AlertDialog
                        open={isAuthModalOpen}
                        onOpenChange={setAuthModalOpen}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Authentication Settings
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to{" "}
                                    {isAuthEnabled ? "disable" : "enable"}{" "}
                                    authentication?
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    isDisabled={isPending}
                                    onClick={() => setAuthModalOpen(false)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    size="sm"
                                    className="font-semibold"
                                    variant="destructive"
                                    isLoading={isPending}
                                    isDisabled={isPending}
                                    onClick={() =>
                                        updatePreferences({
                                            isAuthEnabled: !isAuthEnabled,
                                        })
                                    }
                                >
                                    {isAuthEnabled ? "Disable" : "Enable"}{" "}
                                    Authentication
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog
                        open={isPostCreateModalOpen}
                        onOpenChange={setPostCreateModalOpen}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Post Creation Settings
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to{" "}
                                    {isPostCreateEnabled ? "disable" : "enable"}{" "}
                                    post creation?
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    isDisabled={isPending}
                                    onClick={() =>
                                        setPostCreateModalOpen(false)
                                    }
                                >
                                    Cancel
                                </Button>

                                <Button
                                    size="sm"
                                    className="font-semibold"
                                    variant="destructive"
                                    isLoading={isPending}
                                    isDisabled={isPending}
                                    onClick={() =>
                                        updatePreferences({
                                            isPostCreateEnabled:
                                                !isPostCreateEnabled,
                                        })
                                    }
                                >
                                    {isPostCreateEnabled ? "Disable" : "Enable"}{" "}
                                    Post Creation
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    );
}
