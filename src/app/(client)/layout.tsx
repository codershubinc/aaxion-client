'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import TitleBar from '@/components/TitleBar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAppState();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {

        if (pathname === '/login' || pathname === '/login/info') {
            setIsChecking(false);
            return;
        }

        const timer = setTimeout(() => {
            if (!isAuthenticated) {
                router.push('/login');
            }
            setIsChecking(false);
        }, 100);

        return () => clearTimeout(timer);
    }, [isAuthenticated, router, pathname]);

    if (pathname === '/login' || pathname === '/login/info') {
        return (
            <>
                <div className='h-screen'>
                    <TitleBar />
                    {children}
                </div>
            </>
        );
    }

    if (isChecking && !isAuthenticated) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#121212] text-white">
                <TitleBar />
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-gray-400 text-sm">Validating session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            <TitleBar />
            {children}
        </>
    );
}