import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import { FileItem } from '@/types';
import { formatFileSize, isImageFile } from '@/utils/fileUtils';
import { getFileIcon } from './utils';
import { getApiBaseUrl, API_ENDPOINTS } from '@/config';
import { getToken } from '@/services';
import { STORAGE_KEYS } from '@/constants';

interface FileGridItemProps {
    file: FileItem;
    index: number;
    onClick: (file: FileItem) => void;
    onDownload: (file: FileItem) => void;
    onShare: (file: FileItem) => void;
}

export default function FileGridItem({ file, index, onClick, onDownload, onShare }: FileGridItemProps) {
    const getImageThumbnailUrl = (filePath: string): string => {
        const baseUrl = localStorage.getItem(STORAGE_KEYS.SERVER_URL) || '';
        return `${baseUrl}${API_ENDPOINTS.FILES.THUMBNAIL}?path=${encodeURIComponent(filePath)}&tkn=${getToken()}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.02 }}
            className="group"
        >
            <div
                onClick={() => onClick(file)}
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
                                onDownload(file);
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
                                onShare(file);
                            }}
                            className="p-1.5 bg-dark-bg rounded-lg hover:bg-accent-purple transition-colors"
                        >
                            <Share2 size={14} />
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
