"use client";
import { useEffect, useState } from 'react';
import AuthOverlay from '@/components/streamer/AuthOverlay';
import MovieGrid from '@/components/streamer/MovieGrid';
import AddMovieForm from '@/components/streamer/AddMovieForm';
import { launchVlc } from '@/lib/player';
import VlcRemote from '@/components/streamer/VlcRemote';

export default function StreamerPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState<'stream' | 'add'>('stream');
    const [viewMode, setViewMode] = useState<'grid' | 'player'>('grid');
    const [selectedMovie, setSelectedMovie] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [user, setUser] = useState('');


    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const username = localStorage.getItem('aaxion_user');
        if (token) {
            setIsAuthenticated(true);
            if (username) setUser(username);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setSelectedMovie(null);
        setViewMode('grid');
    };

    const handleMovieAdded = () => {
        setRefreshKey(prev => prev + 1);
        setActiveTab('stream');
    };

    const handleMovieSelect = async (movie: any) => {
        setSelectedMovie(movie);
        setViewMode('player');

        // This triggers the Shell Command we defined in lib/player.ts
        try {
            console.log(`Attempting to launch VLC for ID: ${movie.id}`);
            await launchVlc(movie.id, movie.title);
        } catch (error) {
            console.error("Failed to launch VLC:", error);
        }
    };

    const handleBackToGrid = () => {
        setViewMode('grid');
    };

    return (
        <div className="bg-gray-950 text-gray-100 min-h-screen flex flex-col font-sans">
            {!isAuthenticated && <AuthOverlay onLogin={() => setIsAuthenticated(true)} />}

            {/* Header - Only show in Grid Mode or Add Mode */}
            {viewMode === 'grid' && (
                <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                                A
                            </div>
                            <span className="text-xl font-bold text-white">Aaxion<span className={`text-blue-400 font-cursive text-2xl ml-1`}>Stream</span></span>
                        </div>

                        <nav className="hidden md:flex bg-gray-800 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('stream')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'stream' ? 'bg-gray-700 text-white shadow shadow-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Watch
                            </button>
                            <button
                                onClick={() => setActiveTab('add')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'add' ? 'bg-gray-700 text-white shadow shadow-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Add Movie
                            </button>
                        </nav>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">{user}</span>
                            <button onClick={handleLogout} className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>
                </header>
            )}

            {/* Content */}
            <main className={`flex-1 ${viewMode === 'grid' ? 'container mx-auto px-4 py-6' : 'h-screen w-full overflow-hidden'}`}>
                {isAuthenticated && (
                    activeTab === 'stream' ? (
                        viewMode === 'grid' ? (
                            <MovieGrid
                                onSelect={handleMovieSelect}
                                refreshTrigger={refreshKey}
                            />
                        ) : (
                            <VlcRemote
                                movie={selectedMovie}
                                onBack={handleBackToGrid}
                            />
                        )
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <AddMovieForm
                                onSuccess={handleMovieAdded}
                                onCancel={() => setActiveTab('stream')}
                            />
                        </div>
                    )
                )}
            </main>
        </div>
    );
}
