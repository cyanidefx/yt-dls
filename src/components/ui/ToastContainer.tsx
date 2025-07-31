import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function ToastContainer() {
  const { toasts, hideToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-400 text-white';
      case 'error':
        return 'bg-red-500 border-red-400 text-white';
      case 'warning':
        return 'bg-yellow-500 border-yellow-400 text-black';
      case 'info':
        return 'bg-blue-500 border-blue-400 text-white';
      default:
        return 'bg-primary-500 border-primary-400 text-white';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-60 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`
              relative max-w-sm w-full rounded-2xl border shadow-2xl backdrop-blur-xl
              ${getColorClasses(toast.type)}
            `}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(toast.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className="text-sm opacity-90 mt-1">
                      {toast.message}
                    </p>
                  )}
                  
                  {toast.action && (
                    <button
                      onClick={toast.action.onClick}
                      className="text-sm underline hover:no-underline mt-2 font-medium"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => hideToast(toast.id)}
                  className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Progress bar for timed toasts */}
            {toast.duration && toast.duration > 0 && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: toast.duration / 1000, ease: "linear" }}
                className="h-1 bg-white/30 rounded-b-2xl"
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}