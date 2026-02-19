/**
 * ============================================================================
 * SERVER CONFIGURATION UTILITY
 * Handles dynamic server URL resolution and server info management
 * ============================================================================
 * 
 * This utility provides centralized server configuration management:
 * - Retrieves connected server info from localStorage
 * - Selects best IP address based on network priority
 * - Provides dynamic API base URL resolution
 * - Manages server connection state
 * 
 * @example
 * ```typescript
 * import { getApiBaseUrl, getServerStatus, isServerConnected } from '@/utils/serverConfig';
 * 
 * // Get dynamic API base URL
 * const apiUrl = await get ApiBaseUrl();
 * // Returns: "http://192.168.1.109:8080" (best available IP)
 * 
 * // Check if server is connected
 * if (isServerConnected()) {
 *   const status = await getServerStatus();
 *   console.log(`Connected to ${status.serverName} at ${status.url}`);
 * }
 * ```
 */

import {
    STORAGE_KEYS,
    SERVER,
    type StoredServerInfo,
    buildServerUrl,
    getNetworkPriority
} from '@/constants';
import { API_ENDPOINTS } from '@/config/api';

/**
 * Get stored server info from localStorage
 */
export const getStoredServerInfo = (): StoredServerInfo | null => {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEYS.SERVER_INFO);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Failed to parse stored server info:', error);
        return null;
    }
};

/**
 * Get recent servers list from localStorage
 */
export const getRecentServers = (): StoredServerInfo[] => {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SERVERS);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to parse recent servers:', error);
        return [];
    }
};

/**
 * Find server by device ID from stored servers
 */
export const findServerByDeviceId = (deviceId: string): StoredServerInfo | null => {
    const recentServers = getRecentServers();
    return recentServers.find(server => server.deviceId === deviceId) || null;
};

/**
 * Test connection to a specific server URL
 */
