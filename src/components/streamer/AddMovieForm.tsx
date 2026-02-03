"use client";
import { useState } from 'react';
import { API_BASE, getToken } from '@/lib/api';
import { Upload, Loader2, Search } from 'lucide-react';
import { uploadFile, getSystemRootPath } from '@/services';
import { formatFileSize } from '@/utils/fileUtils';

const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY || 'get_your_dont_look_here';

interface AddMovieFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AddMovieForm({ onSuccess, onCancel }: AddMovieFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState(0);

    const [formTitle, setFormTitle] = useState('');
    const [formPoster, setFormPoster] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!formTitle) return alert("Please enter a title first");
        setIsSearching(true);
        try {
            const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(formTitle)}`);
            const data = await res.json();

            if (data.Response === 'True') {
                setFormTitle(data.Title);
                setFormDesc(data.Plot);
                setFormPoster(data.Poster !== 'N/A' ? data.Poster : '');
            } else {
                alert("No movie found");
            }
        } catch (e) {
            alert("Failed to fetch metadata. Check API Key.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setUploadProgress(0);
        setUploadSpeed(0);

        const formData = new FormData(e.currentTarget);
        const file = formData.get('file') as File;
        const token = getToken();

        try {
            // 1. Get Root Path from backend
            const root_path = await getSystemRootPath();

            // 2. Upload File
            const targetDir = `${root_path}/.aaxion/movies`;

            await uploadFile(file, targetDir, (progress, speed) => {
                setUploadProgress(progress);
                setUploadSpeed(speed || 0);
            });

            // 3. Add Metadata to DB
            const metaData = {
                title: formData.get('title'),
                file_id: 0,
                file_path: `${targetDir}/${file.name}`,
                description: formData.get('description'),
                poster_path: formData.get('poster_path')
            };

            const dbRes = await fetch(`${API_BASE}/api/movies/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metaData)
            });

            if (!dbRes.ok) throw new Error('Failed to save metadata');

            alert('Movie Added!');
            onSuccess();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] w-full flex items-center justify-center">
            <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    <Upload className="w-6 h-6 text-blue-500" />
                    Add New Movie
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Movie Title</label>
                            <div className="relative flex gap-2">
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-[#2D2D2D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-700"
                                    placeholder="e.g. Inception"
                                />
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="px-4 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-400 rounded-xl transition-colors flex items-center gap-2"
                                    title="Auto-fill from OMDb"
                                >
                                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                    <span className="hidden sm:inline text-sm font-medium">Auto-fill</span>
                                </button>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Movie File</label>
                            <input
                                type="file"
                                name="file"
                                required
                                className="w-full bg-[#0a0a0a] border border-[#2D2D2D] rounded-xl p-2 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 transition-colors cursor-pointer file:cursor-pointer"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Poster URL (Optional)</label>
                            <input
                                type="text"
                                name="poster_path"
                                value={formPoster}
                                onChange={(e) => setFormPoster(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#2D2D2D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-700"
                                placeholder="https://example.com/poster.jpg"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                value={formDesc}
                                onChange={(e) => setFormDesc(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#2D2D2D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-700 resize-none"
                                placeholder="Enter movie description..."
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-8 pt-4 border-t border-gray-800">
                        {loading && (
                            <div className="space-y-1.5 animate-in fade-in duration-300">
                                <div className="flex justify-between text-xs font-medium text-blue-400">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-[#0a0a0a] rounded-full h-2 border border-[#2D2D2D] overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <div className="flex justify-end text-[10px] text-gray-500 font-mono">
                                    {formatFileSize(uploadSpeed)}/s
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3">
                            <button type="button" onClick={onCancel} disabled={loading} className="px-6 py-2.5 text-gray-400 hover:text-white font-medium transition-colors disabled:opacity-50">Cancel</button>
                            <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {loading ? 'Processing...' : 'Save Movie'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}