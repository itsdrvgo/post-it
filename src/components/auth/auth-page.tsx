"use client";

import { trpc } from "@/lib/trpc/client";
import { handleClientError } from "@/lib/utils";
import { SignInData, signinSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { generate } from "generate-password";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";

function AuthPage() {
    const router = useRouter();

    const [password, setPassword] = useState("");

    const form = useForm<SignInData>({
        resolver: zodResolver(signinSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const { mutate: authenticateUser, isPending } =
        trpc.users.authenticateUser.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Authenticating...");
                return { toastId };
            },
            onSuccess: ({ user }, _, ctx) => {
                navigator.clipboard.writeText(password);
                toast.success(
                    user.isFirstTime
                        ? "Welcome to PostIT, your account has been created!"
                        : "Welcome back!",
                    {
                        id: ctx?.toastId,
                    }
                );
                router.push("/");
            },
            onError: (err, _, ctx) => {
                return handleClientError(err, ctx?.toastId);
            },
        });

    const onSubmit = (data: SignInData) => {
        const { username } = data;
        const uPassword = data.password.length > 0 ? data.password : password;
        return authenticateUser({ username, password: uPassword });
    };

    const handleGeneratePassword = () => {
        const generatedPassword = generate({
            length: 16,
            numbers: true,
            symbols: true,
        });

        setPassword(generatedPassword);
        form.setValue("password", generatedPassword);
        navigator.clipboard.writeText(generatedPassword);

        toast.success(
            "Your generated password has been copied to clipboard, please save it somewhere safe",
            {
                duration: 5000,
            }
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold">
                    Authentication
                </CardTitle>
                <CardDescription>
                    Enter your credentials to continue
                </CardDescription>
            </CardHeader>

            <Form {...form}>
                <form
                    onSubmit={(...args) => form.handleSubmit(onSubmit)(...args)}
                >
                    <CardContent className="space-y-2">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type="password"
                                                placeholder="********"
                                                {...field}
                                            />

                                            <TooltipProvider>
                                                <Tooltip delayDuration={100}>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm"
                                                            size="icon"
                                                            onClick={
                                                                handleGeneratePassword
                                                            }
                                                        >
                                                            <Icons.key className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>

                                                    <TooltipContent>
                                                        Generate a random
                                                        password
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>

                    <CardFooter>
                        <Button
                            className="w-full font-semibold"
                            type="submit"
                            classNames={{
                                startContent: "text-background",
                            }}
                            isDisabled={isPending}
                            isLoading={isPending}
                        >
                            Submit
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}

export default AuthPage;
