"use client";
import { useState, useEffect, useRef } from 'react';

const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY || 'get_your_dont_look_here';

interface BaseItem {
    id: number;
    title: string;
    description: string;
    poster_path?: string;
}

export function useOmdbCache<T extends BaseItem>(
    items: T[],
    updateItem: (item: T, posterPath: string) => Promise<void>,
    type: 'movie' | 'series',
    loading: boolean
) {
    const [omdbCache, setOmdbCache] = useState<Record<string, any>>({});
    const processedIds = useRef(new Set<number>());

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
        if (loading || items.length === 0) return;

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

        const listToProcess = items.filter(item =>
            !processedIds.current.has(item.id)
        );

        if (listToProcess.length === 0) return;

        listToProcess.forEach(async (item) => {
            processedIds.current.add(item.id);
            const cacheKey = item.title.toLowerCase().trim();

            let data;
            const cache = getOmdbCache();

            if (cache[cacheKey]) {
                data = cache[cacheKey];
            } else {
                try {
                    const typeParam = type === 'series' ? '&type=series' : '';
                    const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(item.title)}${typeParam}`);
                    data = await res.json();

                    if (data && data.Response === 'True') {
                        saveOmdbCache(cacheKey, data);
                    }
                } catch (e) {
                    console.error(`Failed to auto-fetch poster for ${item.title}`, e);
                    return;
                }
            }

            if (data && data.Response === 'True' && data.Poster && data.Poster !== 'N/A' && !item.poster_path) {
                // Call the callback to update backend and local state
                await updateItem(item, data.Poster);
            }
        });
    }, [items, loading, type, updateItem]);

    return omdbCache;
}
