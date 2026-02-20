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
