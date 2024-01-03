import { RootLayoutProps } from "@/src/types";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Auth",
    description: "Sign in or sign up to continue",
};

function Layout({ children }: RootLayoutProps) {
    return (
        <div className="flex h-screen flex-col justify-between overflow-x-hidden">
            <div className="fixed top-0 w-full text-balance bg-red-600 p-1 text-center text-xs md:text-sm">
                <p>
                    PLEASE DO NOT USE REAL PASSWORDS AS CREDENTIALS.{" "}
                    <Link
                        href="https://github.com/itsdrvgo/post-it/blob/master/README.md#warning"
                        className="text-blue-200 underline"
                        target="_blank"
                    >
                        READ MORE.
                    </Link>
                </p>
            </div>
            <main>{children}</main>
        </div>
    );
}

export default Layout;
