import { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsla(var(--border), <alpha-value>)",
                input: "hsla(var(--input), <alpha-value>)",
                ring: "hsla(var(--ring), <alpha-value>)",
                background: "hsla(var(--background), <alpha-value>)",
                foreground: "hsla(var(--foreground), <alpha-value>)",
                primary: {
                    DEFAULT: "hsla(var(--primary), <alpha-value>)",
                    foreground:
                        "hsla(var(--primary-foreground), <alpha-value>)",
                },
                secondary: {
                    DEFAULT: "hsla(var(--secondary), <alpha-value>)",
                    foreground:
                        "hsla(var(--secondary-foreground), <alpha-value>)",
                },
                destructive: {
                    DEFAULT: "hsla(var(--destructive), <alpha-value>)",
                    foreground:
                        "hsla(var(--destructive-foreground), <alpha-value>)",
                },
                muted: {
                    DEFAULT: "hsla(var(--muted), <alpha-value>)",
                    foreground: "hsla(var(--muted-foreground), <alpha-value>)",
                },
                accent: {
                    DEFAULT: "hsla(var(--accent), <alpha-value>)",
                    foreground: "hsla(var(--accent-foreground), <alpha-value>)",
                },
                popover: {
                    DEFAULT: "hsla(var(--popover), <alpha-value>)",
                    foreground:
                        "hsla(var(--popover-foreground), <alpha-value>)",
                },
                card: {
                    DEFAULT: "hsla(var(--card), <alpha-value>)",
                    foreground: "hsla(var(--card-foreground), <alpha-value>)",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
