import { useState, useEffect, useCallback } from "react";

const RECENT_FILES_KEY = "gown_ted_recent_files";
const RECENT_FOLDERS_KEY = "gown_ted_recent_folders";
const MAX_RECENT = 8;

export function useRecentItems() {
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [recentFolders, setRecentFolders] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedFiles = localStorage.getItem(RECENT_FILES_KEY);
      if (storedFiles) {
        setRecentFiles(JSON.parse(storedFiles));
      }
      const storedFolders = localStorage.getItem(RECENT_FOLDERS_KEY);
      if (storedFolders) {
        setRecentFolders(JSON.parse(storedFolders));
      }
    } catch (e) {
      console.error("Failed to read recent items from localStorage:", e);
    }
  }, []);

  const addRecentFile = useCallback((filePath: string) => {
    if (!filePath) return;
    setRecentFiles((prev) => {
      const filtered = prev.filter((p) => p !== filePath);
      const updated = [filePath, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recent files:", e);
      }
      return updated;
    });
  }, []);

  const addRecentFolder = useCallback((folderPath: string) => {
    if (!folderPath) return;
    setRecentFolders((prev) => {
      const filtered = prev.filter((p) => p !== folderPath);
      const updated = [folderPath, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_FOLDERS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recent folders:", e);
      }
      return updated;
    });
  }, []);

  const clearRecentFiles = useCallback(() => {
    setRecentFiles([]);
    try {
      localStorage.removeItem(RECENT_FILES_KEY);
    } catch (e) {
      console.error("Failed to clear recent files:", e);
    }
  }, []);

  const clearRecentFolders = useCallback(() => {
    setRecentFolders([]);
    try {
      localStorage.removeItem(RECENT_FOLDERS_KEY);
    } catch (e) {
      console.error("Failed to clear recent folders:", e);
    }
  }, []);

  return {
    recentFiles,
    recentFolders,
    addRecentFile,
    addRecentFolder,
    clearRecentFiles,
    clearRecentFolders,
  };
}
