"use client";
import { useEffect, useState, useRef } from 'react';
import { authenticatedFetch } from '@/lib/api';
import { Search, Film, Play, Loader2, Star, Calendar } from 'lucide-react';

const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY || 'get_your_dont_look_here';

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
    return authenticatedFetch('/api/movies/edit', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export default function MovieGrid({ onSelect, refreshTrigger }: MovieGridProps) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [omdbCache, setOmdbCache] = useState<Record<string, any>>({});
    const processedIds = useRef(new Set<number>());

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            const endpoint = query
                ? `/api/movies/search?q=${encodeURIComponent(query)}`
                : `/api/movies/list`;

            try {
                const res = await authenticatedFetch(endpoint);
                if (res.ok) {
                    const data = await res.json();
                    setMovies(data || []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchMovies, 300);
        return () => clearTimeout(debounce);
    }, [query, refreshTrigger]);

    // Load omdb cache on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('omdb_data_cache');
            if (stored) {
                setOmdbCache(JSON.parse(stored));
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    // Auto-fetch missing posters
    useEffect(() => {
        if (loading || movies.length === 0) return;

        // Helper to access LocalStorage safely
        const getOmdbCache = (): Record<string, any> => {
            if (typeof window === 'undefined') return {};
            try {
                const stored = localStorage.getItem('omdb_data_cache');
                return stored ? JSON.parse(stored) : {};
            } catch {
                return {};
            }
        };

        const saveOmdbCache = (key: string, data: any) => {
            if (typeof window === 'undefined') return;
            try {
                const cache = getOmdbCache();
                cache[key] = data;
                localStorage.setItem('omdb_data_cache', JSON.stringify(cache));
                setOmdbCache(cache); // Update local state
            } catch (e) {
                console.error("Failed to save omdb cache", e);
            }
        };

        const listToProcess = movies.filter(m =>
            !processedIds.current.has(m.id)
        );

        if (listToProcess.length === 0) return;

        listToProcess.forEach(async (movie) => {
            processedIds.current.add(movie.id);
            const cacheKey = movie.title.toLowerCase().trim();

            let data;
            const cache = getOmdbCache();

            if (cache[cacheKey]) {
                data = cache[cacheKey];
            } else {
                try {
                    const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(movie.title)}`); // Remove type=series for movies
                    data = await res.json();
                    saveOmdbCache(cacheKey, data);
                } catch (e) {
                    console.error(`Failed to auto-fetch poster for ${movie.title}`, e);
                    return;
                }
            }

            if (data && data.Response === 'True' && data.Poster && data.Poster !== 'N/A' && !movie.poster_path) {
                // Update backend
                await editMovie({
                    id: movie.id,
                    title: movie.title,
                    description: movie.description,
                    poster_path: data.Poster
                });

                // Update local state
                setMovies(current =>
                    current.map(m => m.id === movie.id ? { ...m, poster_path: data.Poster } : m)
                );
            }
        });
    }, [movies, loading]);

    return (
        <div className="flex flex-col h-full w-full">
            {/* Search Bar - Centered and Transparent Glass */}
            <div className="mb-6 relative max-w-xl mx-auto w-full group z-10">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 text-lg rounded-full pl-12 pr-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-black/40 text-gray-100 placeholder-gray-600 shadow-lg transition-all backdrop-blur-md"
                    placeholder="Search movies..."
                />
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-blue-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p className="text-gray-500 text-sm">Loading library...</p>
                    </div>
                ) : movies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                        <Film className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No movies found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
                        {movies.map((m) => (
                            <div
                                key={m.id}
                                onClick={() => onSelect(m)}
                                className="group flex flex-col gap-3 cursor-pointer bg-transparent"
                            >
                                {/* Poster Card */}
                                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 shadow-xl ring-1 ring-white/5 transition-all duration-300 group-hover:ring-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-[1.03]">
                                    {m.poster_path ? (
                                        <img
                                            src={m.poster_path}
                                            alt={m.title}
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
        </div>
    );
}
