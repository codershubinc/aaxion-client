import { Download, Video, Music, Image, FileText, Github, Folder } from 'lucide-react';

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getImportantFolders = (rootPath: string) => {
    return [
        { icon: Download, label: 'Downloads', name: 'Downloads', path: `${rootPath}/Downloads`, color: 'text-accent-green', bgColor: 'bg-accent-green/10', hoverColor: 'hover:border-accent-green' },
        { icon: Video, label: 'Videos', name: 'Videos', path: `${rootPath}/Videos`, color: 'text-red-500', bgColor: 'bg-red-500/10', hoverColor: 'hover:border-red-500' },
        { icon: Music, label: 'Music', name: 'Music', path: `${rootPath}/Music`, color: 'text-pink-500', bgColor: 'bg-pink-500/10', hoverColor: 'hover:border-pink-500' },
        { icon: Image, label: 'Pictures', name: 'Pictures', path: `${rootPath}/Pictures`, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', hoverColor: 'hover:border-yellow-500' },
        { icon: FileText, label: 'Documents', name: 'Documents', path: `${rootPath}/Documents`, color: 'text-blue-400', bgColor: 'bg-blue-400/10', hoverColor: 'hover:border-blue-400' },
        { icon: Github, label: 'Github', name: 'Github', path: `${rootPath}/Github`, color: 'text-purple-400', bgColor: 'bg-purple-400/10', hoverColor: 'hover:border-purple-400' },
        { icon: Folder, label: 'aaxion', name: 'aaxion', path: `${rootPath}/aaxion`, color: 'text-accent-blue', bgColor: 'bg-accent-blue/10', hoverColor: 'hover:border-accent-blue' },
        { icon: Folder, label: 'Movies', name: 'Movies', path: `${rootPath}/Movies`, color: 'text-accent-blue', bgColor: 'bg-accent-blue/10', hoverColor: 'hover:border-accent-blue' },
        { icon: Folder, label: 'Series', name: 'Series', path: `${rootPath}/Series`, color: 'text-accent-blue', bgColor: 'bg-accent-blue/10', hoverColor: 'hover:border-accent-blue' },
    ];
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

export const isLocalNetwork = (): boolean => {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname;
    return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::1]' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.endsWith('.local')
    );
};

export const isImageFile = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp'].includes(ext || '');
};


