import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),

  // File system operations
  selectDownloadFolder: () => ipcRenderer.invoke('select-download-folder'),
  openFolder: (folderPath: string) => ipcRenderer.invoke('open-folder', folderPath),
  openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),

  // yt-dlp operations
  checkYtDlp: () => ipcRenderer.invoke('check-ytdlp'),
  installYtDlp: () => ipcRenderer.invoke('install-ytdlp'),
  updateYtDlp: () => ipcRenderer.invoke('update-ytdlp'),
  getVideoInfo: (url: string) => ipcRenderer.invoke('get-video-info', url),
  startDownload: (options: any) => ipcRenderer.invoke('start-download', options),
  cancelDownload: (downloadId: string) => ipcRenderer.invoke('cancel-download', downloadId),
  pauseDownload: (downloadId: string) => ipcRenderer.invoke('pause-download', downloadId),
  resumeDownload: (downloadId: string) => ipcRenderer.invoke('resume-download', downloadId),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSetting: (key: string, value: any) => ipcRenderer.invoke('set-setting', key, value),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),

  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // Updates
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  // Event listeners
  onDownloadProgress: (callback: (data: any) => void) => {
    ipcRenderer.on('download-progress', (_, data) => callback(data));
  },
  onDownloadComplete: (callback: (data: any) => void) => {
    ipcRenderer.on('download-complete', (_, data) => callback(data));
  },
  onDownloadError: (callback: (data: any) => void) => {
    ipcRenderer.on('download-error', (_, data) => callback(data));
  },
  onDownloadFailed: (callback: (data: any) => void) => {
    ipcRenderer.on('download-failed', (_, data) => callback(data));
  },
  onPauseAllDownloads: (callback: () => void) => {
    ipcRenderer.on('pause-all-downloads', callback);
  },
  onResumeAllDownloads: (callback: () => void) => {
    ipcRenderer.on('resume-all-downloads', callback);
  },
  onShowSettings: (callback: () => void) => {
    ipcRenderer.on('show-settings', callback);
  },
  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on('update-available', callback);
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update-downloaded', callback);
  },

  // Remove event listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Type definitions for the exposed API
export interface ElectronAPI {
  windowMinimize: () => Promise<void>;
  windowMaximize: () => Promise<void>;
  windowClose: () => Promise<void>;
  selectDownloadFolder: () => Promise<string | null>;
  openFolder: (folderPath: string) => Promise<void>;
  openFile: (filePath: string) => Promise<void>;
  checkYtDlp: () => Promise<boolean>;
  installYtDlp: () => Promise<{ success: boolean; message: string }>;
  updateYtDlp: () => Promise<{ success: boolean; message: string }>;
  getVideoInfo: (url: string) => Promise<any>;
  startDownload: (options: any) => Promise<string>;
  cancelDownload: (downloadId: string) => Promise<void>;
  pauseDownload: (downloadId: string) => Promise<void>;
  resumeDownload: (downloadId: string) => Promise<void>;
  getSettings: () => Promise<any>;
  setSetting: (key: string, value: any) => Promise<void>;
  resetSettings: () => Promise<void>;
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  checkForUpdates: () => Promise<void>;
  onDownloadProgress: (callback: (data: any) => void) => void;
  onDownloadComplete: (callback: (data: any) => void) => void;
  onDownloadError: (callback: (data: any) => void) => void;
  onDownloadFailed: (callback: (data: any) => void) => void;
  onPauseAllDownloads: (callback: () => void) => void;
  onResumeAllDownloads: (callback: () => void) => void;
  onShowSettings: (callback: () => void) => void;
  onUpdateAvailable: (callback: () => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}