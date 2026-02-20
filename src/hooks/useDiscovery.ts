import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import toast from "react-hot-toast";
import { useIpContext } from "@/context/IpContext";
import { API_ENDPOINTS } from "@/config/api";

export interface ServerInfo {
    hostname: string;
    fullname: string;
    addresses: string[];
    port: number;
    txt: Record<string, string>;
}

interface DiscoveryState {
    availableServers: ServerInfo[];
    selectedServer: ServerInfo | null;
    serverUrl: string | null;
    isScanning: boolean;
    error: string | null;
}

/**
 * Test if an IP address is reachable by making a quick health check
 */
const testIpReachability = async (ip: string, port: number): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 500); // 500ms timeout

        const testUrl = `http://${ip}:${port}${API_ENDPOINTS.SYSTEM.ROOT_PATH}`;
        console.log(`🔍 Testing IP: ${ip} - ${testUrl}`);

        // Get auth token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(testUrl, {
            method: 'GET',
            headers,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const isReachable = response.ok;
        console.log(`${isReachable ? '✅' : '❌'} IP ${ip}: ${isReachable ? 'Reachable' : 'Unreachable'}`);
        return isReachable;
    } catch (error) {
        console.log(`❌ IP ${ip}: Unreachable (${error instanceof Error ? error.message : 'timeout'})`);
        return false;
    }
};

export const useDiscovery = () => {
    const {
        setCurrentSelectedIp,
        setCurrentServerName,
        setCurrentServerUrl,
        setCurrentServerPort,
        setIsConnected,
    } = useIpContext();

    const [state, setState] = useState<DiscoveryState>({
        availableServers: [],
        selectedServer: null,
        serverUrl: null,
        isScanning: false,
        error: null,
    });

    // Helper to extract a usable URL from ServerInfo with IP prioritization and reachability check
     const getServerUrl = async (info: ServerInfo) => {
        // Prioritize IPs based on network type (higher score = better)
        const prioritizeIP = (ip: string): number => {
            // IPv6 addresses - lowest priority
            if (ip.includes(":")) return 1;

            // IPv4 prioritization
            if (ip.startsWith("10.0.0.")) return 100;        // LAN/wired - highest speed
            if (ip.startsWith("192.168.1.")) return 50;      // WiFi - lower speed
            if (ip.startsWith("192.168.")) return 40;        // Other local WiFi
            if (ip.startsWith("172.17.")) return 30;         // Docker network
            if (ip.startsWith("169.254.")) return 20;        // Link-local

            // Other IPv4
            return 60;
        };

        // Filter IPv4 addresses and test reachability
        const ipv4Addresses = info.addresses.filter(addr => !addr.includes(":"));

        console.log(`🔎 Testing ${ipv4Addresses.length} IPv4 addresses for ${info.hostname}...`);

        // Test all IPs in parallel
        const reachabilityTests = await Promise.all(
            ipv4Addresses.map(async (ip) => ({
                ip,
                priority: prioritizeIP(ip),
                reachable: await testIpReachability(ip, info.port)
            }))
        );

        // Filter to only reachable IPs and sort by priority
        const reachableIPs = reachabilityTests
            .filter(test => test.reachable)
            .sort((a, b) => b.priority - a.priority);

        if (reachableIPs.length === 0) {
            console.warn(`⚠️ No reachable IPs found for ${info.hostname}, using highest priority`);
            // Fallback to highest priority if none are reachable
            const fallback = reachabilityTests
                .sort((a, b) => b.priority - a.priority)[0];
            return `http://${fallback.ip}:${info.port}`;
        }

        const bestIP = reachableIPs[0].ip;

        console.log(`🎯 Selected IP for ${info.hostname}: ${bestIP} (priority: ${reachableIPs[0].priority})`);
        console.log(`   Reachable IPs:`, reachableIPs.map(s => `${s.ip} (${s.priority})`));

        return `http://${bestIP}:${info.port}`;
    };

    const selectServer = useCallback(async (server: ServerInfo) => {
        const url = await getServerUrl(server);

        // Update discovery state
        setState(prev => ({
            ...prev,
            selectedServer: server,
            serverUrl: url
        }));

        // Update IP context
        try {
            const urlObj = new URL(url);
            setCurrentSelectedIp(urlObj.hostname);
            setCurrentServerPort(urlObj.port || "80");
        } catch {
            setCurrentSelectedIp(null);
            setCurrentServerPort(null);
        }

        setCurrentServerUrl(url);
        setCurrentServerName(
            server.txt?.device_name ||
            server.hostname?.replace('.local.', '') ||
            null
        );
        setIsConnected(true);

        localStorage.setItem("AAXION_SERVER_URL", url);
        toast.dismiss("discovery");
        toast.success(`Selected: ${server.hostname}`, { id: "server-select" });
    }, [setCurrentSelectedIp, setCurrentServerName, setCurrentServerUrl, setCurrentServerPort, setIsConnected]);

    const scan = useCallback(async () => {
        setState(prev => ({ ...prev, isScanning: true, error: null, availableServers: [] }));

        try {
            const servers = await invoke<ServerInfo[]>("discover_server");

            console.log("Discovered Servers:", servers);

            if (servers.length === 0) {
                setState(prev => ({
                    ...prev,
                    availableServers: [],
                    isScanning: false,
                    error: "No servers found"
                }));
                return;
            }

            // Default to the first one found
            const firstServer = servers[0];
            const firstUrl = await getServerUrl(firstServer);

            setState({
                availableServers: servers,
                selectedServer: firstServer,
                serverUrl: firstUrl,
                isScanning: false,
                error: null
            });

            // Update IP context for first server
            try {
                const urlObj = new URL(firstUrl);
                setCurrentSelectedIp(urlObj.hostname);
                setCurrentServerPort(urlObj.port || "80");
            } catch {
                setCurrentSelectedIp(null);
                setCurrentServerPort(null);
            }

            setCurrentServerUrl(firstUrl);
            setCurrentServerName(
                firstServer.txt?.device_name ||
                firstServer.hostname?.replace('.local.', '') ||
                null
            );
            setIsConnected(true);

            // Auto-persist the primary found server
            localStorage.setItem("AAXION_SERVER_URL", firstUrl);

            if (servers.length > 1) {
                toast.success(`Found ${servers.length} servers`, { id: "discovery" });
            } else {
                toast.success(`Connected to ${firstServer.hostname}`, { id: "discovery" });
            }

        } catch (err: any) {
            console.error("Discovery failed:", err);
            setState(prev => ({
                ...prev,
                availableServers: [],
                selectedServer: null,
                serverUrl: null,
                isScanning: false,
                error: "Discovery failed"
            }));

            // Clear IP context on error
            setCurrentSelectedIp(null);
            setCurrentServerName(null);
            setCurrentServerUrl(null);
            setCurrentServerPort(null);
            setIsConnected(false);

            toast.error("Discovery failed", { id: "discovery" });
        }
    }, [setCurrentSelectedIp, setCurrentServerName, setCurrentServerUrl, setCurrentServerPort, setIsConnected]);

    // Auto-scan on mount 
    useEffect(() => {
        scan();
    }, [scan]);

    return { ...state, scan, selectServer , getServerUrl };
};
