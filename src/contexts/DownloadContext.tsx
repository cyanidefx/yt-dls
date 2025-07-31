import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { Download, DownloadOptions, DownloadStatus, VideoInfo, DownloadProgress } from '@/types';

interface DownloadContextType {
  downloads: Download[];
  activeDownloads: Download[];
  completedDownloads: Download[];
  failedDownloads: Download[];
  totalProgress: number;
  isDownloading: boolean;
  addDownload: (options: DownloadOptions, videoInfo?: VideoInfo) => Promise<string>;
  removeDownload: (id: string) => void;
  pauseDownload: (id: string) => Promise<void>;
  resumeDownload: (id: string) => Promise<void>;
  cancelDownload: (id: string) => Promise<void>;
  retryDownload: (id: string) => Promise<void>;
  clearCompleted: () => void;
  clearFailed: () => void;
  clearAll: () => void;
  pauseAll: () => Promise<void>;
  resumeAll: () => Promise<void>;
  getDownloadById: (id: string) => Download | undefined;
}

type DownloadAction =
  | { type: 'ADD_DOWNLOAD'; payload: Download }
  | { type: 'UPDATE_DOWNLOAD'; payload: { id: string; updates: Partial<Download> } }
  | { type: 'REMOVE_DOWNLOAD'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: DownloadProgress }
  | { type: 'SET_STATUS'; payload: { id: string; status: DownloadStatus; error?: string } }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'CLEAR_FAILED' }
  | { type: 'CLEAR_ALL' };

