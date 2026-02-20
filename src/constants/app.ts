// ============================================================================
// APPLICATION & UI CONFIGURATION
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
