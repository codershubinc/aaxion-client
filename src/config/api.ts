export const API_ENDPOINTS = {
    FILES: {
        VIEW: '/api/files/view',
        CREATE_DIRECTORY: '/files/create-directory',
        DOWNLOAD: '/files/download',
        UPLOAD: '/files/upload',
        CHUNK: {
            START: '/files/upload/chunk/start',
            UPLOAD: '/files/upload/chunk',
            COMPLETE: '/files/upload/chunk/complete',
        },
        SHARE: '/files/d/r',
        THUMBNAIL: '/files/thumbnail'
    },
    SYSTEM: {
        ROOT_PATH: '/api/system/get-root-path',
        STORAGE: '/api/system/storage'
    },
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout'
    }
} as const;
