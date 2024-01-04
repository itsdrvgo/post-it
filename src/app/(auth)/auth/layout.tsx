import Warning from "@/src/components/global/404/warning";
import { RootLayoutProps } from "@/src/types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Auth",
    description: "Sign in or sign up to continue",
};

function Layout({ children }: RootLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <Warning
                content="PLEASE DO NOT USE REAL PASSWORDS AS CREDENTIALS."
                className="fixed top-0"
            />
            <main>{children}</main>
        </div>
    );
}

export default Layout;
