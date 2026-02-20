'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { viewFiles, downloadFile, requestTempShare, getSystemRootPath } from '@/services';
import type { FileItem } from '@/types';
import { isImageFile, getImportantFolders } from '@/utils/fileUtils';
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

            try {
                await navigator.clipboard.writeText(fullUrl);
                toast.success('Share link copied to clipboard!');
            } catch (err) {
                console.error('Share copy failed:', err);
                toast.error('Failed to copy link to clipboard');
            }
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

    const [importantFolders, setImportantFolders] = useState<Array<{ icon: any; label: string; path: string; color: string; hoverColor: string; bgColor: string }>>([]);

    useEffect(() => {
        if (currentPath === rootPath) {
            const potentialFolders = getImportantFolders(rootPath);

            const existingFolderNames = new Set(
                files
                    .filter(file => file.is_dir)
                    .map(file => file.name)
            );

            const available = potentialFolders.filter(f => existingFolderNames.has(f.name));
            // @ts-ignore
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
