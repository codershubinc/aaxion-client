export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
  },
  FILES: {
    VIEW: "/api/files/view",
    CREATE_DIR: "/files/create-directory",
    UPLOAD: "/files/upload",
    DOWNLOAD: "/files/download",
    THUMBNAIL: "/files/thumbnail",
    VIEW_IMAGE: "/files/view-image",
    SHARE_REQUEST: "/files/d/r",
    SHARE_DOWNLOAD: "/files/d/t", // /files/d/t/{token}
  },
  TOKENS: {
    GENERATE: "/api/upload-tokens/generate",
    REVOKE: "/api/upload-tokens/revoke",
    LIST: "/api/upload-tokens/list",
    INFO: "/api/upload-tokens/info",
    VALIDATE: "/upload/token/validate",
    GUEST_UPLOAD_FILE: "/upload/token/file",
    GUEST_UPLOAD_CHUNK_START: "/upload/token/chunk/start",
    GUEST_UPLOAD_CHUNK: "/upload/token/chunk",
    GUEST_UPLOAD_CHUNK_COMPLETE: "/upload/token/chunk/complete",
  },
  CHUNKS: {
    START: "/files/upload/chunk/start",
    UPLOAD: "/files/upload/chunk",
    COMPLETE: "/files/upload/chunk/complete",
  },
}
