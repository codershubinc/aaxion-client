'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppState } from '@/context/AppContext';

export const useAuthCheck = () => {
    const { isAuthenticated } = useAppState();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Skip check for login related pages
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

    return { isChecking, isAuthenticated, pathname };
};
