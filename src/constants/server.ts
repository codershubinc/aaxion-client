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
    URL: 'server_url'
} as const;
