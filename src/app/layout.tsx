import "./globals.css";
import { ClientProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import { Metadata, Viewport } from "next";
import { Titillium_Web } from "next/font/google";
import { cn, getAbsoluteURL } from "../lib/utils";
import { LayoutProps } from "../types";

const font = Titillium_Web({
    subsets: ["latin"],
    weight: ["200", "300", "400", "600", "700"],
});

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: "%s | " + siteConfig.name,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [
        {
            name: siteConfig.name,
            url: getAbsoluteURL(),
        },
    ],
    formatDetection: {
        telephone: false,
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: siteConfig.name,
    },
    creator: siteConfig.name,
    openGraph: {
        type: "website",
        locale: "en_US",
        url: getAbsoluteURL(),
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
        shortcut: "/icons/favicon-16x16.png",
        apple: "/icons/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
    metadataBase: new URL(getAbsoluteURL()),
};

export const viewport: Viewport = {
    themeColor: "#333333",
};

function RootLayout({ children }: LayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head />
            <body
                className={cn(
                    font.className,
                    "flex min-h-screen flex-col overflow-x-hidden antialiased"
                )}
            >
                <ClientProvider>
                    {children}
                    <Toaster />
                </ClientProvider>
            </body>
        </html>
    );
}

export default RootLayout;
