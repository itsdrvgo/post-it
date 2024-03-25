import "./env.mjs";

/** @type {import("next").NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { hostname: "utfs.io" },
            { hostname: "**.clerk.com" },
            {
                // all hosts available on web
                hostname: "*",
            },
        ],
    },
};

export default nextConfig;
