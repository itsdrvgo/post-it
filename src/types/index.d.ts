import { HTMLAttributes, ReactNode } from "react";

export type SiteConfig = {
    name: string;
    description: string;
    url: string;
    ogImage: string;
    keywords: string[];
    links: {
        youtube: string;
        instagram: string;
        twitter: string;
        github: string;
        discord: string;
    };
};

export type DefaultProps = HTMLAttributes<HTMLElement>;
export interface RootLayoutProps {
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
