import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X,
  Bell
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function ToastContainer() {
  const { toasts, hideToast } = useToast();

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return Bell;
    }
  };

  const getToastColors = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-500 to-emerald-500',
          text: 'text-white',
          border: 'border-green-400/50',
          icon: 'text-white'
        };
      case 'error':
        return {
          bg: 'from-red-500 to-pink-500',
          text: 'text-white',
          border: 'border-red-400/50',
          icon: 'text-white'
        };
      case 'warning':
        return {
          bg: 'from-yellow-500 to-orange-500',
          text: 'text-white',
          border: 'border-yellow-400/50',
          icon: 'text-white'
        };
      case 'info':
        return {
          bg: 'from-blue-500 to-cyan-500',
          text: 'text-white',
          border: 'border-blue-400/50',
          icon: 'text-white'
        };
      default:
        return {
          bg: 'from-primary-600 to-primary-700',
          text: 'text-white',
          border: 'border-primary-500/50',
          icon: 'text-white'
        };
    }
  };

  return (
    <div className="fixed top-20 right-4 z-100 space-y-3 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = getToastIcon(toast.type);
          const colors = getToastColors(toast.type);

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ 
                opacity: 0, 
                x: 400, 
                scale: 0.8,
                rotateY: 90
              }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                rotateY: 0
              }}
              exit={{ 
                opacity: 0, 
                x: 400, 
                scale: 0.8,
                rotateY: -90,
                transition: { duration: 0.3 }
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                duration: 0.5
              }}
              className={`
                relative overflow-hidden rounded-2xl shadow-2xl border backdrop-blur-xl
                ${colors.border}
              `}
              whileHover={{ scale: 1.02, x: -8 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} opacity-95`} />
              
              {/* Animated background pattern */}
              <motion.div
                className="absolute inset-0 opacity-10"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%']
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Glow effect */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${colors.bg} blur-xl opacity-30`}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <div className="relative p-4">
                <div className="flex items-start gap-3">
                  {/* Icon with animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="flex-shrink-0"
                  >
                    <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Icon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <motion.h4
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className={`text-sm font-semibold ${colors.text} mb-1`}
                    >
                      {toast.title}
                    </motion.h4>
                    
                    {toast.message && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`text-xs ${colors.text} opacity-90`}
                      >
                        {toast.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Close button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => hideToast(toast.id)}
                    className={`
                      flex-shrink-0 p-1 rounded-lg transition-all duration-200
                      hover:bg-white/20 focus:bg-white/20 focus:outline-none
                      ${colors.text}
                    `}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Progress bar */}
                {toast.duration && toast.duration > 0 && (
                  <motion.div
                    className="mt-3 h-1 bg-black/20 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.div
                      className="h-full bg-white/60 rounded-full"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ 
                        duration: toast.duration / 1000,
                        ease: "linear"
                      }}
                    />
                  </motion.div>
                )}
              </div>

              {/* Side accent line */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-1 bg-white/60"
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ delay: 0.7, duration: 0.3 }}
              />

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  delay: 0.8,
                  duration: 0.8,
                  ease: "easeOut"
                }}
                style={{ width: "50%" }}
              />

              {/* Floating particles for success */}
              {toast.type === 'success' && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white/60 rounded-full"
                      initial={{ 
                        scale: 0,
                        x: Math.random() * 100 + "%",
                        y: Math.random() * 100 + "%"
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        y: [Math.random() * 100 + "%", "-20px"],
                      }}
                      transition={{
                        duration: 2,
                        delay: 1 + i * 0.2,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}