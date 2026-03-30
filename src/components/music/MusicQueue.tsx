import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, GripVertical } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';
import { getToken } from '@/services';
import { STORAGE_KEYS } from '@/constants/storage';

interface MusicQueueProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const MusicQueue: React.FC<MusicQueueProps> = ({ isOpen, setIsOpen }) => {
    const { tracks, currentTrack, isPlaying, playTrack, togglePlay } = useMusic();
    const serverUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SERVER_URL) : null;
    const currentRef = useRef<HTMLDivElement>(null);

    // Scroll to current track when opened
    useEffect(() => {
        if (isOpen && currentRef.current) {
            currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 z-[10000] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#121212]/95 backdrop-blur-3xl border-l border-white/10 z-[10001] flex flex-col shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-white">Queue</h3>
                                <p className="text-sm text-gray-400">{tracks.length} tracks</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {tracks.map((track, i) => {
                                const isCurrent = currentTrack?.id === track.id;
                                const imageUrl = track.imagePath ? `${serverUrl}/files/view-image?path=${encodeURIComponent(track.imagePath)}&tkn=${getToken()}` : null;

                                return (
                                    <div
                                        key={track.id}
                                        ref={isCurrent ? currentRef : null}
                                        onClick={() => {
                                            if (isCurrent) {
                                                togglePlay();
                                            } else {
                                                playTrack(track);
                                            }
                                        }}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer group transition-colors ${isCurrent ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5 transparent border border-transparent'}`}
                                    >
                                        <div className="relative w-12 h-12 bg-gray-800 rounded-md overflow-hidden shrink-0 shadow-md">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt="" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500">♪</div>
                                            )}

                                            <div className={`absolute inset-0 flex items-center justify-center ${isCurrent || 'opacity-0 group-hover:opacity-100'}`}>
                                                {isCurrent && isPlaying ? (
                                                    <Pause className="w-5 h-5 text-blue-400 drop-shadow-md" />
                                                ) : (
                                                    <Play className={`w-5 h-5 ${isCurrent ? 'text-blue-400' : 'text-white'} ml-0.5 drop-shadow-md`} />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-blue-400' : 'text-white group-hover:text-blue-200'}`}>
                                                {track.title}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">
                                                {track.artist}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}