function downloadReducer(state: Download[], action: DownloadAction): Download[] {
  switch (action.type) {
    case 'ADD_DOWNLOAD':
      return [...state, action.payload];
    
    case 'UPDATE_DOWNLOAD':
      return state.map(download =>
        download.id === action.payload.id
          ? { ...download, ...action.payload.updates }
          : download
      );
    
    case 'REMOVE_DOWNLOAD':
      return state.filter(download => download.id !== action.payload);
    
    case 'UPDATE_PROGRESS':
      return state.map(download =>
        download.id === action.payload.downloadId
          ? {
              ...download,
              progress: action.payload.progress,
              speed: action.payload.speed,
              eta: action.payload.eta,
              size: action.payload.size,
              downloadedBytes: action.payload.downloadedBytes,
              totalBytes: action.payload.totalBytes,
            }
          : download
      );
    
    case 'SET_STATUS':
      return state.map(download =>
        download.id === action.payload.id
          ? {
              ...download,
              status: action.payload.status,
              error: action.payload.error,
              endTime: action.payload.status === DownloadStatus.COMPLETED ? new Date() : download.endTime,
            }
          : download
      );
    
    case 'CLEAR_COMPLETED':
      return state.filter(download => download.status !== DownloadStatus.COMPLETED);
    
    case 'CLEAR_FAILED':
      return state.filter(download => download.status !== DownloadStatus.FAILED);
    
    case 'CLEAR_ALL':
      return state.filter(download => 
        download.status === DownloadStatus.DOWNLOADING || 
        download.status === DownloadStatus.PENDING
      );
    
    default:
      return state;
  }
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [downloads, dispatch] = useReducer(downloadReducer, []);

  // Computed values
  const activeDownloads = downloads.filter(
    d => d.status === DownloadStatus.DOWNLOADING || d.status === DownloadStatus.PENDING
  );
  
  const completedDownloads = downloads.filter(
    d => d.status === DownloadStatus.COMPLETED
  );
  
  const failedDownloads = downloads.filter(
    d => d.status === DownloadStatus.FAILED
  );

  const totalProgress = activeDownloads.length > 0 
    ? activeDownloads.reduce((sum, d) => sum + d.progress, 0) / activeDownloads.length
    : 0;

  const isDownloading = activeDownloads.length > 0;

  // Event handlers
  useEffect(() => {
    if (!window.electronAPI) return;

    const handleDownloadProgress = (data: DownloadProgress) => {
      dispatch({ type: 'UPDATE_PROGRESS', payload: data });
    };

    const handleDownloadComplete = ({ downloadId }: { downloadId: string }) => {
      dispatch({ 
        type: 'SET_STATUS', 
        payload: { id: downloadId, status: DownloadStatus.COMPLETED } 
      });
    };

    const handleDownloadError = ({ downloadId, error }: { downloadId: string; error: string }) => {
      dispatch({ 
        type: 'SET_STATUS', 
        payload: { id: downloadId, status: DownloadStatus.FAILED, error } 
      });
    };

    const handleDownloadFailed = ({ downloadId }: { downloadId: string }) => {
      dispatch({ 
        type: 'SET_STATUS', 
        payload: { id: downloadId, status: DownloadStatus.FAILED } 
      });
    };

    // Set up event listeners
    window.electronAPI.onDownloadProgress(handleDownloadProgress);
    window.electronAPI.onDownloadComplete(handleDownloadComplete);
    window.electronAPI.onDownloadError(handleDownloadError);
    window.electronAPI.onDownloadFailed(handleDownloadFailed);

    return () => {
      window.electronAPI.removeAllListeners('download-progress');
      window.electronAPI.removeAllListeners('download-complete');
      window.electronAPI.removeAllListeners('download-error');
      window.electronAPI.removeAllListeners('download-failed');
    };
  }, []);

  // Actions
  const addDownload = useCallback(async (options: DownloadOptions, videoInfo?: VideoInfo): Promise<string> => {
    const downloadId = Math.random().toString(36).substr(2, 9);
    
    const download: Download = {
      id: downloadId,
      url: options.url,
      title: videoInfo?.title || 'Unknown',
      thumbnail: videoInfo?.thumbnail,
      status: DownloadStatus.PENDING,
      progress: 0,
      speed: '',
      eta: '',
      size: '',
      downloadedBytes: 0,
      totalBytes: videoInfo?.filesize || videoInfo?.filesize_approx,
      outputPath: options.outputPath || '',
      filename: options.filename || videoInfo?.title || 'download',
      format: options.format || 'best',
      quality: options.quality || 'best',
      startTime: new Date(),
      options,
    };

    dispatch({ type: 'ADD_DOWNLOAD', payload: download });

    try {
      // Start the download
      const actualId = await window.electronAPI.startDownload(options);
      
      // Update with actual ID from backend
      dispatch({ 
        type: 'UPDATE_DOWNLOAD', 
        payload: { 
          id: downloadId, 
          updates: { 
            id: actualId, 
            status: DownloadStatus.DOWNLOADING 
          } 
        } 
      });
      
      return actualId;
    } catch (error) {
      dispatch({ 
        type: 'SET_STATUS', 
        payload: { 
          id: downloadId, 
          status: DownloadStatus.FAILED, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      });
      throw error;
    }
  }, []);

  const removeDownload = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_DOWNLOAD', payload: id });
  }, []);

  const pauseDownload = useCallback(async (id: string) => {
    try {
      await window.electronAPI.pauseDownload(id);
      dispatch({ 
        type: 'SET_STATUS', 
        payload: { id, status: DownloadStatus.PAUSED } 
      });
    } catch (error) {
      console.error('Failed to pause download:', error);
    }
  }, []);

  const resumeDownload = useCallback(async (id: string) => {
    try {
      await window.electronAPI.resumeDownload(id);
      dispatch({ 
        type: 'SET_STATUS', 
        payload: { id, status: DownloadStatus.DOWNLOADING } 
      });
    } catch (error) {
      console.error('Failed to resume download:', error);
    }
  }, []);

  const cancelDownload = useCallback(async (id: string) => {
    try {
      await window.electronAPI.cancelDownload(id);
      dispatch({ 
        type: 'SET_STATUS', 
        payload: { id, status: DownloadStatus.CANCELLED } 
      });
    } catch (error) {
      console.error('Failed to cancel download:', error);
    }
  }, []);

  const retryDownload = useCallback(async (id: string) => {
    const download = downloads.find(d => d.id === id);
    if (!download) return;

    try {
      const newId = await window.electronAPI.startDownload(download.options);
      dispatch({ 
        type: 'UPDATE_DOWNLOAD', 
        payload: { 
          id, 
          updates: { 
            id: newId, 
            status: DownloadStatus.DOWNLOADING,
            progress: 0,
            error: undefined,
            startTime: new Date(),
          } 
        } 
      });
    } catch (error) {
      dispatch({ 
        type: 'SET_STATUS', 
        payload: { 
          id, 
          status: DownloadStatus.FAILED, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      });
    }
  }, [downloads]);

  const clearCompleted = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPLETED' });
  }, []);

  const clearFailed = useCallback(() => {
    dispatch({ type: 'CLEAR_FAILED' });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const pauseAll = useCallback(async () => {
    const promises = activeDownloads.map(download => pauseDownload(download.id));
    await Promise.all(promises);
  }, [activeDownloads, pauseDownload]);

  const resumeAll = useCallback(async () => {
    const pausedDownloads = downloads.filter(d => d.status === DownloadStatus.PAUSED);
    const promises = pausedDownloads.map(download => resumeDownload(download.id));
    await Promise.all(promises);
  }, [downloads, resumeDownload]);

  const getDownloadById = useCallback((id: string) => {
    return downloads.find(d => d.id === id);
  }, [downloads]);

  const value: DownloadContextType = {
    downloads,
    activeDownloads,
    completedDownloads,
    failedDownloads,
    totalProgress,
    isDownloading,
    addDownload,
    removeDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    retryDownload,
    clearCompleted,
    clearFailed,
    clearAll,
    pauseAll,
    resumeAll,
    getDownloadById,
  };

  return (
    <DownloadContext.Provider value={value}>
      {children}
    </DownloadContext.Provider>
  );
}

export function useDownloads() {
  const context = useContext(DownloadContext);
  if (context === undefined) {
    throw new Error('useDownloads must be used within a DownloadProvider');
  }
  return context;
}