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
