import axios from 'axios';
import { getApiBaseUrl } from '@/config';
import { getToken } from './authService';

const apiClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        // dynamic base URL support
        config.baseURL = getApiBaseUrl();

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
