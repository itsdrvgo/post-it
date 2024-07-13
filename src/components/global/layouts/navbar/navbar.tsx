"use client";

import { Icons } from "@/components/icons";
import { setToken } from "@/components/providers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/components/ui/link";
import { User } from "@/components/ui/user";
import { DEFAULT_IMAGE_URL, ROLES } from "@/config/const";
import { menu } from "@/config/menu";
import { trpc } from "@/lib/trpc/client";
import { cn, getAccessToken, handleClientError } from "@/lib/utils";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function Navbar() {
    const router = useRouter();

    const [isMenuHidden, setIsMenuHidden] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { data, isPending } = trpc.users.currentUser.useQuery();
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;

        if (latest > previous && latest > 150) setIsMenuHidden(true);
        else setIsMenuHidden(false);
    });

    const { mutate: signOut, isPending: isSigningOut } =
        trpc.users.signOutUser.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Logging out...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Good bye!", {
                    id: ctx.toastId,
                });
                router.push("/auth");
            },
            onError: (err, _, ctx) => {
                return handleClientError(err, ctx?.toastId);
            },
        });

    const handleSignout = async () => {
        try {
            const accessToken = await getAccessToken();
            setToken(accessToken);

            signOut();
        } catch (err) {
            return handleClientError(err);
        }
    };

    return (
        <>
            <motion.header
                variants={{
                    visible: {
                        y: 0,
                    },
                    hidden: {
                        y: "-100%",
                    },
                }}
                animate={isMenuHidden ? "hidden" : "visible"}
                transition={{
                    duration: 0.35,
                    ease: "easeInOut",
                }}
                className="sticky inset-x-0 top-0 z-50 flex h-auto w-full items-center justify-center border-b bg-background px-4 py-3 backdrop-blur-md backdrop-saturate-100 md:py-4"
                data-menu-open={isMenuOpen}
            >
                <nav className="flex w-full max-w-5xl items-center justify-between gap-5">
                    <Link
                        type="link"
                        href="/"
                        className="space-x-px text-2xl font-bold"
                    >
                        <span>Post</span>
                        <span className="text-primary">IT</span>
                    </Link>

                    <ul className="hidden gap-2 sm:flex md:gap-4">
                        {!!menu.length &&
                            menu.map((item, index) => (
                                <li key={index}>
                                    <Link
                                        type="link"
                                        className={cn(
                                            "font-medium",
                                            "hover:text-foreground/80"
                                        )}
                                        href={item.href}
                                        isExternal={item.isExternal}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                    </ul>

                    <div className="flex items-center">
                        <button
                            aria-label="Mobile Menu Toggle Button"
                            aria-pressed={isMenuOpen}
                            className="sm:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Icons.menu className="size-6" />
                        </button>

                        {!isPending && data?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="hidden sm:inline-flex">
                                    <Avatar>
                                        <AvatarImage
                                            src={DEFAULT_IMAGE_URL}
                                            alt={data.user.username}
                                        />
                                        <AvatarFallback>
                                            {data.user.username[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="min-w-44">
                                    <DropdownMenuLabel>
                                        <User
                                            name={data.user.username}
                                            description={
                                                "@" + data.user.username
                                            }
                                            avatar={{
                                                src: DEFAULT_IMAGE_URL,
                                                alt: data.user.username,
                                            }}
                                        />
                                    </DropdownMenuLabel>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        className="gap-2"
                                        onSelect={() => router.push("/create")}
                                    >
                                        <Icons.add className="size-4" />
                                        <span>Create a Post</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        className="gap-2"
                                        onSelect={() => router.push("/profile")}
                                    >
                                        <Icons.dashboard className="size-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>

                                    {data.user.role !== ROLES.USER && (
                                        <>
                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem
                                                className="gap-2"
                                                onSelect={() =>
                                                    router.push("/admin")
                                                }
                                            >
                                                <Icons.user className="size-4" />
                                                <span>Admin Panel</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        className="gap-2 focus:bg-destructive"
                                        onSelect={handleSignout}
                                        disabled={isSigningOut}
                                    >
                                        <Icons.logout className="size-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div></div>
                        )}
                    </div>
                </nav>
            </motion.header>

            <ul
                aria-label="Mobile Menu"
                data-menu-open={isMenuOpen}
                className={cn(
                    "fixed inset-x-0 z-40 space-y-5 border-b bg-background/50 backdrop-blur-md",
                    "w-screen overflow-hidden px-4 py-3",
                    "transition-all duration-500 ease-in-out",
                    "h-0 data-[menu-open=true]:h-[calc(100vh-3.75rem)]",
                    "-top-1/2 bottom-0 data-[menu-open=true]:top-[3.75rem]",
                    "md:hidden"
                )}
                style={{
                    backgroundImage: "url(./noise-light.png)",
                }}
            >
                <div>
                    {menu.map((item, index) => {
                        const Icon = Icons[item.icon ?? "add"];

                        return (
                            <li
                                key={index}
                                className="border-b"
                                aria-label="Mobile Menu Item"
                            >
                                <Link
                                    type="link"
                                    href={item.href}
                                    className="flex items-center justify-between gap-2 px-2 py-5 text-white"
                                    isExternal={item.isExternal}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span>{item.name}</span>
                                    <Icon className="size-5" />
                                </Link>
                            </li>
                        );
                    })}
                </div>

                {!isPending && data?.user && (
                    <div className="space-y-5 rounded-xl border p-5">
                        <User
                            name={data.user.username}
                            description={"@" + data.user.username}
                            avatar={{
                                src: DEFAULT_IMAGE_URL,
                                alt: data?.user?.username,
                            }}
                        />

                        <div className="flex justify-between gap-2">
                            <Link
                                type="button"
                                href="/profile"
                                className="w-full font-semibold"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Profile
                            </Link>

                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleSignout}
                                isDisabled={isSigningOut}
                                isLoading={isSigningOut}
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                )}
            </ul>
        </>
    );
}
