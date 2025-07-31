import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Settings, 
  Home, 
  History, 
  Users, 
  Search,
  Plus,
  Moon,
  Sun,
  Monitor,
  Minimize2,
  Maximize2,
  X,
  Activity
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { AppState } from '@/types';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onSettingsClick: () => void;
  isDownloading: boolean;
  totalProgress: number;
  appState: AppState;
}

export default function Navbar({
  currentView,
  onViewChange,
  onSettingsClick,
  isDownloading,
  totalProgress,
  appState
}: NavbarProps) {
  const { theme, actualTheme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'downloads', icon: Download, label: 'Downloads', color: 'from-blue-500 to-cyan-500' },
    { id: 'history', icon: History, label: 'History', color: 'from-purple-500 to-pink-500' },
    { id: 'queue', icon: Users, label: 'Queue', color: 'from-green-500 to-emerald-500' },
    { id: 'analytics', icon: Activity, label: 'Analytics', color: 'from-orange-500 to-red-500' },
  ];

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor
  };

  const ThemeIcon = themeIcons[theme];

  const handleWindowControl = (action: string) => {
    if (window.electronAPI) {
      switch (action) {
        case 'minimize':
          window.electronAPI.windowMinimize();
          break;
        case 'maximize':
          window.electronAPI.windowMaximize();
          break;
        case 'close':
          window.electronAPI.windowClose();
          break;
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="floating-navbar px-6 py-3 mx-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        {/* Gradient background */}
        <motion.div
          animate={{
            background: actualTheme === 'dark' 
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%)'
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        />
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent-400/30 rounded-full"
              animate={{
                x: [0, Math.random() * 400],
                y: [0, Math.random() * 60],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                ease: "linear",
                delay: i * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Glow effect on hover */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.1 : 0,
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl blur-xl"
        />
      </div>

      <div className="relative flex items-center justify-between">
        {/* Left section - App info */}
        <div className="flex items-center gap-4">
          {/* App logo with pulsing effect */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <motion.div
              animate={{ 
                boxShadow: isDownloading 
                  ? '0 0 20px rgba(59, 130, 246, 0.6)' 
                  : '0 0 10px rgba(59, 130, 246, 0.3)' 
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="bg-gradient-to-br from-accent-500 to-accent-600 p-2.5 rounded-xl"
            >
              <Download className="w-5 h-5 text-white" />
            </motion.div>
            
            {/* Download progress ring */}
            {isDownloading && (
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: totalProgress / 100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 -m-1"
              >
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${totalProgress}, 100`}
                    className="text-accent-400"
                  />
                </svg>
              </motion.div>
            )}
          </motion.div>

          {/* App title with typewriter effect */}
          <div className="hidden sm:block">
            <motion.h1 
              className="font-bold text-lg bg-gradient-to-r from-accent-500 to-accent-700 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              YT-DL Studio
            </motion.h1>
            <motion.p 
              className="text-xs text-primary-500 dark:text-primary-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              v{appState.appVersion}
            </motion.p>
          </div>
        </div>

        {/* Center section - Navigation */}
        <div className="flex items-center gap-1 bg-primary-100/50 dark:bg-primary-800/50 rounded-xl p-1 backdrop-blur-sm">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                  ${isActive 
                    ? 'text-white shadow-lg' 
                    : 'text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-white'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-lg`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                
                {/* Icon and label */}
                <div className="relative flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-lg"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right section - Controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <motion.div
            className="relative"
            animate={{ width: searchFocused ? 200 : 40 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <input
              type="text"
              placeholder="Search downloads..."
              className={`
                w-full h-10 pl-10 pr-4 rounded-lg border-0 
                bg-primary-100/80 dark:bg-primary-800/80 
                text-primary-900 dark:text-primary-100
                placeholder-primary-500 dark:placeholder-primary-400
                focus:ring-2 focus:ring-accent-400 focus:outline-none
                transition-all duration-300
                ${searchFocused ? 'backdrop-blur-md' : 'backdrop-blur-sm'}
              `}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-500" />
          </motion.div>

          {/* Add download button */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            title="Add Download"
          >
            <Plus className="w-4 h-4" />
          </motion.button>

          {/* Theme toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 bg-primary-200/80 dark:bg-primary-700/80 rounded-lg hover:bg-primary-300/80 dark:hover:bg-primary-600/80 transition-all duration-300"
            title={`Current: ${theme}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <ThemeIcon className="w-4 h-4 text-primary-700 dark:text-primary-300" />
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Settings */}
          <motion.button
            onClick={onSettingsClick}
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 bg-primary-200/80 dark:bg-primary-700/80 rounded-lg hover:bg-primary-300/80 dark:hover:bg-primary-600/80 transition-all duration-300"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-primary-700 dark:text-primary-300" />
          </motion.button>

          {/* Window controls (desktop only) */}
          {window.electronAPI && (
            <div className="hidden lg:flex items-center gap-1 ml-2 pl-2 border-l border-primary-300 dark:border-primary-600">
              <motion.button
                onClick={() => handleWindowControl('minimize')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-md hover:bg-yellow-500/20 text-yellow-600 transition-colors"
              >
                <Minimize2 className="w-3 h-3" />
              </motion.button>
              <motion.button
                onClick={() => handleWindowControl('maximize')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-md hover:bg-green-500/20 text-green-600 transition-colors"
              >
                <Maximize2 className="w-3 h-3" />
              </motion.button>
              <motion.button
                onClick={() => handleWindowControl('close')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-md hover:bg-red-500/20 text-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </motion.button>
            </div>
          )}

          {/* Time display */}
          <div className="hidden xl:block text-right">
            <div className="text-xs font-medium text-primary-700 dark:text-primary-300">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-primary-500 dark:text-primary-400">
              {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Download progress bar */}
      <AnimatePresence>
        {isDownloading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 pt-3 border-t border-primary-200/50 dark:border-primary-700/50"
          >
            <div className="flex items-center justify-between text-xs text-primary-600 dark:text-primary-400 mb-2">
              <span>Downloading...</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <div className="relative h-1.5 bg-primary-200 dark:bg-primary-700 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-500 to-accent-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{ width: '30%' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}