import { siteConfig } from "@/config/site";
import { LayoutProps } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "Admin Panel",
        template: "%s | " + siteConfig.name,
    },
    description: "Admin Panel for " + siteConfig.name,
};

function Layout({ children }: LayoutProps) {
    return (
        <div className="h-screen flex-1 basis-0">
            <div className="flex h-full">
                <main className="flex flex-1">{children}</main>
            </div>
        </div>
    );
}

export default Layout;
