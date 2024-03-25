import { LayoutProps } from "@/types";
import Warning from "../404/warning";

export function AuthShell({ children }: LayoutProps) {
    return (
        <section className="flex flex-1 flex-col">
            <Warning content="PLEASE DO NOT USE REAL PASSWORDS AS CREDENTIALS." />

            <div className="flex flex-1 items-center justify-center p-5">
                {children}
            </div>
        </section>
    );
}
