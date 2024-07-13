import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";
import { cn, handleClientError } from "@/lib/utils";
import { SignInData, signinSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormProps {
    username: string;
}

export function UpdateUsernameForm({ username }: FormProps) {
    const router = useRouter();

    const form = useForm<Pick<SignInData, "username">>({
        resolver: zodResolver(signinSchema.pick({ username: true })),
        defaultValues: {
            username,
        },
    });

    const { mutate: updateUsername, isPending } =
        trpc.users.updateUsername.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating username...");
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
        <Form {...form}>
            <form
                onSubmit={(...args) =>
                    form.handleSubmit((data) => updateUsername(data))(...args)
                }
            >
                <CardContent>
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem className="grid md:grid-cols-5 md:items-center">
                                <FormLabel>Username</FormLabel>
                                <FormControl className="col-span-4">
                                    <Input
                                        placeholder="itsdrvgo"
                                        {...field}
                                        onChange={(e) => {
                                            e.target.value =
                                                e.target.value.toLowerCase();
                                            field.onChange(e);
                                        }}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </CardContent>

                <CardFooter
                    className={cn(
                        "justify-end gap-2",
                        !form.formState.isDirty && "p-0 opacity-0"
                    )}
                >
                    <Button
                        type="submit"
                        className={cn(
                            "font-semibold",
                            !form.formState.isDirty && "pointer-events-none h-0"
                        )}
                        isDisabled={isPending}
                        isLoading={isPending}
                    >
                        Update
                    </Button>
                </CardFooter>
            </form>
        </Form>
    );
}
