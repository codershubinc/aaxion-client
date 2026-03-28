'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useMusic } from '@/context/MusicContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, ChevronDown } from 'lucide-react';
import { getToken } from '@/services';
import { STORAGE_KEYS } from '@/constants/storage';

export default function GlobalMusicPlayer() {
    const { currentTrack, isPlaying, togglePlay, playNext, playPrev } = useMusic();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const serverUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SERVER_URL) : null;

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
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (audioRef.current) {
            const bounds = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - bounds.left) / bounds.width;
            audioRef.current.currentTime = percent * audioRef.current.duration;
            setProgress(percent * 100);
        }
    };

    if (!currentTrack) return null;

    const streamUrl = `${serverUrl}/music/stream?id=${currentTrack.id}&tkn=${getToken()}`;
    const imageUrl = currentTrack.imagePath ? `${serverUrl}/files/view-image?path=${encodeURIComponent(currentTrack.imagePath)}&tkn=${getToken()}` : null;

    // Use a shared progress bar element to avoid code duplication
    const ProgressBar = ({ size = 'sm' }) => (
        <div className="w-full flex items-center gap-3 group">
            <span className={`text-gray-500 font-mono w-10 text-right ${size === 'lg' ? 'text-xs' : 'text-[10px]'}`}>
                {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}
            </span>
            <div
                className={`flex-1 bg-gray-800 rounded-full cursor-pointer relative ${size === 'lg' ? 'h-2' : 'h-1.5'}`}
                onClick={handleProgressClick}
            >
                <div
                    className="absolute left-0 top-0 h-full bg-blue-500 rounded-full group-hover:bg-blue-400 transition-colors"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className={`text-gray-500 font-mono w-10 ${size === 'lg' ? 'text-xs' : 'text-[10px]'}`}>
                {audioRef.current && audioRef.current.duration ? formatTime(audioRef.current.duration) : (currentTrack.duration ? formatTime(currentTrack.duration) : '0:00')}
            </span>
        </div>
    );

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-[#2D2D2D] z-[9999] shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isExpanded ? 'top-0 h-screen border-none flex flex-col p-8' : 'h-20 border-t flex flex-row items-center px-6 gap-6'}`}>
            
            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={streamUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={playNext}
                autoPlay={isPlaying}
            />

            {/* ======================================================== */}
            {/* FULL SCREEN VIEW */}
            {/* ======================================================== */}
            {isExpanded ? (
                <div className="w-full h-full max-w-4xl mx-auto flex flex-col relative animate-in fade-in zoom-in-95 duration-500">
                    <button 
                        onClick={() => setIsExpanded(false)}
                        className="absolute top-0 right-0 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors z-50"
                    >
                        <ChevronDown className="w-6 h-6" />
                    </button>

                    <div className="flex-1 flex flex-col items-center justify-center gap-12 mt-10">
                        {/* Huge Cover Art */}
                        <div className="w-64 h-64 md:w-96 md:h-96 rounded-2xl bg-gray-900 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-800">
                            {imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imageUrl} alt="Cover art" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-700 text-6xl">♪</div>
                            )}
                        </div>

                        {/* Title & Artist */}
                        <div className="text-center space-y-2 max-w-xl w-full">
                            <h2 className="text-2xl md:text-4xl font-bold text-white truncate px-4">{currentTrack.title}</h2>
                            <p className="text-lg md:text-xl text-gray-400 truncate px-4">{currentTrack.artist}</p>
                        </div>

                        {/* Full Size Controls */}
                        <div className="w-full max-w-2xl space-y-8">
                            <ProgressBar size="lg" />

                            <div className="flex justify-center items-center gap-8 md:gap-12">
                                <button onClick={playPrev} className="text-gray-400 hover:text-white transition-colors scale-150">
                                    <SkipBack className="w-5 h-5 fill-current" />
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                    className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-900/20 pointer-events-auto"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-8 h-8 fill-current" />
                                    ) : (
                                        <Play className="w-8 h-8 fill-current ml-2" />
                                    )}
                                </button>

                                <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors scale-150">
                                    <SkipForward className="w-5 h-5 fill-current" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ======================================================== */
                /* MINI PLAYER VIEW */
                /* ======================================================== */
                <>
                    {/* Now Playing Info (Click to expand) */}
                    <div 
                        className="flex items-center gap-4 w-1/4 min-w-[200px] cursor-pointer group"
                        onClick={() => setIsExpanded(true)}
                    >
                        <div className="w-12 h-12 rounded-md bg-gray-800 shrink-0 overflow-hidden shadow-lg border border-gray-700/50 relative">
                            {imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imageUrl} alt="Cover art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">♪</div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                                {currentTrack.title}
                            </span>
                            <span className="text-xs text-gray-400 truncate">
                                {currentTrack.artist}
                            </span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl gap-2">
                        <div className="flex items-center gap-6">
                            <button onClick={playPrev} className="text-gray-400 hover:text-white transition-colors">
                                <SkipBack className="w-5 h-5 fill-current" />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform shadow-lg"
                            >
                                {isPlaying ? (
                                    <Pause className="w-5 h-5 fill-current" />
                                ) : (
                                    <Play className="w-5 h-5 fill-current ml-1" />
                                )}
                            </button>

                            <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors">
                                <SkipForward className="w-5 h-5 fill-current" />
                            </button>
                        </div>

                        <ProgressBar />
                    </div>

                    {/* Right Tools (Volume / Expand) */}
                    <div className="w-1/4 min-w-[200px] flex items-center justify-end gap-5">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (audioRef.current) {
                                        audioRef.current.muted = !isMuted;
                                        setIsMuted(!isMuted);
                                    }
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <div className="w-24 h-1.5 bg-gray-800 rounded-full hidden sm:block relative cursor-not-allowed">
                                <div className="absolute left-0 top-0 h-full bg-gray-300 rounded-full w-full" />
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsExpanded(true)}
                            className="text-gray-400 hover:text-white transition-colors p-2"
                        >
                            <Maximize2 className="w-5 h-5" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function formatTime(seconds: number) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}
