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

function ImageViewModal({ isOpen, setIsOpen, trigger, image }: PageProps) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger}

            <DialogContent className="w-full max-w-full border-none !bg-transparent p-0 !pr-0 sm:max-w-full md:w-auto">
                <NextImage src={image} alt="Image" width={1000} height={1000} />
            </DialogContent>
        </Dialog>
    );
}

export default ImageViewModal;
