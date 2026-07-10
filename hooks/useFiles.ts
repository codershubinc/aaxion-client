"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/constants/api";
import { formatBytes, isImageFile, isVideoFile } from "@/utils/file";

interface FileItem {
  name: string;
  is_dir: boolean;
  size: number;
  path: string;
  raw_path: string;
}

export function useFiles(apiUrl: string, token: string | null) {
  const [currentDir, setCurrentDir] = useState<string>("/");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filesLoading, setFilesLoading] = useState<boolean>(false);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCreateFolderModal, setShowCreateFolderModal] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Restore last visited directory
  useEffect(() => {
    const savedDir = localStorage.getItem("aaxion_current_dir");
    if (savedDir) setCurrentDir(savedDir);
  }, []);

  // Fetch folder contents from Go Backend
  const fetchDirectory = useCallback(async (dirPath: string) => {
    if (!token) return;
    setFilesLoading(true);
    setFilesError(null);

    try {
      const res = await fetch(`${apiUrl}${API_ENDPOINTS.FILES.VIEW}?dir=${encodeURIComponent(dirPath)}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to read directory (Status: ${res.status})`);
      }

      const data = await res.json();
      const sorted = (data || []).sort((a: FileItem, b: FileItem) => {
        if (a.is_dir && !b.is_dir) return -1;
        if (!a.is_dir && b.is_dir) return 1;
        return a.name.localeCompare(b.name);
      });

      setFiles(sorted);
      setCurrentDir(dirPath);
      localStorage.setItem("aaxion_current_dir", dirPath);
    } catch (err: any) {
      setFilesError(err.message || "Failed to load directory content.");
    } finally {
      setFilesLoading(false);
    }
  }, [token, apiUrl]);

  // Reload folder contents when token or folder changes
  useEffect(() => {
    if (token) {
      fetchDirectory(currentDir);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentDir, fetchDirectory]);

  // Create Subdirectory
  const handleCreateDirectory = async (folderName: string) => {
    if (!token) return;
    const separator = currentDir.endsWith("/") ? "" : "/";
    const absolutePath = `${currentDir}${separator}${folderName}`;

    const res = await fetch(`${apiUrl}${API_ENDPOINTS.FILES.CREATE_DIR}?path=${encodeURIComponent(absolutePath)}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error("Could not create directory.");
    }

    fetchDirectory(currentDir);
  };

  return {
    currentDir,
    setCurrentDir,
    files,
    setFiles,
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
  };
}
