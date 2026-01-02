'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Folder, HardDrive } from 'lucide-react';
import { getSystemRootPath } from '@/services/api';

interface SidebarProps {
    currentPath: string;
    onPathChange: (path: string) => void;
}

export default function Sidebar({ currentPath, onPathChange }: SidebarProps) {
    const [rootPath, setRootPath] = useState('');

    useEffect(() => {
        loadRootPath();
    }, []);

    const loadRootPath = async () => {
        try {
            const root = await getSystemRootPath();
            setRootPath(root);
            if (currentPath === '/') {
                onPathChange(root);
            }
        } catch (error) {
            console.error('Failed to load root path:', error);
        }
    };

    const quickLinks = [
        { icon: Home, label: 'Home', path: rootPath },
        { icon: HardDrive, label: 'Storage', path: rootPath },
    ];

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-64 bg-dark-surface border-r border-dark-border p-4 space-y-6"
        >
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
                            onClick={() => onPathChange(link.path)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPath === link.path
                                    ? 'bg-accent-blue text-white'
                                    : 'text-dark-text hover:bg-dark-hover'
                                }`}
                        >
                            <link.icon size={18} />
                            <span className="text-sm">{link.label}</span>
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
                <div className="px-3 space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-dark-muted">Storage</span>
                        <span className="text-dark-text font-medium">Local</span>
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}
