import { getApiBaseUrl } from "@/config";

// src/lib/api.ts
// Dynamic API base URL getter
export const getApiBase = () => getApiBaseUrl();

export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
};

export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    console.log("Token ::", token);

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    const apiBase = getApiBase(); // Get API base dynamically
    const res = await fetch(`${apiBase}${url}`, { ...options, headers });

    if (res.status === 401) {
        if (typeof window !== 'undefined') {
            const currentToken = localStorage.getItem('aaxion_token');
            if (currentToken) {
                localStorage.removeItem('aaxion_token');
                window.location.reload();
            }
        }
    }
    return res;
};