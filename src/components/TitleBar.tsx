"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Minus, Square, Copy, X, HardDrive, Film, Server } from "lucide-react";
import { useTitleBar } from "@/context/TitleBarContext";
import { useIp } from "@/hooks/useIp";

export default function TitleBar() {
    const { content } = useTitleBar();
    const { currentSelectedIp, currentServerName, isConnected } = useIp();
    const [appWindow, setAppWindow] = useState<any>(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Dynamically import Tauri APIs to prevent SSR issues
        import("@tauri-apps/api/window").then((module) => {
            // Use Tauri v2 getCurrentWindow API
            // @ts-ignore
            const win = module.getCurrentWindow();
            setAppWindow(win);

            // Check initial state
            win?.isMaximized().then(setIsMaximized);

            // Set up resize listener to update icon state
            const unlisten = win?.onResized && win.onResized(async () => {
                const max = await win.isMaximized();
                setIsMaximized(max);
            });

            return () => {
                // @ts-ignore
                if (unlisten) unlisten.then((f: any) => f());
            }
        });
    }, []);

    const minimize = () => appWindow?.minimize();

    const toggleMaximize = async () => {
        if (!appWindow) return;
        await appWindow.toggleMaximize();
        // Check state again after toggle
        const max = await appWindow.isMaximized();
        setIsMaximized(max);
    };

    const close = () => appWindow?.close();

    const getLinkStyles = (path: string) => {
        const isActive = pathname === path || (path !== '/' && pathname?.startsWith(path));
        return `relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2 group ${isActive
            ? "bg-white/10 text-white shadow-inner border border-white/5"
            : "text-gray-400 hover:text-white hover:bg-white/5"
            }`;
    };

    return (
        <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4">
            <div
                data-tauri-drag-region
                className="w-full max-w-5xl h-12 backdrop-blur-xl bg-[#0a0a0a]/80 border border-white/10 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex justify-between items-center select-none pointer-events-auto relative overflow-hidden"
            >
                {/* Left: Logo & App Name */}
                <div className="flex items-center h-full pl-4 pr-6" data-tauri-drag-region>
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow duration-300">
                            <span className="text-white font-bold text-[10px]">A</span>
                        </div>
                        <span className="text-white/90 text-sm font-semibold tracking-tight group-hover:text-white transition-colors">
                            Aaxion
                        </span>
                    </Link>
                </div>

                {/* Center: Navigation */}
                <div className="hidden md:flex items-center gap-1 justify-center flex-1 mx-4">
                    {content || (
                        <>
                            <Link href="/d" className={getLinkStyles("/d")}>
                                <HardDrive className="w-3.5 h-3.5" />
                                <span>Drive</span>
                            </Link>
                            <Link href="/streamer" className={getLinkStyles("/streamer")}>
                                <Film className="w-3.5 h-3.5" />
                                <span>Stream</span>
                            </Link>
                        </>
                    )}
                </div>

                {/* Right: Server Info & Window Controls */}
                <div className="flex items-center gap-4 h-full pr-2">
                    {/* Server Info */}
                    {isConnected && (
                        <div className="hidden sm:flex items-center gap-3 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">
                                    {currentServerName || 'Unknown'}
                                </span>
                                <span className="text-[9px] text-gray-600 font-mono leading-none">
                                    {currentSelectedIp}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Window Controls */}
                    <div className="flex items-center gap-1.5 h-full pl-2 border-l border-white/5">
                        <button
                            onClick={minimize}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                            aria-label="Minimize"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={toggleMaximize}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                            aria-label={isMaximized ? "Restore" : "Maximize"}
                        >
                            {isMaximized ? (
                                <Copy className="w-3.5 h-3.5 rotate-180" />
                            ) : (
                                <Square className="w-3.5 h-3.5" />
                            )}
                        </button>
                        <button
                            onClick={close}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/20 transition-all duration-200"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}