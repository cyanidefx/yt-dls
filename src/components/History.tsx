import React from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon } from 'lucide-react';

const History: React.FC = () => {
  return (
    <motion.div 
      className="history-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="history-header">
        <HistoryIcon size={32} />
        <h1>Download History</h1>
      </div>
      <p>History page coming soon...</p>
    </motion.div>
  );
};

export default History;