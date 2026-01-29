export const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        // Priority 1: Full URL from new Server Config Hook
        const storedUrl = localStorage.getItem('AAXION_SERVER_URL');
        if (storedUrl) {
            return storedUrl;
        }

        // Priority 2: Legacy IP specific items
        const storedIp = localStorage.getItem('API_IP');
        if (storedIp?.includes("aaxion")) {
            return `https://${storedIp}`;
        }
        if (storedIp) {
            return `http://${storedIp}:8080`;
        }
        return `http://${window.location.hostname}:8080`;
    }
    return 'http://192.168.1.104:8080';
};

export * from './api';
