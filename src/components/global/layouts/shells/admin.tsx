import { LayoutProps } from "@/types";

export function AdminShell({ children }: LayoutProps) {
    return (
        <section className="flex w-full justify-center p-5">
            <div className="w-full max-w-4xl space-y-4">{children}</div>
        </section>
    );
}
