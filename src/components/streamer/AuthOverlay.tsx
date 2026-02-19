"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, RefreshCw, ChevronDown, Monitor } from "lucide-react";
import { useDiscovery } from "@/hooks/useDiscovery";
import { useIp } from "@/hooks/useIp";
import LoginCard from "@/components/auth/LoginCard";

interface AuthOverlayProps {
    onLogin: () => void;
}

export default function AuthOverlay({ onLogin }: AuthOverlayProps) {
    const { serverUrl, isScanning, scan, availableServers, selectServer, selectedServer } = useDiscovery();
    const { currentServerName } = useIp();
    const [isServerListOpen, setIsServerListOpen] = useState(false);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center p-4 overflow-hidden">

            {/* --- SERVER STATUS INDICATOR (Top Left) --- */}
            {mounted && (
                <div className="absolute top-[70px] left-6 z-50 flex flex-col items-start gap-2">
                    <motion.button
                        onClick={() => availableServers.length > 1 && setIsServerListOpen(!isServerListOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a0a0a]/80 backdrop-blur-md border border-[#2D2D2D] hover:bg-[#0a0a0a] transition-all shadow-xl ${availableServers.length > 1 ? "cursor-pointer active:scale-95" : ""}`}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                        {isScanning ? (
                            <>
                                <RefreshCw className="w-3.5 h-3.5 text-yellow-500 animate-spin" />
                                <span className="text-xs text-gray-400 font-mono font-medium tracking-wide">SCANNING NETWORK...</span>
                            </>
                        ) : serverUrl ? (
                            <>
                                <Wifi className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-xs text-green-500/90 font-mono font-medium tracking-wide">
                                    {currentServerName || "CONNECTED"}
                                </span>
                                {availableServers.length > 1 && (
                                    <span className="ml-1 text-[10px] bg-[#2D2D2D] text-gray-300 px-1.5 py-0.5 rounded-full">
                                        {availableServers.length}
                                    </span>
                                )}
                                {availableServers.length > 1 && <ChevronDown className="w-3 h-3 text-gray-500" />}
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-3.5 h-3.5 text-red-500" />
                                <span onClick={(e) => { e.stopPropagation(); scan(); }} className="text-xs text-red-500/90 font-mono font-medium hover:text-red-400 hover:underline tracking-wide cursor-pointer">
                                    OFFLINE (RETRY)
                                </span>
                            </>
                        )}
                    </motion.button>

                    {/* Server Dropdown List */}
                    <AnimatePresence>
                        {isServerListOpen && availableServers.length > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-[#2D2D2D] rounded-2xl overflow-hidden shadow-2xl p-1 min-w-[240px]"
                            >
                                <div className="px-3 py-2 text-[10px] text-gray-500 uppercase font-bold tracking-wider border-b border-[#2D2D2D]/50 mb-1">
                                    Available Servers
                                </div>
                                {availableServers.map((srv) => (
                                    <button
                                        key={srv.fullname}
                                        onClick={() => {
                                            selectServer(srv);
                                            setIsServerListOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${selectedServer?.fullname === srv.fullname ? "bg-blue-500/10 border border-blue-500/20" : "hover:bg-[#1a1a1a] border border-transparent"}`}
                                    >
                                        <div className={`p-1.5 rounded-lg ${selectedServer?.fullname === srv.fullname ? "bg-blue-500/20 text-blue-400" : "bg-[#1a1a1a] text-gray-400"}`}>
                                            <Monitor className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold ${selectedServer?.fullname === srv.fullname ? "text-blue-400" : "text-gray-200"}`}>
                                                {srv.txt.device_name || srv.hostname.replace('.local.', '')}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-mono">
                                                {srv.addresses[0]}:{srv.port}
                                            </span>
                                        </div>
                                        {selectedServer?.fullname === srv.fullname && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* --- Background Ambient Effects --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.2, 0.3], x: [0, 100, 0], y: [0, -50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2], x: [0, -100, 0], y: [0, 50, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3"
                />
            </div>

            <LoginCard onSuccess={onLogin} appSubtitle="Stream" />
        </div>
    );
}