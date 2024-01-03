import "./globals.css";
import { siteConfig } from "@/src/config/site";
import { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ClientProvider from "../components/providers/client";
import { cn } from "../lib/utils";
import { RootLayoutProps } from "../types";

const font = Titillium_Web({
    subsets: ["latin"],
    weight: ["200", "300", "400", "600", "700"],
});

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [
        {
            name: siteConfig.name,
            url: siteConfig.url,
        },
    ],
    creator: siteConfig.name,
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: siteConfig.name,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.name,
        description: siteConfig.description,
        images: [siteConfig.ogImage],
        creator: "@itsdrvgo",
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
    manifest: `${siteConfig.url}/site.webmanifest`,
    metadataBase: new URL(siteConfig.url),
};

function RootLayout({ children }: RootLayoutProps) {
    return (
            <html lang="en" suppressHydrationWarning>
                <head />
                <ClientProvider
                    className={cn(
                        font.className,
                        "min-h-screen overflow-x-hidden scroll-smooth bg-background text-foreground antialiased"
                    )}
                >
                    {children}
                    <Toaster
                        toastOptions={{
                            style: {
                                background: "#333",
                                color: "#fff",
                            },
                        }}
                    />
                </ClientProvider>
            </html>
    );
}

export default RootLayout;
