import axios from 'axios';
import { getToken } from './authService';
import { STORAGE_KEYS } from '@/constants';
import getServerUrl from '@/utils/serverUrlWithLiveChecks';
import toast from 'react-hot-toast';

const apiClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});


let serverUrl: string | null = typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEYS.SERVER_URL)
    : null;

console.log("Using  server uri", serverUrl);

let serverUrlPromise: Promise<string> | null = null;

const fetchServerUrl = async (): Promise<string> => {
    if (typeof window === 'undefined') return "http://localhost:8000";

    try {
        const serverInfo = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVER_INFO) || '{}');
        const url = await getServerUrl(serverInfo);
        serverUrl = url;
        toast.success(`Connected to server at ${url}`);
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
        toast.success("Using server  url " + config.baseURL);
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        toast.error("Error occurred while making API request" + (error.message ? `: ${error.message}` : ''));
        return Promise.reject(error);
    }
);

export default apiClient;

