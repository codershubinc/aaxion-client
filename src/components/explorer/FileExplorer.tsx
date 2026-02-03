'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Folder, Download, Video, Github, FileText, Music, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { viewFiles, downloadFile, requestTempShare, getSystemRootPath } from '@/services';
import type { FileItem } from '@/types';
import { isImageFile } from '@/utils/fileUtils';
import ImagePreview from '../ImagePreview';

import ExplorerHeader from './ExplorerHeader';
import QuickAccess from './QuickAccess';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import FileGridItem from './FileGridItem';
import FileListItem from './FileListItem';

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
            console.log("setting img to preview", file);

            setPreviewImage(file);
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
            const fullUrl = `${shareLink.baseUri}${shareLink.share_link}`;
            console.log("share uri", fullUrl);

            // 1. Try Modern API (Works on HTTPS / Localhost)
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(fullUrl);
                    toast.success('Share link copied to clipboard!');
                    return;
                } catch (err) {
                    console.warn('Modern clipboard copy failed, trying legacy...', err);
                }
            }

            // 2. Legacy Fallback
            try {
                const textArea = document.createElement("textarea");
                textArea.value = fullUrl;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    toast.success('Share link copied to clipboard!');
                    return;
                }
            } catch (err) {
                console.error('Legacy copy failed', err);
            }

            // 3. Final Fallback
            toast((t) => (
                <div className="flex flex-col gap-2">
                    <span className="font-medium">Share Link:</span>
                    <input
                        type="text"
                        value={fullUrl}
                        readOnly
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        className="px-2 py-1 bg-dark-bg border border-dark-border rounded text-xs"
                    />
                    <span className="text-xs text-dark-muted">Click to select and copy</span>
                </div>
            ), {
                duration: 8000,
            });

        } catch (error) {
            console.log("got err", error);
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
                { icon: Folder, label: 'Movies', name: 'Movies', path: `${rootPath}/Movies`, color: 'bg-accent-blue/10 text-accent-blue', hoverColor: 'hover:border-accent-blue' },
                { icon: Folder, label: 'Series', name: 'Series', path: `${rootPath}/Series`, color: 'bg-accent-blue/10 text-accent-blue', hoverColor: 'hover:border-accent-blue' },
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

    if (loading) {
        return <LoadingState />;
    }

    return (
        <div className="h-full flex flex-col bg-dark-bg">
            <ExplorerHeader
                pathParts={pathParts}
                viewMode={viewMode}
                setViewMode={setViewMode}
                goBack={goBack}
                goForward={goForward}
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                navigateToPath={navigateToPath}
                rootPath={rootPath}
                onPathChange={onPathChange}
            />

            {/* File Grid/List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                {/* Important Folders - Show only at root */}
                {isRootPath() && <QuickAccess folders={importantFolders} onPathChange={onPathChange} />}

                {/* Regular Files Section - Hide at root */}
                {!isRootPath() && files.length === 0 ? (
                    <EmptyState />
                ) : !isRootPath() && viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
                        <AnimatePresence>
                            {files.map((file, index) => (
                                <FileGridItem
                                    key={file.raw_path}
                                    file={file}
                                    index={index}
                                    onClick={handleFileClick}
                                    onDownload={handleDownload}
                                    onShare={handleShare}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : !isRootPath() && viewMode === 'list' ? (
                    <div className="space-y-1">
                        <AnimatePresence>
                            {files.map((file, index) => (
                                <FileListItem
                                    key={file.raw_path}
                                    file={file}
                                    index={index}
                                    onClick={handleFileClick}
                                    onDownload={handleDownload}
                                    onShare={handleShare}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : null}
            </div>

            <ImagePreview
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
                files={files}
                initialFile={previewImage}
            />
        </div>
    );
}
