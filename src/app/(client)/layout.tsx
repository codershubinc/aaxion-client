'use client';

import TitleBar from '@/components/TitleBar';
import { TitleBarProvider } from '@/context/TitleBarContext';
import { IpProvider } from '@/context/IpContext';
import { useEffect, useState } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isTauri, setIsTauri] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && (
            (window as any).__TAURI__ ||
            (window as any).__TAURI_INTERNALS__
        )) {
            setIsTauri(true);
        }
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