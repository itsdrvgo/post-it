import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { trpc } from "@/lib/trpc/client";
import { cn, handleClientError } from "@/lib/utils";
import { signinSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const updatePasswordSchema = z
    .object({
        currentPassword: signinSchema.shape.password,
        newPassword: signinSchema.shape.password,
        confirmPassword: signinSchema.shape.password,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password cannot be the same as the current password",
        path: ["newPassword"],
    });

type UpdatePasswordData = z.infer<typeof updatePasswordSchema>;

export function UpdatePasswordForm() {
    const router = useRouter();

    const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] =
        useState(false);

    const form = useForm<UpdatePasswordData>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const { mutate: updatePassword, isPending } =
        trpc.users.updatePassword.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating password...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Username updated successfully!", {
                    id: ctx.toastId,
                });
                router.refresh();
            },
            onError: (err, _, ctx) => {
                return handleClientError(err, ctx?.toastId);
            },
        });

    return (
        <Dialog
            open={isPasswordChangeModalOpen}
            onOpenChange={setIsPasswordChangeModalOpen}
        >
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="min-w-28">
                    Change Password
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                        Enter your new password to change it.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={(...args) =>
                            form.handleSubmit((data) => updatePassword(data))(
                                ...args
                            )
                        }
                    >
                        <div className="space-y-2">
                            <FormField
                                control={form.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-5 items-center">
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl className="col-span-4">
                                            <PasswordInput
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-5 items-center">
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl className="col-span-4">
                                            <PasswordInput
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-5 items-center">
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl className="col-span-4">
                                            <PasswordInput
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter
                            className={cn(
                                "mt-4 justify-end gap-2",
                                !form.formState.isDirty && "p-0 opacity-0"
                            )}
                        >
                            <Button
                                size="sm"
                                variant="outline"
                                isDisabled={isPending}
                                type="button"
                                className={cn(
                                    "font-semibold",
                                    !form.formState.isDirty &&
                                        "pointer-events-none h-0"
                                )}
                                onClick={() => {
                                    setIsPasswordChangeModalOpen(false);
                                    form.reset();
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                size="sm"
                                type="submit"
                                isDisabled={
                                    isPending || !form.formState.isValid
                                }
                                isLoading={isPending}
                                className={cn(
                                    "font-semibold",
                                    !form.formState.isDirty &&
                                        "pointer-events-none h-0"
                                )}
                            >
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
