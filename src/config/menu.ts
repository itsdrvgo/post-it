interface Menu {
    name: string;
    href: string;
    isExternal?: boolean;
}

export const menu: Menu[] = [
    {
        name: "Home",
        href: "/",
    },
    {
        name: "Create",
        href: "/create",
    },
    {
        name: "View Source",
        href: "https://github.com/itsdrvgo/post-it",
        isExternal: true,
    },
];
