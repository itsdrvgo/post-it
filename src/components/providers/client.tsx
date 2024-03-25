"use client";

import { trpc } from "@/lib/trpc/client";
import { getAbsoluteURL } from "@/lib/utils";
import { LayoutProps } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink, loggerLink } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";

export let token: string;

export const setToken = (newToken: string) => {
    token = newToken;
};

function ClientProvider({ children }: LayoutProps) {
    const [queryClient] = useState(() => new QueryClient());

    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: getAbsoluteURL("/api/trpc"),
                    transformer: superjson,
                    headers: () => {
                        return {
                            Authorization: `Bearer ${token}`,
                        };
                    },
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
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}

                <ReactQueryDevtools />
            </QueryClientProvider>
        </trpc.Provider>
    );
}

export default ClientProvider;
