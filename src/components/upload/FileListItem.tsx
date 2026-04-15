import { motion } from 'framer-motion';
import { X, Loader } from 'lucide-react';
import { formatFileSize } from '@/utils/fileUtils';

export const FileListItem = ({ item, index, onRemove, isUploading }: { item: any; index: number; onRemove: () => void; isUploading: boolean }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between p-3 bg-dark-bg rounded-lg border border-dark-border"
    >
        <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm text-dark-text truncate font-medium">
                {item.file.name}
            </p>
            <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-dark-muted">
                    {formatFileSize(item.file.size)}
                </p>
                {item.totalChunks && item.totalChunks > 1 && (
                    <>
                        <span className="text-xs text-dark-muted">•</span>
                        <p className="text-xs text-accent-blue font-medium">
                            Chunk {item.currentChunk || 0}/{item.totalChunks}
                        </p>
                    </>
                )}
            </div>

            {item.status === 'uploading' && (
                <div className="mt-2">
                    <div className="h-1.5 bg-dark-surface rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            className="h-full bg-accent-blue rounded-full"
                        />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-dark-muted">
                            {item.progress}%
                        </p>
                        {item.speed !== undefined && (
                            <p className="text-xs text-dark-muted font-medium">
                                {formatFileSize(item.speed)}/s
                            </p>
                        )}
                    </div>
                </div>
            )}

            {item.status === 'finalizing' && (
                <div className="mt-2 flex items-center space-x-2 text-xs text-accent-blue font-medium">
                    <Loader className="w-3 h-3 animate-spin" />
                    <span>Finalizing chunks...</span>
                </div>
            )}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
            {item.status === 'pending' && (
                <button
                    onClick={onRemove}
                    disabled={isUploading}
                    className="p-1.5 hover:bg-dark-hover rounded transition-colors disabled:opacity-50"
                    title="Remove file"
                >
                    <X size={16} className="text-dark-muted hover:text-red-400" />
                </button>
            )}
            {item.status === 'uploading' && (
                <Loader className="animate-spin text-accent-blue" size={20} />
            )}
            {item.status === 'completed' && (
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
            {item.status === 'error' && (
                <div className="flex items-center space-x-2 text-red-500">
                    <X size={18} />
                    <span className="text-xs font-medium">Failed</span>
                </div>
            )}
        </div>
    </motion.div>
);