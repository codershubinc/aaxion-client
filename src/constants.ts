/**
 * ============================================================================
 * AAXION CLIENT CONSTANTS
 * Centralized constants for the entire application
 * ============================================================================
 */

// ============================================================================
// SERVER TYPES & INTERFACES
// ============================================================================

/**
 * Discovered server information from mDNS/Bonjour
 */
export interface DiscoveredServer {
    /** Server hostname */
    hostname: string;
    /** Full service name */
    fullname: string;
    /** Array of IP addresses (IPv4 and IPv6) */
    addresses: string[];
    /** Server port */
    port: number;
    /** Text record data */
    txt: Record<string, string>;
}

/**
 * Stored server info with authentication
 */
export interface StoredServerInfo {
    /** Server device ID */
    deviceId: string;
    /** Server device name */
    deviceName: string;
    /** Server hostname */
    hostname: string;
    /** Server description */
    description: string;
    /** Server version */
    version: string;
    /** Array of IP addresses */
    addresses: string[];
    /** Server port */
    port: number;
    /** Selected server URL */
    url: string;
    /** Authentication token */
    authToken: string;
    /** Username */
    username: string;
    /** Last connected timestamp */
    lastConnected: number;
}

// ============================================================================
// SERVER CONFIGURATION
// ============================================================================

export const SERVER = {
    /** Default server IP for development */
    DEFAULT_IP: '192.168.1.104',

    /** Default server port */
    PORT: 8080,

    /** Development server port */
    DEV_PORT: 3000,

    /** Localhost */
    LOCALHOST: 'localhost',

    /** Local IP */
    LOCAL_IP: '127.0.0.1',

    /** Protocol */
    PROTOCOL: {
        HTTP: 'http',
        HTTPS: 'https',
    },
} as const;

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
    /** Aaxion server URL */
    SERVER_URL: 'AAXION_SERVER_URL',

    /** API IP address (legacy) */
    API_IP: 'API_IP',

    /** Authentication token */
    AUTH_TOKEN: 'auth_token',

    /** Alternative auth token key */
    AAXION_TOKEN: 'aaxion_token',

    /** Username */
    USER: 'aaxion_user',

    /** OMDB data cache */
    OMDB_CACHE: 'omdb_data_cache',

    /** Stored server info with auth */
    SERVER_INFO: 'aaxion_server_info',

    /** Recent servers list */
    RECENT_SERVERS: 'aaxion_recent_servers',
} as const;

// ============================================================================
// VLC PLAYER CONFIGURATION
// ============================================================================

export const VLC = {
    /** VLC server IP */
    IP: '127.0.0.1',

    /** VLC server port */
    PORT: '9090',

    /** VLC password */
    PASSWORD: 'aaxion_secret',

    /** VLC base URL */
    get BASE_URL(): string {
        return `http://${this.IP}:${this.PORT}`;
    },

    /** VLC requests endpoint */
    get REQUESTS_URL(): string {
        return `${this.BASE_URL}/requests`;
    },

    /** VLC API endpoints */
    ENDPOINTS: {
        STATUS: '/status.json',
        PLAYLIST: '/playlist.json',
    },
} as const;

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

export const NETWORK = {
    /** IP ranges and priorities for discovery */
    IP_RANGES: {
        /** Primary local network (highest priority) */
        PRIMARY_LOCAL: '192.168.1.',

        /** Other local networks */
        SECONDARY_LOCAL: '192.168.',

        /** Localhost */
        LOCALHOST: '127.0.0.1',
    },

    /** Connection priorities */
    PRIORITY: {
        ETHERNET: 100,
        WIFI_PRIMARY: 50,
        WIFI_SECONDARY: 40,
        LOCALHOST: 10,
    },

    /** Timeout values (in milliseconds) */
    TIMEOUT: {
        /** Request timeout */
        REQUEST: 5000,

        /** Discovery timeout */
        DISCOVERY: 10000,

        /** Health check timeout */
        HEALTH_CHECK: 3000,
    },
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
    /** File-related endpoints */
    FILES: {
        VIEW: '/api/files/view',
        CREATE_DIRECTORY: '/files/create-directory',
        DOWNLOAD: '/files/download',
        UPLOAD: '/files/upload',
        CHUNK: {
            START: '/files/upload/chunk/start',
            UPLOAD: '/files/upload/chunk',
            COMPLETE: '/files/upload/chunk/complete',
        },
        SHARE: '/files/d/r',
        THUMBNAIL: '/files/thumbnail',
    },

    /** System-related endpoints */
    SYSTEM: {
        ROOT_PATH: '/api/system/get-root-path',
        STORAGE: '/api/system/storage',
    },

    /** Authentication endpoints */
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
    },
} as const;

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API = {
    /** Response Status Codes */
    STATUS: {
        SUCCESS: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        SERVER_ERROR: 500,
    },

    /** Request Headers */
    HEADERS: {
        CONTENT_TYPE: 'Content-Type',
        AUTHORIZATION: 'Authorization',
        ACCEPT: 'Accept',
    },

    /** Content Types */
    CONTENT_TYPES: {
        JSON: 'application/json',
        FORM_DATA: 'multipart/form-data',
        URL_ENCODED: 'application/x-www-form-urlencoded',
    },
} as const;

// ============================================================================
// APPLICATION
// ============================================================================

export const APP = {
    /** Application name */
    NAME: 'Aaxion',

    /** Application version */
    VERSION: '1.0.0',

    /** Environment */
    ENV: {
        DEVELOPMENT: 'development',
        PRODUCTION: 'production',
        TEST: 'test',
    },
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI = {
    /** Animation durations (in milliseconds) */
    ANIMATION_DURATION: {
        FAST: 150,
        NORMAL: 300,
        SLOW: 500,
    },

    /** Debounce delays (in milliseconds) */
    DEBOUNCE: {
        SEARCH: 300,
        RESIZE: 150,
        SCROLL: 100,
    },
} as const;

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
