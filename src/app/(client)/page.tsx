'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HardDrive, Tv } from 'lucide-react';
import { useAuthCheck } from '@/hooks/useAuthCheck';

type Tab = 'drive' | 'stream';

export default function HomePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('drive');
    const { isAuthenticated, isChecking } = useAuthCheck();

    useEffect(() => {
        if (isChecking) return;

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
    }, [isAuthenticated, isChecking, router]);

    const handleNavigate = (tab: Tab) => {
        if (tab === 'drive') {
            router.push('/d');
        } else {
            router.push('/streamer');
        }
    };

    if (isChecking) {
        return (
            <div className="h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-xl">
                            A
                        </div>
                        <h1 className="text-4xl font-bold text-white">
                            Aaxion<span className="text-blue-400">Drive</span>
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg mb-6">Choose your experience</p>

                    {/* Tab Navigation */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="inline-flex bg-gray-900/80 backdrop-blur-sm p-1.5 rounded-xl border border-gray-800 shadow-lg">
                            <button
                                onClick={() => setActiveTab('drive')}
                                className={`relative px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${activeTab === 'drive'
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-gray-300'
                                    }`}
                            >
                                {activeTab === 'drive' && (
                                    <span className="absolute inset-0 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30" />
                                )}
                                <span className="relative flex items-center gap-2">
                                    <HardDrive size={18} />
                                    Drive
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('stream')}
                                className={`relative px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${activeTab === 'stream'
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-gray-300'
                                    }`}
                            >
                                {activeTab === 'stream' && (
                                    <span className="absolute inset-0 bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30" />
                                )}
                                <span className="relative flex items-center gap-2">
                                    <Tv size={18} />
                                    Stream
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Card */}
                <div className="relative overflow-hidden rounded-2xl border-2 transition-all duration-300 p-8 bg-gray-900/50 border-gray-800">
                    {activeTab === 'drive' ? (
                        <div className="relative z-10">
                            <div className="flex items-start gap-6 mb-6">
                                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-blue-500/20 shrink-0">
                                    <HardDrive size={32} className="text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        File Manager
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed">
                                        Browse, upload, and manage your files with an intuitive interface.
                                        Instant image previews and easy folder navigation.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    File Explorer
                                </span>
                                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    Upload
                                </span>
                                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Share
                                </span>
                            </div>

                            <button
                                onClick={() => handleNavigate('drive')}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
                            >
                                Launch File Manager
                                <HardDrive size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            <div className="flex items-start gap-6 mb-6">
                                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-purple-500/20 shrink-0">
                                    <Tv size={32} className="text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        Media Streamer
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed">
                                        Your personal media center. Auto-scans for movies and series,
                                        fetches metadata, and controls VLC remotely.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    Movies
                                </span>
                                <span className="text-xs px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                                    Series
                                </span>
                                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    VLC Remote
                                </span>
                            </div>

                            <button
                                onClick={() => handleNavigate('stream')}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 group"
                            >
                                Launch Media Streamer
                                <Tv size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
