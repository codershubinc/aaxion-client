"use client";

import React, { useState } from "react";
import { Icons } from "@/components/Icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FileItem {
  name: string;
  is_dir: boolean;
  size: number;
  path: string;
  raw_path: string;
}

interface FileExplorerProps {
  apiUrl: string;
  token: string | null;
  currentDir: string;
  files: FileItem[];
  filesLoading: boolean;
  filesError: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showCreateFolderModal: boolean;
  setShowCreateFolderModal: (show: boolean) => void;
  previewImage: string | null;
  setPreviewImage: (url: string | null) => void;
  fetchDirectory: (dir: string) => Promise<void>;
  handleCreateDirectory: (folderName: string) => Promise<void>;
  formatBytes: (bytes: number) => string;
  isImageFile: (filename: string) => boolean;
  isVideoFile: (filename: string) => boolean;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  apiUrl,
  token,
  currentDir,
  files,
  filesLoading,
  filesError,
  searchQuery,
  setSearchQuery,
  showCreateFolderModal,
  setShowCreateFolderModal,
  previewImage,
  setPreviewImage,
  fetchDirectory,
  handleCreateDirectory,
  formatBytes,
  isImageFile,
  isVideoFile,
}) => {
  const [newFolderName, setNewFolderName] = useState("");
  const [createFolderLoading, setCreateFolderLoading] = useState(false);

  // Path Breadcrumb Navigation
  const navigateToSegment = (index: number) => {
    const segments = currentDir.split("/").filter(Boolean);
    const targetPath = "/" + segments.slice(0, index + 1).join("/");
    fetchDirectory(targetPath);
  };

  // Filter files by search query
  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setCreateFolderLoading(true);
    try {
      await handleCreateDirectory(newFolderName);
      setNewFolderName("");
      setShowCreateFolderModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create folder");
    } finally {
      setCreateFolderLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-6 gap-6 max-w-7xl mx-auto w-full animate-fade-in">
      
      {/* Navigation Breadcrumbs Bar */}
      <div className="flex flex-wrap items-center gap-2 py-3 px-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => fetchDirectory("/")}
          className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          Root
        </button>

        {currentDir.split("/").filter(Boolean).map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <Icons.ChevronRight />
            <button
              onClick={() => navigateToSegment(index)}
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors max-w-[120px] truncate cursor-pointer"
            >
              {segment}
            </button>
          </div>
        ))}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Button
            onClick={() => setShowCreateFolderModal(true)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1 border-0 cursor-pointer h-9 px-3.5"
          >
            <Icons.Plus />
            <span>New Folder</span>
          </Button>
          
          <Button
            onClick={() => fetchDirectory(currentDir)}
            variant="outline"
            size="icon-sm"
            className="text-zinc-400 hover:text-white border-zinc-800 hover:bg-zinc-800 cursor-pointer w-9 h-9 flex items-center justify-center"
            title="Reload directory"
          >
            <Icons.Refresh />
          </Button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icons.Search />
        </div>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files in the current folder..."
          className="block w-full pl-10 pr-4 bg-zinc-900 border border-zinc-800 focus-visible:ring-indigo-500/50 text-sm text-zinc-200 placeholder-zinc-500 h-10 px-3 transition-all"
        />
      </div>

      {/* Main Files Display Panel */}
      <div className="flex-1 flex flex-col min-h-[300px]">
        {filesLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-zinc-800 border-t-indigo-500 rounded-full animate-spin mb-3" />
            <p className="text-xs text-zinc-500 font-medium">Scanning directory contents...</p>
          </div>
        ) : filesError ? (
          <div className="flex-1 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-full text-red-400 mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm">Failed to access folder</h3>
            <p className="text-zinc-500 text-xs mt-1 max-w-sm">{filesError}</p>
            <Button
              onClick={() => fetchDirectory(currentDir)}
              variant="outline"
              size="sm"
              className="mt-4 border-zinc-800 hover:bg-zinc-800 text-zinc-200 h-9"
            >
              Retry
            </Button>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex-1 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="p-3.5 bg-zinc-900 rounded-full mb-3 text-zinc-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-bold text-sm text-zinc-400">Folder is empty</h3>
            <p className="text-zinc-500 text-xs mt-1">This directory doesn&apos;t contain any files or subdirectories.</p>
          </div>
        ) : (
          /* File Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => {
              const isImg = isImageFile(file.name);
              const isVid = isVideoFile(file.name);
              
              const authParam = token ? `?tkn=${token}` : "";
              const thumbUrl = `${apiUrl}/files/thumbnail?path=${encodeURIComponent(file.raw_path)}${authParam ? `&tkn=${token}` : ""}`;
              const viewUrl = `${apiUrl}/files/view-image?path=${encodeURIComponent(file.raw_path)}${authParam ? `&tkn=${token}` : ""}`;
              const downloadUrl = `${apiUrl}/files/download?path=${encodeURIComponent(file.raw_path)}${authParam ? `&tkn=${token}` : ""}`;
              
              return (
                <div
                  key={file.raw_path}
                  onClick={() => {
                    if (file.is_dir) {
                      fetchDirectory(file.raw_path);
                    } else if (isImg) {
                      setPreviewImage(viewUrl);
                    }
                  }}
                  className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex gap-4 items-center group hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all cursor-pointer relative"
                >
                  {/* Left: Thumbnail/Icon wrapper */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center shrink-0 border border-zinc-800/60 relative">
                    {file.is_dir ? (
                      <Icons.Folder />
                    ) : isImg && token ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : isVid ? (
                      <Icons.Video />
                    ) : (
                      <Icons.File />
                    )}
                  </div>

                  {/* Center: Details */}
                  <div className="flex-1 min-w-0 pr-8">
                    <h4 className="font-semibold text-xs text-zinc-100 truncate group-hover:text-white transition-colors" title={file.name}>
                      {file.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                      {file.is_dir ? "Directory" : formatBytes(file.size)}
                    </p>
                  </div>

                  {/* Hover Action buttons */}
                  {!file.is_dir && (
                    <div className="absolute right-3.5 inset-y-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={downloadUrl}
                        download={file.name}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 hover:text-indigo-400 border border-zinc-700/30 transition-colors flex items-center justify-center w-8 h-8"
                        title="Download file"
                      >
                        <Icons.Download />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- INLINE MODALS --- */}

      {/* Modal: Create Directory */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 relative animate-scale-in">
            <button
              onClick={() => setShowCreateFolderModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <Icons.Close />
            </button>

            <h3 className="text-sm font-bold tracking-tight text-white mb-4">Create New Folder</h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 tracking-wide uppercase block mb-1">Folder Name</label>
                <Input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="block w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs transition-all h-9"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                disabled={createFolderLoading}
                className="w-full h-9 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center border-0 cursor-pointer"
              >
                {createFolderLoading ? "Creating..." : "Create Folder"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Preview Image Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer w-10 h-10 flex items-center justify-center"
            onClick={() => setPreviewImage(null)}
          >
            <Icons.Close />
          </button>
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-zinc-800/40 cursor-default animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  );
};
