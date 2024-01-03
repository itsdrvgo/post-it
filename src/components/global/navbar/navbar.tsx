"use client";

import { DEFAULT_IMAGE_URL } from "@/src/config/const";
import { menu } from "@/src/config/menu";
import {
    Avatar,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Link,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    User,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Icons } from "../../icons/icons";
import { useUser } from "../../providers/user";

function Nav() {
    const router = useRouter();

    const { isLoaded, user, setUser } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        setUser(null);
        toast.success("See you soon!");
        router.push("/auth");
    };

    return (
        <Navbar
            shouldHideOnScroll
            onMenuOpenChange={setIsMenuOpen}
            classNames={{
                base: "border-b border-white/10",
            }}
        >
            <NavbarContent>
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden"
                />

                <NavbarBrand>
                    <Link
                        className="space-x-[2px] text-2xl font-bold hover:opacity-100"
                        href="/"
                        color="foreground"
                    >
                        <span>Post</span>
                        <span className="text-primary-600">IT</span>
                    </Link>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="hidden gap-4 sm:flex" justify="center">
                {menu.map((item) => (
                    <NavbarItem key={item.href}>
                        <Link
                            href={item.href}
                            color="foreground"
                            isExternal={item.isExternal}
                        >
                            {item.name}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent justify="end">
                {isLoaded && user ? (
                    <Dropdown showArrow radius="sm">
                        <DropdownTrigger className="cursor-pointer">
                            <Avatar
                                size="sm"
                                src={DEFAULT_IMAGE_URL}
                                alt={user.username}
                                showFallback
                            />
                        </DropdownTrigger>

                        <DropdownMenu disabledKeys={["user"]}>
                            <DropdownSection showDivider aria-label="User">
                                <DropdownItem
                                    isReadOnly
                                    key="user"
                                    className="opacity-100"
                                >
                                    <User
                                        name={user.username}
                                        description={"@" + user.username}
                                        avatarProps={{
                                            src: DEFAULT_IMAGE_URL,
                                            alt: user.username,
                                            color: "primary",
                                        }}
                                    />
                                </DropdownItem>
                            </DropdownSection>

                            <DropdownSection aria-label="Posts" showDivider>
                                <DropdownItem
                                    key="create"
                                    startContent={
                                        <Icons.add className="h-4 w-4" />
                                    }
                                    onPress={() => router.push("/create")}
                                >
                                    Create a Post
                                </DropdownItem>

                                <DropdownItem
                                    key="your_posts"
                                    startContent={
                                        <Icons.dashboard className="h-4 w-4" />
                                    }
                                    onPress={() => router.push("/profile")}
                                >
                                    Your Posts
                                </DropdownItem>
                            </DropdownSection>

                            <DropdownSection aria-label="Settings">
                                <DropdownItem
                                    key="logout"
                                    color="danger"
                                    startContent={
                                        <Icons.logout className="h-4 w-4" />
                                    }
                                    onPress={handleLogout}
                                >
                                    Logout
                                </DropdownItem>
                            </DropdownSection>
                        </DropdownMenu>
                    </Dropdown>
                ) : (
                    <></>
                )}
            </NavbarContent>

            <NavbarMenu>
                {menu.map((item) => (
                    <NavbarMenuItem key={item.href}>
                        <Link href={item.href} color="foreground">
                            {item.name}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    );
}

export default Nav;
