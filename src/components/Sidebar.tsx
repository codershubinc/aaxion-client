'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Folder, HardDrive, X, Settings, Save } from 'lucide-react';
import { getSystemRootPath, getStorageInfo, viewFiles } from '@/services';
import { getImportantFolders } from '@/utils/fileUtils';
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
    const [apiIp, setApiIp] = useState('');

    const handleSaveIp = () => {
        localStorage.setItem('API_IP', apiIp);
        window.location.reload();
    };

    useEffect(() => {
        const stored = localStorage.getItem('API_IP');
        setApiIp(stored || window.location.hostname);
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

            // Get actual files/folders in root directory
            const files = await viewFiles(root);
            const existingFolderNames = new Set(
                files
                    .filter(file => file.is_dir)
                    .map(file => file.name)
            );

            // Define potential important folders
            const potentialFolders = getImportantFolders(root);

            // Filter to only show folders that exist
            const availableFolders = potentialFolders.filter(folder =>
                existingFolderNames.has(folder.name)
            );

            setImportantFolders(availableFolders);
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

                                {storageInfo.external_devices && storageInfo.external_devices.length > 0 && (
                                    <div className="pt-4 border-t border-dark-border space-y-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-dark-muted">External Devices</span>
                                        </div>
                                        {storageInfo.external_devices.map((device, index) => (
                                            <motion.button
                                                key={index}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleLinkClick(device.mount_point)}
                                                className="w-full space-y-2 text-left hover:bg-dark-hover p-2 rounded-lg transition-colors group"
                                            >
                                                <div className="flex justify-between text-xs">
                                                    <div className="flex items-center space-x-2 truncate">
                                                        <HardDrive size={12} className="text-accent-purple flex-shrink-0" />
                                                        <span className="text-dark-text truncate" title={device.mount_point}>
                                                            {device.mount_point.split('/').pop() || device.device}
                                                        </span>
                                                    </div>
                                                    <span className="text-dark-muted flex-shrink-0 ml-2">{formatBytes(device.total)}</span>
                                                </div>
                                                <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${device.usage_percentage > 90
                                                            ? 'bg-red-500'
                                                            : device.usage_percentage > 70
                                                                ? 'bg-yellow-500'
                                                                : 'bg-accent-purple'
                                                            }`}
                                                        style={{ width: `${Math.min(device.usage_percentage, 100)}%` }}
                                                    />
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t border-dark-border">
                    <div className="px-3 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-dark-muted">Server IP</span>
                            <Settings size={14} className="text-dark-muted" />
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={apiIp}
                                onChange={(e) => setApiIp(e.target.value)}
                                className="bg-dark-bg text-dark-text text-sm rounded px-2 py-1 w-full border border-dark-border focus:border-accent-blue outline-none"
                                placeholder="Server IP"
                            />
                            <button
                                onClick={handleSaveIp}
                                className="p-1.5 bg-dark-bg hover:bg-dark-hover text-accent-blue rounded border border-dark-border transition-colors"
                                title="Save & Reload"
                            >
                                <Save size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.aside>
        </AnimatePresence>
    );
}
