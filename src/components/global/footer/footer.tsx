import Link from "next/link";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import Vercel from "../svgs/Vercel";

function Footer({}: DetailedHTMLProps<
    HTMLAttributes<HTMLElement>,
    HTMLElement
>) {
    return (
        <footer className="flex justify-center border-t border-white/10 p-5">
            <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-2 md:flex-row md:justify-between">
                <p className="text-sm text-white/60">
                    &copy; {new Date().getFullYear()}{" "}
                    <Link href="https://itsdrvgo.me" className="underline">
                        DRVGO
                    </Link>
                    . All rights reserved.
                </p>

                <div className="flex items-center gap-2 text-sm">
                    <p>Powered by</p>
                    <Vercel width={70.75} height={16} />
                </div>
            </div>
        </footer>
    );
}

export default Footer;
