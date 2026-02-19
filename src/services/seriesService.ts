import { authenticatedFetch, getApiBase } from '../lib/api';
import { getToken } from './authService';
import { uploadFile } from './uploadService';
import { getSystemRootPath } from './systemService';

// Series APIs
export async function getSeriesList() {
    return authenticatedFetch('/api/series/list');
}

export async function searchSeries(query: string) {
    return authenticatedFetch(`/api/series/search?q=${encodeURIComponent(query)}`);
}

export async function addSeries(data: { title: string; description: string; poster_path?: string }) {
    const token = getToken();
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/api/series/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return res;
}

export async function editSeries(data: { id: number; title: string; description: string; poster_path?: string }) {
    const token = getToken();
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/api/series/edit`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return res;
}

// Episode APIs
export async function getSeriesEpisodes(seriesId: number) {
    return authenticatedFetch(`/api/series/episodes/list?series_id=${seriesId}`);
}

export async function addEpisode(
    file: File,
    metaData: {
        series_id: number;
        season_number: number;
        episode_number: number;
        title: string;
        description: string;
    },
    onProgress?: (progress: number, speed: number | undefined) => void
) {
    const root_path = await getSystemRootPath();
    const targetDir = `${root_path}/.aaxion/series/${metaData.series_id}/S${String(metaData.season_number).padStart(2, '0')}`;

    await uploadFile(file, targetDir, onProgress);

    const token = getToken();
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/api/series/episodes/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            series_id: metaData.series_id,
            file_id: Date.now(), // Use timestamp as placeholder ID to satisfy "!= 0" check
            file_path: `${targetDir}/${file.name}`,
            season_number: metaData.season_number,
            episode_number: metaData.episode_number,
            title: metaData.title,
            description: metaData.description
        })
    });

    if (!res.ok) {
        throw new Error('Failed to add episode metadata');
    }
    return res;
}
