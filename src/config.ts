export const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const storedIp = localStorage.getItem('API_IP');
        if (!storedIp?.includes("localhost")) {
            return `https://${storedIp}`;
        }
        if (storedIp) {
            return `http://${storedIp}:8080`;
        }
        return `http://${window.location.hostname}:8080`;
    }
    return 'http://192.168.1.104:8080';
};
