import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import { FileItem } from '@/types';
import { formatFileSize, isImageFile } from '@/utils/fileUtils';
import { getFileIcon } from './utils';
import { getApiBaseUrl, API_ENDPOINTS } from '@/config';

import { STORAGE_KEYS } from '@/constants';
import { getToken } from '@/services';

interface FileListItemProps {
    file: FileItem;
    index: number;
    onClick: (file: FileItem) => void;
    onDownload: (file: FileItem) => void;
    onShare: (file: FileItem) => void;
}

export default function FileListItem({ file, index, onClick, onDownload, onShare }: FileListItemProps) {
    const getImageThumbnailUrl = (filePath: string): string => {
        const baseUrl = localStorage.getItem(STORAGE_KEYS.SERVER_URL) || '';
        return `${baseUrl}${API_ENDPOINTS.FILES.THUMBNAIL}?path=${encodeURIComponent(filePath)}&tkn=${getToken()}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.02 }}
            onClick={() => onClick(file)}
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
                            onDownload(file);
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
                            onShare(file);
                        }}
                        className="p-2 bg-dark-bg rounded-lg hover:bg-accent-purple transition-colors"
                    >
                        <Share2 size={16} />
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
}
