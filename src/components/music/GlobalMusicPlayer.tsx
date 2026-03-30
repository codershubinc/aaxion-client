'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useMusic } from '@/context/MusicContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, ChevronDown, ListMusic, X } from 'lucide-react';
import { getToken } from '@/services';
import { STORAGE_KEYS } from '@/constants/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from './ProgressBar';
import { MusicQueue } from './MusicQueue';

const MenuDots = ({ className = "" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 16 16">
        <path fill="currentColor" d="M9.5 13a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0" />
    </svg>
);

export default function GlobalMusicPlayer() {
    const { currentTrack, isPlaying, togglePlay, playNext, playPrev, tracks } = useMusic();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAmbientMode, setIsAmbientMode] = useState(false);
    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [hoverPos, setHoverPos] = useState<number | null>(null);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const serverUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SERVER_URL) : null;

    useEffect(() => {
        if (!isExpanded) setIsMenuOpen(false);
    }, [isExpanded]);

    // Feature 4: Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (audioRef.current) audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (audioRef.current) audioRef.current.volume = Math.min(audioRef.current.volume + 0.1, 1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (audioRef.current) audioRef.current.volume = Math.max(audioRef.current.volume - 0.1, 0);
                    break;
                case 'KeyI':
                    e.preventDefault();
                    setIsExpanded(prev => !prev);
                    break;
                case 'KeyN':
                    if (e.shiftKey) {
                        e.preventDefault();
                        playNext();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, playNext]);

    useEffect(() => {
        if (currentTrack && audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(console.error);
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);

            // Feature 5: Media Session Position State
            if ('mediaSession' in navigator && audioRef.current.duration && isFinite(audioRef.current.duration)) {
                try {
                    navigator.mediaSession.setPositionState({
                        duration: audioRef.current.duration,
                        playbackRate: audioRef.current.playbackRate,
                        position: audioRef.current.currentTime
                    });
                } catch (e) {
                    // Ignore transient errors
                }
            }
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>) => {
        if (audioRef.current) {
            const bounds = e.currentTarget.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
            audioRef.current.currentTime = percent * audioRef.current.duration;
            setProgress(percent * 100);
        }
    };

    const streamUrl = `${serverUrl}/music/stream?id=${currentTrack?.id}&tkn=${getToken()}`;
    const imageUrl = currentTrack?.imagePath ? `${serverUrl}/files/view-image?path=${encodeURIComponent(currentTrack.imagePath)}&tkn=${getToken()}` : null;

    useEffect(() => {
        if ('mediaSession' in navigator && currentTrack) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack.title || 'Unknown Title',
                artist: currentTrack.artist || 'Unknown Artist',
                album: currentTrack.album || 'Aaxion Music',
                artwork: imageUrl ? [
                    { src: imageUrl, sizes: '512x512', type: 'image/jpeg' }
                ] : []
            });
        }
    }, [currentTrack, imageUrl]);

    useEffect(() => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
        }
    }, [isPlaying]);

    useEffect(() => {
        if ('mediaSession' in navigator) {
            try {
                navigator.mediaSession.setActionHandler('play', () => {
                    if (!isPlaying) togglePlay();
                });
                navigator.mediaSession.setActionHandler('pause', () => {
                    if (isPlaying) togglePlay();
                });
                navigator.mediaSession.setActionHandler('previoustrack', () => {
                    playPrev();
                });
                navigator.mediaSession.setActionHandler('nexttrack', () => {
                    playNext();
                });
            } catch (err) {
                console.warn("Failed to set media session action handlers:", err);
            }
        }
    }, [isPlaying, togglePlay, playNext, playPrev]);

    if (!currentTrack) return null;

    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextTrack = tracks.length > 0 ? tracks[(currentIndex + 1) % tracks.length] : null;
    const nextImageUrl = nextTrack?.imagePath ? `${serverUrl}/files/view-image?path=${encodeURIComponent(nextTrack.imagePath)}&tkn=${getToken()}` : null;

    const baseClasses = "fixed z-[9999] shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden flex";
    const expandedClasses = "inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl flex-col p-8 items-center justify-center";
    const miniClasses = "bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl h-[84px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/5 items-center px-4 md:px-6 gap-4 md:gap-6 hover:bg-[#1f1f1f]/95 transition-colors";

    return (
        <motion.div
            layout
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed z-[9999] shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden flex transition-colors duration-1000 ${isExpanded
                ? `inset-0 w-full h-[100dvh] max-w-none rounded-none flex-col p-8 items-center justify-center ${isAmbientMode ? 'bg-black/60 border-transparent' : 'bg-[#0a0a0a]/95 backdrop-blur-xl border-white/5'}`
                : `bottom-6 left-0 right-0 mx-auto w-[95%] max-w-5xl h-[84px] rounded-3xl flex-row items-center px-4 md:px-6 gap-4 md:gap-6 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/5`
                }`}
            style={{ transformOrigin: 'bottom center' }}
        >
            {/* Ambient Background layer */}
            <AnimatePresence>
                {isExpanded && isAmbientMode && imageUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={imageUrl}
                                initial={{ opacity: 0, scale: 1.2, x: 0, y: 0 }}
                                animate={{
                                    opacity: 1,
                                    scale: [1.2, 1.3, 1.25, 1.3, 1.2],
                                    x: [0, 30, -20, 15, 0],
                                    y: [0, -20, 25, -10, 0]
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    opacity: { duration: 1.5 },
                                    scale: { repeat: Infinity, duration: 30, ease: "linear" },
                                    x: { repeat: Infinity, duration: 40, ease: "linear" },
                                    y: { repeat: Infinity, duration: 35, ease: "linear" }
                                }}
                                src={imageUrl}
                                alt=""
                                className="w-full h-full object-cover blur-[80px] saturate-200 opacity-60"
                            />
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-black/60 mix-blend-overlay" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={streamUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={playNext}
                autoPlay={isPlaying}
            />

            <AnimatePresence mode="popLayout">
                {isExpanded ? (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full max-w-4xl mx-auto flex flex-col relative"
                    >
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="absolute top-0 right-0 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors z-50 focus:outline-none"
                        >
                            <ChevronDown className="w-6 h-6" />
                        </button>

                        <div className="flex-1 flex flex-col items-center justify-center gap-12 mt-4 md:mt-10">
                            {/* Huge Cover Art with Image Change Animation */}
                            <motion.div layoutId="album-art" className="w-64 h-64 md:w-96 md:h-96   rounded-2xl bg-gray-900 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-800 relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={imageUrl || 'empty'}
                                        initial={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }}
                                        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                                        exit={{ opacity: 0, filter: "blur(10px)", scale: 0.9 }}
                                        transition={{ duration: 0.4 }}
                                        className="w-full h-full"
                                    >
                                        {imageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={imageUrl} alt="Cover art" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-700 text-6xl">♪</div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>

                            {/* Title & Artist */}
                            <div className="text-center space-y-2 max-w-xl w-full">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentTrack.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className="text-2xl md:text-4xl font-bold text-white truncate px-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{currentTrack.title}</h2>
                                        <p className="text-lg md:text-xl text-gray-300 truncate px-4 mt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{currentTrack.artist}</p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Full Size Controls */}
                            <div className="w-full max-w-2xl space-y-8 relative pointer-events-auto">
                                <ProgressBar audioRef={audioRef} progress={progress} size="lg" duration={currentTrack.duration} onProgressClick={handleProgressClick} />

                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex justify-start">
                                        <button
                                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsQueueOpen(!isQueueOpen); }}
                                            className={`p-3 rounded-full transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] focus:outline-none ${isQueueOpen ? 'text-white bg-white/20' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                                        >
                                            <ListMusic className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="flex justify-center items-center gap-8 md:gap-12 flex-shrink-0">
                                        <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={(e: React.MouseEvent) => { e.stopPropagation(); playPrev(); }} className="text-gray-300 hover:text-white transition-colors scale-150 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                                            <SkipBack className="w-5 h-5 fill-current" />
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); togglePlay(); }}
                                            className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-white transition-colors hover:text-blue-600 shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
                                        >
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={isPlaying ? 'pause' : 'play'}
                                                    initial={{ scale: 0, opacity: 0, rotate: -90 }}
                                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                                    exit={{ scale: 0, opacity: 0, rotate: 90 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {isPlaying ? (
                                                        <Pause className="w-8 h-8 fill-current" />
                                                    ) : (
                                                        <Play className="w-8 h-8 fill-current ml-2" />
                                                    )}
                                                </motion.div>
                                            </AnimatePresence>
                                        </motion.button>

                                        <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={(e: React.MouseEvent) => { e.stopPropagation(); playNext(); }} className="text-gray-300 hover:text-white transition-colors scale-150 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                                            <SkipForward className="w-5 h-5 fill-current" />
                                        </motion.button>
                                    </div>

                                    <div className="flex-1 flex justify-end relative">
                                        <button
                                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                                            className={`p-3 rounded-full transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] focus:outline-none ${isMenuOpen ? 'text-white bg-white/20' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                                        >
                                            <MenuDots className="w-7 h-7" />
                                        </button>

                                        <AnimatePresence>
                                            {isMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute bottom-full right-0 mb-4 p-4 bg-zinc-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl w-56 transform origin-bottom-right z-50 text-left"
                                                >
                                                    <div className="flex items-center justify-between cursor-pointer group" onClick={(e) => { e.stopPropagation(); setIsAmbientMode(!isAmbientMode); }}>
                                                        <span className="text-gray-200 text-sm font-medium group-hover:text-white transition-colors">Ambient Mode</span>
                                                        <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                                                            <input type="checkbox" className="sr-only peer" checked={isAmbientMode} readOnly />
                                                            <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                                                        </label>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Up Next Info */}
                        <AnimatePresence>
                            {nextTrack && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50, x: 20 }}
                                    animate={{ opacity: 1, y: 0, x: 0 }}
                                    exit={{ opacity: 0, y: 50, x: 20 }}
                                    transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                                    className="absolute bottom-4 right-4 md:bottom-8 md:right-8 flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 md:p-4 cursor-pointer hover:bg-white/10 transition-colors group"
                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); playNext(); }}
                                >
                                    <div className="flex flex-col text-right hidden md:flex drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                        <span className="text-[10px] md:text-xs text-gray-300 font-bold uppercase tracking-widest mb-0.5">Up Next</span>
                                        <span className="text-sm font-medium text-white truncate max-w-[120px] md:max-w-[180px] group-hover:text-blue-400 transition-colors">{nextTrack.title}</span>
                                    </div>
                                    <div className="w-12 h-12 md:w-14 md:h-14  rounded-xl bg-gray-800 overflow-hidden shrink-0 border border-white/10 shadow-lg relative">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={nextImageUrl || 'empty'}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="w-full h-full"
                                            >
                                                {nextImageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={nextImageUrl} alt="Next track" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">♪</div>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div
                        key="mini"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full flex flex-row items-center gap-4"
                    >
                        {/* Now Playing Info (Click to expand) */}
                        <div
                            className="flex items-center gap-3 md:gap-4 w-1/3 md:w-1/4 cursor-pointer group"
                            onClick={() => setIsExpanded(true)}
                        >
                            <motion.div layoutId="album-art" className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gray-800 shrink-0 overflow-hidden shadow-md border border-white/10 relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={imageUrl || 'empty'}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-full h-full"
                                    >
                                        {imageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={imageUrl} alt="Cover art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">♪</div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                                    <Maximize2 className="w-4 h-4 text-white" />
                                </div>
                            </motion.div>
                            <div className="flex flex-col overflow-hidden">
                                <motion.span layoutId="track-title" className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                                    {currentTrack.title}
                                </motion.span>
                                <motion.span layoutId="track-artist" className="text-xs text-gray-400 truncate font-medium">
                                    {currentTrack.artist}
                                </motion.span>
                            </div>
                        </div>

                        {/* Controls & Progress */}
                        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl gap-1">
                            <div className="flex items-center gap-4 md:gap-6">
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={playPrev} className="text-gray-400 hover:text-white transition-colors">
                                    <SkipBack className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); togglePlay(); }}
                                    className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white text-black shadow-lg"
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={isPlaying ? 'pause' : 'play'}
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            {isPlaying ? (
                                                <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                                            ) : (
                                                <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-1" />
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </motion.button>

                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={playNext} className="text-gray-400 hover:text-white transition-colors">
                                    <SkipForward className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                                </motion.button>
                            </div>

                            <div className="w-full hidden md:block px-8">
                                <ProgressBar audioRef={audioRef} progress={progress} duration={currentTrack.duration} onProgressClick={handleProgressClick} />
                            </div>
                        </div>

                        {/* Right Tools (Volume / Expand) */}
                        <div className="flex items-center justify-end gap-3 md:gap-5 w-1/3 md:w-1/4">
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                        if (audioRef.current) {
                                            audioRef.current.muted = !isMuted;
                                            setIsMuted(!isMuted);
                                        }
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                                </motion.button>
                                <div className="w-20 md:w-24 h-1.5 bg-gray-800 rounded-full hidden sm:block relative cursor-not-allowed">
                                    <div className="absolute left-0 top-0 h-full bg-gray-400 rounded-full w-full" />
                                </div>
                            </div>

                            <div className="w-px h-8 bg-white/10 hidden md:block mx-1"></div>

                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsExpanded(true)}
                                className="text-gray-400 hover:text-white transition-colors p-2 hidden md:block outline-none"
                                title="Full Screen"
                            >
                                <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feature 3: Music Queue drawer */}
            <MusicQueue isOpen={isQueueOpen} setIsOpen={setIsQueueOpen} />
        </motion.div>
    );
}

function formatTime(seconds: number) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}
