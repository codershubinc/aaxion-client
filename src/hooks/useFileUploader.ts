import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface UploadingFile {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'finalizing' | 'completed' | 'error';
    speed?: number;
    currentChunk?: number;
    totalChunks?: number;
}

export function useFileUploader(currentPath: string, onUploadComplete: () => void) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const addFiles = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => ({ file, progress: 0, status: 'pending' as const }));
        setUploadingFiles(prev => {
            const existing = new Set(prev.map(f => `${f.file.name}-${f.file.size}`));
            const filtered = newFiles.filter(f => !existing.has(`${f.file.name}-${f.file.size}`));
            return [...prev, ...filtered];
        });
    }, []);

    const removeFile = (index: number) => {
        setUploadingFiles(prev => prev.filter((_, idx) => idx !== index));
    };

    const uploadChunksOnly = async (
        file: File,
        targetDir: string,
        fileIndex: number,
        totalChunks: number
    ) => {
        const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB chunks
        const { startChunkUpload, uploadChunk } = await import('@/services/uploadService');

        await startChunkUpload(file.name);

        let totalUploadedSoFar = 0;
        let lastTotalUploaded = 0;
        let lastTime = Date.now();
        let lastSpeed = 0;

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

                setUploadingFiles(prev =>
                    prev.map((f, idx) =>
                        idx === fileIndex ? {
                            ...f,
                            progress,
                            speed,
                            currentChunk: i + 1,
                            totalChunks
                        } : f
                    )
                );
            });

            totalUploadedSoFar += chunk.size;
        }
    };

    const handleUpload = async () => {
        if (uploadingFiles.length === 0) {
            toast.error('Please select files to upload');
            return;
        }

        if (!currentPath || currentPath === '/') {
            toast.error('Please select a valid destination folder');
            return;
        }

        setIsUploading(true);

        // Phase 1: Upload all chunks for all files
        for (let i = 0; i < uploadingFiles.length; i++) {
            const fileItem = uploadingFiles[i];

            if (fileItem.status === 'completed') continue;

            try {
                const CHUNK_SIZE = 50 * 1024 * 1024;
                const totalChunks = Math.ceil(fileItem.file.size / CHUNK_SIZE);

                setUploadingFiles(prev =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, status: 'uploading', currentChunk: 0, totalChunks } : f
                    )
                );

                toast(`Starting upload: ${fileItem.file.name} (${totalChunks} chunks)`, {
                    icon: '📤',
                    duration: 2000,
                });

                await uploadChunksOnly(fileItem.file, currentPath, i, totalChunks);

                setUploadingFiles(prev =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, status: 'pending', progress: 100 } : f
                    )
                );
            } catch (error) {
                setUploadingFiles(prev =>
                    prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f)
                );
                toast.error(`Failed to upload chunks for ${fileItem.file.name}`);
                console.error(error);
            }
        }

        // Phase 2: Complete chunk uploads one by one
        for (let i = 0; i < uploadingFiles.length; i++) {
            const fileItem = uploadingFiles[i];

            if (fileItem.status === 'error' || fileItem.status === 'completed') continue;

            try {
                const { completeChunkUpload } = await import('@/services/uploadService');

                setUploadingFiles(prev =>
                    prev.map((f, idx) => idx === i ? { ...f, status: 'finalizing' } : f)
                );

                await completeChunkUpload(fileItem.file.name, currentPath);

                setUploadingFiles(prev =>
                    prev.map((f, idx) => idx === i ? { ...f, status: 'completed', progress: 100 } : f)
                );

                toast.success(`${fileItem.file.name} uploaded successfully! ✨`);
            } catch (error) {
                setUploadingFiles(prev =>
                    prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f)
                );
                toast.error(`Failed to finalize ${fileItem.file.name}`);
                console.error(error);
            }
        }

        setIsUploading(false);
        onUploadComplete();
    };

    // Derived statistics
    const totalSize = uploadingFiles.reduce((acc, f) => acc + f.file.size, 0);
    const uploadedSize = uploadingFiles.reduce((acc, f) => {
        if (f.status === 'completed') return acc + f.file.size;
        if (f.status === 'uploading' || f.status === 'finalizing') return acc + (f.file.size * f.progress / 100);
        return acc;
    }, 0);

    const overallProgress = totalSize > 0 ? Math.round((uploadedSize * 100) / totalSize) : 0;
    const uploadingFile = uploadingFiles.find(f => f.status === 'uploading' || f.status === 'finalizing');

    return {
        uploadingFiles,
        isUploading,
        addFiles,
        removeFile,
        handleUpload,
        setUploadingFiles,
        stats: {
            overallProgress,
            totalFiles: uploadingFiles.length,
            completedFiles: uploadingFiles.filter(f => f.status === 'completed').length,
            averageSpeed: uploadingFile?.speed || 0,
            uploadingFile,
            allCompleted: uploadingFiles.length > 0 && uploadingFiles.every(f => f.status === 'completed')
        }
    };
}