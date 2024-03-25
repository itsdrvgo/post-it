import Footer from "@/components/global/footer/footer";
import Navbar from "@/components/global/navbar/navbar";
import { LayoutProps } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Post",
    description: "Create a new post",
};

function Layout({ children }: LayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}

export default Layout;
