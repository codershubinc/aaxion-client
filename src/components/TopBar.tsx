'use client';

import { Upload, RefreshCw, FolderPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { createDirectory } from '@/services/api';

interface TopBarProps {
    onUploadClick: () => void;
    currentPath: string;
    onRefresh: () => void;
}

export default function TopBar({ onUploadClick, currentPath, onRefresh }: TopBarProps) {
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [folderName, setFolderName] = useState('');

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
            className="h-16 bg-dark-surface border-b border-dark-border flex items-center justify-between px-6"
        >
            <div className="flex items-center space-x-4">
                <motion.h1
                    className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent"
                    whileHover={{ scale: 1.05 }}
                >
                    Aaxion
                </motion.h1>
                <span className="text-dark-muted">File Storage</span>
            </div>

            <div className="flex items-center space-x-3">
                {isCreatingFolder && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center space-x-2"
                    >
                        <input
                            type="text"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                            placeholder="Folder name..."
                            className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm focus:outline-none focus:border-accent-blue transition-colors"
                            autoFocus
                        />
                        <button
                            onClick={handleCreateFolder}
                            className="px-3 py-2 bg-accent-green text-white rounded-lg text-sm hover:bg-accent-green/80 transition-colors"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => {
                                setIsCreatingFolder(false);
                                setFolderName('');
                            }}
                            className="px-3 py-2 bg-dark-hover text-dark-text rounded-lg text-sm hover:bg-dark-border transition-colors"
                        >
                            Cancel
                        </button>
                    </motion.div>
                )}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreatingFolder(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-dark-hover hover:bg-dark-border rounded-lg transition-colors"
                >
                    <FolderPlus size={18} />
                    <span className="text-sm">New Folder</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRefresh}
                    className="p-2 bg-dark-hover hover:bg-dark-border rounded-lg transition-colors"
                >
                    <RefreshCw size={18} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onUploadClick}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 rounded-lg transition-colors"
                >
                    <Upload size={18} />
                    <span className="text-sm font-medium">Upload</span>
                </motion.button>
            </div>
        </motion.header>
    );
}
