"use client";
import { useEffect, useState, useRef } from 'react';
import { authenticatedFetch } from '@/lib/api';
import { editSeries } from '@/services/seriesService';
import { Search, ListVideo, Play, Loader2 } from 'lucide-react';
import { Series } from '@/types';

const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY || 'get_your_dont_look_here';

interface SeriesGridProps {
    onSelect: (series: Series) => void;
    refreshTrigger: number;
}

export default function SeriesGrid({ onSelect, refreshTrigger }: SeriesGridProps) {
    const [seriesList, setSeriesList] = useState<Series[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const processedIds = useRef(new Set<number>());

    useEffect(() => {
        const fetchSeries = async () => {
            setLoading(true);
            const endpoint = query
                ? `/api/series/search?q=${encodeURIComponent(query)}`
                : `/api/series/list`;

            try {
                const res = await authenticatedFetch(endpoint);
                if (res.ok) {
                    const data = await res.json();
                    setSeriesList(data || []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchSeries, 300);
        return () => clearTimeout(debounce);
    }, [query, refreshTrigger]);

    // Auto-fetch missing posters
    useEffect(() => {
        if (loading || seriesList.length === 0) return;

        const missingPosters = seriesList.filter(s => !s.poster_path && !processedIds.current.has(s.id));

        missingPosters.forEach(async (series) => {
            processedIds.current.add(series.id);
            try {
                const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(series.title)}&type=series`);
                const data = await res.json();

                if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
                    // Update backend
                    await editSeries({
                        id: series.id,
                        title: series.title,
                        description: series.description,
                        poster_path: data.Poster
                    });

                    // Update local state
                    setSeriesList(current =>
                        current.map(s => s.id === series.id ? { ...s, poster_path: data.Poster } : s)
                    );
                }
            } catch (e) {
                console.error(`Failed to auto-fetch poster for ${series.title}`, e);
            }
        });
    }, [seriesList, loading]);

    return (
        <div className="flex flex-col h-full w-full">
            {/* Search Bar */}
            <div className="mb-6 relative max-w-xl mx-auto w-full group z-10">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 text-lg rounded-full pl-12 pr-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-black/40 text-gray-100 placeholder-gray-600 shadow-lg transition-all backdrop-blur-md"
                    placeholder="Search series..."
                />
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-purple-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p className="text-gray-500 text-sm">Loading series...</p>
                    </div>
                ) : seriesList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                        <ListVideo className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No series found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
                        {seriesList.map((s) => (
                            <div
                                key={s.id}
                                onClick={() => onSelect(s)}
                                className="group flex flex-col gap-3 cursor-pointer bg-transparent"
                            >
                                {/* Card Design */}
                                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 shadow-xl ring-1 ring-white/5 transition-all duration-300 group-hover:ring-purple-500/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:scale-[1.03]">
                                    {s.poster_path ? (
                                        <img
                                            src={s.poster_path}
                                            alt={s.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 border border-white/5">
                                            <ListVideo className="w-10 h-10 text-gray-700 mb-2" />
                                        </div>
                                    )}

                                    {/* Hover Overlay Play Icon */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                            <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Title & Info */}
                                <div className="space-y-1 px-1">
                                    <h3
                                        className="text-gray-200 font-semibold text-sm md:text-base leading-tight line-clamp-2 group-hover:text-purple-400 transition-colors min-h-[2.5rem]"
                                        title={s.title}
                                    >
                                        {s.title}
                                    </h3>
                                    <p className="text-gray-500 text-xs truncate opacity-70">
                                        Series • {new Date(s.created_at).getFullYear() || "Unknown"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
