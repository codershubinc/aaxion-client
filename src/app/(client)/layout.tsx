'use client';

import TitleBar from '@/components/TitleBar';
import { TitleBarProvider } from '@/context/TitleBarContext';
import { IpProvider } from '@/context/IpContext';
import { useEffect, useState } from 'react';
import { useDiscovery } from '@/hooks/useDiscovery';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isTauri, setIsTauri] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && (
            (window as any).__TAURI__ ||
            (window as any).__TAURI_INTERNALS__
        )) {
            setIsTauri(true);
        }

        // Prevent default browser behavior for drag and drop to avoid Tauri navigating to dropped files
        const preventDefault = (e: DragEvent) => {
            e.preventDefault();
        };
        window.addEventListener('dragover', preventDefault, false);
        window.addEventListener('drop', preventDefault, false);

        return () => {
            window.removeEventListener('dragover', preventDefault, false);
            window.removeEventListener('drop', preventDefault, false);
        };
    }, []);

    return (
        <IpProvider>
            <TitleBarProvider>
                {isTauri && <TitleBar />}
                <div className={isTauri ? 'pt-24 h-full bg-transparent' : 'h-full bg-transparent'}>
                    {children}
                </div>
            </TitleBarProvider>
        </IpProvider>
    );
}