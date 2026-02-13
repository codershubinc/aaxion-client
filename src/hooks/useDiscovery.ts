import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import toast from "react-hot-toast";

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
    const [state, setState] = useState<DiscoveryState>({
        availableServers: [],
        selectedServer: null,
        serverUrl: null,
        isScanning: false,
        error: null,
    });

    // Helper to extract a usable URL from ServerInfo
    const getServerUrl = (info: ServerInfo) => {
        // IP v4 is preferred
        const ipv4 = info.addresses.find(addr => addr.includes("."));
        const ip = ipv4 || info.addresses[0];
        return `http://${ip}:${info.port}`;
    };

    const selectServer = useCallback((server: ServerInfo) => {
        const url = getServerUrl(server);
        setState(prev => ({
            ...prev,
            selectedServer: server,
            serverUrl: url
        }));
        localStorage.setItem("AAXION_SERVER_URL", url);
        toast.dismiss("discovery");
        toast.success(`Selected: ${server.hostname}`, { id: "server-select" });
    }, []);

    const scan = useCallback(async () => {
        if (typeof window === "undefined" || !(window as any).__TAURI__) {
            console.log("Discovery skipped: Not running in Tauri");
            return;
        }

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
                isScanning: false,
                error: "Discovery failed"
            }));
            toast.error("Discovery failed", { id: "discovery" });
        }
    }, []);

    const isTauri: boolean = typeof window !== "undefined" && (window as any).__TAURI__;

    // Auto-scan on mount 
    useEffect(() => { scan(); }, [scan]);

    return { ...state, scan, selectServer, isTauri };
};
