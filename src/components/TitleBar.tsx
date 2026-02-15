"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Minus, Square, Copy, X, HardDrive, Film } from "lucide-react";

export default function TitleBar() {
    const [appWindow, setAppWindow] = useState<any>(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Dynamically import Tauri APIs to prevent SSR issues
        import("@tauri-apps/api/window").then((module) => {
            // Use Tauri v2 getCurrentWindow API
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
                if (unlisten) unlisten.then((f: any) => f());
            }
        });
    }, []);

    const minimize = () => appWindow?.minimize();

    const toggleMaximize = async () => {
        if (!appWindow) return;
        await appWindow.toggleMaximize();
        setIsMaximized(!isMaximized); // Optimistic update
    };

    const close = () => appWindow?.close();

    // Helper for active link styling
    const getLinkStyles = (path: string) => {
        const isActive = pathname === path;
        return `pointer-events-auto px-4 py-1.5 text-sm font-medium rounded-xl transition-all duration-150 flex items-center gap-2 group ${isActive
            ? "bg-white/15 text-white shadow-lg shadow-black/30"
            : "text-gray-400 hover:text-white hover:bg-white/10"
            }`;
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] px-3 pt-3 pointer-events-none">
            <div
                data-tauri-drag-region
                className="h-11 backdrop-blur-2xl bg-black/30 border border-white/5 rounded-2xl shadow-2xl shadow-black/50 flex justify-between items-center select-none pointer-events-auto overflow-hidden relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/[0.03] before:to-transparent before:pointer-events-none"
            >
                {/* Left: Logo & App Name */}
                <div className="flex items-center gap-3 pl-4 pointer-events-none z-10" data-tauri-drag-region>
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-white font-bold text-[10px]">A</span>
                    </div>
                    <span className="text-white/90 text-sm font-semibold tracking-tight">
                        Aaxion
                    </span>
                </div>

                {/* Center: Navigation */}
                {/* Note: We explicitly stop propagation on clicks here if needed, 
                    but pointer-events-auto usually overrides drag-region nicely on Windows */}
                <div className="flex items-center gap-1 z-10">
                    <Link href="/d" className={getLinkStyles("/d")}>
                        <HardDrive className="w-4 h-4" />
                        <span>Drive</span>
                    </Link>
                    <Link href="/streamer" className={getLinkStyles("/streamer")}>
                        <Film className="w-4 h-4" />
                        <span>Stream</span>
                    </Link>
                </div>

                {/* Right: Window Controls */}
                <div className="flex items-center h-full z-10">
                    <button
                        onClick={minimize}
                        className="w-11 h-full hover:bg-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-150 border-l border-white/5"
                        aria-label="Minimize"
                    >
                        <Minus className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={toggleMaximize}
                        className="w-11 h-full hover:bg-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-150"
                        aria-label={isMaximized ? "Restore" : "Maximize"}
                    >
                        {isMaximized ? (
                            <Copy className="w-3.5 h-3.5 rotate-180" strokeWidth={2.5} />
                        ) : (
                            <Square className="w-3.5 h-3.5" strokeWidth={2.5} />
                        )}
                    </button>
                    <button
                        onClick={close}
                        className="w-11 h-full hover:bg-red-500/90 hover:text-white flex items-center justify-center text-gray-400 transition-all duration-150"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
}