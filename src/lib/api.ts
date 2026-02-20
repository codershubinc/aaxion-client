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
