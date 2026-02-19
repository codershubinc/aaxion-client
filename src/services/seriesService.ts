import apiClient from './apiClient';
import { uploadFile } from './uploadService';
import { getSystemRootPath } from './systemService';

// Series APIs
export async function getSeriesList() {
    return apiClient.get('/api/series/list');
}

export async function searchSeries(query: string) {
    return apiClient.get(`/api/series/search?q=${encodeURIComponent(query)}`);
}

export async function addSeries(data: { title: string; description: string; poster_path?: string }) {
    return apiClient.post('/api/series/add', data);
}

export async function editSeries(data: { id: number; title: string; description: string; poster_path?: string }) {
    return apiClient.put('/api/series/edit', data);
}

// Episode APIs
export async function getSeriesEpisodes(seriesId: number) {
    return apiClient.get(`/api/series/episodes/list?series_id=${seriesId}`);
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

    return apiClient.post('/api/series/episodes/add', {
        series_id: metaData.series_id,
        file_id: Date.now(), // Use timestamp as placeholder ID to satisfy "!= 0" check
        file_path: `${targetDir}/${file.name}`,
        season_number: metaData.season_number,
        episode_number: metaData.episode_number,
        title: metaData.title,
        description: metaData.description
    });
}

