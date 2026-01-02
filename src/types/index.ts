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

export interface ChunkUploadProgress {
    filename: string;
    chunkIndex: number;
    totalChunks: number;
    progress: number;
}
