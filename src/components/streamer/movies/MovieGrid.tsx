"use client";
import { useEffect, useState, useRef, useCallback, use } from 'react';
import apiClient from '@/services/apiClient';
import { Search, Film, Play, Loader2, Star, Calendar, MoreVertical, Copy, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOmdbCache } from '@/hooks/useOmdbCache';
import Image from 'next/image';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { getToken } from '@/services';
import getServerUrl from '@/utils/serverUrlWithLiveChecks';
import { STORAGE_KEYS } from '@/constants';

interface Movie {
    id: number;
    title: string;
    description: string;
    poster_path: string;
    file_path: string;
    created_at: string;
}

interface MovieGridProps {
    onSelect: (movie: Movie) => void;
    refreshTrigger: number;
}

async function editMovie(data: { id: number; title: string; description: string; poster_path?: string }) {
    return apiClient.put('/api/movies/edit', data);
}

export default function MovieGrid({ onSelect, refreshTrigger }: MovieGridProps) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [qrUrl, setQrUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await apiClient.get('/api/movies/list');
                setMovies(response.data);
            } catch (error) {
                console.error('Failed to fetch movies:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, [refreshTrigger]);

    const handleUpdateMovie = useCallback(async (movie: Movie, posterPath: string) => {
        // Update backend
        await editMovie({
            id: movie.id,
            title: movie.title,
            description: movie.description,
            poster_path: posterPath
        });

        // Update local state
        setMovies(current =>
            current.map(m => m.id === movie.id ? { ...m, poster_path: posterPath } : m)
        );
    }, []);

    const omdbCache = useOmdbCache<Movie>(movies, handleUpdateMovie, 'movie', loading);

    const [showFloatingSearch, setShowFloatingSearch] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const filteredMovies = movies.filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase())
    );

    const handleCopyStream = async (movie: Movie) => {
        if (movie.file_path) {
            try {
                const apiBase = await getServerUrl(JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVER_INFO) || '{}'));
                const token = getToken();
                const endpoint = '/api/stream/movie';
                const streamUrl = `${apiBase}${endpoint}?id=${movie.id}&tkn=${token}`;

                // Try Tauri native clipboard first
                try {
                    await writeText(streamUrl);
                    toast.success('Stream URL copied');
                    return;
                } catch (tauriErr) {
                    console.log("Tauri clipboard failed, falling back to web API", tauriErr);
                }

                // Fallback for web environments
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(streamUrl);
                } else {
                    // Create a temporary textarea to copy from
                    const textArea = document.createElement("textarea");
                    textArea.value = streamUrl;
                    // Move textarea out of viewport
                    textArea.style.position = "absolute";
                    textArea.style.left = "-999999px";
                    document.body.prepend(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                    } catch (error) {
                        console.error(error);
                        throw new Error("Fallback copy failed");
                    } finally {
                        textArea.remove();
                    }
                }
                toast.success('Stream URL copied');
            } catch (e) {
                toast.error('Failed to copy URL');
                console.error(e);
            }
        }
    };

    // if there were a server-side endpoint that returns the contents of a scanned QR (for demo we just use file path)
    const handleScanQr = async (movie: Movie) => {
        try {
            const apiBase = await getServerUrl(JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVER_INFO) || '{}'));
            const token = getToken();
            const endpoint = '/api/stream/movie';
            const streamUrl = `${apiBase}${endpoint}?id=${movie.id}&tkn=${token}`;
            const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(streamUrl)}`;
            setQrUrl(url);
        } catch (err) {
            // fallback to simple generated QR
            const data = movie.file_path || movie.title;
            const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
            setQrUrl(url);
            toast.error('Failed to scan QR, showing default');
        }
    };

    const closeQr = () => setQrUrl(null);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollTop > 100) {
                setShowFloatingSearch(true);
            } else {
                setShowFloatingSearch(false);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // close options menu when user clicks anywhere else
    useEffect(() => {
        const handleDocClick = () => setOpenMenuId(null);
        document.addEventListener('click', handleDocClick);
        return () => document.removeEventListener('click', handleDocClick);
    }, []);
    useEffect(() => {
        console.log("m.id", openMenuId);


    }, [openMenuId]);

    return (
        <div className="flex flex-col h-full w-full relative">
            {/* Grid Area - This is the main scroll container */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-24 pt-4"
            >
                {/* Initial Search Bar Position - Hides when scrolled */}
                <div className={`mb-6 relative max-w-xl mx-auto w-full group transition-opacity duration-300 ${showFloatingSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 text-lg rounded-full pl-12 pr-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-100 placeholder-gray-600 shadow-lg backdrop-blur-md"
                        placeholder="Search movies..."
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-blue-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p className="text-gray-500 text-sm">Loading library...</p>
                    </div>
                ) : filteredMovies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                        <Film className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No movies found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
                        {filteredMovies.map((m) => (
                            <div
                                key={m.id}
                                onClick={() => onSelect(m)}
                                className="group flex flex-col gap-3 cursor-pointer bg-transparent relative"
                            >
                                {/* options menu trigger */}
                                <div className="absolute top-2 right-2 z-50">
                                    <button
                                        type="button"
                                        onClick={e => {
                                            console.log("clicked more btn", m.id);

                                            e.preventDefault();
                                            e.stopPropagation();
                                            // Use a timeout to prevent the document click listener from immediately closing it
                                            setTimeout(() => {
                                                setOpenMenuId(prev => prev === m.id ? null : m.id);
                                            }, 0);
                                        }}
                                        className="p-1.5 bg-black/50 rounded-full text-gray-300 hover:text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                    {openMenuId === m.id && (
                                        <div className="absolute right-0 mt-2 w-36 bg-black/90 text-white rounded-lg shadow-lg z-[60] border border-white/10 overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={e => { e.preventDefault(); e.stopPropagation(); handleCopyStream(m); setOpenMenuId(null); }}
                                                className="flex items-center gap-2 w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors text-sm"
                                            >
                                                <Copy className="w-4 h-4" />
                                                Copy stream
                                            </button>
                                            <button
                                                type="button"
                                                onClick={e => { e.preventDefault(); e.stopPropagation(); handleScanQr(m); setOpenMenuId(null); }}
                                                className="flex items-center gap-2 w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors text-sm"
                                            >
                                                <QrCode className="w-4 h-4" />
                                                Scan QR
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {/* Poster Card */}
                                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 shadow-xl ring-1 ring-white/5 transition-all duration-300 group-hover:ring-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-[1.03]">
                                    {m.poster_path ? (
                                        <Image
                                            src={m.poster_path}
                                            alt={m.title}
                                            width={300}
                                            height={450}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 border border-white/5">
                                            <Film className="w-10 h-10 text-gray-700 mb-2" />
                                        </div>
                                    )}

                                    {/* Hover Overlay Play Icon */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                            <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Title & Info Below */}
                                <div className="space-y-1.5 px-1 mt-2">
                                    <h3
                                        className="text-gray-200 font-semibold text-sm md:text-base leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors"
                                        title={m.title}
                                    >
                                        {m.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        {omdbCache[m.title.toLowerCase().trim()]?.Year ? (
                                            <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                {omdbCache[m.title.toLowerCase().trim()].Year.split('–')[0]}
                                            </span>
                                        ) : (
                                            <span>{new Date(m.created_at).getFullYear() || "Unknown"}</span>
                                        )}

                                        {omdbCache[m.title.toLowerCase().trim()]?.imdbRating && omdbCache[m.title.toLowerCase().trim()]?.imdbRating !== "N/A" && (
                                            <span className="flex items-center gap-1 text-yellow-500/80">
                                                <Star className="w-3 h-3 fill-current" />
                                                {omdbCache[m.title.toLowerCase().trim()].imdbRating}
                                            </span>
                                        )}
                                    </div>

                                    {omdbCache[m.title.toLowerCase().trim()]?.Genre && (
                                        <p className="text-[10px] text-gray-600 truncate">
                                            {omdbCache[m.title.toLowerCase().trim()].Genre}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Search Bar (Bottom) */}
            <div
                className={`absolute bottom-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300 transform ${showFloatingSearch ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
            >
                <div className="relative w-full max-w-lg shadow-2xl shadow-black/50">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-[#0a0a0a]/90 border border-white/20 text-lg rounded-full pl-12 pr-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-100 placeholder-gray-500 backdrop-blur-xl"
                        placeholder="Search movies..."
                    />
                </div>
            </div>

            {/* QR overlay bottom-right */}
            {qrUrl && (
                <div className="fixed bottom-4 right-4 z-60 bg-black/80 p-3 rounded-lg flex flex-col items-center">
                    <img src={qrUrl} alt="QR code" className="w-36 h-36" />
                    <button
                        onClick={closeQr}
                        className="mt-2 text-xs text-white/80 hover:text-white"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}
