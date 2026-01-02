export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getFileIcon = (filename: string, isDir: boolean): string => {
    if (isDir) return '📁';

    const ext = filename.split('.').pop()?.toLowerCase();

    const iconMap: Record<string, string> = {
        // Documents
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'txt': '📝',
        'md': '📝',

        // Images
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'png': '🖼️',
        'gif': '🖼️',
        'svg': '🖼️',

        // Videos
        'mp4': '🎥',
        'avi': '🎥',
        'mov': '🎥',
        'mkv': '🎥',

        // Audio
        'mp3': '🎵',
        'wav': '🎵',
        'flac': '🎵',

        // Archives
        'zip': '📦',
        'rar': '📦',
        'tar': '📦',
        'gz': '📦',

        // Code
        'js': '⚡',
        'ts': '⚡',
        'jsx': '⚛️',
        'tsx': '⚛️',
        'py': '🐍',
        'go': '🔷',
        'java': '☕',
        'cpp': '⚙️',
        'c': '⚙️',
        'rs': '🦀',
        'html': '🌐',
        'css': '🎨',
    };

    return iconMap[ext || ''] || '📄';
};

export const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
