import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <motion.div 
      className="settings-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="settings-header">
        <SettingsIcon size={32} />
        <h1>Settings</h1>
      </div>
      <p>Settings page coming soon...</p>
    </motion.div>
  );
};

export default Settings;