import "./env.mjs";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: "public",
});

/** @type {import("next").NextConfig} */
const nextConfig = withPWA({
    images: {
        remotePatterns: [
            { hostname: "utfs.io" },
            { hostname: "**.clerk.com" },
            {
                hostname: "*",
            },
        ],
    },
});

export default nextConfig;
