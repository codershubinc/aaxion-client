"use client";
import { useEffect, useState } from 'react';
import AuthOverlay from '@/components/streamer/AuthOverlay';
import MovieGrid from '@/components/streamer/movies/MovieGrid';
import AddMovieForm from '@/components/streamer/movies/AddMovieForm';
import SeriesGrid from '@/components/streamer/series/SeriesGrid';
import AddSeriesForm from '@/components/streamer/series/AddSeriesForm';
import SeriesDetail from '@/components/streamer/series/SeriesDetail';
import { launchVlc } from '@/lib/player';
import VlcRemote from '@/components/streamer/handler/VlcRemote';
import { Series } from '@/types';

type Tab = 'movies' | 'series' | 'add_movie' | 'add_series';
type ViewMode = 'grid' | 'player' | 'detail';

export default function StreamerPage() {


    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTabRaw] = useState<Tab>('movies');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const [selectedMovie, setSelectedMovie] = useState<any>(null);
    const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);

    const [refreshKey, setRefreshKey] = useState(0);
    const [user, setUser] = useState('');

    const setActiveTab = (tab: Tab) => {
        setActiveTabRaw(tab);
        setViewMode('grid');
    };

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
        setSelectedSeries(null);
        setViewMode('grid');
    };

    const handleMovieAdded = () => {
        setRefreshKey(prev => prev + 1);
        setActiveTab('movies');
    };

    const handleSeriesAdded = () => {
        setRefreshKey(prev => prev + 1);
        setActiveTab('series');
    };

    const handleMovieSelect = async (movie: any) => {
        setSelectedMovie(movie);
        setViewMode('player');
        try {
            console.log(`Attempting to launch VLC for ID: ${movie.id}`);
            await launchVlc(movie.id, movie.title, 'movie', movie.poster_path);
        } catch (error) {
            console.error("Failed to launch VLC:", error);
        }
    };

    const handleSeriesSelect = (series: Series) => {
        setSelectedSeries(series);
        setViewMode('detail');
    };

    const handleBackToGrid = () => {
        setViewMode('grid');
        setSelectedMovie(null);
        setSelectedSeries(null);
    };

    return (
        <div className="bg-gray-950 text-gray-100 min-h-screen flex flex-col font-sans">
            {!isAuthenticated && <AuthOverlay onLogin={() => setIsAuthenticated(true)} />}

            {/* Header - Show in Grid Mode */}
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
                                onClick={() => setActiveTab('movies')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'movies' ? 'bg-gray-700 text-white shadow shadow-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Movies
                            </button>
                            <button
                                onClick={() => setActiveTab('series')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'series' ? 'bg-gray-700 text-white shadow shadow-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Series
                            </button>
                            <button
                                onClick={() => setActiveTab('add_movie')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'add_movie' ? 'bg-gray-700 text-white shadow shadow-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Add Movie
                            </button>
                            <button
                                onClick={() => setActiveTab('add_series')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'add_series' ? 'bg-gray-700 text-white shadow shadow-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Add Series
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
                    <>
                        {activeTab === 'movies' && viewMode === 'grid' && (
                            <MovieGrid onSelect={handleMovieSelect} refreshTrigger={refreshKey} />
                        )}
                        {activeTab === 'movies' && viewMode === 'player' && selectedMovie && (
                            <VlcRemote movie={selectedMovie} onBack={handleBackToGrid} />
                        )}

                        {activeTab === 'series' && viewMode === 'grid' && (
                            <SeriesGrid onSelect={handleSeriesSelect} refreshTrigger={refreshKey} />
                        )}
                        {activeTab === 'series' && viewMode === 'detail' && selectedSeries && (
                            <SeriesDetail series={selectedSeries} onBack={handleBackToGrid} />
                        )}

                        {activeTab === 'add_movie' && (
                            <div className="max-w-4xl mx-auto">
                                <AddMovieForm onSuccess={handleMovieAdded} onCancel={() => setActiveTab('movies')} />
                            </div>
                        )}

                        {activeTab === 'add_series' && (
                            <div className="max-w-4xl mx-auto">
                                <AddSeriesForm onSuccess={handleSeriesAdded} onCancel={() => setActiveTab('series')} />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
