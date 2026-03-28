"use client";
import React, { useState, useEffect } from "react";
import { MusicProvider, useMusic } from "@/context/MusicContext";
import { Play, Monitor, Plus, Search, Music, Wifi, WifiOff } from "lucide-react";
import { STORAGE_KEYS } from "@/constants";
import { getToken } from "@/lib/api";

function MusicLibrary() {
    const { tracks, devices, addTrack, playTrack, currentTrack, isPlaying, isConnected } = useMusic();
    const [searchQuery, setSearchQuery] = useState("");
    const [url, setUrl] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [serverUrl, setServerUrl] = useState<string | null>(null);

    useEffect(() => {
        setServerUrl(localStorage.getItem(STORAGE_KEYS.SERVER_URL));
    }, []);

    // Lightning-fast client-side filtering
    const filteredTracks = tracks.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (url) {
            setIsAdding(true);
            try {
                await addTrack(url);
                setUrl(""); // Clear input on success
            } catch (err) {
                console.error("Failed to add track", err);
            } finally {
                setIsAdding(false);
            }
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        Aaxion Vault
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
                            Live Sync
                        </span>
                    </h1>
                    <p className="text-gray-400 mt-2">Your synchronized local audio library.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900/40 border border-gray-800">
                    {isConnected ? (
                        <>
                            <Wifi className="w-4 h-4 text-green-400" />
                            <span className="text-xs font-medium text-green-400">Connected</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-4 h-4 text-red-400" />
                            <span className="text-xs font-medium text-red-400">Disconnected</span>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">

                {/* LEFT COLUMN: LIBRARY */}
                <div className="lg:col-span-2 flex flex-col h-full bg-gray-900/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Library</h2>

                        {/* Search Bar */}
                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder="Search tracks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#2D2D2D] text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                            />
                            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    <ul className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {filteredTracks.length > 0 ? filteredTracks.map((track, i) => {
                            const isThisPlaying = currentTrack?.id === track.id || currentTrack?.title === track.title;

                            return (
                                <li
                                    key={track.id || i}
                                    onClick={() => playTrack(track)}
                                    className={`p-3 rounded-xl transition-all cursor-pointer group flex items-center gap-4 border ${isThisPlaying
                                        ? 'bg-blue-500/10 border-blue-500/30'
                                        : 'bg-gray-800/50 border-transparent hover:bg-gray-800 hover:border-gray-700'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center shrink-0 overflow-auto  relative">
                                        {track.imagePath && serverUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={`${serverUrl}/files/view-image?path=${encodeURIComponent(track.imagePath)}&tkn=${getToken()}`} alt="cover" className="w-full h-full object-cover" />
                                        ) : (
                                            <Play className={`w-4 h-4 ${isThisPlaying ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'}`} />
                                        )}

                                        {/* Hover Play Overlay for tracks with images */}
                                        {track.imagePath && (
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Play className="w-4 h-4 text-white fill-white" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className={`font-medium truncate ${isThisPlaying ? 'text-blue-400' : 'text-white'}`}>
                                            {track.title}
                                        </div>
                                        <div className="text-xs text-gray-400 truncate">{track.artist}</div>
                                    </div>

                                    {isThisPlaying && isPlaying && (
                                        <div className="flex items-center gap-1 px-2 h-4">
                                            <div className="w-1 h-full bg-blue-500 animate-[bounce_1s_infinite] rounded-full" />
                                            <div className="w-1 h-3/4 bg-blue-500 animate-[bounce_1.2s_infinite] rounded-full" />
                                            <div className="w-1 h-full bg-blue-500 animate-[bounce_0.8s_infinite] rounded-full" />
                                        </div>
                                    )}
                                </li>
                            );
                        }) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
                                <Music className="w-12 h-12 opacity-20" />
                                <p>No tracks found.</p>
                            </div>
                        )}
                    </ul>
                </div>

                {/* RIGHT COLUMN: TOOLS */}
                <div className="flex flex-col gap-8">

                    {/* Download Box */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
                        <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-400" /> Add to Vault
                        </h2>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Paste YouTube Link or Playlist..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#2D2D2D] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-green-500/50 transition-colors text-sm placeholder:text-gray-600"
                            />
                            <button
                                type="submit"
                                disabled={isAdding || !url.trim()}
                                className="w-full bg-green-600/10 border border-green-500/20 hover:bg-green-600/20 text-green-400 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAdding ? "Queuing Download..." : "Download Track"}
                            </button>
                        </form>
                    </div>

                    {/* Network Devices Box */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm flex-1">
                        <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-purple-400" /> Active Network
                        </h2>
                        <ul className="space-y-3">
                            {devices.length > 0 ? devices.map((device, i) => (
                                <li key={i} className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-[#2D2D2D] rounded-xl">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-200 truncate">{device.deviceName}</p>
                                        <p className="text-[10px] text-gray-500 font-mono truncate">{device.deviceId}</p>
                                    </div>
                                </li>
                            )) : (
                                <div className="text-center p-4 text-gray-500 italic text-sm">
                                    No other devices connected.
                                </div>
                            )}
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function MusicPage() {
    return (
        <MusicLibrary />
    );
}