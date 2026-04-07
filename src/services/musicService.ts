// src/services/musicService.ts
import apiClient from './apiClient';

export interface Track {
    id?: string;
    title: string;
    artist: string;
    album?: string;
    duration?: number;
    release_year?: number;
    file_path: string;
    imagePath?: string;
    size?: number;
    ytUri?: string;
}

export const musicService = {
    // Uses the API handler we wrote in Go (AddTrackApi)
    addTrack: async (uri: string) => {
        const formData = new FormData();
        formData.append('uri', uri);
        const res = await apiClient.post('/music/add?uri=' + encodeURIComponent(uri), formData);
        return res.data;
    },
    searchTracks: async (q: string) => {
        const res = await apiClient.get(`/music/search?q=${encodeURIComponent(q)}`);
        return res.data;
    },
    // Uses the API handler we wrote in Go (GetTracksHandler)
    getAllTracks: async () => {
        const res = await apiClient.get('/music/all');
        return res.data || [];
    },
    updateTrack: async (track: Track) => {
        const res = await apiClient.put('/music/update', track);
        return res.data;
    },
    // Fetches active connected suckers
    getDevices: async () => {
        const res = await apiClient.get('/api/devices');
        return res.data || [];
    }
};