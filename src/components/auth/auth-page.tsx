"use client";

import { User } from "@/src/lib/drizzle/schema";
import { trpc } from "@/src/lib/trpc/client";
import { handleClientError } from "@/src/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Input,
    Tooltip,
} from "@nextui-org/react";
import { generate } from "generate-password";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Icons } from "../icons/icons";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";

const signinSchema = z.object({
    username: z
        .string()
        .min(3, "Username is too short")
        .max(32, "Username is too long"),
    password: z
        .string()
        .min(8, "Password is too short")
        .max(64, "Password is too long"),
});

type SignInData = z.infer<typeof signinSchema>;

interface PageProps {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
}

function AuthPage({ user, setUser }: PageProps) {
    const router = useRouter();

    const [password, setPassword] = useState("");

    const form = useForm<SignInData>({
        resolver: zodResolver(signinSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const { mutate: authenticateUser, isLoading } =
        trpc.users.authenticateUser.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Authenticating...");
                return { toastId };
            },
            onSuccess: (data, _, ctx) => {
                navigator.clipboard.writeText(password);
                toast.success(
                    data.firstTimeLogin
                        ? "Welcome to PostIT, your account has been created!"
                        : "Welcome back!",
                    {
                        id: ctx?.toastId,
                    }
                );
                if (data.user) setUser(data.user);
                router.push("/");
            },
            onError: (err, _, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
        });

    const onSubmit = (data: SignInData) => {
        const { username } = data;

        const uPassword = user
            ? user.password
            : data.password.length > 0
              ? data.password
              : password;

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
        <Card
            classNames={{
                header: "px-5 pt-4 pb-2",
                body: "px-5 py-2",
                footer: "px-5 pt-2 pb-4",
            }}
        >
            <CardHeader>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Authentication</h1>
                    <p className="text-sm text-white/60">
                        Enter your credentials to continue
                    </p>
                </div>
            </CardHeader>

            <Form {...form}>
                <form
                    onSubmit={(...args) => form.handleSubmit(onSubmit)(...args)}
                >
                    <CardBody className="gap-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            size="sm"
                                            radius="sm"
                                            placeholder="itsdrvgo"
                                            {...field}
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
                                                size="sm"
                                                radius="sm"
                                                type="password"
                                                placeholder="********"
                                                {...field}
                                            />

                                            <div>
                                                <Tooltip content="Generate a random password">
                                                    <Button
                                                        isIconOnly
                                                        radius="sm"
                                                        size="sm"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                                        startContent={
                                                            <Icons.key className="h-4 w-4" />
                                                        }
                                                        onPress={
                                                            handleGeneratePassword
                                                        }
                                                    />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardBody>

                    <CardFooter>
                        <Button
                            className="font-bold text-black"
                            color="primary"
                            fullWidth
                            radius="sm"
                            type="submit"
                            isDisabled={isLoading}
                            isLoading={isLoading}
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
