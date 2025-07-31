import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '@/types';

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toastData: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = toastData.duration || 5000;

    const toast: Toast = {
      ...toastData,
      id,
      duration,
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Helper functions for common toast types
  const showSuccess = useCallback((title: string, message?: string) => {
    return showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    return showToast({ type: 'error', title, message, duration: 7000 });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    return showToast({ type: 'warning', title, message, duration: 6000 });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    return showToast({ type: 'info', title, message });
  }, [showToast]);

  const value: ToastContextType & {
    showSuccess: (title: string, message?: string) => string;
    showError: (title: string, message?: string) => string;
    showWarning: (title: string, message?: string) => string;
    showInfo: (title: string, message?: string) => string;
  } = {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}