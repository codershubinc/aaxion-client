import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { formatFileSize } from '@/utils/fileUtils';
import { FileItem } from '@/types';

interface UploadIslandProps {
    onClick: () => void;
    uploadingFile: any | null;
    filesCount: number;
    currentIndex: number;
}


export const UploadIsland = ({ onClick, uploadingFile, filesCount, currentIndex }: UploadIslandProps) => (
    <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed bottom-6 right-6 z-50">
        <div onClick={onClick} className="bg-dark-surface border border-dark-border rounded-2xl shadow-2xl p-4 cursor-pointer hover:bg-dark-hover transition-colors">
            {/* Paste your Island JSX here */}
        </div>
    </motion.div>
);