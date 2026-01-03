'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, File, Download, Share2, ChevronRight, Grid, List, Home, FileText, FileImage, FileVideo, FileArchive, FileCode, FileSpreadsheet, Music, Image, Video, Github, X, ZoomIn, ZoomOut, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { viewFiles, downloadFile, requestTempShare, getSystemRootPath } from '@/services';
import type { FileItem } from '@/types';
import { formatFileSize, isImageFile } from '@/utils/fileUtils';
import ImagePreview from './ImagePreview';

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
    const [previewImage, setPreviewImage] = useState<FileItem | null>(null);
    const [imageZoom, setImageZoom] = useState(1);
    const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        loadRootPath();
    }, []);

    useEffect(() => {
        if (currentPath && currentPath !== '') {
            loadFiles();
            updatePathParts();

            // Track navigation history
            if (!isNavigating && currentPath !== navigationHistory[historyIndex]) {
                const newHistory = navigationHistory.slice(0, historyIndex + 1);
                newHistory.push(currentPath);
                setNavigationHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);
            }
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
        } else if (isImageFile(file.name)) {
            setPreviewImage(file);
        }
    };

    const getImagePreviewUrl = (filePath: string): string => {
        return `/files/download?path=${encodeURIComponent(filePath)}`;
    };

    const getImageThumbnailUrl = (filePath: string): string => {
        return `/files/thumbnail?path=${encodeURIComponent(filePath)}`;
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

    const goBack = () => {
        if (historyIndex > 0) {
            setIsNavigating(true);
            setHistoryIndex(historyIndex - 1);
            onPathChange(navigationHistory[historyIndex - 1]);
            setTimeout(() => setIsNavigating(false), 100);
        }
    };

    const goForward = () => {
        if (historyIndex < navigationHistory.length - 1) {
            setIsNavigating(true);
            setHistoryIndex(historyIndex + 1);
            onPathChange(navigationHistory[historyIndex + 1]);
            setTimeout(() => setIsNavigating(false), 100);
        }
    };

    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < navigationHistory.length - 1;

    const isRootPath = () => {
        return currentPath === rootPath;
    };

    const [importantFolders, setImportantFolders] = useState<Array<{ icon: any; label: string; path: string; color: string; hoverColor: string }>>([]);

    useEffect(() => {
        if (currentPath === rootPath) {
            const potentialFolders = [
                { icon: Download, label: 'Downloads', name: 'Downloads', path: `${rootPath}/Downloads`, color: 'bg-accent-green/10 text-accent-green', hoverColor: 'hover:border-accent-green' },
                { icon: Video, label: 'Videos', name: 'Videos', path: `${rootPath}/Videos`, color: 'bg-red-500/10 text-red-500', hoverColor: 'hover:border-red-500' },
                { icon: Music, label: 'Music', name: 'Music', path: `${rootPath}/Music`, color: 'bg-pink-500/10 text-pink-500', hoverColor: 'hover:border-pink-500' },
                { icon: Image, label: 'Pictures', name: 'Pictures', path: `${rootPath}/Pictures`, color: 'bg-yellow-500/10 text-yellow-500', hoverColor: 'hover:border-yellow-500' },
                { icon: FileText, label: 'Documents', name: 'Documents', path: `${rootPath}/Documents`, color: 'bg-blue-400/10 text-blue-400', hoverColor: 'hover:border-blue-400' },
                { icon: Github, label: 'Github', name: 'Github', path: `${rootPath}/Github`, color: 'bg-purple-400/10 text-purple-400', hoverColor: 'hover:border-purple-400' },
                { icon: Folder, label: 'aaxion', name: 'aaxion', path: `${rootPath}/aaxion`, color: 'bg-accent-blue/10 text-accent-blue', hoverColor: 'hover:border-accent-blue' },
            ];

            const existingFolderNames = new Set(
                files
                    .filter(file => file.is_dir)
                    .map(file => file.name)
            );

            const available = potentialFolders.filter(f => existingFolderNames.has(f.name));
            setImportantFolders(available);
        }
    }, [files, rootPath, currentPath]);

    const getFileIcon = (fileName: string, isDir: boolean) => {
        if (isDir) {
            return Folder;
        }

        const ext = fileName.split('.').pop()?.toLowerCase();

        // Image files
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp'].includes(ext || '')) {
            return FileImage;
        }

        // Video files
        if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext || '')) {
            return FileVideo;
        }

        // Audio files
        if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext || '')) {
            return Music;
        }

        // Archive files
        if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext || '')) {
            return FileArchive;
        }

        // Code files
        if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift'].includes(ext || '')) {
            return FileCode;
        }

        // Spreadsheet files
        if (['xlsx', 'xls', 'csv', 'ods'].includes(ext || '')) {
            return FileSpreadsheet;
        }

        // Text files
        if (['txt', 'md', 'pdf', 'doc', 'docx'].includes(ext || '')) {
            return FileText;
        }

        return File;
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-dark-border gap-2 sm:gap-0">
                <div className="flex items-center space-x-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide max-w-full">
                    {/* Navigation Buttons */}
                    <div className="flex items-center space-x-1 mr-2 flex-shrink-0">
                        <motion.button
                            whileHover={{ scale: canGoBack ? 1.05 : 1 }}
                            whileTap={{ scale: canGoBack ? 0.95 : 1 }}
                            onClick={goBack}
                            disabled={!canGoBack}
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${canGoBack
                                ? 'hover:bg-dark-hover text-dark-text'
                                : 'text-dark-muted cursor-not-allowed opacity-50'
                                }`}
                            title="Go back"
                        >
                            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: canGoForward ? 1.05 : 1 }}
                            whileTap={{ scale: canGoForward ? 0.95 : 1 }}
                            onClick={goForward}
                            disabled={!canGoForward}
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${canGoForward
                                ? 'hover:bg-dark-hover text-dark-text'
                                : 'text-dark-muted cursor-not-allowed opacity-50'
                                }`}
                            title="Go forward"
                        >
                            <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </motion.button>
                    </div>
                    {/* Home Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => rootPath && onPathChange(rootPath)}
                        className="flex items-center space-x-1 px-2 py-1 rounded-lg text-dark-text hover:text-accent-blue hover:bg-dark-hover transition-colors flex-shrink-0"
                        title="Go to home"
                    >
                        <Home size={14} className="sm:w-4 sm:h-4" />
                        <span className="font-medium text-xs sm:text-sm">Home</span>
                    </motion.button>

                    {pathParts.length > 0 && <ChevronRight size={14} className="sm:w-4 sm:h-4 text-dark-muted flex-shrink-0" />}

                    {pathParts.map((part, index) => (
                        <div key={index} className="flex items-center space-x-2 flex-shrink-0">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => navigateToPath(index)}
                                className="text-dark-text hover:text-accent-blue transition-colors text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                                {part}
                            </motion.button>
                            {index < pathParts.length - 1 && (
                                <ChevronRight size={14} className="sm:w-4 sm:h-4 text-dark-muted" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-accent-blue text-white' : 'bg-dark-hover text-dark-text'}`}
                        title="Grid view"
                    >
                        <Grid size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>

                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-accent-blue text-white' : 'bg-dark-hover text-dark-text'}`}
                        title="List view"
                    >
                        <List size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                </div>
            </div>

            {/* File Grid/List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                {/* Important Folders - Show only at root */}
                {isRootPath() && (
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-sm sm:text-base font-semibold text-dark-text mb-3 sm:mb-4 px-1">Quick Access</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                            {importantFolders.map((folder, index) => (
                                <motion.div
                                    key={folder.path}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => onPathChange(folder.path)}
                                    className={`relative bg-dark-surface border-2 border-dark-border rounded-lg sm:rounded-xl p-3 sm:p-4 ${folder.hoverColor} transition-all cursor-pointer hover-lift group`}
                                >
                                    <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                                        <div className={`p-2 sm:p-3 rounded-lg ${folder.color}`}>
                                            <folder.icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                                        </div>
                                        <p className="text-xs sm:text-sm text-dark-text font-medium text-center">
                                            {folder.label}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Regular Files Section - Hide at root */}
                {!isRootPath() && files.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full flex flex-col items-center justify-center text-dark-muted"
                    >
                        <Folder size={64} className="mb-4 opacity-50" />
                        <p>This folder is empty</p>
                    </motion.div>
                ) : !isRootPath() && viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
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
                                        className="relative bg-dark-surface border border-dark-border rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-accent-blue transition-all cursor-pointer hover-lift"
                                    >
                                        <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                                            {isImageFile(file.name) && !file.is_dir ? (
                                                <div className="w-full aspect-square rounded-lg overflow-hidden bg-dark-bg">
                                                    <img
                                                        src={getImageThumbnailUrl(file.raw_path)}
                                                        alt={file.name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ) : (
                                                <div className={`p-2 sm:p-3 rounded-lg ${file.is_dir ? 'bg-accent-blue/10 text-accent-blue' : 'bg-accent-purple/10 text-accent-purple'}`}>
                                                    {(() => {
                                                        const IconComponent = getFileIcon(file.name, file.is_dir);
                                                        return <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />;
                                                    })()}
                                                </div>
                                            )}
                                            <div className="w-full text-center">
                                                <p className="text-xs sm:text-sm text-dark-text truncate font-medium">
                                                    {file.name}
                                                </p>
                                                {!file.is_dir && (
                                                    <p className="text-[10px] sm:text-xs text-dark-muted mt-0.5 sm:mt-1">
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
                ) : !isRootPath() && viewMode === 'list' ? (
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
                                        {isImageFile(file.name) && !file.is_dir ? (
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-dark-bg flex-shrink-0">
                                                <img
                                                    src={getImageThumbnailUrl(file.raw_path)}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                        ) : (
                                            <div className={`p-2 rounded-lg flex-shrink-0 ${file.is_dir ? 'bg-accent-blue/10 text-accent-blue' : 'bg-accent-purple/10 text-accent-purple'}`}>
                                                {(() => {
                                                    const IconComponent = getFileIcon(file.name, file.is_dir);
                                                    return <IconComponent className="w-5 h-5" />;
                                                })()}
                                            </div>
                                        )}
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
                ) : null}
            </div>
            {/* Image Preview Modal */}
            <ImagePreview
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
                files={files}
                initialFile={previewImage}
            />
        </div>
    );
}
