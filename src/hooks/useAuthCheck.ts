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
        const timer = setTimeout(() => {
            // Case 1: Dashboard Routes - Require Authentication
            if (pathname?.startsWith('/d')) {
                if (!isAuthenticated) {
                    router.push('/login');
                }
            }
            // Case 2: Login Page - Redirect if already authenticated
            else if (pathname === '/login') {
                if (isAuthenticated) {
                    router.push('/d');
                }
            }
            // Other routes (like /login/info) do not require checks

            setIsChecking(false);
        }, 100);

        return () => clearTimeout(timer);
    }, [isAuthenticated, router, pathname]);

    return { isChecking, isAuthenticated, pathname };
};
