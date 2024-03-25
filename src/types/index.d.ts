import { HTMLAttributes, ReactNode } from "react";

export type SiteConfig = {
    name: string;
    description: string;
    ogImage: string;
    keywords?: string[];
    links?: {
        [key: string]: string;
    };
};

export type GenericProps = HTMLAttributes<HTMLElement>;
export interface LayoutProps {
    children: ReactNode;
}

declare global {
    interface ExtendedFile {
        id: string;
        url: string;
        file: File;
    }

    type UploadData = {
        key: string;
        url: string;
        name: string;
        size: number;
    };

    type UploadError = {
        code: string;
        message: string;
        data: any;
    };

    type UploadFileResponse =
        | {
              data: UploadData;
              error: null;
          }
        | {
              data: null;
              error: UploadError;
          };
}
