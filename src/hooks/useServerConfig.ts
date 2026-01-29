import { useState, useEffect, useCallback } from 'react';

export const SERVER_STORAGE_KEY = 'AAXION_SERVER_URL';

export const useServerConfig = () => {
    const [baseUrl, setBaseUrlState] = useState<string>("");

    // Initialize from storage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(SERVER_STORAGE_KEY);
            if (stored) {
                setBaseUrlState(stored);
            } else {
                // Default fallback
                setBaseUrlState(`http://${window.location.hostname}:8080`);
            }
        }
    }, []);

    // Setter that persists to localStorage
    const setServerUrl = useCallback((url: string) => {
        // Basic normalization: remove trailing slash
        const normalized = url.replace(/\/$/, "");
        setBaseUrlState(normalized);
        if (typeof window !== 'undefined') {
            localStorage.setItem(SERVER_STORAGE_KEY, normalized);
        }
    }, []);

    // Helper to construct full API endpoints
    const getApiUrl = useCallback((endpoint: string) => {
        if (!baseUrl) return "";
        const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${baseUrl}${cleanPath}`;
    }, [baseUrl]);

    return {
        serverUrl: baseUrl,
        setServerUrl,
        getApiUrl
    };
};
