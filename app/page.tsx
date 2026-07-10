"use client";

import { useAuth } from "@/hooks/useAuth";
import { useFiles } from "@/hooks/useFiles";
import { AuthScreen } from "@/components/AuthScreen";
import { FileExplorer } from "@/components/FileExplorer";
import { Icons } from "@/components/Icons";

export default function Home() {
  const auth = useAuth();
  const files = useFiles(auth.apiUrl, auth.token);

  // If not authenticated, render login form
  if (!auth.token) {
    return (
      <AuthScreen
        apiUrl={auth.apiUrl}
        authLoading={auth.authLoading}
        authError={auth.authError}
        onLogin={auth.handleLogin}
      />
    );
  }

  // Dashboard with File Explorer
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl shadow-lg border border-indigo-400/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-lg">Aaxion Cloud</span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-zinc-950 border border-zinc-800 py-1.5 px-3 rounded-full text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono max-w-[200px] truncate">{auth.apiUrl}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={auth.handleLogout}
            className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-950/80 border border-red-800/40 hover:border-red-800/80 text-red-300 font-semibold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center"
          >
            <Icons.Logout />
            <span className="ml-1.5">Sign Out</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD CONTENT BODY */}
      <div className="flex flex-1 flex-col">
        <FileExplorer
          apiUrl={auth.apiUrl}
          token={auth.token}
          currentDir={files.currentDir}
          files={files.files}
          filesLoading={files.filesLoading}
          filesError={files.filesError}
          searchQuery={files.searchQuery}
          setSearchQuery={files.setSearchQuery}
          showCreateFolderModal={files.showCreateFolderModal}
          setShowCreateFolderModal={files.setShowCreateFolderModal}
          previewImage={files.previewImage}
          setPreviewImage={files.setPreviewImage}
          fetchDirectory={files.fetchDirectory}
          handleCreateDirectory={files.handleCreateDirectory}
          formatBytes={files.formatBytes}
          isImageFile={files.isImageFile}
          isVideoFile={files.isVideoFile}
        />
      </div>

    </div>
  );
}
