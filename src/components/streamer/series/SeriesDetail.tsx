"use client";
import React, { useEffect, useState } from 'react';
import { Series, Episode } from '@/types';
import { getSeriesEpisodes } from '@/services/seriesService';
import { launchVlc } from '@/lib/player';
import { ArrowLeft, Plus, PlayCircle, MonitorPlay, Calendar } from 'lucide-react';
import AddEpisodeForm from './AddEpisodeForm';

interface SeriesDetailProps {
    series: Series;
    onBack: () => void;
}

export default function SeriesDetail({ series, onBack }: SeriesDetailProps) {
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchEpisodes = async () => {
            setLoading(true);
            try {
                const res = await getSeriesEpisodes(series.id);
                setEpisodes(res.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchEpisodes();
    }, [series.id, refreshKey]);

    const episodesBySeason = episodes.reduce((acc, ep) => {
        const season = ep.season_number;
        if (!acc[season]) acc[season] = [];
        acc[season].push(ep);
        return acc;
    }, {} as Record<number, Episode[]>);

    const sortedSeasons = Object.keys(episodesBySeason).map(Number).sort((a, b) => a - b);

    const handlePlay = async (ep: Episode) => {
        try {
            console.log("VLC episode det", ep, series.poster_path);
            await launchVlc(ep.id, `${series.title} - S${ep.season_number}E${ep.episode_number} - ${ep.title}`, 'episode', series.poster_path);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10 bg-gray-900/50 backdrop-blur-md sticky top-0 z-20">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white">{series.title}</h1>
                    <p className="text-gray-400 text-sm line-clamp-1">{series.description}</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showAddForm
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                        }`}
                >
                    {showAddForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Episode</>}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                {showAddForm && (
                    <AddEpisodeForm
                        seriesId={series.id}
                        onSuccess={() => { setShowAddForm(false); setRefreshKey(k => k + 1); }}
                        onCancel={() => setShowAddForm(false)}
                    />
                )}

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading episodes...</div>
                ) : episodes.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-white/5 mx-auto max-w-2xl">
                        <MonitorPlay className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                        <h3 className="text-xl font-medium text-gray-400">No Episodes Yet</h3>
                        <p className="text-gray-500 mt-2">Add the first episode to start watching.</p>
                    </div>
                ) : (
                    <div className="space-y-8 max-w-5xl mx-auto">
                        {sortedSeasons.map((season) => (
                            <div key={season} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-purple-400" />
                                    Season {season}
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {episodesBySeason[season]
                                        .sort((a, b) => a.episode_number - b.episode_number)
                                        .map((ep) => (
                                            <div
                                                key={ep.id}
                                                onClick={() => handlePlay(ep)}
                                                className="group flex items-center gap-4 bg-gray-900/40 hover:bg-gray-800 border border-white/5 hover:border-purple-500/30 rounded-xl p-4 cursor-pointer transition-all duration-200"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors shrink-0">
                                                    <PlayCircle className="w-6 h-6 text-gray-400 group-hover:text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-purple-400 font-mono text-sm font-bold">E{ep.episode_number}</span>
                                                        <h4 className="font-medium text-gray-200 group-hover:text-white truncate">{ep.title}</h4>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1 group-hover:text-gray-400">{ep.description}</p>
                                                </div>
                                                <div className="text-xs text-gray-600 font-mono shrink-0">
                                                    S{season} E{ep.episode_number}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
