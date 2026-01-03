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
