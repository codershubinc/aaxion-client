"use client";

import { useRouter } from "next/navigation";

type Tab = 'movies' | 'series' | 'add_movie' | 'add_series';

interface StreamerHeaderProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    user: string;
    onLogout: () => void;
}

export default function StreamerHeader({ activeTab, onTabChange, user, onLogout }: StreamerHeaderProps) {
    const router = useRouter();

    const handleLogout = () => {
        onLogout();
        router.push('/login');
    };

    return (
        <div className="flex items-center gap-4 z-10 pointer-events-auto">
            {/* Tab Navigation */}
            <nav className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                <button
                    onClick={() => onTabChange('movies')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'movies'
                            ? 'bg-white/15 text-white shadow shadow-black/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    Movies
                </button>
                <button
                    onClick={() => onTabChange('series')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'series'
                            ? 'bg-white/15 text-white shadow shadow-black/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    Series
                </button>
                <button
                    onClick={() => onTabChange('add_movie')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'add_movie'
                            ? 'bg-white/15 text-white shadow shadow-black/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    Add Movie
                </button>
                <button
                    onClick={() => onTabChange('add_series')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'add_series'
                            ? 'bg-white/15 text-white shadow shadow-black/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    Add Series
                </button>
            </nav>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                <span className="text-xs text-gray-400 font-medium">{user}</span>
                <button
                    onClick={handleLogout}
                    className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg transition-all border border-red-500/20 font-medium"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
