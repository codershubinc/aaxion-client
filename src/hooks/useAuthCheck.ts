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

            if (pathname?.startsWith('/d')) {
                if (!isAuthenticated) {
                    router.push('/login');
                }
            }

            else if (pathname === '/login') {
                if (isAuthenticated) {
                    router.push('/d');
                }
            }


            setIsChecking(false);
        }, 100);

        return () => clearTimeout(timer);
    }, [isAuthenticated, router, pathname]);

    return { isChecking, isAuthenticated, pathname };
};
