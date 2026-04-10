// src/context/MusicContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { musicService, Track } from '../services/musicService';
import { STORAGE_KEYS } from '@/constants';
import toast from 'react-hot-toast';

interface Device {
    deviceId: string;
    deviceName: string;
}

interface MusicContextProps {
    tracks: Track[];
    devices: Device[];
    deviceId: string;
    currentTrack: Track | null;
    isPlaying: boolean;
    isConnected: boolean;
    playTrack: (track: Track) => void;
    togglePlay: () => void;
    playNext: () => void;
    playPrev: () => void;
    addTrack: (uri: string) => Promise<void>;
    sendCommand: (targetId: string, action: string, payload?: any) => void;
    reconnectWebSocket: () => void;
}

const MusicContext = createContext<MusicContextProps | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [deviceId, setDeviceId] = useState<string>('');
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [serverUrl, setServerUrl] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);

    // Initial Load
    useEffect(() => {
        setServerUrl(localStorage.getItem(STORAGE_KEYS.SERVER_URL));
        musicService.getAllTracks().then(setTracks).catch(console.error);
        musicService.getDevices().then(setDevices).catch(console.error);

        // Generate a persistent ID for this specific browser/device
        let id = localStorage.getItem("aaxion_device_id");
        if (!id) {
            id = "dev-" + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("aaxion_device_id", id);
        }
        setDeviceId(id);
    }, []);

    // WebSocket Connection
    useEffect(() => {
        console.log("[WebSocket] Checking requirements...", { serverUrl, deviceId });
        if (!serverUrl || !deviceId) {
            console.log("[WebSocket] Missing requirements, skipping connection.");
            return;
        }


        // Convert http:// to ws://
        const wsUrl = serverUrl.replace(/^http/, 'ws') +
            `/ws?deviceId=${deviceId}&deviceName=${encodeURIComponent("Aaxion Web")}`;

        console.log(`[WebSocket] Connecting to: ${wsUrl}`);
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("[WebSocket] Connection established successfully!");
            setIsConnected(true);
        };

        socket.onclose = (event) => {
            console.log(`[WebSocket] Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
            setIsConnected(false);
        };

        socket.onerror = (error) => {
            console.error("[WebSocket] Connection error!", error);
            setIsConnected(false);
        };

        socket.onmessage = (event) => {
            console.log("[WebSocket] Message received:", event.data);
            try {
                const msg = JSON.parse(event.data);

                switch (msg.type) {
                    case "TRACK_ADDED":
                        // Convert camelCase from backend to snake_case for UI
                        const incomingTrack = msg.state.track;
                        const formattedTrack = {
                            ...incomingTrack,
                            file_path: incomingTrack.filePath,
                            image_path: incomingTrack.imagePath,
                            release_year: incomingTrack.releaseYear
                        };

                        // Instantly inject the new track at the top
                        setTracks(prev => [formattedTrack, ...prev]);
                        toast.success("Track successfully added to library!");
                        break;
                    case "DEVICE_JOINED":
                    case "DEVICE_LEFT":
                        // Refresh devices list
                        musicService.getDevices().then(setDevices).catch(console.error);
                        break;
                    case "COMMAND":
                        // Handle remote commands (e.g., phone told desktop to play)
                        if (msg.targetId === deviceId) {
                            if (msg.payload.action === "PLAY_TRACK") {
                                setCurrentTrack(msg.payload.track);
                                setIsPlaying(true);
                            } else if (msg.payload.action === "PAUSE") {
                                setIsPlaying(false);
                            }
                        }
                        break;
                    case "TRACK_ERROR":
                        console.error("Error adding track:", msg.payload?.message || "Unknown error");
                        toast.error("Error adding track: " + (msg.payload?.message || "Unknown error"));
                        break;

                }
            } catch (err) {
                console.error("[WebSocket] Message parsing error:", err);
            }
        };

        wsRef.current = socket;
        return () => socket.close();
    }, [serverUrl, deviceId]);

    const addTrack = async (uri: string) => {
        await musicService.addTrack(uri);
    };

    const playTrack = (track: Track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const togglePlay = () => {
        if (currentTrack) {
            setIsPlaying((prev) => !prev);
        }
    };

    const playNext = () => {
        if (!currentTrack || tracks.length === 0) return;
        const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
        const nextIndex = (currentIndex + 1) % tracks.length;
        playTrack(tracks[nextIndex]);
    };

    const playPrev = () => {
        if (!currentTrack || tracks.length === 0) return;
        const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
        const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
        playTrack(tracks[prevIndex]);
    };

    const sendCommand = useCallback((targetId: string, action: string, payload: any = {}) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "COMMAND",
                senderId: deviceId,
                targetId: targetId,
                payload: { action, ...payload }
            }));
        }
    }, [deviceId]);

    // websocket
    const reconnectWebSocket = useCallback(() => {
        console.log("[WebSocket] Attempting to reconnect...");
        if (wsRef.current) return;
        const url = serverUrl?.replace(/^http/, 'ws://') + `/ws?deviceId=${deviceId}&deviceName=${encodeURIComponent("Aaxion Web")}`;
        if (!url) {
            console.warn("[WebSocket] Cannot reconnect, missing URL or device ID.");
            return;
        }
    }, [deviceId, serverUrl]);
    return (
        <MusicContext.Provider value={{
            tracks, devices, deviceId, currentTrack, isPlaying, isConnected,
            playTrack, togglePlay, playNext, playPrev, addTrack, sendCommand, reconnectWebSocket
        }}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (!context) throw new Error('useMusic must be used within MusicProvider');
    return context;
};


