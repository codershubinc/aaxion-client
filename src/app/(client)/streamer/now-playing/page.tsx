"use client";

import React, { useState, useEffect } from 'react';
import { useVlc } from '@/hooks/useVlc';
import { useIp } from '@/hooks/useIp';
import { MonitorPlay, Play, Pause, Square, Volume2, ListVideo, Monitor, Copy, Check, Info } from 'lucide-react';
import apiClient from '@/services/apiClient';

function formatTime(seconds: number) {
    if (!seconds) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function NowPlayingPage() {
    const {
        isConnected,
        meta,
        playing,
        time,
        length,
        volume,
        togglePlay,
        stop,
        seek,
        setVolume,
        toggleFullscreen
    } = useVlc();

    const { currentServerUrl } = useIp();

    const [copied, setCopied] = useState(false);
    const [serverMeta, setServerMeta] = useState<any>(null);

    // Attempt to extract title from meta
    const categoryMeta = meta?.category?.meta || {};
    const title = categoryMeta.title || categoryMeta.filename || 'Unknown Media';
    const artist = categoryMeta.artist || categoryMeta.album || '';
    const nowPlaying = categoryMeta.now_playing || '';
    const streamUrl = categoryMeta.url || categoryMeta.filename || '';
    const artworkUrl = categoryMeta.artwork_url;

    // Auto-fetch data from server using stream URL / filename ID
    useEffect(() => {
        const fetchServerInfo = async () => {
            if (!streamUrl) return;

            try {
                const id = new URL(streamUrl, 'http://dummy.com').searchParams.get("id");

                if (!id) return;

                if (streamUrl.includes('movie')) {
                    // It's a Movie
                    const res = await apiClient.get('/api/movies/list');
                    const movies = res.data;
                    const found = movies.find((m: any) => m.id.toString() === id);
                    if (found) setServerMeta(found);
                } else if (streamUrl.includes('episode')) {

                    const res = await apiClient.get('/api/series');
                    const seriesList = res.data;
                    let foundEpisode = null;
                    let parentSeries = null;

                    // Deep search through all series -> seasons -> episodes
                    for (const series of seriesList) {
                        for (const season of (series.seasons || [])) {
                            const ep = season.episodes?.find((e: any) => e.id.toString() === id);
                            if (ep) {
                                foundEpisode = ep;
                                parentSeries = series;
                                break;
                            }
                        }
                        if (foundEpisode) break;
                    }

                    if (foundEpisode) {
                        setServerMeta({
                            ...foundEpisode,
                            series_title: parentSeries?.title,
                            poster_path: parentSeries?.poster_path || foundEpisode.poster_path
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to map playing media back to server info", error);
            }
        };

        fetchServerInfo();
    }, [streamUrl]);

    const progress = length > 0 ? (time / length) * 100 : 0;

    const handleCopyUrl = () => {
        if (!streamUrl) return;

        let finalUrl = streamUrl;
        if (streamUrl.startsWith('/')) {
            const baseUrl = currentServerUrl || 'http://localhost:8000';
            finalUrl = `${baseUrl.replace(/\/$/, '')}${streamUrl}`;
        } else if (!streamUrl.startsWith('http')) {
            const baseUrl = currentServerUrl || 'http://localhost:8000';
            finalUrl = `${baseUrl.replace(/\/$/, '')}/${streamUrl}`;
        }

        navigator.clipboard.writeText(finalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isConnected) {
        return (
            <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                    <MonitorPlay className="w-10 h-10 text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">VLC Not Connected</h2>
                <p className="text-gray-400 max-w-md">
                    Could not connect to the VLC remote interface. Make sure VLC is running with the web interface enabled on port 9090 with the correct password.
                </p>
            </div>
        );
    }

    // Determine display overrides if server info exists
    const displayTitle = serverMeta?.title || serverMeta?.episode_title || title;
    const displayDesc = serverMeta?.description || serverMeta?.episode_description;
    const displayArt = serverMeta?.poster_path || artworkUrl;

    return (
        <div className="max-w-4xl mx-auto p-6 mt-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <MonitorPlay className="text-blue-500" />
                    Now Playing on VLC
                </h1>

                {streamUrl && (
                    <button
                        onClick={handleCopyUrl}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-xl transition-colors text-sm font-medium text-gray-300"
                        title="Copy Stream URL"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                        {copied ? 'Copied URL!' : 'Copy Stream URL'}
                    </button>
                )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">

                    {/* Art placeholder */}
                    <div className="w-48 h-48 bg-gray-800 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0 relative overflow-hidden">
                        {displayArt ? (
                            <img src={displayArt} alt="Cover" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <ListVideo className="w-16 h-16 text-gray-600" />
                        )}
                    </div>

                    <div className="flex-1 w-full flex flex-col justify-center">
                        <div className="mb-6">
                            {serverMeta?.series_title && (
                                <p className="text-blue-400 font-medium mb-1">{serverMeta.series_title} • Season {serverMeta.season_number} Episode {serverMeta.episode_number}</p>
                            )}
                            <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">{displayTitle}</h2>
                            {displayDesc ? (
                                <p className="text-gray-400 text-sm line-clamp-2">{displayDesc}</p>
                            ) : (artist || nowPlaying) && (
                                <p className="text-blue-400 text-lg">{nowPlaying || artist}</p>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm text-gray-400 mb-2 font-mono">
                                <span>{formatTime(time)}</span>
                                <span>{formatTime(length)}</span>
                            </div>
                            <div
                                className="w-full bg-gray-800 h-3 rounded-full overflow-hidden cursor-pointer"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const clickX = e.clientX - rect.left;
                                    const percent = clickX / rect.width;
                                    const seekTime = Math.floor(length * percent);
                                    seek(seekTime.toString());
                                }}
                            >
                                <div
                                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={stop}
                                    className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                                    title="Stop"
                                >
                                    <Square className="w-6 h-6" />
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="w-14 h-14 bg-white text-black hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-white/10"
                                >
                                    {playing ? (
                                        <Pause className="w-7 h-7 fill-black" />
                                    ) : (
                                        <Play className="w-7 h-7 fill-black ml-1" />
                                    )}
                                </button>

                                <button
                                    onClick={toggleFullscreen}
                                    className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                                    title="Toggle Fullscreen"
                                >
                                    <Monitor className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 w-48 bg-gray-950 p-2 rounded-xl border border-gray-800">
                                <Volume2 className="w-5 h-5 text-gray-400 ml-2" />
                                <input
                                    type="range"
                                    min="0"
                                    max="512"
                                    value={volume}
                                    onChange={(e) => setVolume(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <span className="text-xs text-gray-500 font-mono w-8 mr-2">{Math.round((volume / 256) * 100)}%</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Extended Meta Info */}
                {Object.keys(categoryMeta).length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-800">
                        <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">File Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                            {Object.entries(categoryMeta).map(([key, value]) => {
                                if (key === 'artwork_url' || !value) return null;
                                return (
                                    <div key={key} className="bg-gray-950 p-3 rounded-lg border border-gray-800/50">
                                        <span className="block text-gray-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</span>
                                        <span className="text-gray-300 break-all line-clamp-2">{String(value)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Streams Info */}
                {meta?.category && Object.keys(meta.category).filter(k => k.startsWith('Stream')).length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-800">
                        <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Media Streams</h3>
                        <div className="flex flex-col gap-4">
                            {Object.entries(meta.category)
                                .filter(([key]) => key.startsWith('Stream'))
                                .map(([streamName, streamData]: [string, any]) => (
                                    <div key={streamName} className="bg-gray-950 p-4 rounded-xl border border-gray-800/50">
                                        <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
                                            <span className="font-semibold text-gray-300">{streamName}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-gray-800 text-xs text-gray-400 font-medium">
                                                {streamData.Type || 'Unknown'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            {Object.entries(streamData).map(([k, v]) => {
                                                if (k === 'Type' || !v) return null;
                                                return (
                                                    <div key={k}>
                                                        <span className="block text-gray-500 text-xs mb-0.5">{k.replace(/_/g, ' ')}</span>
                                                        <span className="text-gray-300">{String(v)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}