import axios from 'axios';
import type { FileItem, SystemInfo } from '@/types';

const API_BASE = '';

// File Operations
export const viewFiles = async (dirPath: string): Promise<FileItem[]> => {
    const response = await axios.get(`/api/files/view`, {
        params: { dir: dirPath || '/' },
    });
    return response.data;
};

export const createDirectory = async (path: string): Promise<void> => {
    await axios.post(`/files/create-directory`, null, {
        params: { path },
    });
};

export const uploadFile = async (
    file: File,
    targetDir: string,
    onProgress?: (progress: number) => void
): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    await axios.post(`/files/upload`, formData, {
        params: { dir: targetDir },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(progress);
            }
        },
    });
};

// Chunked upload for large files
export const startChunkUpload = async (filename: string): Promise<void> => {
    await axios.post(`/files/upload/chunk/start`, null, {
        params: { filename },
    });
};

export const uploadChunk = async (
    filename: string,
    chunkIndex: number,
    chunkData: Blob
): Promise<void> => {
    await axios.post(`/files/upload/chunk`, chunkData, {
        params: { filename, chunk_index: chunkIndex },
        headers: {
            'Content-Type': 'application/octet-stream',
        },
    });
};

export const completeChunkUpload = async (
    filename: string,
    targetDir: string
): Promise<void> => {
    await axios.post(`/files/upload/chunk/complete`, null, {
        params: { filename, dir: targetDir },
    });
};

export const downloadFile = (filePath: string): void => {
    const url = `/files/download?path=${encodeURIComponent(filePath)}`;
    window.open(url, '_blank');
};

// Temporary sharing
export const requestTempShare = async (filePath: string): Promise<string> => {
    const response = await axios.get(`/files/d/r`, {
        params: { file_path: filePath },
    });
    return response.data;
};

// System info
export const getSystemRootPath = async (): Promise<string> => {
    const response = await axios.get<SystemInfo>(`/api/system/get-root-path`);
    return response.data.root_path;
};

// Utility: Upload large file with chunking
export const uploadLargeFile = async (
    file: File,
    targetDir: string,
    onProgress?: (progress: number) => void
): Promise<void> => {
    const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Start chunked upload
    await startChunkUpload(file.name);

    // Upload chunks
    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await uploadChunk(file.name, i, chunk);

        if (onProgress) {
            const progress = Math.round(((i + 1) / totalChunks) * 100);
            onProgress(progress);
        }
    }

    // Complete upload
    await completeChunkUpload(file.name, targetDir);
};
