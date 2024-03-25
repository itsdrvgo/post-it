import AuthPage from "@/components/auth/auth-page";
import { AuthShell } from "@/components/global/shells/auth-shell";

function Page() {
    return (
        <AuthShell>
            <div className="w-full max-w-md">
                <AuthPage />
            </div>
        </AuthShell>
    );
}

export default Page;
