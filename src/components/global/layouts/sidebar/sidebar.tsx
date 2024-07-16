"use client";

import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/components/ui/link";
import Skeleton from "@/components/ui/skeleton";
import { DEFAULT_IMAGE_URL } from "@/config/const";
import { useSidebarStore, useUserDropdownStore } from "@/lib/store";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { UserClientData } from "@/lib/validation";
import { GenericProps } from "@/types";
import { usePathname } from "next/navigation";
import { LogoutButton } from "../../buttons";
import { PostIT } from "../../svgs";

interface List {
    category: string;
    items: {
        name: string;
        href: string;
        icon: keyof typeof Icons;
    }[];
}

const lists: List[] = [
    {
        category: "Management",
        items: [
            {
                name: "Users",
                href: "/admin/users",
                icon: "users",
            },
            {
                name: "Posts",
                href: "/admin/posts",
                icon: "podcast",
            },
        ],
    },
    {
        category: "Website",
        items: [
            {
                name: "Preferences",
                href: "/admin/preferences",
                icon: "settings",
            },
            {
                name: "Profile",
                href: "/profile",
                icon: "user",
            },
            {
                name: "Home",
                href: "/",
                icon: "home",
            },
        ],
    },
];

interface PageProps extends GenericProps {
    params?: {
        orgId?: string;
    };
}

export function Sidebar({ className, params, ...props }: PageProps) {
    const pathname = usePathname();
    const currentPath = pathname.split("/").pop();

    const isSidebarOpen = useSidebarStore((state) => state.isOpen);
    const setIsSidebarOpen = useSidebarStore((state) => state.setIsOpen);
    const isUserDropdownOpen = useUserDropdownStore((state) => state.isOpen);

    const { data, isPending } = trpc.users.currentUser.useQuery();

    return (
        <div
            className={cn(
                "fixed left-0",
                "flex h-screen w-14 flex-col md:w-[4.5rem]",
                "z-10"
            )}
        >
            <aside
                data-state={isSidebarOpen ? "expanded" : "collapsed"}
                className={cn(
                    "border-r border-border/10 bg-background",
                    "h-full w-14 data-[state=expanded]:w-64 md:w-[4.5rem]",
                    "transition-width flex flex-col duration-200 ease-in-out",
                    className
                )}
                onMouseEnter={() => setIsSidebarOpen(true)}
                onMouseLeave={() =>
                    !isUserDropdownOpen && setIsSidebarOpen(false)
                }
                {...props}
            >
                <div className="flex items-center p-4 md:px-6">
                    <Link
                        type="link"
                        href="/admin"
                        className="flex items-center gap-2 text-xl font-semibold"
                    >
                        <PostIT width={25} height={25} />
                        <div
                            className={cn(
                                "whitespace-nowrap text-white transition-opacity ease-in-out",
                                !isSidebarOpen &&
                                    "pointer-events-none opacity-0"
                            )}
                        >
                            <span>Post</span>
                            <span className="text-primary">IT</span>
                        </div>
                    </Link>
                </div>

                <div className="flex flex-1 flex-col divide-y divide-border/10">
                    {lists.map((list) => (
                        <ul
                            key={list.category}
                            className="flex flex-col gap-1 p-1 md:p-2"
                        >
                            {list.items.map((item) => {
                                const Icon = Icons[item.icon];

                                return (
                                    <li key={item.name}>
                                        <Link
                                            type="link"
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-2 rounded-md p-3 py-4 md:p-4",
                                                "transition-all ease-in-out",
                                                "text-sm text-muted-foreground hover:text-white",
                                                "hover:bg-accent",
                                                {
                                                    "bg-accent text-white":
                                                        (currentPath ===
                                                            params?.orgId &&
                                                            item.name ===
                                                                "Home") ||
                                                        (item.name
                                                            .split(" ")
                                                            .join("")
                                                            .toLowerCase() ===
                                                            "allorganizations" &&
                                                            currentPath ===
                                                                "organizations") ||
                                                        currentPath ===
                                                            item.name.toLowerCase(),
                                                }
                                            )}
                                        >
                                            <div>
                                                <Icon className="size-5" />
                                            </div>
                                            <span
                                                className={cn(
                                                    "whitespace-nowrap transition-opacity ease-in-out",
                                                    !isSidebarOpen &&
                                                        "pointer-events-none opacity-0"
                                                )}
                                            >
                                                {item.name}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    ))}
                </div>

                {isPending ? (
                    <SidebarUserSkeleton isSidebarOpen={isSidebarOpen} />
                ) : data?.user ? (
                    <SidebarUser
                        user={data.user}
                        isSidebarOpen={isSidebarOpen}
                    />
                ) : (
                    <SidebarUserSkeleton isSidebarOpen={isSidebarOpen} />
                )}
            </aside>
        </div>
    );
}

function SidebarUser({
    user,
    isSidebarOpen,
}: {
    user: UserClientData;
    isSidebarOpen: boolean;
}) {
    return <UserItem user={user} isSidebarOpen={isSidebarOpen} />;
}

function UserItem({
    user,
    isSidebarOpen,
}: {
    user: UserClientData;
    isSidebarOpen: boolean;
}) {
    const isUserDropdownOpen = useUserDropdownStore((state) => state.isOpen);
    const setIsUserDropdownOpen = useUserDropdownStore(
        (state) => state.setIsOpen
    );

    return (
        <div className="p-1 py-2 md:p-2">
            <DropdownMenu
                open={isUserDropdownOpen}
                onOpenChange={setIsUserDropdownOpen}
            >
                <DropdownMenuTrigger className="w-full">
                    <div
                        className={cn(
                            "flex items-center gap-2 rounded-md p-2 py-3 md:p-3",
                            "transition-all ease-in-out",
                            "text-sm text-white",
                            "hover:bg-accent"
                        )}
                    >
                        <div>
                            <Avatar>
                                <AvatarImage
                                    src={DEFAULT_IMAGE_URL}
                                    alt={user.username}
                                />
                                <AvatarFallback>
                                    {user.username[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div
                            className={cn(
                                "text-start transition-all ease-in-out",
                                !isSidebarOpen &&
                                    "pointer-events-none opacity-0"
                            )}
                        >
                            <p>@{user.username}</p>
                            <p className="text-xs capitalize text-muted-foreground">
                                {user.role}
                            </p>
                        </div>
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    {lists[1].items.map((item) => {
                        const Icon = Icons[item.icon];

                        return (
                            <DropdownMenuItem key={item.name} className="p-0">
                                <Link
                                    type="link"
                                    href={item.href}
                                    className={cn(
                                        "flex w-full items-center gap-2 p-2 py-1 text-sm text-muted-foreground hover:text-white",
                                        "transition-all ease-in-out"
                                    )}
                                >
                                    <div>
                                        <Icon className="size-4" />
                                    </div>

                                    <span>{item.name}</span>
                                </Link>
                            </DropdownMenuItem>
                        );
                    })}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="p-0 focus:bg-destructive">
                        <LogoutButton className="w-full text-start" />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function SidebarUserSkeleton({ isSidebarOpen }: { isSidebarOpen: boolean }) {
    return (
        <div className="p-1 py-2 md:p-2">
            <div className="flex items-center gap-2 rounded-md p-2 py-3 md:p-3">
                <div>
                    <Skeleton className="size-8 rounded-full" />
                </div>

                <div
                    className={cn(
                        "space-y-1 transition-all ease-in-out",
                        !isSidebarOpen && "pointer-events-none opacity-0"
                    )}
                >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        </div>
    );
}
