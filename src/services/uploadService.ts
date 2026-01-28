import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/config';

/**
 * Upload Service - Handles file uploads including chunked uploads for large files
 */

/**
 * Upload a single file
 * @param file - The file to upload
 * @param targetDir - The target directory path
 * @param onProgress - Optional callback for upload progress
 */
export const uploadFile = async (
    file: File,
    targetDir: string,
    onProgress?: (progress: number, speed?: number) => void
): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    let lastLoaded = 0;
    let lastTime = Date.now();
    let lastSpeed = 0;

    await apiClient.post(API_ENDPOINTS.FILES.UPLOAD, formData, {
        params: { dir: targetDir },
        headers: {
            'Content-Type': 'multipart/form-data', // Explicitly set for form data override
        },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
                const currentTime = Date.now();
                const timeDiff = (currentTime - lastTime) / 1000; // seconds

                let speed = lastSpeed;

                if (timeDiff >= 0.5) {
                    const loadedDiff = progressEvent.loaded - lastLoaded;
                    speed = loadedDiff / timeDiff;
                    lastLoaded = progressEvent.loaded;
                    lastTime = currentTime;
                    lastSpeed = speed;
                }

                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(progress, speed);
            }
        },
    });
};

/**
 * Start a chunked upload session for large files
 * @param filename - The name of the file being uploaded
 */
export const startChunkUpload = async (filename: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.FILES.CHUNK.START, null, {
        params: { filename },
    });
};

/**
 * Upload a single chunk of a large file
 * @param filename - The name of the file being uploaded
 * @param chunkIndex - The index of this chunk
 * @param chunkData - The chunk data blob
 */
export const uploadChunk = async (
    filename: string,
    chunkIndex: number,
    chunkData: Blob,
    onProgress?: (loaded: number, total: number) => void
): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.FILES.CHUNK.UPLOAD, chunkData, {
        params: { filename, chunk_index: chunkIndex },
        headers: {
            'Content-Type': 'application/octet-stream',
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                onProgress(progressEvent.loaded, progressEvent.total);
            }
        },
    });
};

/**
 * Complete a chunked upload session
 * @param filename - The name of the file being uploaded
 * @param targetDir - The target directory path
 * @param onStart - Optional callback when finalization starts
 */
export const completeChunkUpload = async (
    filename: string,
    targetDir: string,
    onStart?: () => void
): Promise<void> => {
    if (onStart) {
        onStart();
    }
    await apiClient.post(API_ENDPOINTS.FILES.CHUNK.COMPLETE, null, {
        params: { filename, dir: targetDir },
    });
};

/**
 * Upload a large file using chunked upload
 * @param file - The file to upload
 * @param targetDir - The target directory path
 * @param onProgress - Optional callback for upload progress
 */
export const uploadLargeFile = async (
    file: File,
    targetDir: string,
    onProgress?: (progress: number, speed?: number) => void
): Promise<void> => {
    const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Start chunked upload
    await startChunkUpload(file.name);

    let totalUploadedSoFar = 0;
    let lastTotalUploaded = 0;
    let lastTime = Date.now();
    let lastSpeed = 0;

    // Upload chunks
    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await uploadChunk(file.name, i, chunk, (loaded, total) => {
            const currentTotalUploaded = totalUploadedSoFar + loaded;
            const totalSize = file.size;
            const progress = Math.round((currentTotalUploaded * 100) / totalSize);

            const currentTime = Date.now();
            const timeDiff = (currentTime - lastTime) / 1000;

            let speed = lastSpeed;

            if (timeDiff >= 0.5) {
                const loadedDiff = currentTotalUploaded - lastTotalUploaded;
                speed = loadedDiff / timeDiff;

                lastTotalUploaded = currentTotalUploaded;
                lastTime = currentTime;
                lastSpeed = speed;
            }

            if (onProgress) {
                onProgress(progress, speed);
            }
        });

        totalUploadedSoFar += chunk.size;
    }

    // Complete upload
    await completeChunkUpload(file.name, targetDir);
};
