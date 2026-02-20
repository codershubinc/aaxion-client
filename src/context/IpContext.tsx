"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface IpContextType {
    currentSelectedIp: string | null;
    currentServerName: string | null;
    currentServerUrl: string | null;
    currentServerPort: string | null;
    isConnected: boolean;
    setCurrentSelectedIp: (ip: string | null) => void;
    setCurrentServerName: (name: string | null) => void;
    setCurrentServerUrl: (url: string | null) => void;
    setCurrentServerPort: (port: string | null) => void;
    setIsConnected: (connected: boolean) => void;
}

const IpContext = createContext<IpContextType | undefined>(undefined);

export const IpProvider = ({ children }: { children: ReactNode }) => {
    const [currentSelectedIp, setCurrentSelectedIp] = useState<string | null>(null);
    const [currentServerName, setCurrentServerName] = useState<string | null>(null);
    const [currentServerUrl, setCurrentServerUrl] = useState<string | null>(null);
    const [currentServerPort, setCurrentServerPort] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    return (
        <IpContext.Provider
            value={{
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
            }}
        >
            {children}
        </IpContext.Provider>
    );
};

export const useIpContext = () => {
    const context = useContext(IpContext);
    if (context === undefined) {
        throw new Error("useIpContext must be used within an IpProvider");
    }
    return context;
};
