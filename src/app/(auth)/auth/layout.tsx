import { LayoutProps } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Auth",
    description: "Sign in or sign up to continue",
};

function Layout({ children }: LayoutProps) {
    return <main className="flex flex-1 flex-col">{children}</main>;
}

export default Layout;
