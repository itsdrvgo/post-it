"use client";

import { generatePathTitle } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function NavbarDash() {
    const pathname = usePathname();

    return (
        <header className="border-b bg-background">
            <nav className="flex h-11 items-center">
                <div className="p-2 px-6">
                    <p className="text-sm text-muted-foreground">
                        {generatePathTitle(pathname)}
                    </p>
                </div>
            </nav>
        </header>
    );
}
