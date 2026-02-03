"use client";
import { useEffect, useRef } from 'react';
import { API_BASE, getToken } from '@/lib/api';
import { Play } from 'lucide-react';

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

    if (!movie) {
        return (
            <section className="flex-1 flex flex-col items-center justify-center bg-gray-900 rounded-2xl border border-gray-800 text-gray-500 h-[calc(100vh-8rem)]">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Play className="w-10 h-10 text-gray-600 ml-1" />
                </div>
                <p className="text-lg font-medium">Select a movie to start watching</p>
            </section>
        );
    }

    return (
        <section className="flex-1 flex flex-col bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden h-[calc(100vh-8rem)]">
            <div className="flex-1 bg-black flex items-center justify-center relative">
                <video
                    ref={videoRef}
                    className="w-full h-full max-h-full object-contain focus:outline-none"
                    controls
                    controlsList="nodownload"
                />
            </div>
            <div className="p-6 bg-gray-900 border-t border-gray-800">
                <h1 className="text-2xl font-bold text-white mb-2">{movie.title}</h1>
                <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
                    {movie.description}
                </p>
            </div>
        </section>
    );
}