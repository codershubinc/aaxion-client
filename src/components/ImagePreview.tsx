'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { formatFileSize, isImageFile } from '@/utils/fileUtils';
import { downloadFile, getToken } from '@/services';
import type { FileItem } from '@/types';
import toast from 'react-hot-toast';
import { getApiBaseUrl, API_ENDPOINTS } from '@/config';

interface ImagePreviewProps {
    isOpen: boolean;
    onClose: () => void;
    files: FileItem[];
    initialFile: FileItem | null;
}

export default function ImagePreview({ isOpen, onClose, files, initialFile }: ImagePreviewProps) {
    const [images, setImages] = useState<FileItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageZoom, setImageZoom] = useState(1);
    const [isLoaded, setIsLoaded] = useState(false);
    const thumbnailContainerRef = useRef<HTMLDivElement>(null);
    console.log("Got image to preview", initialFile);


    useEffect(() => {
        if (isOpen && files.length > 0) {
            const imageFiles = files.filter(f => !f.is_dir && isImageFile(f.name));
            setImages(imageFiles);

            if (initialFile) {
                const index = imageFiles.findIndex(f => f.raw_path === initialFile.raw_path);
                setCurrentIndex(index >= 0 ? index : 0);
            }
            setImageZoom(1);
            setIsLoaded(false);
        }
    }, [isOpen, files, initialFile]);

    useEffect(() => {
        // Scroll active thumbnail into view
        if (thumbnailContainerRef.current && images.length > 0) {
            const activeThumb = thumbnailContainerRef.current.children[currentIndex] as HTMLElement;
            if (activeThumb) {
                activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentIndex, images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setImageZoom(1);
        setIsLoaded(false);
    }, [images.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setImageZoom(1);
        setIsLoaded(false);
    }, [images.length]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowRight':
                handleNext();
                break;
            case 'ArrowLeft':
                handlePrev();
                break;
            case 'Escape':
                onClose();
                break;
            case '+':
            case '=':
                setImageZoom(prev => Math.min(3, prev + 0.25));
                break;
            case '-':
            case '_':
                setImageZoom(prev => Math.max(0.5, prev - 0.25));
                break;
        }
    }, [isOpen, handleNext, handlePrev, onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleDownload = (file: FileItem) => {
        try {
            downloadFile(file.raw_path);
            toast.success(`Downloading ${file.name}`);
        } catch (error) {
            toast.error('Failed to download file');
        }
    };

    const getImagePreviewUrl = (filePath: string): string => {
        const baseUrl = getApiBaseUrl();
        return `${baseUrl}/files/download?path=${encodeURIComponent(filePath)}&tkn=${getToken()}`;
    };

    const getImageThumbnailUrl = (filePath: string): string => {
        const baseUrl = getApiBaseUrl();
        return `${baseUrl}${API_ENDPOINTS.FILES.THUMBNAIL}?path=${encodeURIComponent(filePath)}&tkn=${getToken()}`;
    };

    if (!isOpen || images.length === 0) return null;

    const currentImage = images[currentIndex];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative w-full h-full flex flex-col"
                    >
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity hover:opacity-100 opacity-0 sm:opacity-100">
                            <div className="flex-1 min-w-0 mr-4">
                                <h3 className="text-white font-medium truncate">{currentImage.name}</h3>
                                <p className="text-sm text-gray-300">
                                    {formatFileSize(currentImage.size)} • {currentIndex + 1} / {images.length}
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.25))}
                                    className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors text-white"
                                    title="Zoom out (-)"
                                >
                                    <ZoomOut size={20} />
                                </motion.button>
                                <span className="text-white text-sm px-2 min-w-[3rem] text-center">{Math.round(imageZoom * 100)}%</span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setImageZoom(Math.min(3, imageZoom + 0.25))}
                                    className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors text-white"
                                    title="Zoom in (+)"
                                >
                                    <ZoomIn size={20} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDownload(currentImage)}
                                    className="p-2 bg-accent-blue hover:bg-accent-blue/80 rounded-lg transition-colors text-white"
                                    title="Download"
                                >
                                    <Download size={20} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors text-white"
                                    title="Close (Esc)"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>
                        </div>

                        {/* Main Image Area */}
                        <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative group">
                            {/* Navigation Buttons (Overlay) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                className="absolute left-4 z-10 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                            >
                                <ChevronLeft size={32} />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                className="absolute right-4 z-10 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                            >
                                <ChevronRight size={32} />
                            </button>

                            {!isLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader className="w-10 h-10 text-accent-blue animate-spin" />
                                </div>
                            )}

                            <motion.img
                                key={currentImage.path}
                                src={getImagePreviewUrl(currentImage.raw_path)}
                                alt={currentImage.name}
                                className="max-w-full max-h-full object-contain shadow-2xl"
                                style={{
                                    transform: `scale(${imageZoom})`,
                                    cursor: imageZoom > 1 ? 'grab' : 'default',
                                    display: isLoaded ? 'block' : 'none'
                                }}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                drag={imageZoom > 1}
                                dragConstraints={{
                                    left: -1000 * imageZoom,
                                    right: 1000 * imageZoom,
                                    top: -1000 * imageZoom,
                                    bottom: 1000 * imageZoom
                                }}
                                onLoad={() => setIsLoaded(true)}
                            />
                        </div>

                        {/* Thumbnails Strip */}
                        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity hover:opacity-100 opacity-0 sm:opacity-100 flex justify-center">
                            <div
                                ref={thumbnailContainerRef}
                                className="flex space-x-2 overflow-x-auto max-w-full pb-2 scrollbar-hide px-4"
                            >
                                {images.map((img, idx) => (
                                    <button
                                        key={img.raw_path}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentIndex(idx);
                                            setImageZoom(1);
                                        }}
                                        className={`relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${currentIndex === idx
                                            ? 'border-accent-blue scale-110 z-10'
                                            : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                            }`}
                                    >
                                        <img
                                            src={getImageThumbnailUrl(img.raw_path)}
                                            alt={img.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
