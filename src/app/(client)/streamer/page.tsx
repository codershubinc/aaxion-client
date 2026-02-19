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
import StreamerHeader from '@/components/streamer/StreamerHeader';
import { useTitleBar } from '@/context/TitleBarContext';
import { Series } from '@/types';
import { useIp } from '@/hooks/useIp';
import GetServerIp from '@/utils/getServerIp';

type Tab = 'movies' | 'series' | 'add_movie' | 'add_series';
type ViewMode = 'grid' | 'player' | 'detail';

export default function StreamerPage() {
    const { setContent } = useTitleBar();
    const { currentServerUrl } = useIp();
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

    // Update TitleBar content based on view mode
    useEffect(() => {
        if (isAuthenticated && viewMode === 'grid') {
            setContent(
                <StreamerHeader
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    user={user}
                    onLogout={handleLogout}
                />
            );
        } else {
            setContent(null);
        }

        return () => {
            setContent(null);
        };
    }, [isAuthenticated, viewMode, activeTab, user, setContent]);

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
            await launchVlc(movie.id, movie.title, 'movie', movie.poster_path, currentServerUrl || "");
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

    console.log("JUST A INFO OF SERVERS", GetServerIp());

    return (
        <div className="bg-gray-950 text-gray-100 min-h-screen flex flex-col font-sans">
            {!isAuthenticated && <AuthOverlay onLogin={() => setIsAuthenticated(true)} />}

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
