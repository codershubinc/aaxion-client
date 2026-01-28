"use client";

import TitleBar from "@/components/TitleBar";
import { useEffect, useState } from "react";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isTauri, setIsTauri] = useState(false);

    useEffect(() => {
        // Only show TitleBar if running inside Tauri
        if (typeof window !== "undefined" && (window as any).__TAURI__) {
            setIsTauri(true);
        }
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#121212]">
            {/* Custom Desktop TitleBar */}
            {isTauri && <TitleBar />}

            {/* Main App Content */}
            {/* We add pt-10 ONLY if the TitleBar is visible */}
            <main className={`flex-1 overflow-hidden relative ${isTauri ? 'pt-10' : ''}`}>
                {children}
            </main>
        </div>
    );
}