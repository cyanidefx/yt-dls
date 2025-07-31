import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { DownloadProvider } from './contexts/DownloadContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastProvider } from './contexts/ToastContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SettingsProvider>
        <DownloadProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </DownloadProvider>
      </SettingsProvider>
    </ThemeProvider>
  </React.StrictMode>
);