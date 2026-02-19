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
