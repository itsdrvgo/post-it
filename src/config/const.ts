// GENEREL
export const DEFAULT_ERROR_MESSAGE = "Something went wrong, try again later!";
export const DEFAULT_IMAGE_URL = "https://img.clerk.com/preview.png";
export const DEFAULT_IP = "127.0.0.1";

// APP
export const APP_ID = "pi_gowhb09hfb";
export const PAGES = {
    AUTH_PAGE: "/auth",
};

// ATTACHMENTS
export const MAX_IMAGE_COUNT = 2;
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/jpg",
];

// TOKENS
export const TOKENS = {
    AUTH_COOKIE_NAME: APP_ID + "__auth_token",
    ACCESS_COOKIE_NAME: APP_ID + "__access_token",
    CACHED_AUTH_KEY: APP_ID + "__cached_auth_token",
};
