'use client';

import TitleBar from '@/components/TitleBar';
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
        <>
            {isTauri && <TitleBar />}
            <div className={`pt-${isTauri ? '16' : '0'} h-full bg-none`}>
                {children}
            </div>
        </>
    );
}