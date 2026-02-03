"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function TitleBar() {
    const [appWindow, setAppWindow] = useState<any>(null);

    useEffect(() => {
        import("@tauri-apps/api/window").then((module) => {
            const win = module.getCurrentWindow ? module.getCurrentWindow() : module.Window;
            setAppWindow(win);
        });
    }, []);

    const minimize = () => appWindow?.minimize();
    const toggleMaximize = () => appWindow?.toggleMaximize();
    const close = () => appWindow?.close();

    return (
        <div
            data-tauri-drag-region
            className="h-10 bg-[#121212] flex justify-between items-center z-[100] select-none border-b border-[#2D2D2D] w-full shrink-0"
        >
            <div className="flex items-center gap-2 pl-4 pointer-events-none text-gray-400 text-xs font-bold uppercase tracking-widest">
                Aaxion <span className={`font-cursive text-sm capitalize tracking-normal ml-0.5 text-blue-400`}>Client</span>
            </div>
            <div>
                <Link href="/d" className="pointer-events-auto px-4 py-1.5 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                    <svg width="34" height="10" viewBox="0 0 34 10"><path fill="currentColor" d="M0 0h34v10H0z" /></svg>
                    drive
                </Link>
            </div>
            <div>
                <Link href="/streamer" className="pointer-events-auto px-4 py-1.5 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                    <svg width="34" height="10" viewBox="0 0 34 10"><path fill="currentColor" d="M0 0h34v10H0z" /></svg>
                    stream
                </Link>
            </div>

            <div className="flex h-full">
                <button onClick={minimize} className="w-12 hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors">
                    <svg width="10" height="1" viewBox="0 0 10 1"><path fill="currentColor" d="M0 0h10v1H0z" /></svg>
                </button>
                <button onClick={toggleMaximize} className="w-12 hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors">
                    <svg width="10" height="10" viewBox="0 0 10 10"><path fill="none" stroke="currentColor" d="M1.5 1.5h7v7h-7z" /></svg>
                </button>
                <button onClick={close} className="w-12 hover:bg-red-500 hover:text-white flex items-center justify-center text-gray-400 transition-colors">
                    <svg width="10" height="10" viewBox="0 0 10 10"><path fill="none" stroke="currentColor" d="M1 1l8 8m0-8l-8 8" /></svg>
                </button>
            </div>
        </div>
    );
}