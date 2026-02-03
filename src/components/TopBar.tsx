'use client';

import { Upload, RefreshCw, FolderPlus, Menu, Loader, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createDirectory } from '@/services';
import { formatFileSize } from '@/utils/fileUtils';
import { useAppState } from '@/context/AppContext';

interface TopBarProps {
    onUploadClick: () => void;
    currentPath: string;
    onRefresh: () => void;
    onMenuClick: () => void;
}

export default function TopBar({ onUploadClick, currentPath, onRefresh, onMenuClick }: TopBarProps) {
    const router = useRouter();
    const { uploadProgress, logout } = useAppState();
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [folderName, setFolderName] = useState('');

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        router.push("/login");
    };

    const handleCreateFolder = async () => {
        if (!folderName.trim()) {
            toast.error('Please enter a folder name');
            return;
        }

        try {
            if (!currentPath || currentPath === '/') {
                toast.error('Please wait for the root directory to load');
                return;
            }
            const newPath = `${currentPath}/${folderName}`;
            await createDirectory(newPath);
            toast.success('Folder created successfully');
            setFolderName('');
            setIsCreatingFolder(false);
            onRefresh();
        } catch (error) {
            toast.error('Failed to create folder');
            console.error(error);
        }
    };

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-14 sm:h-16 bg-dark-surface border-b border-dark-border flex items-center justify-between px-3 sm:px-6 mt-0"
        >
            <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-dark-hover rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>

                <motion.h1
                    className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent flex items-baseline"
                    whileHover={{ scale: 1.05 }}
                >
                    Aaxion <span className={`font-cursive text-accent-blue ml-1.5 text-2xl sm:text-3xl`}>Drive</span>
                </motion.h1>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-3">
                {isCreatingFolder && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-full left-0 right-0 mt-2 mx-3 sm:mx-6 p-3 sm:p-4 bg-dark-surface border border-dark-border rounded-lg shadow-xl z-50 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                    >
                        <input
                            type="text"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                            placeholder="Folder name..."
                            className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm focus:outline-none focus:border-accent-blue transition-colors flex-1"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreateFolder}
                                className="flex-1 sm:flex-none px-3 py-2 bg-accent-green text-white rounded-lg text-sm hover:bg-accent-green/80 transition-colors"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => {
                                    setIsCreatingFolder(false);
                                    setFolderName('');
                                }}
                                className="flex-1 sm:flex-none px-3 py-2 bg-dark-hover text-dark-text rounded-lg text-sm hover:bg-dark-border transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreatingFolder(true)}
                    className="hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-2 bg-dark-hover hover:bg-dark-border rounded-lg transition-colors"
                >
                    <FolderPlus size={18} />
                    <span className="text-sm hidden md:inline">New Folder</span>
                </motion.button>

                {/* Mobile new folder button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreatingFolder(true)}
                    className="sm:hidden p-2 bg-dark-hover hover:bg-dark-border rounded-lg transition-colors"
                >
                    <FolderPlus size={18} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRefresh}
                    className="p-2 bg-dark-hover hover:bg-dark-border rounded-lg transition-colors"
                >
                    <RefreshCw className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </motion.button>

                {!uploadProgress?.isUploading ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onUploadClick}
                        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 rounded-lg transition-colors"
                    >
                        <Upload className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm font-medium hidden xs:inline">Upload</span>
                    </motion.button>
                ) : (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-full flex items-center gap-2"
                    >
                        <Loader className="animate-spin text-accent-blue flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                            {uploadProgress.status === 'finalizing' ? (
                                <span className="font-semibold text-accent-blue whitespace-nowrap animate-pulse">
                                    Finalizing...
                                </span>
                            ) : (
                                <>
                                    <span className="font-semibold text-dark-text whitespace-nowrap">
                                        {uploadProgress.completedFiles}/{uploadProgress.totalFiles}
                                    </span>
                                    <span className="text-dark-muted hidden xs:inline">•</span>
                                    <span className="font-medium text-accent-blue whitespace-nowrap hidden xs:inline">
                                        {uploadProgress.overallProgress}%
                                    </span>
                                    {uploadProgress.speed > 0 && (
                                        <>
                                            <span className="text-dark-muted hidden sm:inline">•</span>
                                            <span className="text-accent-green font-medium whitespace-nowrap hidden sm:inline">
                                                {formatFileSize(uploadProgress.speed)}/s
                                            </span>
                                        </>
                                    )}
                                    {uploadProgress.estimatedTimeRemaining > 0 && (
                                        <>
                                            <span className="text-dark-muted hidden md:inline">•</span>
                                            <span className="text-dark-muted whitespace-nowrap hidden md:inline">
                                                {formatTime(uploadProgress.estimatedTimeRemaining)}
                                            </span>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="p-2 bg-dark-hover hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </motion.button>
            </div>
        </motion.header>
    );
}
