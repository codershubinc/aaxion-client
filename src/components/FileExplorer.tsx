'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, File, Download, Share2, ChevronRight, Grid, List, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import { viewFiles, downloadFile, requestTempShare, getSystemRootPath } from '@/services/api';
import type { FileItem } from '@/types';
import { formatFileSize } from '@/utils/fileUtils';

interface FileExplorerProps {
    currentPath: string;
    onPathChange: (path: string) => void;
    refreshKey: number;
}

export default function FileExplorer({ currentPath, onPathChange, refreshKey }: FileExplorerProps) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [pathParts, setPathParts] = useState<string[]>([]);
    const [rootPath, setRootPath] = useState('');

    useEffect(() => {
        loadRootPath();
    }, []);

    useEffect(() => {
        if (currentPath && currentPath !== '') {

            loadFiles();
            updatePathParts();
        }
    }, [currentPath, refreshKey]);

    const updatePathParts = () => {
        const parts = currentPath.split('/').filter(Boolean);
        setPathParts(parts);
    };

    const loadRootPath = async () => {
        try {
            const root = await getSystemRootPath();
            setRootPath(root);
        } catch (error) {
            console.error('Failed to load root path:', error);
        }
    };

    const loadFiles = async () => {
        setLoading(true);
        try {
            if (!currentPath.startsWith(rootPath)) {
                currentPath = rootPath;
            }
            const data = await viewFiles(currentPath);
            setFiles(data || []);
        } catch (error) {
            toast.error('Failed to load files');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileClick = (file: FileItem) => {
        if (file.is_dir) {
            onPathChange(file.raw_path);
        }
    };

    const handleDownload = (file: FileItem) => {
        try {
            downloadFile(file.raw_path);
            toast.success(`Downloading ${file.name}`);
        } catch (error) {
            toast.error('Failed to download file');
        }
    };

    const handleShare = async (file: FileItem) => {
        try {
            const shareLink = await requestTempShare(file.raw_path);
            const fullUrl = `${window.location.origin}${shareLink}`;
            await navigator.clipboard.writeText(fullUrl);
            toast.success('Share link copied to clipboard!');
        } catch (error) {
            toast.error('Failed to generate share link');
        }
    };

    const navigateToPath = (index: number) => {
        const newPath = '/' + pathParts.slice(0, index + 1).join('/');
        onPathChange(newPath);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-dark-bg">
            {/* Breadcrumb & View Toggle */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
                <div className="flex items-center space-x-2 text-sm overflow-x-auto scrollbar-hide">
                    {/* Home Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => rootPath && onPathChange(rootPath)}
                        className="flex items-center space-x-1 px-2 py-1 rounded-lg text-dark-text hover:text-accent-blue hover:bg-dark-hover transition-colors"
                        title="Go to home"
                    >
                        <Home size={16} />
                        <span className="font-medium">Home</span>
                    </motion.button>

                    {pathParts.length > 0 && <ChevronRight size={16} className="text-dark-muted" />}

                    {pathParts.map((part, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => navigateToPath(index)}
                                className="text-dark-text hover:text-accent-blue transition-colors">
                                {part}
                            </motion.button>
                            {index < pathParts.length - 1 && (
                                <ChevronRight size={16} className="text-dark-muted" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-accent-blue text-white' : 'bg-dark-hover text-dark-text'
                            }`}
                    >
                        <Grid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-accent-blue text-white' : 'bg-dark-hover text-dark-text'
                            }`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* File Grid/List */}
            <div className="flex-1 overflow-y-auto p-6">
                {files.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full flex flex-col items-center justify-center text-dark-muted"
                    >
                        <Folder size={64} className="mb-4 opacity-50" />
                        <p>This folder is empty</p>
                    </motion.div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        <AnimatePresence>
                            {files.map((file, index) => (
                                <motion.div
                                    key={file.raw_path}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="group"
                                >
                                    <div
                                        onClick={() => handleFileClick(file)}
                                        className="relative bg-dark-surface border border-dark-border rounded-xl p-4 hover:border-accent-blue transition-all cursor-pointer hover-lift"
                                    >
                                        <div className="flex flex-col items-center space-y-3">
                                            <div className="text-5xl">
                                                {file.is_dir ? '📁' : '📄'}
                                            </div>
                                            <div className="w-full text-center">
                                                <p className="text-sm text-dark-text truncate font-medium">
                                                    {file.name}
                                                </p>
                                                {!file.is_dir && (
                                                    <p className="text-xs text-dark-muted mt-1">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {!file.is_dir && (
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownload(file);
                                                    }}
                                                    className="p-1.5 bg-dark-bg rounded-lg hover:bg-accent-blue transition-colors"
                                                >
                                                    <Download size={14} />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShare(file);
                                                    }}
                                                    className="p-1.5 bg-dark-bg rounded-lg hover:bg-accent-purple transition-colors"
                                                >
                                                    <Share2 size={14} />
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <AnimatePresence>
                            {files.map((file, index) => (
                                <motion.div
                                    key={file.raw_path}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.02 }}
                                    onClick={() => handleFileClick(file)}
                                    className="flex items-center justify-between p-3 bg-dark-surface hover:bg-dark-hover border border-dark-border rounded-lg cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <div className="text-2xl flex-shrink-0">
                                            {file.is_dir ? '📁' : '📄'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-dark-text truncate font-medium">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-dark-muted">
                                                {file.is_dir ? 'Folder' : formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>

                                    {!file.is_dir && (
                                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownload(file);
                                                }}
                                                className="p-2 bg-dark-bg rounded-lg hover:bg-accent-blue transition-colors"
                                            >
                                                <Download size={16} />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShare(file);
                                                }}
                                                className="p-2 bg-dark-bg rounded-lg hover:bg-accent-purple transition-colors"
                                            >
                                                <Share2 size={16} />
                                            </motion.button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
