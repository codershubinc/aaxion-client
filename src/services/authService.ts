import { API_ENDPOINTS, getApiBaseUrl } from '@/config';
import { Storage, createStoredServerInfo, type DiscoveredServer, type StoredServerInfo } from '@/constants';
import toast from 'react-hot-toast';

interface LoginResponse {
    token: string;
    expires_in: number;
}

interface AuthError {
    error: string;
}

export const login = async (username: string, password: string) => {
    try {
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorText = await response.text(); // Read raw text first
            let errorMessage = `Error ${response.status}: ${response.statusText}`;

            try {
                // Try to parse it as JSON (e.g. {"error": "Invalid password"})
                const errorJson = JSON.parse(errorText);
                if (errorJson.error) errorMessage = errorJson.error;
            } catch {
                // If parsing fails, use the raw text (e.g. "Unauthorized")
                if (errorText) errorMessage = errorText;
            }

            throw new Error(errorMessage);
        }

        return await response.json();

    } catch (error: any) {
        console.log("Got login err ::", error.message);
        throw error;
    }
};

export const register = async (username: string, password: string): Promise<{ message: string }> => {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const error = await response.json() as AuthError;
        throw new Error(error.error || 'Registration failed');
    }

    return response.json();
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
    return Storage.getServerInfo();
};

/**
 * Get recent servers
 */
export const getRecentServers = (): StoredServerInfo[] => {
    return Storage.getRecentServers();
};

/**
 * Clear server info on logout
 */
export const clearServerInfo = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(Storage.get('SERVER_INFO') || 'aaxion_server_info');
    }
};
