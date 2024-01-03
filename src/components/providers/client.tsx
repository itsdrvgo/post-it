"use client";

import { trpc } from "@/src/lib/trpc/client";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink, loggerLink } from "@trpc/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import superjson from "superjson";
import UserProvider from "./user";

const getBaseUrl = () => {
    if (typeof window !== "undefined") return "";
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return `http://localhost:${process.env.PORT ?? 3000}`;
};

function ClientProvider({ children, className, ...props }: DefaultProps) {
    const router = useRouter();
    const [queryClient] = useState(() => new QueryClient());

    const [trpcClient] = useState(() =>
        trpc.createClient({
            transformer: superjson,
            links: [
                httpBatchLink({
                    url: `${getBaseUrl()}/api/trpc`,
                }),
                loggerLink({
                    enabled: (opts) =>
                        process.env.NODE_ENV === "development" ||
                        (opts.direction === "down" &&
                            opts.result instanceof Error),
                }),
            ],
        })
    );

    return (
        <NextUIProvider navigate={router.push}>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                    <UserProvider>
                        <body className={cn(className)} {...props}>
                            {children}
                        </body>
                    </UserProvider>
                    <ReactQueryDevtools />
                </QueryClientProvider>
            </trpc.Provider>
        </NextUIProvider>
    );
}

export default ClientProvider;
