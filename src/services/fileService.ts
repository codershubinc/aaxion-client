import apiClient from './apiClient';
import type { FileItem } from '@/types';
import { API_ENDPOINTS, getApiBaseUrl } from '@/config';
import { getToken } from './authService';

/**
 * File Service - Handles file viewing and directory operations
 */

/**
 * View files in a directory
 * @param dirPath - The directory path to view
 * @returns Array of file items
 */
export const viewFiles = async (dirPath: string): Promise<FileItem[]> => {
    const response = await apiClient.get(API_ENDPOINTS.FILES.VIEW, {
        params: { dir: dirPath || '/' },
    });
    return response.data;
};

/**
 * Create a new directory
 * @param path - The full path where the directory should be created
 */
export const createDirectory = async (path: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.FILES.CREATE_DIRECTORY, null, {
        params: { path },
    });
};

/**
 * Download a file
 * @param filePath - The full path to the file to download
 */
export const downloadFile = async (filePath: string): Promise<void> => {
    const token = getToken();
    const baseUrl = await getApiBaseUrl();
    const downloadUrl = `${baseUrl}${API_ENDPOINTS.FILES.DOWNLOAD}?path=${encodeURIComponent(filePath)}`;
    const url = token ? `${downloadUrl}&token=${token}` : downloadUrl;
    window.location.href = url;
}