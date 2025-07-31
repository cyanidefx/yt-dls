import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TitleBar from './components/TitleBar';
import FloatingNavbar from './components/FloatingNavbar';
import DownloadManager from './components/DownloadManager';
import Settings from './components/Settings';
import History from './components/History';
import { useThemeStore } from './store/themeStore';
import './styles/App.css';

type View = 'downloads' | 'settings' | 'history';

function App() {
  const [currentView, setCurrentView] = useState<View>('downloads');
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const views = {
    downloads: <DownloadManager />,
    settings: <Settings />,
    history: <History />
  };

  return (
    <div className={`app ${theme}`}>
      <TitleBar onThemeToggle={toggleTheme} />
      
      <div className="app-content">
        <FloatingNavbar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />
        
        <motion.main 
          className="main-content"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {views[currentView]}
            </motion.div>
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  );
}

export default App;