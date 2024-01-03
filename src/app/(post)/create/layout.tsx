import Footer from "@/src/components/global/footer/footer";
import Nav from "@/src/components/global/navbar/navbar";
import { RootLayoutProps } from "@/src/types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Post",
    description: "Create a new post"
};

function Layout({ children }: RootLayoutProps) {
    return (
        <div className="flex h-screen flex-col justify-between overflow-x-hidden">
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}

export default Layout;
