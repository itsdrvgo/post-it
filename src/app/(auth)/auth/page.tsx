"use client";

import { useUser } from "@/src/components/providers/user";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/src/components/ui/form";
import Loader from "@/src/components/ui/loader";
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
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const signinSchema = z.object({
    username: z.string().min(3).max(32),
});

type SignInData = z.infer<typeof signinSchema>;

function Page() {
    const router = useRouter();

    const { isLoaded, isSignedIn, setUser } = useUser();

    const form = useForm<SignInData>({
        resolver: zodResolver(signinSchema),
        defaultValues: {
            username: "",
        },
    });

    const { mutate: createUser, isLoading } = trpc.users.createUser.useMutation(
        {
            onMutate: () => {
                const toastId = toast.loading("Authenticating...");
                return { toastId };
            },
            onSuccess: (data, _, ctx) => {
                toast.success("Authenticated successfully!", {
                    id: ctx?.toastId,
                });
                if (data.user) setUser(data.user);
                router.push("/");
            },
            onError: (err, _, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
        }
    );

    const authenticateUser = (data: SignInData) => {
        const { username } = data;
        return createUser({ username });
    };

    if (!isLoaded) return <Loader />;
    if (isSignedIn) router.push("/");

    return (
        <section className="flex h-screen w-full items-center justify-center p-5">
            <div className="w-full max-w-md">
                <Card
                    classNames={{
                        header: "px-5 pt-4 pb-2",
                        body: "px-5 py-2",
                        footer: "px-5 pt-2 pb-4",
                    }}
                >
                    <CardHeader>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold">
                                Authentication
                            </h1>
                            <p className="text-sm text-white/60">
                                Enter your credentials to continue
                            </p>
                        </div>
                    </CardHeader>

                    <Form {...form}>
                        <form
                            className="space-y-4"
                            onSubmit={(...args) =>
                                form.handleSubmit(authenticateUser)(...args)
                            }
                        >
                            <CardBody>
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
                                    isDisabled={isLoading}
                                    isLoading={isLoading}
                                >
                                    Submit
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </div>
        </section>
    );
}

export default Page;
