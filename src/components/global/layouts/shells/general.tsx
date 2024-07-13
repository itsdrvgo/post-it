import { LayoutProps } from "@/types";

export function GeneralShell({ children }: LayoutProps) {
    return (
        <section className="flex w-full justify-center p-5">
            <div className="w-full max-w-2xl space-y-4">{children}</div>
        </section>
    );
}
