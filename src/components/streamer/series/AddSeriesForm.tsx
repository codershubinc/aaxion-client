"use client";
import { useState } from 'react';
import { addSeries } from '@/services';
import { Loader2, Plus, X, Search } from 'lucide-react';

const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY || 'get_your_dont_look_here';

interface AddSeriesFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AddSeriesForm({ onSuccess, onCancel }: AddSeriesFormProps) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [posterPath, setPosterPath] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!title) return alert("Please enter a title first");
        setIsSearching(true);
        try {
            const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&type=series`);
            const data = await res.json();

            if (data.Response === 'True') {
                setTitle(data.Title);
                setDescription(data.Plot);
                setPosterPath(data.Poster !== 'N/A' ? data.Poster : '');
            } else {
                alert("No series found");
            }
        } catch (e) {
            alert("Failed to fetch metadata. Check API Key.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addSeries({
                title,
                description,
                poster_path: posterPath
            });

            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Error creating series');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl relative">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    <Plus className="w-6 h-6 text-purple-500" />
                    New Series
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Series Title</label>
                        <div className="relative flex gap-2">
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#2D2D2D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-gray-700"
                                placeholder="e.g. Breaking Bad"
                            />
                            <button
                                type="button"
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="px-4 bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 text-purple-400 rounded-xl transition-colors flex items-center gap-2"
                                title="Auto-fill from OMDb"
                            >
                                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Poster URL (Optional)</label>
                        <input
                            type="text"
                            value={posterPath}
                            onChange={(e) => setPosterPath(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#2D2D2D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-gray-700"
                            placeholder="https://example.com/poster.jpg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                        <textarea
                            required
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#2D2D2D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-gray-700 resize-none"
                            placeholder="Brief synopsis..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Creating...' : 'Create Series'}
                    </button>
                </form>
            </div>
        </div>
    );
}
