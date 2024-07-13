import { Icons } from "@/components/icons";

interface Menu {
    name: string;
    href: string;
    isExternal?: boolean;
    icon: keyof typeof Icons;
}

export const menu: Menu[] = [
    {
        name: "Home",
        href: "/",
        icon: "home",
    },
    {
        name: "Create",
        href: "/create",
        icon: "add",
    },
    {
        name: "View Source",
        href: "https://github.com/itsdrvgo/post-it",
        isExternal: true,
        icon: "github",
    },
];
