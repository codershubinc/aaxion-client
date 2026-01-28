/**
 * Services Index - Central export point for all API services
 */

// File Service
export {
    viewFiles,
    createDirectory,
    downloadFile,
} from './fileService';

// Upload Service
export {
    uploadFile,
    uploadLargeFile,
    startChunkUpload,
    uploadChunk,
    completeChunkUpload,
} from './uploadService';

// Share Service
export {
    requestTempShare,
} from './shareService';

// System Service
export {
    getSystemRootPath,
    getStorageInfo,
} from './systemService';

// Auth Service
export {
    login,
    register,
    setToken,
    getToken,
    removeToken,
    isAuthenticated,
} from './authService';
