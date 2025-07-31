import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Link, 
  Play, 
  Pause, 
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Zap,
  History
} from 'lucide-react';
import { useDownloads } from '@/contexts/DownloadContext';
import { useToast } from '@/contexts/ToastContext';
import { AppState } from '@/types';
import ProgressBar from '@/components/ui/ProgressBar';

interface MainContentProps {
  currentView: string;
  appState: AppState;
  onRetryInitialization: () => void;
}

export default function MainContent({ 
  currentView, 
  appState, 
  onRetryInitialization 
}: MainContentProps) {
  const { downloads, addDownload, pauseDownload, resumeDownload, cancelDownload } = useDownloads();
  const { showSuccess, showError } = useToast();
  const [url, setUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddDownload = async () => {
    if (!url.trim()) {
      showError('Invalid URL', 'Please enter a valid URL');
      return;
    }

    setIsAdding(true);
    try {
      await addDownload({ url: url.trim() });
      setUrl('');
      showSuccess('Download Added', 'Your download has been added to the queue');
    } catch (error) {
      showError('Failed to Add Download', 'Please check the URL and try again');
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddDownload();
    }
  };

  const filteredDownloads = downloads.filter(download =>
    download.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    download.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDownloadInterface = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mb-2">
            Downloads
          </h1>
          <p className="text-primary-600 dark:text-primary-400">
            Manage your video downloads with ease
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-500" />
            <input
              type="text"
              placeholder="Search downloads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border-0 bg-primary-100/80 dark:bg-primary-800/80 text-primary-900 dark:text-primary-100 placeholder-primary-500 focus:ring-2 focus:ring-accent-400 focus:outline-none w-64"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-primary-100/50 dark:bg-primary-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-accent-500 text-white shadow-lg'
                  : 'text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-accent-500 text-white shadow-lg'
                  : 'text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* URL Input Section */}
      <motion.div
        className="glass p-6 rounded-2xl"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100">
              Add New Download
            </h2>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              Paste any video URL to start downloading
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500" />
            <input
              type="text"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-primary-100/80 dark:bg-primary-800/80 text-primary-900 dark:text-primary-100 placeholder-primary-500 focus:ring-2 focus:ring-accent-400 focus:outline-none text-sm"
              disabled={isAdding}
            />
          </div>
          <motion.button
            onClick={handleAddDownload}
            disabled={isAdding || !url.trim()}
            className="px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAdding ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Adding...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Downloads List/Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
            {filteredDownloads.length === 0 ? 'No Downloads' : `Downloads (${filteredDownloads.length})`}
          </h3>
          {downloads.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
              <Zap className="w-4 h-4" />
              {downloads.filter(d => d.status === 'downloading').length} active
            </div>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {filteredDownloads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass p-12 rounded-2xl text-center"
            >
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 bg-gradient-to-r from-accent-500/20 to-accent-600/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Download className="w-10 h-10 text-accent-500" />
              </motion.div>
              <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-2">
                No downloads yet
              </h3>
              <p className="text-primary-600 dark:text-primary-400 mb-6">
                Add your first download by pasting a video URL above
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-primary-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  YouTube
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Vimeo
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  1000+ sites
                </div>
              </div>
            </motion.div>
          ) : (
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-4'
              }
            `}>
              {filteredDownloads.map((download, index) => (
                <motion.div
                  key={download.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={viewMode === 'grid' ? 'h-fit' : ''}
                >
                  <ProgressBar
                    progress={download.progress}
                    speed={download.speed}
                    eta={download.eta}
                    size={download.size}
                    status={download.status as any}
                    title={download.title}
                    onPause={() => pauseDownload(download.id)}
                    onResume={() => resumeDownload(download.id)}
                    onCancel={() => cancelDownload(download.id)}
                    className="h-full"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const renderInitializationError = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center h-full"
    >
      <div className="glass p-8 rounded-2xl text-center max-w-md">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <AlertCircle className="w-8 h-8 text-red-500" />
        </motion.div>
        <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-2">
          Initialization Failed
        </h3>
        <p className="text-primary-600 dark:text-primary-400 mb-6">
          There was an error initializing the application. This might be due to missing dependencies or configuration issues.
        </p>
        <motion.button
          onClick={onRetryInitialization}
          className="px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry Initialization
          </div>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    if (!appState.isInitialized) {
      return renderInitializationError();
    }

    switch (currentView) {
      case 'downloads':
        return renderDownloadInterface();
      case 'history':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-2xl text-center"
          >
            <History className="w-16 h-16 text-accent-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-primary-900 dark:text-primary-100 mb-2">
              Download History
            </h2>
            <p className="text-primary-600 dark:text-primary-400">
              View your completed downloads and statistics
            </p>
          </motion.div>
        );
      case 'queue':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-2xl text-center"
          >
            <Play className="w-16 h-16 text-accent-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-primary-900 dark:text-primary-100 mb-2">
              Download Queue
            </h2>
            <p className="text-primary-600 dark:text-primary-400">
              Manage your download queue and priorities
            </p>
          </motion.div>
        );
      case 'analytics':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-2xl text-center"
          >
            <Settings className="w-16 h-16 text-accent-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-primary-900 dark:text-primary-100 mb-2">
              Analytics
            </h2>
            <p className="text-primary-600 dark:text-primary-400">
              View detailed statistics and insights
            </p>
          </motion.div>
        );
      default:
        return renderDownloadInterface();
    }
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto custom-scrollbar p-6">
        {renderContent()}
      </div>
    </div>
  );
}