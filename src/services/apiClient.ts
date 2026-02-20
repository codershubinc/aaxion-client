import axios from 'axios';
import { getToken } from './authService';
import { STORAGE_KEYS } from '@/constants';
import getServerUrl from '@/utils/serverUrlWithLiveChecks';

const apiClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});


let serverUrl: string | null = typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEYS.SERVER_URL)
    : null;

let serverUrlPromise: Promise<string> | null = null;

const fetchServerUrl = async (): Promise<string> => {
    if (typeof window === 'undefined') return "http://localhost:8000";

    try {
        const serverInfo = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVER_INFO) || '{}');
        const url = await getServerUrl(serverInfo);
        serverUrl = url;
        localStorage.setItem(STORAGE_KEYS.SERVER_URL, url);
        return url;
    } catch (error) {
        console.log("cant get server url", error);
        serverUrl = "http://localhost:8000";
        return serverUrl;
    }
};


if (!serverUrl && typeof window !== 'undefined') {
    serverUrlPromise = fetchServerUrl();
}

apiClient.interceptors.request.use(
    async (config) => {
        if (!serverUrl && serverUrlPromise) {
            await serverUrlPromise;
        }

        config.baseURL = serverUrl || "http://localhost:8000";

        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;

