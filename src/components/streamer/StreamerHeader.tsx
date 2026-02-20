"use client";

import { useRouter } from "next/navigation";
import { Film, Tv, Plus, LogOut, User, LayoutGrid, ListPlus } from "lucide-react";

type Tab = 'movies' | 'series' | 'add_movie' | 'add_series';

interface StreamerHeaderProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    user?: string;
    onLogout: () => void;
}

export default function StreamerHeader({ activeTab, onTabChange, user, onLogout }: StreamerHeaderProps) {
    const router = useRouter();

    const handleLogout = () => {
        onLogout();
        router.push('/login');
    };

    const tabs = [
        { id: 'movies', label: 'Movies', icon: Film },
        { id: 'series', label: 'Series', icon: Tv },
        { id: 'add_movie', label: 'Add Movie', icon: Plus },
        { id: 'add_series', label: 'Add Series', icon: ListPlus },
    ];

    return (
        <div className="flex items-center gap-4 z-10 pointer-events-auto">
            {/* Tab Navigation */}
            <nav className="flex items-center gap-1 bg-[#0a0a0a]/80 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-lg shadow-black/20">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id as Tab)}
                            className={`
                                relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2 group
                                ${isActive
                                    ? 'bg-zinc-800 text-white shadow-md shadow-black/40 border border-white/5'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            <Icon
                                size={16}
                                className={`transition-transform duration-300 ${isActive ? 'scale-110 text-blue-400' : 'group-hover:scale-110'}`}
                            />
                            <span>{tab.label}</span>

                            {/* Active Glow Effect */}
                            {isActive && (
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3 bg-[#0a0a0a]/80 backdrop-blur-xl py-1.5 px-2 pl-4 rounded-full border border-white/10 shadow-lg shadow-black/20">
                <div className="flex items-center gap-2 text-zinc-400">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                        <User size={12} />
                    </div>
                    <span className="text-xs font-medium pr-2 max-w-[100px] truncate">{user || 'User'}</span>
                </div>

                <div className="w-px h-6 bg-white/10" />

                <button
                    onClick={handleLogout}
                    className="group flex items-center gap-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-full transition-all border border-red-500/10 hover:border-red-500/30 font-medium"
                >
                    <LogOut size={14} className="transition-transform group-hover:-translate-x-0.5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
