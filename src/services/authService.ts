import { API_ENDPOINTS } from '@/config';
import { Storage, createStoredServerInfo, type DiscoveredServer, type StoredServerInfo } from '@/constants';
import { clearServerConnection, getStoredServerInfo as getServerInfo, getRecentServers as getRecentServersList } from '@/utils/serverConfig';
import apiClient from './apiClient';

interface LoginResponse {
    token: string;
    expires_in: number;
}

interface AuthError {
    error: string;
}

export const login = async (username: string, password: string) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
        return response.data;
    } catch (error: any) {
        console.log("Got login err ::", error.message);
        throw error.response?.data || error;
    }
};

export const register = async (username: string, password: string): Promise<{ message: string }> => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, { username, password });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Registration failed');
    }
};

export const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
    }
};

export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
};

export const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
    }
};

export const isAuthenticated = (): boolean => {
    const token = getToken();
    return !!token;
};

/**
 * Store server info with authentication after successful login
 */
export const storeServerInfoWithAuth = (
    server: DiscoveredServer,
    authToken: string,
    username: string,
    serverUrl: string
): void => {
    const serverInfo = createStoredServerInfo(server, authToken, username);
    serverInfo.url = serverUrl;

    // Store current server info
    Storage.setServerInfo(serverInfo);

    // Add to recent servers
    Storage.addRecentServer(serverInfo);

    // Also store username separately for backwards compatibility
    if (typeof window !== 'undefined') {
        localStorage.setItem('aaxion_user', username);
    }
};

/**
 * Get current stored server info
 */
export const getStoredServerInfo = (): StoredServerInfo | null => {
    return getServerInfo();
};

/**
 * Get recent servers
 */
export const getRecentServers = (): StoredServerInfo[] => {
    return getRecentServersList();
};

/**
 * Clear server info on logout
 */
export const clearServerInfo = (): void => {
    clearServerConnection();
};
