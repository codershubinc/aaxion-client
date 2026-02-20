import { SERVER, StoredServerInfo, DiscoveredServer } from './server';
import { VLC } from './vlc';
import { NETWORK } from './network';
import { STORAGE_KEYS } from './storage';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build server URL from components
 */
export const buildServerUrl = (
    ip: string,
    port: number = SERVER.PORT,
    protocol: string = SERVER.PROTOCOL.HTTP
): string => {
    return `${protocol}://${ip}:${port}`;
};

/**
 * Build default server URL
 */
export const getDefaultServerUrl = (): string => {
    return buildServerUrl(SERVER.DEFAULT_IP, SERVER.PORT);
};

/**
 * Build VLC request URL with endpoint
 */
export const buildVlcUrl = (endpoint: string): string => {
    return `${VLC.REQUESTS_URL}${endpoint}`;
};

/**
 * Get network priority based on IP address
 */
export const getNetworkPriority = (ip: string): number => {
    if (ip.startsWith(NETWORK.IP_RANGES.TEN_LOCAL)) {
        return NETWORK.PRIORITY.TEN_LOCAL;
    }
    if (ip.startsWith(NETWORK.IP_RANGES.PRIMARY_LOCAL)) {
        return NETWORK.PRIORITY.WIFI_PRIMARY;
    }
    if (ip.startsWith(NETWORK.IP_RANGES.SECONDARY_LOCAL)) {
        return NETWORK.PRIORITY.WIFI_SECONDARY;
    }
    if (ip === NETWORK.IP_RANGES.LOCALHOST) {
        return NETWORK.PRIORITY.LOCALHOST;
    }
    return 0;
};

/**
 * Check if IP is in local network
 */
export const isLocalNetwork = (ip: string): boolean => {
    return (
        ip.startsWith(NETWORK.IP_RANGES.TEN_LOCAL) ||
        ip.startsWith(NETWORK.IP_RANGES.PRIMARY_LOCAL) ||
        ip.startsWith(NETWORK.IP_RANGES.SECONDARY_LOCAL) ||
        ip === NETWORK.IP_RANGES.LOCALHOST
    );
};

/**
 * localStorage helper functions
 */
export const Storage = {
    /**
     * Get item from localStorage
     */
    get: (key: keyof typeof STORAGE_KEYS): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(STORAGE_KEYS[key]);
    },

    /**
     * Set item in localStorage
     */
    set: (key: keyof typeof STORAGE_KEYS, value: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS[key], value);
    },

    /**
     * Remove item from localStorage
     */
    remove: (key: keyof typeof STORAGE_KEYS): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(STORAGE_KEYS[key]);
    },

    /**
     * Clear all items
     */
    clear: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.clear();
    },

    /**
     * Store server info with authentication
     */
    setServerInfo: (serverInfo: StoredServerInfo): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.SERVER_INFO, JSON.stringify(serverInfo));
    },

    /**
     * Get stored server info
     */
    getServerInfo: (): StoredServerInfo | null => {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(STORAGE_KEYS.SERVER_INFO);
        return stored ? JSON.parse(stored) : null;
    },

    /**
     * Add server to recent servers list
     */
    addRecentServer: (serverInfo: StoredServerInfo): void => {
        if (typeof window === 'undefined') return;
        const recent = Storage.getRecentServers();
        // Remove if already exists
        const filtered = recent.filter(s => s.deviceId !== serverInfo.deviceId);
        // Add to front
        const updated = [serverInfo, ...filtered].slice(0, 5); // Keep only 5 recent
        localStorage.setItem(STORAGE_KEYS.RECENT_SERVERS, JSON.stringify(updated));
    },

    /**
     * Get recent servers list
     */
    getRecentServers: (): StoredServerInfo[] => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SERVERS);
        return stored ? JSON.parse(stored) : [];
    },
} as const;

// ============================================================================
// SERVER UTILITIES
// ============================================================================

/**
 * Convert discovered server to stored server info
 */
export const createStoredServerInfo = (
    server: DiscoveredServer,
    authToken: string,
    username: string
): StoredServerInfo => {
    return {
        deviceId: server.txt.device_id || server.fullname,
        deviceName: server.txt.device_name || server.hostname.replace('.local.', ''),
        hostname: server.hostname,
        description: server.txt.description || 'Aaxion Server',
        version: server.txt.version || 'unknown',
        addresses: server.addresses,
        port: server.port,
        url: '', // Will be set by the caller
        authToken,
        username,
        lastConnected: Date.now(),
    };
};
