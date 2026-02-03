"use client";
import { useEffect, useState } from 'react';
import { authenticatedFetch } from '@/lib/api';
import { Search, Film } from 'lucide-react';

interface Movie {
    id: number;
    title: string;
    description: string;
    poster_path: string;
    file_path: string;
    created_at: string;
}

interface MovieSidebarProps {
    onSelect: (movie: Movie) => void;
    selectedId: number | null;
    refreshTrigger: number;
}

export default function MovieSidebar({ onSelect, selectedId, refreshTrigger }: MovieSidebarProps) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const fetchMovies = async () => {
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
            }
        };

        const debounce = setTimeout(fetchMovies, 300);
        return () => clearTimeout(debounce);
    }, [query, refreshTrigger]);

    return (
        <aside className="w-1/3 min-w-[300px] flex flex-col bg-gray-900 rounded-2xl border border-gray-800 backdrop-blur-sm overflow-hidden h-[calc(100vh-8rem)]">
            <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        placeholder="Search movies..."
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {movies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                        <Film className="w-8 h-8 mb-2 opacity-30" />
                        <p className="text-sm">No movies found</p>
                    </div>
                ) : (
                    movies.map(m => (
                        <div
                            key={m.id}
                            onClick={() => onSelect(m)}
                            className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer border transition-all group ${selectedId === m.id
                                ? 'border-blue-500 bg-gray-800 ring-1 ring-blue-500/50'
                                : 'border-gray-800 bg-gray-800/30 hover:bg-gray-800 hover:border-blue-500/30'
                                }`}
                        >
                            <div className="w-16 h-24 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {m.poster_path ? (
                                    <img src={m.poster_path} alt={m.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Film className="w-6 h-6 text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold truncate transition-colors ${selectedId === m.id ? 'text-blue-400' : 'text-gray-200 group-hover:text-blue-400'}`}>
                                    {m.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.description || 'No description.'}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}