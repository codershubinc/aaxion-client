import { useState, useEffect, useCallback } from 'react';
import { fetch } from '@tauri-apps/plugin-http';

const VLC_BASE = "http://127.0.0.1:9090/requests";
const VLC_PWD = "aaxion_secret";

export function useVlc() {
    const [isConnected, setIsConnected] = useState(false);
    const [state, setState] = useState({
        playing: false,
        time: 0,
        length: 0,
        volume: 0,      // 0 - 512 (where 256 is 100%)
        rate: 1,        // Playback speed
        fullscreen: false,
        audiodelay: 0,
        subdelay: 0
    });
    const [meta, setMeta] = useState<any>(null);

    // Generic Sender
    const send = useCallback(async (cmd: string, val = "") => {
        try {
            const auth = btoa(`:${VLC_PWD}`);
            // Force &val= even if empty, some versions require it
            const url = `${VLC_BASE}/status.json?command=${cmd}&val=${val}`;
            await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Basic ${auth}` }
            });
        } catch (e) { console.error(e); }
    }, []);

    // Polling Loop
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const auth = btoa(`:${VLC_PWD}`);
                const res = await fetch(`${VLC_BASE}/status.json`, {
                    headers: { 'Authorization': `Basic ${auth}` }
                });

                if (res.ok) {
                    const status = await res.json();
                    console.log("VLC info ::", status);

                    setIsConnected(true);
                    setMeta(status.information);
                    setState({
                        playing: status.state === "playing",
                        time: status.time,
                        length: status.length,
                        volume: status.volume,
                        rate: status.rate,
                        fullscreen: status.fullscreen,
                        audiodelay: status.audiodelay,
                        subdelay: status.subdelay
                    });
                }
            } catch (e) { setIsConnected(false); }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return {
        isConnected,
        meta,
        ...state,
        togglePlay: () => send("pl_pause"),
        stop: () => send("pl_stop"),
        seek: (val: string) => send("seek", val),
        setVolume: (val: number) => send("volume", val.toString()),
        setRate: (val: number) => send("rate", val.toString()),
        toggleFullscreen: () => send("fullscreen"),
        cycleAudio: () => send("key", "audio-track"), // Cycle tracks
        cycleSubs: () => send("key", "subtitle-track"), // Cycle subs
    };
}