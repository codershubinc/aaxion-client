import apiClient from './apiClient';
import { getApiBaseUrl, API_ENDPOINTS } from '@/config';

/**
 * Share Service - Handles file sharing operations
 */

/**
 * Request a temporary share link for a file
 * @param filePath - The full path to the file to share
 * @returns The temporary share link
 */
export const requestTempShare = async (filePath: string): Promise<{ share_link: string, baseUri: string }> => {
    const response = await apiClient.get(API_ENDPOINTS.FILES.SHARE, {
        params: { file_path: filePath },
    });
    return {
        share_link: response.data.share_link,
        baseUri: getApiBaseUrl(),
    };
};
