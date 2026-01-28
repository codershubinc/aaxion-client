import { API_ENDPOINTS, getApiBaseUrl } from '@/config';
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
