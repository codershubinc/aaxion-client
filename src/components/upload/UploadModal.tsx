'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileUp, Loader } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import { useFileUploader } from '@/hooks/useFileUploader';
import { UploadIsland } from './UploadIsland';
import { FileListItem } from './FileListItem';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPath: string;
    onUploadComplete: () => void;
    initialFiles?: File[];

}
export default function UploadModal({ isOpen, onClose, currentPath, onUploadComplete, initialFiles }: UploadModalProps) {
    const [showMinimized, setShowMinimized] = useState(false);
    const { updateUploadProgress } = useAppState();

    const {
        uploadingFiles, isUploading, addFiles, removeFile, handleUpload, stats, setUploadingFiles
    } = useFileUploader(currentPath, () => {
        setShowMinimized(false);
        onUploadComplete();
    });

    // Dropzone Setup
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles, fileRejections, event) => {
            console.log("dropzone onDrop triggered:", { acceptedFiles, fileRejections, event });
            addFiles(acceptedFiles); // Assuming addFiles only needs the acceptedFiles array
        },
        onDragEnter: () => console.log("dropzone onDragEnter"),
        onDragOver: () => console.log("dropzone onDragOver"),
        onDragLeave: () => console.log("dropzone onDragLeave"),
        disabled: isUploading,

    });

    // Handle initial files
    useEffect(() => {
        if (isOpen && initialFiles?.length) addFiles(initialFiles);
    }, [isOpen, initialFiles, addFiles]);

    // Handle global file paste events
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            if (!isOpen || showMinimized) return;

            e.preventDefault();

            const newFiles: File[] = [];

            if (e.clipboardData && e.clipboardData.files.length > 0) {
                const files = Array.from(e.clipboardData.files);
                console.log("Web pasted files:", files);
                newFiles.push(...files);
            }
            else if (typeof window !== 'undefined' && ((window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__)) {
                const textData = e.clipboardData?.getData('text/uri-list') || e.clipboardData?.getData('text/plain');
                if (textData) {
                    // Try to split by newlines in case multiple files were copied
                    const lines = textData.split(/\r?\n/).filter((line: string) => line.trim().length > 0);

                    try {
                        const { readFile } = await import('@tauri-apps/plugin-fs');

                        for (let line of lines) {
                            // Strip quotes and file:// prefix, decode URI encoded paths
                            let filepath = decodeURIComponent(line.trim().replace(/^"|"$/g, '').replace(/^file:\/\//i, ''));

                            try {
                                const filename = filepath.split(/[/\\]/).pop() || 'pasted_file';
                                const content = await readFile(filepath);
                                const file = new File([content], filename);
                                newFiles.push(file);
                                console.log("Added file from pasted path:", filepath);
                            } catch (err) {
                                // Not a valid file path, just ignore
                                console.log("Pasted text was not a valid path:", filepath);
                            }
                        }
                    } catch (err) {
                        console.error('Failed to import Tauri fs plugin for paste', err);
                    }
                }
            }

            if (newFiles.length > 0) {
                addFiles(newFiles);
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, [isOpen, showMinimized, addFiles]);

    // Tauri v2 native file drop listener
    useEffect(() => {
        let unlistenDrop: (() => void) | undefined;
        let isTauriEnv = false;

        const setupTauriDrop = async () => {
            if (typeof window !== 'undefined' && ((window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__)) {
                isTauriEnv = true;
                try {
                    const { getCurrentWindow } = await import('@tauri-apps/api/window');
                    const { readFile } = await import('@tauri-apps/plugin-fs');

                    unlistenDrop = await getCurrentWindow().onDragDropEvent(async (event) => {
                        if (!isOpen) return;

                        if (event.payload.type === 'drop') {
                            const paths = event.payload.paths;
                            const newFiles: File[] = [];

                            for (const path of paths) {
                                try {
                                    // Extract filename
                                    const filename = path.split(/[/\\]/).pop() || 'unknown_file';

                                    // Read the file natively from the disk!
                                    const content = await readFile(path);

                                    // Create standard JS File object to feed to dropzone/uploader
                                    const file = new File([content], filename);
                                    newFiles.push(file);
                                } catch (err) {
                                    console.error('Failed to read dropped file:', path, err);
                                }
                            }

                            if (newFiles.length > 0) {
                                addFiles(newFiles);
                            }
                        }
                    });
                } catch (err) {
                    console.error('Failed to setup Tauri drop listener', err);
                }
            }
        };

        setupTauriDrop();
        return () => {
            if (unlistenDrop) unlistenDrop();
        };
    }, [isOpen, addFiles]);

    // Handle Escape Key & Closing
    const handleClose = useCallback(() => {
        if (!isUploading) {
            setUploadingFiles([]);
            setShowMinimized(false);
            onClose();
        }
    }, [isUploading, onClose, setUploadingFiles]);


    useEffect(() => {
        let currentStatus: 'pending' | 'uploading' | 'finalizing' | 'completed' | 'error' = 'pending';
        if (isUploading) {
            const isFinalizing = uploadingFiles.some(f => f.status === 'finalizing');
            const hasErrors = uploadingFiles.some(f => f.status === 'error');
            if (hasErrors) currentStatus = 'error';
            else if (isFinalizing) currentStatus = 'finalizing';
            else currentStatus = 'uploading';
        } else if (stats.allCompleted) {
            currentStatus = 'completed';
        }

        updateUploadProgress({
            isUploading,
            status: currentStatus,
            completedFiles: stats.completedFiles,
            totalFiles: stats.totalFiles,
            overallProgress: stats.overallProgress,
            speed: stats.averageSpeed,
            estimatedTimeRemaining: stats.averageSpeed > 0 ? Math.round((uploadingFiles.reduce((acc, f) => {
                if (f.status === 'completed') return acc;
                return acc + f.file.size - (f.file.size * f.progress / 100);
            }, 0)) / stats.averageSpeed) : 0
        });
        // Destructure dependencies to avoid infinite loops from 'stats' re-creations in useFileUploader
    }, [isUploading, uploadingFiles, stats.allCompleted, stats.completedFiles, stats.totalFiles, stats.overallProgress, stats.averageSpeed, updateUploadProgress]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !showMinimized) handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, showMinimized, handleClose]);

    return (
        <>
            <AnimatePresence>
                {showMinimized && isUploading && (
                    <UploadIsland
                        onClick={() => setShowMinimized(false)}
                        uploadingFile={stats.uploadingFile}
                        filesCount={stats.totalFiles}
                        currentIndex={0}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && !showMinimized && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div onClick={handleClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                        <motion.div className="relative w-full max-w-2xl bg-dark-surface border border-dark-border rounded-xl shadow-2xl overflow-hidden z-10">

                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-dark-border">
                                <div>
                                    <h2 className="text-xl font-semibold text-dark-text">Upload Files</h2>
                                    <p className="text-sm text-dark-muted">{currentPath || 'Select a folder'}</p>
                                </div>
                                <button onClick={handleClose} disabled={isUploading} className="p-2 hover:bg-dark-hover rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer ${isDragActive ? 'border-accent-blue bg-accent-blue/10' : 'border-dark-border bg-dark-bg'}`}>
                                    <input {...getInputProps()} />
                                    <FileUp size={32} className="mx-auto text-accent-blue mb-2" />
                                    <p className="text-dark-text font-medium">Drag & drop files here</p>
                                </div>

                                {uploadingFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-dark-text">Files ({stats.totalFiles})</h3>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {uploadingFiles.map((item: any, index: number) => (
                                                <FileListItem
                                                    key={index}
                                                    item={item}
                                                    onRemove={() => removeFile(index)}
                                                    isUploading={isUploading} index={index} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between p-6 border-t border-dark-border bg-dark-bg">
                                <p className="text-sm text-dark-muted">{stats.totalFiles} file(s) selected</p>
                                <div className="space-x-3">
                                    <button onClick={handleClose} disabled={isUploading} className="px-4 py-2 bg-dark-hover rounded-lg">
                                        {stats.allCompleted ? 'Close' : 'Cancel'}
                                    </button>
                                    {!stats.allCompleted && !isUploading && (
                                        <button onClick={() => { handleUpload(); setShowMinimized(true); }} className="px-4 py-2 bg-accent-blue rounded-lg flex items-center space-x-2">
                                            <Upload size={16} /><span>Upload</span>
                                        </button>
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