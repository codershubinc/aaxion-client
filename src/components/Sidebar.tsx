'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Folder, HardDrive, X, Download, Video, Github, FileText, Music, Image } from 'lucide-react';
import { getSystemRootPath, getStorageInfo } from '@/services';
import type { StorageInfo } from '@/types';

interface SidebarProps {
    currentPath: string;
    onPathChange: (path: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ currentPath, onPathChange, isOpen, onClose }: SidebarProps) {
    const [rootPath, setRootPath] = useState('');
    const [importantFolders, setImportantFolders] = useState<Array<{ icon: any; label: string; path: string; color: string }>>([]);
    const [isDesktop, setIsDesktop] = useState(false);
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

    useEffect(() => {
        loadRootPath();
        loadStorageInfo();
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    const loadRootPath = async () => {
        try {
            const root = await getSystemRootPath();
            setRootPath(root);
            if (currentPath === '/') {
                onPathChange(root);
            }

            // Set up important folders
            const folders = [
                { icon: Download, label: 'Downloads', path: `${root}/Downloads`, color: 'text-accent-green' },
                { icon: Video, label: 'Videos', path: `${root}/Videos`, color: 'text-red-500' },
                { icon: Music, label: 'Music', path: `${root}/Music`, color: 'text-pink-500' },
                { icon: Image, label: 'Pictures', path: `${root}/Pictures`, color: 'text-yellow-500' },
                { icon: FileText, label: 'Documents', path: `${root}/Documents`, color: 'text-blue-400' },
                { icon: Github, label: 'Github', path: `${root}/Github`, color: 'text-purple-400' },
            ];

            setImportantFolders(folders);
        } catch (error) {
            console.error('Failed to load root path:', error);
        }
    };

    const loadStorageInfo = async () => {
        try {
            const storage = await getStorageInfo();
            setStorageInfo(storage);
        } catch (error) {
            console.error('Failed to load storage info:', error);
        }
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const quickLinks = [
        { icon: Home, label: 'Home', path: rootPath, color: 'text-accent-blue' },
        { icon: HardDrive, label: 'Storage', path: rootPath, color: 'text-accent-purple' },
    ];

    const handleLinkClick = (path: string) => {
        onPathChange(path);
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: isDesktop || isOpen ? 0 : -280 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed lg:static w-64 sm:w-72 bg-dark-surface border-r border-dark-border p-4 space-y-6 h-full z-40 overflow-y-auto"
            >
                {/* Mobile close button */}
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-4 right-4 p-2 hover:bg-dark-hover rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="space-y-2">
                    <h2 className="text-xs font-semibold text-dark-muted uppercase tracking-wider px-3">
                        Quick Access
                    </h2>
                    <div className="space-y-1">
                        {quickLinks.map((link, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleLinkClick(link.path)}
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPath === link.path
                                    ? 'bg-accent-blue text-white'
                                    : 'text-dark-text hover:bg-dark-hover'
                                    }`}
                            >
                                <link.icon size={18} className={currentPath === link.path ? '' : link.color} />
                                <span className="text-sm">{link.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-xs font-semibold text-dark-muted uppercase tracking-wider px-3">
                        Important Folders
                    </h2>
                    <div className="space-y-1">
                        {importantFolders.map((folder, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleLinkClick(folder.path)}
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPath === folder.path
                                    ? 'bg-accent-blue text-white'
                                    : 'text-dark-text hover:bg-dark-hover'
                                    }`}
                            >
                                <folder.icon size={18} className={currentPath === folder.path ? '' : folder.color} />
                                <span className="text-sm">{folder.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-xs font-semibold text-dark-muted uppercase tracking-wider px-3">
                        Current Location
                    </h2>
                    <div className="px-3 py-2 bg-dark-bg rounded-lg">
                        <div className="flex items-start space-x-2">
                            <Folder size={16} className="text-accent-purple mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-dark-text break-all">
                                {currentPath && currentPath !== '/' ? currentPath : 'Loading...'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-dark-border">
                    <div className="px-3 space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-dark-muted">Storage</span>
                            <span className="text-dark-text font-medium">Local</span>
                        </div>
                        {storageInfo && (
                            <>
                                <div className="space-y-2">
                                    <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${storageInfo.usage_percentage > 90
                                                ? 'bg-red-500'
                                                : storageInfo.usage_percentage > 70
                                                    ? 'bg-yellow-500'
                                                    : 'bg-accent-blue'
                                                }`}
                                            style={{ width: `${Math.min(storageInfo.usage_percentage, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-dark-muted">
                                            {formatBytes(storageInfo.available)} free
                                        </span>
                                        <span className="text-dark-text font-medium">
                                            {formatBytes(storageInfo.total)} total
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.aside>
        </AnimatePresence>
    );
}
