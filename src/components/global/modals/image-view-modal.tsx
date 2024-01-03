"use client";

import { Image, Modal, ModalBody, ModalContent } from "@nextui-org/react";

interface PageProps {
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    image: string;
}

function ImageViewModal({ onClose, isOpen, onOpenChange, image }: PageProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onOpenChange={onOpenChange}
            placement="center"
            hideCloseButton
            classNames={{
                body: "p-0",
                base: "w-auto",
            }}
            backdrop="blur"
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalBody>
                            <Image radius="none" src={image} alt="Image" />
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default ImageViewModal;
