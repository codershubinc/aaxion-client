import { useCallback } from "react";
import { useIpContext } from "@/context/IpContext";

export const useIp = () => {
    const {
        currentSelectedIp,
        currentServerName,
        currentServerUrl,
        currentServerPort,
        isConnected,
        setCurrentSelectedIp,
        setCurrentServerName,
        setCurrentServerUrl,
        setCurrentServerPort,
        setIsConnected,
    } = useIpContext();

    /**
     * Extract IP address from a URL string
     */
    const getIPFromUrl = useCallback((url: string | null): string | null => {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return null;
        }
    }, []);



    /**
     * Get full server display info (name + IP)
     */
    const getServerDisplayInfo = useCallback(() => {
        if (!isConnected) return null;

        return {
            name: currentServerName || "Unknown Server",
            ip: currentSelectedIp || "N/A",
            port: currentServerPort || "8080",
            url: currentServerUrl || "",
        };
    }, [isConnected, currentServerName, currentSelectedIp, currentServerPort, currentServerUrl]);

    return {
        // Current state values
        currentSelectedIp,
        currentServerName,
        currentServerUrl,
        currentServerPort,
        isConnected,

        // State setters
        setCurrentSelectedIp,
        setCurrentServerName,
        setCurrentServerUrl,
        setCurrentServerPort,
        setIsConnected,

        // Utility functions
        getIPFromUrl,
        getServerDisplayInfo,
    };
};
