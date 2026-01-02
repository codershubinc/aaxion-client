'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileUp, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadFile, uploadLargeFile } from '@/services/api';
import { formatFileSize } from '@/utils/fileUtils';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPath: string;
    onUploadComplete: () => void;
}

interface UploadingFile {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
}

export default function UploadModal({ isOpen, onClose, currentPath, onUploadComplete }: UploadModalProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);

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

        for (let i = 0; i < uploadingFiles.length; i++) {
            const fileItem = uploadingFiles[i];

            if (fileItem.status === 'completed') continue;

            try {
                setUploadingFiles(prev =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, status: 'uploading' } : f
                    )
                );

                const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024; // 100MB

                if (fileItem.file.size > LARGE_FILE_THRESHOLD) {
                    await uploadLargeFile(fileItem.file, currentPath, (progress) => {
                        setUploadingFiles(prev =>
                            prev.map((f, idx) =>
                                idx === i ? { ...f, progress } : f
                            )
                        );
                    });
                } else {
                    await uploadFile(fileItem.file, currentPath, (progress) => {
                        setUploadingFiles(prev =>
                            prev.map((f, idx) =>
                                idx === i ? { ...f, progress } : f
                            )
                        );
                    });
                }

                setUploadingFiles(prev =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, status: 'completed', progress: 100 } : f
                    )
                );

                toast.success(`${fileItem.file.name} uploaded successfully`);
            } catch (error) {
                setUploadingFiles(prev =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, status: 'error' } : f
                    )
                );
                toast.error(`Failed to upload ${fileItem.file.name}`);
                console.error(error);
            }
        }

        setIsUploading(false);
        onUploadComplete();
    };

    const removeFile = (index: number) => {
        setUploadingFiles(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleClose = () => {
        if (!isUploading) {
            setUploadingFiles([]);
            onClose();
        }
    };

    const allCompleted = uploadingFiles.length > 0 && uploadingFiles.every(f => f.status === 'completed');

    return (
        <AnimatePresence>
            {isOpen && (
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
                        className="relative w-full max-w-2xl bg-dark-surface border border-dark-border rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-dark-border">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-accent-blue/20 rounded-lg">
                                    <Upload className="text-accent-blue" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-dark-text">Upload Files</h2>
                                    <p className="text-sm text-dark-muted">
                                        Upload to: {currentPath || 'Select a folder'}
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
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Dropzone */}
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${isDragActive
                                        ? 'border-accent-blue bg-accent-blue/10'
                                        : 'border-dark-border hover:border-accent-blue/50 bg-dark-bg'
                                    } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center space-y-3 text-center">
                                    <motion.div
                                        animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                                        className="p-4 bg-dark-surface rounded-full"
                                    >
                                        <FileUp size={32} className="text-accent-blue" />
                                    </motion.div>
                                    <div>
                                        <p className="text-dark-text font-medium">
                                            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                                        </p>
                                        <p className="text-sm text-dark-muted mt-1">
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
                                                    <p className="text-xs text-dark-muted">
                                                        {formatFileSize(item.file.size)}
                                                    </p>

                                                    {item.status === 'uploading' && (
                                                        <div className="mt-2">
                                                            <div className="h-1.5 bg-dark-surface rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${item.progress}%` }}
                                                                    className="h-full bg-accent-blue rounded-full"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-dark-muted mt-1">
                                                                {item.progress}%
                                                            </p>
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
                        <div className="flex items-center justify-between p-6 border-t border-dark-border bg-dark-bg">
                            <p className="text-sm text-dark-muted">
                                {uploadingFiles.length} file(s) selected
                            </p>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleClose}
                                    disabled={isUploading}
                                    className="px-4 py-2 bg-dark-hover hover:bg-dark-border rounded-lg transition-colors text-sm disabled:opacity-50"
                                >
                                    {allCompleted ? 'Close' : 'Cancel'}
                                </button>
                                {!allCompleted && (
                                    <button
                                        onClick={handleUpload}
                                        disabled={isUploading || uploadingFiles.length === 0}
                                        className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center space-x-2"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader className="animate-spin" size={16} />
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={16} />
                                                <span>Upload</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
