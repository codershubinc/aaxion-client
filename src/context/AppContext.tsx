'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getToken, setToken as setAuthToken, removeToken } from '@/services';

// Define the upload progress structure
export interface UploadProgress {
    isUploading: boolean;
    status: 'pending' | 'uploading' | 'finalizing' | 'completed' | 'error';
    completedFiles: number;
    totalFiles: number;
    overallProgress: number;
    speed: number;
    estimatedTimeRemaining: number;
}

interface AppContextType {
    uploadProgress: UploadProgress | null;
    updateUploadProgress: (progress: UploadProgress | null) => void;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const token = getToken();
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const updateUploadProgress = useCallback((progress: UploadProgress | null) => {
        setUploadProgress(progress);
    }, []);

    const login = useCallback((token: string) => {
        setAuthToken(token);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        removeToken();
        setIsAuthenticated(false);
    }, []);

    const value = React.useMemo(() => ({
        uploadProgress, updateUploadProgress, isAuthenticated, login, logout
    }), [uploadProgress, updateUploadProgress, isAuthenticated, login, logout]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within an AppProvider');
    }
    return context;
}
