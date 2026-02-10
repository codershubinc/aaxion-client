"use client";
import { useEffect, useRef } from 'react';
import { API_BASE, getToken } from '@/lib/api';
import { MonitorPlay } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Movie {
    id: number;
    title: string;
    description: string;
    poster_path: string;
    file_path: string;
    created_at: string;
}

interface VideoPlayerProps {
    movie: Movie | null;
}

export default function VideoPlayer({ movie }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (movie && videoRef.current) {
            const token = getToken();
            // Pass token in URL for direct streaming access (Auth Middleware must accept Query Params)
            videoRef.current.src = `${API_BASE}/api/stream/movie?id=${movie.id}&tkn=${token}`;
            videoRef.current.load();
            videoRef.current.play().catch(e => console.log("Auto-play blocked"));
        }
    }, [movie]);

    return (
        <section className="flex-1 flex flex-col h-[calc(100vh-8rem)] relative overflow-hidden rounded-3xl bg-[#050505] border border-white/5 shadow-2xl ring-1 ring-white/5">
            <AnimatePresence mode="wait">
                {!movie ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
                    >
                        {/* Abstract background atmosphere */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
                            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-transparent to-transparent" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-sm shadow-[0_0_40px_rgba(255,255,255,0.03)] group"
                            >
                                <MonitorPlay className="w-10 h-10 text-white/30 ml-1 group-hover:text-blue-400 transition-colors duration-500" />
                            </motion.div>
                            <div className="space-y-3">
                                <h2 className="text-sm font-medium tracking-[0.3em] text-white/60 uppercase">
                                    System Ready
                                </h2>
                                <h3 className="text-3xl font-light text-white tracking-tight">
                                    Select Title
                                </h3>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="player"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative w-full h-full flex flex-col"
                    >
                        {/* Ambient Background Layer */}
                        {movie.poster_path && (
                            <div className="absolute inset-0 z-0 pointer-events-none">
                                <Image
                                    src={movie.poster_path}
                                    className="w-full h-full object-cover opacity-20 blur-3xl scale-110 saturate-150"
                                    alt=""
                                />
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/40" />
                            </div>
                        )}

                        {/* Video Container - Centered and constrained */}
                        <div className="flex-1 relative z-10 flex items-center justify-center p-4 md:p-8 lg:p-10">
                            <div className="w-full max-h-full aspect-video rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 relative bg-black group">
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-contain focus:outline-none"
                                    controls
                                    controlsList="nodownload"
                                />
                            </div>
                        </div>

                        {/* Metadata overlaid at bottom with glass effect */}
                        <div className="relative z-20 px-8 pb-10 pt-12 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="max-w-5xl mx-auto"
                            >
                                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-xl font-display">
                                    {movie.title}
                                </h1>
                                <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-3xl font-light drop-shadow-md border-l-2 border-blue-500/50 pl-4">
                                    {movie.description}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}