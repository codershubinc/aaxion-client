'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FileExplorer from '@/components/explorer/FileExplorer';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import UploadModal from '@/components/upload/UploadModal';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useDropzone } from 'react-dropzone';

function DashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [currentPath, setCurrentPathState] = useState<string>(searchParams.get('dir') || '/');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [droppedFiles, setDroppedFiles] = useState<File[] | null>(null);
    const { isAuthenticated, isChecking } = useAuthCheck()

    // Global dropzone for the dashboard
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        noClick: true,
        noKeyboard: true,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                setDroppedFiles(acceptedFiles);
                setIsUploadModalOpen(true);
            }
        }
    });
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
        setIsUploadModalOpen(false);

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
        <div {...getRootProps()} className="h-full flex flex-col overflow-hidden outline-none relative">
            <input {...getInputProps()} />

            {/* Global Drag Overlay */}
            {isDragActive && !isUploadModalOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
                    <div className="bg-dark-surface border border-accent-blue rounded-xl p-8 flex flex-col items-center shadow-2xl">
                        <div className="p-4 bg-accent-blue/20 rounded-full mb-4">
                            <svg className="w-10 h-10 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-dark-text">Release to Upload</h3>
                        <p className="text-sm text-dark-muted mt-2">Files will be uploaded to {currentPath === '/' ? 'root directory' : currentPath}</p>
                    </div>
                </div>
            )}

            <TopBar
                onUploadClick={() => {
                    console.log("upload Model state", isUploadModalOpen)
                    setIsUploadModalOpen(true)
                }}
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
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setDroppedFiles(null);
                }}
                currentPath={currentPath}
                onUploadComplete={handleRefresh}
                initialFiles={droppedFiles || undefined}
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
