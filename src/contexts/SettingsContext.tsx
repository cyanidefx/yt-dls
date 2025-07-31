import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Settings } from '@/types';

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSettings: () => void;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  // General
  theme: 'system',
  language: 'en',
  autoUpdateYtDlp: true,
  checkUpdatesOnStartup: true,
  minimizeToTray: true,
  closeToTray: true,
  startMinimized: false,
  autoStart: false,
  
  // Downloads
  defaultDownloadPath: '',
  maxConcurrentDownloads: 3,
  defaultFormat: 'best',
  defaultQuality: 'best',
  defaultAudioFormat: 'mp3',
  createSubfolders: false,
  overwriteFiles: false,
  continuePartialDownloads: true,
  
  // Network
  maxDownloadSpeed: '',
  maxRetries: 3,
  retryDelay: 5,
  timeout: 30,
  proxy: '',
  useProxy: false,
  
  // Advanced
  ffmpegPath: '',
  ytdlpPath: '',
  customArgs: '',
  enableLogging: true,
  logLevel: 'info',
  
  // UI
  showThumbnails: true,
  showProgressInTaskbar: true,
  showNotifications: true,
  soundOnComplete: false,
  animationsEnabled: true,
  compactMode: false,
  
  // Privacy
  clearHistoryOnExit: false,
  saveDownloadHistory: true,
  anonymizeFilenames: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      if (window.electronAPI) {
        const savedSettings = await window.electronAPI.getSettings();
        setSettings({ ...defaultSettings, ...savedSettings });
      } else {
        // Fallback to localStorage for web development
        const savedSettings = localStorage.getItem('yt-dls-settings');
        if (savedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Save to persistent storage
      if (window.electronAPI) {
        window.electronAPI.setSetting(key as string, value);
      } else {
        localStorage.setItem('yt-dls-settings', JSON.stringify(newSettings));
      }
      
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.resetSettings();
      } else {
        localStorage.removeItem('yt-dls-settings');
      }
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }, []);

  const value: SettingsContextType = {
    settings,
    updateSetting,
    resetSettings,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}