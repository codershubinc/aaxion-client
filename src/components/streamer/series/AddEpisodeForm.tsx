"use client";
import { useState } from 'react';
import { addEpisode } from '@/services/seriesService';
import { Loader2, Upload, X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/utils/fileUtils';

interface AddEpisodeFormProps {
    seriesId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

interface EpisodeDraft {
    id: string;
    season: number;
    episode: number;
    title: string;
    description: string;
    file: File | null;
    status: 'idle' | 'uploading' | 'success' | 'error';
    progress: number;
    speed: number;
    errorMsg?: string;
}

export default function AddEpisodeForm({ seriesId, onSuccess, onCancel }: AddEpisodeFormProps) {
    const [drafts, setDrafts] = useState<EpisodeDraft[]>([
        { id: Math.random().toString(36).substr(2, 9), season: 1, episode: 1, title: '', description: '', file: null, status: 'idle', progress: 0, speed: 0 }
    ]);
    const [isprocessing, setIsprocessing] = useState(false);
    const [hasUploaded, setHasUploaded] = useState(false);

    const addDraft = () => {
        setDrafts(prev => {
            const last = prev[prev.length - 1];
            return [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                season: last ? last.season : 1,
                episode: last ? last.episode + 1 : 1,
                title: '',
                description: '',
                file: null,
                status: 'idle',
                progress: 0,
                speed: 0
            }];
        });
    };

    const removeDraft = (id: string) => {
        setDrafts(prev => prev.filter(d => d.id !== id));
    };

    const updateDraft = (id: string, updates: Partial<EpisodeDraft>) => {
        setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    };

    const handleUploadAll = async () => {
        setIsprocessing(true);
        let anySuccess = false;

        for (const draft of drafts) {
            if (draft.status === 'success' || !draft.file) continue;

            updateDraft(draft.id, { status: 'uploading', progress: 0, speed: 0 });

            try {
                await addEpisode(draft.file, {
                    series_id: seriesId,
                    season_number: draft.season,
                    episode_number: draft.episode,
                    title: draft.title || `Episode ${draft.episode}`,
                    description: draft.description
                }, (progress, speed) => {
                    updateDraft(draft.id, { progress, speed: speed || 0 });
                });

                updateDraft(draft.id, { status: 'success' });
                anySuccess = true;
                setHasUploaded(true);
            } catch (error: any) {
                console.error(error);
                updateDraft(draft.id, { status: 'error', errorMsg: error.message });
            }
        }
        setIsprocessing(false);
        if (anySuccess) {
            // Optional: Auto close if all success? 
            // Better to let user see the results.
        }
    };

    const handleClose = () => {
        if (hasUploaded) {
            onSuccess(); // Refresh parent
        } else {
            onCancel();
        }
    };

    const validDraftsCount = drafts.filter(d => d.file).length;
    const allCompleted = drafts.length > 0 && drafts.every(d => d.status === 'success');

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-purple-400" />
                    Upload Episodes
                </h3>
                <button onClick={handleClose} className="text-gray-500 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {drafts.map((draft, index) => (
                    <div key={draft.id} className="bg-[#0a0a0a] border border-[#2D2D2D] rounded-lg p-4 relative group">
                        {drafts.length > 1 && draft.status === 'idle' && (
                            <button
                                onClick={() => removeDraft(draft.id)}
                                className="absolute top-4 right-4 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}

                        <div className="grid grid-cols-12 gap-4">
                            {/* Season/Ep Inputs */}
                            <div className="col-span-2">
                                <label className="block text-[10px] font-medium text-gray-500 mb-1">Season</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={draft.season}
                                    disabled={draft.status !== 'idle'}
                                    onChange={(e) => updateDraft(draft.id, { season: parseInt(e.target.value) })}
                                    className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-sm text-white focus:border-purple-500/50 outline-none"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-medium text-gray-500 mb-1">Episode</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={draft.episode}
                                    disabled={draft.status !== 'idle'}
                                    onChange={(e) => updateDraft(draft.id, { episode: parseInt(e.target.value) })}
                                    className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-sm text-white focus:border-purple-500/50 outline-none"
                                />
                            </div>

                            {/* Title/File */}
                            <div className="col-span-8 space-y-3">
                                <input
                                    type="text"
                                    placeholder="Episode Title (Optional)"
                                    value={draft.title}
                                    disabled={draft.status !== 'idle'}
                                    onChange={(e) => updateDraft(draft.id, { title: e.target.value })}
                                    className="w-full bg-transparent border-b border-gray-800 focus:border-purple-500/50 px-0 py-1 text-sm text-white outline-none"
                                />

                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        id={`file-${draft.id}`}
                                        disabled={draft.status !== 'idle'}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            updateDraft(draft.id, { file });
                                        }}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor={`file-${draft.id}`}
                                        className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded text-xs cursor-pointer transition-colors border ${draft.file
                                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                                            } ${draft.status !== 'idle' ? 'pointer-events-none opacity-60' : ''}`}
                                    >
                                        <div className="truncate max-w-[200px]">
                                            {draft.file ? draft.file.name : 'Select Video File...'}
                                        </div>
                                    </label>

                                    {/* Status Indicators */}
                                    <div className="w-24 shrink-0 flex justify-end">
                                        {draft.status === 'success' && (
                                            <span className="flex items-center gap-1 text-xs text-green-400">
                                                <CheckCircle2 className="w-3 h-3" /> Done
                                            </span>
                                        )}
                                        {draft.status === 'error' && (
                                            <span className="flex items-center gap-1 text-xs text-red-400" title={draft.errorMsg}>
                                                <AlertCircle className="w-3 h-3" /> Error
                                            </span>
                                        )}
                                        {draft.status === 'uploading' && (
                                            <span className="text-xs text-purple-400 animate-pulse">
                                                {draft.progress}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {draft.status === 'uploading' && (
                            <div className="mt-3">
                                <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                                    <div
                                        className="bg-purple-500 h-full transition-all duration-300"
                                        style={{ width: `${draft.progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-end mt-1">
                                    <span className="text-[10px] text-gray-500">{formatFileSize(draft.speed)}/s</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <button
                    onClick={addDraft}
                    disabled={isprocessing}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    Add Another Episode
                </button>

                <div className="flex gap-3">
                    {allCompleted ? (
                        <button
                            onClick={handleClose}
                            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg shadow-green-500/20"
                        >
                            Finish
                        </button>
                    ) : (
                        <button
                            onClick={handleUploadAll}
                            disabled={isprocessing || validDraftsCount === 0}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isprocessing && <Loader2 className="w-3 h-3 animate-spin" />}
                            {isprocessing ? 'Uploading...' : `Upload ${validDraftsCount} Episodes`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
