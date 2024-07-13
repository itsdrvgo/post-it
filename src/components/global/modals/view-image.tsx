"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import NextImage from "next/image";
import { Dispatch, ReactNode, SetStateAction } from "react";

interface PageProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    image: string;
    trigger: ReactNode;
}

export function ViewImageModal({
    isOpen,
    setIsOpen,
    trigger,
    image,
}: PageProps) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger}

            <DialogContent className="flex max-w-full items-center justify-center border-none bg-transparent p-0 shadow-none">
                <NextImage src={image} alt="Image" width={500} height={500} />
            </DialogContent>
        </Dialog>
    );
}
