'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FileExplorer from '@/components/explorer/FileExplorer';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import UploadModal from '@/components/UploadModal';
import { useAuthCheck } from '@/hooks/useAuthCheck';

function DashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [currentPath, setCurrentPathState] = useState<string>(searchParams.get('dir') || '/');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { isAuthenticated, isChecking } = useAuthCheck()
    useEffect(() => {
        if (isChecking) <>
            <div>
                loading...
            </div>
        </>

        if (!isAuthenticated && !isChecking) {
            router.push('/login');
            return;
        }
        const dir = searchParams.get('dir');
        if (dir) {
            setCurrentPathState(dir);
        } else {
            setCurrentPathState('/');
        }
    }, [searchParams, isAuthenticated, isChecking, router]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handlePathChange = (path: string) => {
        setCurrentPathState(path);
        const params = new URLSearchParams(searchParams.toString());
        if (path && path !== '/') {
            params.set('dir', path);
        } else {
            params.delete('dir');
        }
        router.push(`/d?${params.toString()}`);
    };

    return (
        <div className="h-screen flex flex-col bg-dark-bg overflow-hidden">
            <TopBar
                onUploadClick={() => setIsUploadModalOpen(true)}
                currentPath={currentPath}
                onRefresh={handleRefresh}
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <Sidebar
                    currentPath={currentPath}
                    onPathChange={handlePathChange}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                <main className="flex-1 overflow-hidden">
                    <FileExplorer
                        currentPath={currentPath}
                        onPathChange={handlePathChange}
                        refreshKey={refreshKey}
                    />
                </main>
            </div>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                currentPath={currentPath}
                onUploadComplete={handleRefresh}
            />
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={<div className="h-screen bg-dark-bg flex items-center justify-center text-dark-text">Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
