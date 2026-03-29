import React, { useState, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressBarProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    progress: number;
    size?: 'sm' | 'lg';
    duration?: number;
    onProgressClick: (e: MouseEvent<HTMLDivElement>) => void;
}

function formatTime(seconds: number) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ audioRef, progress, size = 'sm', duration, onProgressClick }) => {
    const [hoverPos, setHoverPos] = useState<number | null>(null);
    const [hoverTime, setHoverTime] = useState<number | null>(null);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !audioRef.current.duration) return;
        const bounds = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - bounds.left) / bounds.width;

        setHoverPos(percent * 100);
        setHoverTime(percent * audioRef.current.duration);
    };

    const handleMouseLeave = () => {
        setHoverPos(null);
        setHoverTime(null);
    };

    return (
        <div className="w-full flex items-center gap-3 group px-2">
            <span className={`text-gray-500 font-mono w-10 text-right ${size === 'lg' ? 'text-xs' : 'text-[10px]'}`}>
                {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}
            </span>
            <div
                className={`flex-1 bg-gray-800 rounded-full cursor-pointer relative ${size === 'lg' ? 'h-2' : 'h-1.5'}`}
                onClick={onProgressClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Feature 7: Hover Tooltip */}
                <AnimatePresence>
                    {hoverPos !== null && hoverTime !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 5 }}
                            transition={{ duration: 0.1 }}
                            className="absolute -top-8 -translate-x-1/2 bg-gray-900 border border-gray-700 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-50"
                            style={{ left: `${Math.max(0, Math.min(100, hoverPos))}%` }}
                        >
                            {formatTime(hoverTime)}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hover indicator bar */}
                {hoverPos !== null && (
                    <div
                        className="absolute left-0 top-0 h-full bg-white/20 rounded-full transition-none pointer-events-none"
                        style={{ width: `${Math.max(0, Math.min(100, hoverPos))}%` }}
                    />
                )}

                <div
                    className="absolute left-0 top-0 h-full bg-blue-500 rounded-full group-hover:bg-blue-400 transition-colors pointer-events-none"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className={`text-gray-500 font-mono w-10 ${size === 'lg' ? 'text-xs' : 'text-[10px]'}`}>
                {audioRef.current && audioRef.current.duration
                    ? formatTime(audioRef.current.duration)
                    : (duration ? formatTime(duration) : '0:00')}
            </span>
        </div>
    );
};
