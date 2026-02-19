'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileUp, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatFileSize, isLocalNetwork } from '@/utils/fileUtils';
import { useAppState } from '@/context/AppContext';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPath: string;
    onUploadComplete: () => void;
}

interface UploadingFile {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'finalizing' | 'completed' | 'error';
    speed?: number;
    currentChunk?: number;
    totalChunks?: number;
}

export default function UploadModal({ isOpen, onClose, currentPath, onUploadComplete }: UploadModalProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showMinimized, setShowMinimized] = useState(false);
    const { updateUploadProgress } = useAppState();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => ({
            file,
            progress: 0,
            status: 'pending' as const,
        }));
        setUploadingFiles(prev => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        disabled: isUploading,
    });

    const handleUpload = async () => {
        if (uploadingFiles.length === 0) {
            toast.error('Please select files to upload');
            return;
        }

        if (!currentPath || currentPath === '/') {
            toast.error('Please wait for the root directory to load or select a valid folder');
            return;
        }

        setIsUploading(true);
        setShowMinimized(true); // Minimize the modal and show island

        // Phase 1: Upload all chunks for all files
        for (let i = 0; i < uploadingFiles.length; i++) {
            const fileItem = uploadingFiles[i];

            if (fileItem.status === 'completed') continue;

            try {
                const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB chunks
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

                // Upload chunks only (without completion)
                await uploadChunksOnly(
                    fileItem.file,
                    currentPath,
                    i,
                    totalChunks
                );

                // Mark chunks as uploaded, waiting for finalization
                setUploadingFiles(prev =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, status: 'pending', progress: 100 } : f
                    )
                );
            } catch (error) {
                setUploadingFiles(prev =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, status: 'error' } : f
                    )
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
                    prev.map((f, idx) =>
                        idx === i ? { ...f, status: 'finalizing' } : f
                    )
                );

                toast.loading(`Finalizing upload in destination: ${currentPath}`, {
                    duration: 3000,
                });

                await completeChunkUpload(fileItem.file.name, currentPath);

                setUploadingFiles(prev =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, status: 'completed', progress: 100 } : f
                    )
                );

                toast.success(`${fileItem.file.name} uploaded successfully! ✨`);
            } catch (error) {
                setUploadingFiles(prev =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, status: 'error' } : f
                    )
                );
                toast.error(`Failed to finalize ${fileItem.file.name}`);
                console.error(error);
            }
        }

        setIsUploading(false);
        setShowMinimized(false);
        onUploadComplete();
    };

    const uploadChunksOnly = async (
        file: File,
        targetDir: string,
        fileIndex: number,
        totalChunks: number
    ) => {
        const CHUNK_SIZE = 50 * 1024 * 1024;

        // Import the chunk upload functions
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

    const removeFile = (index: number) => {
        setUploadingFiles(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleClose = useCallback(() => {
        if (!isUploading) {
            setUploadingFiles([]);
            setShowMinimized(false);
            onClose();
        }
    }, [isUploading, onClose]);

    // Handle Escape key
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !showMinimized) {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, showMinimized, handleClose, isUploading, onClose]);

    const toggleMinimize = () => {
        if (isUploading) {
            setShowMinimized(!showMinimized);
        }
    };

    const allCompleted = uploadingFiles.length > 0 && uploadingFiles.every(f => f.status === 'completed');

    // Calculate overall progress
    const uploadingFile = uploadingFiles.find(f => f.status === 'uploading' || f.status === 'finalizing');
    const currentFileIndex = uploadingFiles.findIndex(f => f.status === 'uploading' || f.status === 'finalizing');

    // Calculate overall statistics for all files
    const totalFiles = uploadingFiles.length;
    const completedFiles = uploadingFiles.filter(f => f.status === 'completed').length;
    const totalSize = uploadingFiles.reduce((acc, f) => acc + f.file.size, 0);
    const uploadedSize = uploadingFiles.reduce((acc, f) => {
        if (f.status === 'completed') return acc + f.file.size;
        if (f.status === 'uploading' || f.status === 'finalizing') return acc + (f.file.size * f.progress / 100);
        return acc;
    }, 0);
    const overallProgress = totalSize > 0 ? Math.round((uploadedSize * 100) / totalSize) : 0;
    const remainingSize = totalSize - uploadedSize;
    const averageSpeed = uploadingFile?.speed || 0;
    const estimatedTimeRemaining = averageSpeed > 0 ? Math.round(remainingSize / averageSpeed) : 0;

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    // Notify parent of upload progress
    React.useEffect(() => {
        // Determine overall status
        let currentStatus: 'pending' | 'uploading' | 'finalizing' | 'completed' | 'error' = 'pending';
        if (isUploading) {
            const isFinalizing = uploadingFiles.some(f => f.status === 'finalizing');
            const hasErrors = uploadingFiles.some(f => f.status === 'error');

            if (hasErrors) currentStatus = 'error';
            else if (isFinalizing) currentStatus = 'finalizing';
            else currentStatus = 'uploading';
        } else if (allCompleted) {
            currentStatus = 'completed';
        }

        updateUploadProgress({
            isUploading,
            status: currentStatus,
            completedFiles,
            totalFiles,
            overallProgress,
            speed: averageSpeed,
            estimatedTimeRemaining
        });
    }, [isUploading, uploadingFiles, completedFiles, totalFiles, overallProgress, averageSpeed, estimatedTimeRemaining, updateUploadProgress, allCompleted]);

    return (
        <>
            {/* Minimized Island Indicator */}
            <AnimatePresence>
                {showMinimized && isUploading && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <div
                            onClick={toggleMinimize}
                            className="bg-dark-surface border border-dark-border rounded-2xl shadow-2xl p-4 cursor-pointer hover:bg-dark-hover transition-colors"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Loader className="animate-spin text-accent-blue" size={24} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 rounded-full border-2 border-accent-blue/20" />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-dark-text">
                                        {uploadingFile?.status === 'finalizing'
                                            ? `Finalizing ${currentFileIndex + 1}/${uploadingFiles.length}`
                                            : `Uploading ${currentFileIndex + 1}/${uploadingFiles.length}`
                                        }
                                    </p>
                                    {uploadingFile && (
                                        <div className="space-y-1">
                                            <p className="text-xs text-dark-muted truncate max-w-[200px]">
                                                {uploadingFile.file.name}
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-xs text-accent-blue font-medium">
                                                    {uploadingFile.currentChunk}/{uploadingFile.totalChunks} chunks
                                                </p>
                                                <span className="text-xs text-dark-muted">•</span>
                                                <p className="text-xs text-dark-muted">
                                                    {uploadingFile.progress}%
                                                </p>
                                                {uploadingFile.speed !== undefined && (
                                                    <>
                                                        <span className="text-xs text-dark-muted">•</span>
                                                        <p className="text-xs text-accent-green">
                                                            {formatFileSize(uploadingFile.speed)}/s
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            <div className="w-48 h-1 bg-dark-bg rounded-full overflow-hidden">
                                                <motion.div
                                                    animate={{ width: `${uploadingFile.progress}%` }}
                                                    className="h-full bg-accent-blue rounded-full"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Upload Modal */}
            <AnimatePresence>
                {isOpen && !showMinimized && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-dark-surface border border-dark-border rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden mx-2"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-dark-border">
                                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                                    <div className="p-1.5 sm:p-2 bg-accent-blue/20 rounded-lg flex-shrink-0">
                                        <Upload className="text-accent-blue" size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-base sm:text-xl font-semibold text-dark-text">Upload Files</h2>
                                        <p className="text-xs sm:text-sm text-dark-muted truncate">
                                            {currentPath || 'Select a folder'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    disabled={isUploading}
                                    className="p-2 hover:bg-dark-hover rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto">
                                {/* Dropzone */}
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 transition-all cursor-pointer ${isDragActive
                                        ? 'border-accent-blue bg-accent-blue/10'
                                        : 'border-dark-border hover:border-accent-blue/50 bg-dark-bg'
                                        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <input {...getInputProps()} />
                                    <div className="flex flex-col items-center space-y-2 sm:space-y-3 text-center">
                                        <motion.div
                                            animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                                            className="p-3 sm:p-4 bg-dark-surface rounded-full"
                                        >
                                            <FileUp size={24} className="sm:w-8 sm:h-8 text-accent-blue" />
                                        </motion.div>
                                        <div>
                                            <p className="text-sm sm:text-base text-dark-text font-medium">
                                                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                                            </p>
                                            <p className="text-xs sm:text-sm text-dark-muted mt-1">
                                                or click to browse
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* File List */}
                                {uploadingFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-dark-text">
                                            Files ({uploadingFiles.length})
                                        </h3>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {uploadingFiles.map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center justify-between p-3 bg-dark-bg rounded-lg border border-dark-border"
                                                >
                                                    <div className="flex-1 min-w-0 mr-4">
                                                        <p className="text-sm text-dark-text truncate font-medium">
                                                            {item.file.name}
                                                        </p>
                                                        <div className="flex items-center space-x-2">
                                                            <p className="text-xs text-dark-muted">
                                                                {formatFileSize(item.file.size)}
                                                            </p>
                                                            {item.totalChunks && item.totalChunks > 1 && (
                                                                <>
                                                                    <span className="text-xs text-dark-muted">•</span>
                                                                    <p className="text-xs text-accent-blue">
                                                                        {item.totalChunks} chunks
                                                                    </p>
                                                                </>
                                                            )}
                                                        </div>

                                                        {item.status === 'uploading' && (
                                                            <div className="mt-2">
                                                                <div className="h-1.5 bg-dark-surface rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${item.progress}%` }}
                                                                        className="h-full bg-accent-blue rounded-full"
                                                                    />
                                                                </div>
                                                                <div className="flex justify-between items-center mt-1">
                                                                    <div className="flex items-center space-x-2">
                                                                        <p className="text-xs text-dark-muted">
                                                                            {item.progress}%
                                                                        </p>
                                                                        {item.currentChunk !== undefined && item.totalChunks && (
                                                                            <>
                                                                                <span className="text-xs text-dark-muted">•</span>
                                                                                <p className="text-xs text-accent-blue font-medium">
                                                                                    Chunk {item.currentChunk}/{item.totalChunks}
                                                                                </p>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    {item.speed !== undefined && (
                                                                        <p className="text-xs text-dark-muted">
                                                                            {formatFileSize(item.speed)}/s
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        {item.status === 'pending' && (
                                                            <button
                                                                onClick={() => removeFile(index)}
                                                                disabled={isUploading}
                                                                className="p-1.5 hover:bg-dark-hover rounded transition-colors disabled:opacity-50"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                        {item.status === 'uploading' && (
                                                            <Loader className="animate-spin text-accent-blue" size={20} />
                                                        )}
                                                        {item.status === 'completed' && (
                                                            <span className="text-accent-green">✓</span>
                                                        )}
                                                        {item.status === 'error' && (
                                                            <span className="text-red-500">✗</span>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-6 border-t border-dark-border bg-dark-bg gap-3 sm:gap-0">
                                <p className="text-xs sm:text-sm text-dark-muted text-center sm:text-left">
                                    {uploadingFiles.length} file(s) selected
                                </p>
                                <div className="flex items-center justify-end space-x-2 sm:space-x-3">
                                    <button
                                        onClick={handleClose}
                                        disabled={isUploading}
                                        className="px-4 py-2 bg-dark-hover hover:bg-dark-border rounded-lg transition-colors text-sm disabled:opacity-50"
                                    >
                                        {allCompleted ? 'Close' : 'Cancel'}
                                    </button>
                                    {!allCompleted && !isUploading && (
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploadingFiles.length === 0}
                                            className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center space-x-2"
                                        >
                                            <Upload size={16} />
                                            <span>Upload</span>
                                        </button>
                                    )}
                                    {isUploading && (
                                        <motion.div
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="px-4 py-2.5 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-full flex items-center gap-3"
                                        >
                                            <Loader className="animate-spin text-accent-blue flex-shrink-0" size={16} />
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="font-semibold text-dark-text whitespace-nowrap">
                                                    {completedFiles}/{totalFiles} files
                                                </span>
                                                <span className="text-dark-muted">•</span>
                                                <span className="font-medium text-accent-blue whitespace-nowrap">
                                                    {overallProgress}%
                                                </span>
                                                {averageSpeed > 0 && (
                                                    <>
                                                        <span className="text-dark-muted">•</span>
                                                        <span className="text-accent-green font-medium whitespace-nowrap">
                                                            {formatFileSize(averageSpeed)}/s
                                                        </span>
                                                    </>
                                                )}
                                                {estimatedTimeRemaining > 0 && (
                                                    <>
                                                        <span className="text-dark-muted">•</span>
                                                        <span className="text-dark-muted whitespace-nowrap">
                                                            {formatTime(estimatedTimeRemaining)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
