import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Square, X, Sun, Moon } from 'lucide-react';
import './TitleBar.css';

interface TitleBarProps {
  onThemeToggle: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ onThemeToggle }) => {
  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <motion.div 
      className="title-bar"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="title-bar-content">
        <div className="title-bar-left">
          <div className="app-logo">
            <span className="logo-text">YT-DL</span>
            <span className="logo-accent">Studio</span>
          </div>
        </div>
        
        <div className="title-bar-center">
          <div className="title">YT-DL Studio</div>
        </div>
        
        <div className="title-bar-right">
          <motion.button
            className="theme-toggle"
            onClick={onThemeToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sun className="sun-icon" />
            <Moon className="moon-icon" />
          </motion.button>
          
          <div className="window-controls">
            <motion.button
              className="window-control minimize"
              onClick={handleMinimize}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.95 }}
            >
              <Minus size={12} />
            </motion.button>
            
            <motion.button
              className="window-control maximize"
              onClick={handleMaximize}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.95 }}
            >
              <Square size={12} />
            </motion.button>
            
            <motion.button
              className="window-control close"
              onClick={handleClose}
              whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={12} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TitleBar;