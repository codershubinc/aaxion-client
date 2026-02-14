export interface FileItem {
    name: string;
    is_dir: boolean;
    size: number;
    path: string;
    raw_path: string;
}

export interface SystemInfo {
    root_path: string;
}

export interface ExternalDevice {
    available: number;
    device: string;
    filesystem_type: string;
    mount_point: string;
    total: number;
    usage_percentage: number;
    used: number;
}

export interface StorageInfo {
    total: number;
    used: number;
    available: number;
    usage_percentage: number;
    external_devices: ExternalDevice[];
}

export interface ChunkUploadProgress {
    filename: string;
    chunkIndex: number;
    totalChunks: number;
    progress: number;
}

export interface Series {
    id: number;
    title: string;
    description: string;
    poster_path: string;
    created_at: string;
}

export interface Episode {
    id: number;
    series_id: number;
    season_number: number;
    episode_number: number;
    title: string;
    description: string;
    file_path: string;
    size: number;
    mime_type: string;
    created_at: string;
}