export const testServerConnection = async (url: string, timeout = 500): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Get auth token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${url}${API_ENDPOINTS.SYSTEM.ROOT_PATH}`, {
            method: 'GET',
            headers,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.error(`[ServerConfig] Connection test failed for ${url}:`, error);
        return false;
    }
};

/**
 * Select best IP address from available addresses based on network priority
 * Filters out IPv6 and prioritizes local network addresses
 * Also tests reachability with 500ms timeout
 */
export const selectBestIpAddress = async (addresses: string[], port: number = SERVER.PORT): Promise<string> => {
    if (!addresses || addresses.length === 0) {
        console.warn('No addresses provided, using default');
        return SERVER.DEFAULT_IP;
    }

    // Filter out IPv6 addresses (contain ':')
    const ipv4Addresses = addresses.filter(addr => !addr.includes(':'));

    if (ipv4Addresses.length === 0) {
        console.warn('No IPv4 addresses found, using first available');
        return addresses[0];
    }

    console.log(`🔍 Testing ${ipv4Addresses.length} IPs for reachability...`);

    // Test all IPs in parallel with 500ms timeout
    const reachabilityTests = await Promise.all(
        ipv4Addresses.map(async (ip) => {
            const url = buildServerUrl(ip, port);
            const reachable = await testServerConnection(url, 500);
            return {
                ip,
                priority: getNetworkPriority(ip),
                reachable
            };
        })
    );

    // Filter to only reachable IPs and sort by priority
    const reachableIPs = reachabilityTests
        .filter(test => test.reachable)
        .sort((a, b) => b.priority - a.priority);

    if (reachableIPs.length === 0) {
        console.warn('⚠️ No reachable IPs found, using highest priority (may be offline)');
        // Fallback to highest priority even if unreachable
        const fallback = reachabilityTests
            .sort((a, b) => b.priority - a.priority)[0];
        return fallback.ip;
    }

    const bestIp = reachableIPs[0].ip;

    console.log(`✅ Selected best IP: ${bestIp} (priority: ${reachableIPs[0].priority})`);
    console.log(`   Reachable IPs:`, reachableIPs.map(s => `${s.ip} (${s.priority})`));

    return bestIp;
};

/**
 * Select best IP without reachability check (synchronous)
 * Used for regular API calls - fast and doesn't block
 */
export const selectBestIpSync = (addresses: string[]): string => {
    if (!addresses || addresses.length === 0) {
        return SERVER.DEFAULT_IP;
    }

    // Filter out IPv6 addresses
    const ipv4Addresses = addresses.filter(addr => !addr.includes(':'));

    if (ipv4Addresses.length === 0) {
        return addresses[0];
    }

    // Sort by network priority
    const sorted = ipv4Addresses
        .map(ip => ({ ip, priority: getNetworkPriority(ip) }))
        .sort((a, b) => b.priority - a.priority);

    return sorted[0].ip;
};

/**
 * Get connected server info with best available IP
 * Synchronous version for regular API calls
 */
export const getConnectedServerUrl = (): string | null => {
    const serverInfo = getStoredServerInfo();

    if (!serverInfo || !serverInfo.deviceId) {
        console.log('[ServerConfig] No connected server found');
        return null;
    }

    // Select best IP from available addresses (no reachability check for speed)
    const bestIp = selectBestIpSync(serverInfo.addresses);

    // Determine protocol (HTTPS if domain contains 'aaxion', HTTP otherwise)
    const protocol = bestIp.includes('aaxion')
        ? SERVER.PROTOCOL.HTTPS
        : SERVER.PROTOCOL.HTTP;

    const url = buildServerUrl(bestIp, serverInfo.port, protocol);

    console.log(`[ServerConfig] Connected server URL: ${url}`);
    console.log(`[ServerConfig] Server: ${serverInfo.deviceName} (${serverInfo.deviceId})`);

    return url;
};

/**
 * Get connected server URL with reachability check (async)
 * Use this when you need to verify the server is actually reachable
 */
export const getConnectedServerUrlWithCheck = async (): Promise<string | null> => {
    const serverInfo = getStoredServerInfo();

    if (!serverInfo || !serverInfo.deviceId) {
        console.log('[ServerConfig] No connected server found');
        return null;
    }

    // Select best IP from available addresses (with reachability check)
    const bestIp = await selectBestIpAddress(serverInfo.addresses, serverInfo.port);

    // Determine protocol (HTTPS if domain contains 'aaxion', HTTP otherwise)
    const protocol = bestIp.includes('aaxion')
        ? SERVER.PROTOCOL.HTTPS
        : SERVER.PROTOCOL.HTTP;

    const url = buildServerUrl(bestIp, serverInfo.port, protocol);

    console.log(`[ServerConfig] Connected server URL (verified): ${url}`);
    console.log(`[ServerConfig] Server: ${serverInfo.deviceName} (${serverInfo.deviceId})`);

    return url;
};

/**
 * Get API base URL dynamically (synchronous)
 * Priority:
 * 1. Connected server info (with best IP selection)
 * 2. Legacy AAXION_SERVER_URL
 * 3. Legacy API_IP
 * 4. Window location hostname
 * 5. Default fallback
 */
export const getApiBaseUrl = (): string => {
    if (typeof window === 'undefined') {
        return buildServerUrl(SERVER.DEFAULT_IP, SERVER.PORT);
    }

    // Priority 1: Get connected server URL
    const connectedServerUrl = getConnectedServerUrl();
    if (connectedServerUrl) {
        return connectedServerUrl;
    }

    // Priority 2: Legacy AAXION_SERVER_URL (for backward compatibility)
    const storedUrl = localStorage.getItem(STORAGE_KEYS.SERVER_URL);
    if (storedUrl) {
        console.log('[ServerConfig] Using legacy AAXION_SERVER_URL:', storedUrl);
        return storedUrl;
    }

    // Priority 3: Legacy API_IP (for backward compatibility)
    const storedIp = localStorage.getItem(STORAGE_KEYS.API_IP);
    if (storedIp) {
        const protocol = storedIp.includes('aaxion')
            ? SERVER.PROTOCOL.HTTPS
            : SERVER.PROTOCOL.HTTP;
        const url = buildServerUrl(storedIp, SERVER.PORT, protocol);
        console.log('[ServerConfig] Using legacy API_IP:', url);
        return url;
    }

    // Priority 4: Use window location hostname
    if (window.location.hostname) {
        const url = buildServerUrl(window.location.hostname, SERVER.PORT);
        console.log('[ServerConfig] Using window.location.hostname:', url);
        return url;
    }

    // Fallback: Default server
    const defaultUrl = buildServerUrl(SERVER.DEFAULT_IP, SERVER.PORT);
    console.log('[ServerConfig] Using default fallback:', defaultUrl);
    return defaultUrl;
};

/**
 * Check if a server is connected
 */
export const isServerConnected = (): boolean => {
    const serverInfo = getStoredServerInfo();
    return serverInfo !== null && serverInfo.deviceId !== undefined;
};

/**
 * Update server info addresses when network changes
 * Useful for detecting IP changes or network switches
 */
export const refreshServerAddresses = (newAddresses: string[]): void => {
    const serverInfo = getStoredServerInfo();

    if (!serverInfo) {
        console.warn('[ServerConfig] No server info to refresh');
        return;
    }

    // Update addresses
    serverInfo.addresses = newAddresses;
    serverInfo.lastConnected = Date.now();

    // Save updated info
    localStorage.setItem(STORAGE_KEYS.SERVER_INFO, JSON.stringify(serverInfo));

    console.log('[ServerConfig] Server addresses refreshed:', newAddresses);
};

/**
 * Get server connection status
 */
export const getServerStatus = () => {
    const serverInfo = getStoredServerInfo();

    if (!serverInfo) {
        return {
            connected: false,
            serverName: null,
            deviceId: null,
            url: null,
            lastConnected: null,
        };
    }

    return {
        connected: true,
        serverName: serverInfo.deviceName,
        deviceId: serverInfo.deviceId,
        url: getConnectedServerUrl(),
        lastConnected: new Date(serverInfo.lastConnected),
        addresses: serverInfo.addresses,
        port: serverInfo.port,
    };
};

/**
 * Clear connected server info (logout)
 */
export const clearServerConnection = (): void => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(STORAGE_KEYS.SERVER_INFO);
    console.log('[ServerConfig] Server connection cleared');
};

/**
 * Test all available IPs and return reachable ones
 */
export const getReachableAddresses = async (addresses: string[], port: number = SERVER.PORT): Promise<string[]> => {
    const reachable: string[] = [];

    for (const ip of addresses) {
        const url = buildServerUrl(ip, port);
        const isReachable = await testServerConnection(url);

        if (isReachable) {
            reachable.push(ip);
        }
    }

    console.log('[ServerConfig] Reachable addresses:', reachable);
    return reachable;
};
