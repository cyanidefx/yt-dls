import React from 'react';
import { motion } from 'framer-motion';
import { Download, Settings, History, Play, Pause, Square } from 'lucide-react';
import './FloatingNavbar.css';

interface FloatingNavbarProps {
  currentView: 'downloads' | 'settings' | 'history';
  onViewChange: (view: 'downloads' | 'settings' | 'history') => void;
}

const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'downloads', icon: Download, label: 'Downloads' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'history', icon: History, label: 'History' }
  ] as const;

  return (
    <motion.nav 
      className="floating-navbar"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="navbar-content">
        <div className="navbar-logo">
          <div className="logo-icon">
            <Play size={20} />
          </div>
        </div>
        
        <div className="navbar-items">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                className={`navbar-item ${isActive ? 'active' : ''}`}
                onClick={() => onViewChange(item.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                animate={{
                  backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-secondary)'
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon size={20} />
                <span className="item-label">{item.label}</span>
                
                {isActive && (
                  <motion.div
                    className="active-indicator"
                    layoutId="activeIndicator"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
        
        <div className="navbar-footer">
          <motion.button
            className="control-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Pause size={18} />
          </motion.button>
          
          <motion.button
            className="control-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Square size={18} />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default FloatingNavbar;