import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Link, Play, Pause, Square, Settings, Info } from 'lucide-react';
import './DownloadManager.css';

const DownloadManager: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloads, setDownloads] = useState<any[]>([]);

  const handleDownload = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          options: {
            format: 'best',
            audio_only: false,
            audio_format: 'mp3'
          }
        })
      });
      
      const data = await response.json();
      if (data.download_id) {
        setUrl('');
        // Add to downloads list
        setDownloads(prev => [...prev, {
          id: data.download_id,
          url: url,
          status: 'queued',
          progress: 0,
          speed: '0 B/s',
          eta: 'Unknown'
        }]);
      }
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="download-manager">
      <motion.div 
        className="download-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1>Downloads</h1>
        <p>Download videos and audio from various platforms</p>
      </motion.div>

      <motion.div 
        className="url-input-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="input-group">
          <Link className="input-icon" size={20} />
          <input
            type="text"
            className="url-input"
            placeholder="Enter video URL (YouTube, Vimeo, etc.)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
          />
          <motion.button
            className="download-btn"
            onClick={handleDownload}
            disabled={isLoading || !url.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="loading-spinner" />
            ) : (
              <Download size={20} />
            )}
            {isLoading ? 'Processing...' : 'Download'}
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        className="downloads-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="section-header">
          <h2>Active Downloads</h2>
          <div className="download-stats">
            <span>Downloading: {downloads.filter(d => d.status === 'downloading').length}</span>
            <span>Completed: {downloads.filter(d => d.status === 'completed').length}</span>
          </div>
        </div>

        <div className="downloads-list">
          {downloads.length === 0 ? (
            <div className="empty-state">
              <Download size={48} />
              <h3>No downloads yet</h3>
              <p>Enter a URL above to start downloading</p>
            </div>
          ) : (
            downloads.map((download) => (
              <motion.div
                key={download.id}
                className="download-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="download-info">
                  <h4>{download.url}</h4>
                  <div className="download-progress">
                    <div className="progress-bar">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${download.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="progress-details">
                      <span>{download.progress}%</span>
                      <span>{download.speed}</span>
                      <span>{download.eta}</span>
                    </div>
                  </div>
                </div>
                
                <div className="download-actions">
                  <button className="action-btn">
                    <Play size={16} />
                  </button>
                  <button className="action-btn">
                    <Pause size={16} />
                  </button>
                  <button className="action-btn">
                    <Square size={16} />
                  </button>
                  <button className="action-btn">
                    <Info size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DownloadManager;