import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import toast from "react-hot-toast";
import { useIpContext } from "@/context/IpContext";

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

    // Helper to extract a usable URL from ServerInfo with IP prioritization
    const getServerUrl = (info: ServerInfo) => {
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

        // Filter and sort IPv4 addresses by priority
        const sortedAddresses = [...info.addresses]
            .map(addr => ({ addr, priority: prioritizeIP(addr) }))
            .sort((a, b) => b.priority - a.priority);

        const bestIP = sortedAddresses[0]?.addr || info.addresses[0];

        console.log(`🎯 Selected IP for ${info.hostname}: ${bestIP} (priority: ${sortedAddresses[0]?.priority})`);
        console.log(`   Available IPs:`, sortedAddresses.map(s => `${s.addr} (${s.priority})`));

        return `http://${bestIP}:${info.port}`;
    };

    const selectServer = useCallback((server: ServerInfo) => {
        const url = getServerUrl(server);

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
            const firstUrl = getServerUrl(firstServer);

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

    return { ...state, scan, selectServer };
};
