import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useDownloads } from '@/contexts/DownloadContext';
import { useToast } from '@/contexts/ToastContext';

// Components
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MainContent from '@/components/layout/MainContent';
import ToastContainer from '@/components/ui/ToastContainer';
import SettingsModal from '@/components/modals/SettingsModal';
import LoadingScreen from '@/components/ui/LoadingScreen';
import UpdateNotification from '@/components/ui/UpdateNotification';

// Types
import { AppState } from '@/types';

function App() {
  const { actualTheme } = useTheme();
  const { settings, isLoading: settingsLoading } = useSettings();
  const { isDownloading, totalProgress } = useDownloads();
  const { showError, showSuccess, showInfo } = useToast();

  const [currentView, setCurrentView] = useState<string>('downloads');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appState, setAppState] = useState<AppState>({
    isInitialized: false,
    ytdlpInstalled: false,
    appVersion: '',
    platform: '',
    updateAvailable: false,
    isUpdating: false,
  });

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!window.electronAPI) return;

    const handleShowSettings = () => {
      setIsSettingsOpen(true);
    };

    const handleUpdateAvailable = () => {
      setAppState(prev => ({ ...prev, updateAvailable: true }));
      showInfo('Update Available', 'A new version of YT-DL Studio is available');
    };

    const handleUpdateDownloaded = () => {
      showSuccess('Update Downloaded', 'The update will be installed when you restart the app');
    };

    window.electronAPI.onShowSettings(handleShowSettings);
    window.electronAPI.onUpdateAvailable(handleUpdateAvailable);
    window.electronAPI.onUpdateDownloaded(handleUpdateDownloaded);

    return () => {
      window.electronAPI.removeAllListeners('show-settings');
      window.electronAPI.removeAllListeners('update-available');
      window.electronAPI.removeAllListeners('update-downloaded');
    };
  }, [showInfo, showSuccess]);

  const initializeApp = async () => {
    try {
      if (!window.electronAPI) {
        // Development mode fallback
        setAppState(prev => ({ 
          ...prev, 
          isInitialized: true,
          ytdlpInstalled: true,
          appVersion: '1.0.0-dev',
          platform: 'web',
        }));
        return;
      }

      // Check yt-dlp installation
      const ytdlpInstalled = await window.electronAPI.checkYtDlp();
      const appVersion = await window.electronAPI.getAppVersion();
      const platform = await window.electronAPI.getPlatform();

      setAppState(prev => ({
        ...prev,
        isInitialized: true,
        ytdlpInstalled,
        appVersion,
        platform,
      }));

      if (!ytdlpInstalled) {
        showError(
          'yt-dlp Not Found',
          'yt-dlp is required for downloads. Please install it or use the built-in installer.'
        );
      } else {
        showSuccess('Ready', 'YT-DL Studio is ready for downloads');
      }

      // Check for updates if enabled
      if (settings.checkUpdatesOnStartup) {
        await window.electronAPI.checkForUpdates();
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      showError('Initialization Error', 'Failed to initialize the application');
    }
  };

  // Show loading screen while initializing
  if (settingsLoading || !appState.isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <div className={`
      min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 
      dark:from-primary-950 dark:to-primary-900
      ${actualTheme === 'dark' ? 'dark' : ''}
    `}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-300/5 rounded-full blur-3xl" />
      </div>

      {/* Floating Navbar */}
      <Navbar 
        currentView={currentView}
        onViewChange={setCurrentView}
        onSettingsClick={() => setIsSettingsOpen(true)}
        isDownloading={isDownloading}
        totalProgress={totalProgress}
        appState={appState}
      />

      {/* Main Layout */}
      <div className="flex h-screen pt-20">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-64 shrink-0"
        >
          <Sidebar 
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="flex-1 overflow-hidden"
        >
          <MainContent 
            currentView={currentView}
            appState={appState}
            onRetryInitialization={initializeApp}
          />
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            appState={appState}
          />
        )}
      </AnimatePresence>

      {/* Update Notification */}
      {appState.updateAvailable && (
        <UpdateNotification
          onClose={() => setAppState(prev => ({ ...prev, updateAvailable: false }))}
        />
      )}

      {/* Toast Container */}
      <ToastContainer />

      {/* Development Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-medium">
            DEV MODE
          </div>
        </div>
      )}
    </div>
  );
}

export default App;