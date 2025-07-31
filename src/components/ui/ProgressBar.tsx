import React from 'react';
import { motion } from 'framer-motion';
import { Download, Pause, Play, X, Clock, HardDrive } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  speed?: string;
  eta?: string;
  size?: string;
  status: 'downloading' | 'paused' | 'completed' | 'error';
  title?: string;
  showDetails?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function ProgressBar({
  progress,
  speed = '',
  eta = '',
  size = '',
  status,
  title = 'Download Progress',
  showDetails = true,
  onPause,
  onResume,
  onCancel,
  className = ''
}: ProgressBarProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'downloading':
        return {
          primary: 'from-blue-500 via-cyan-500 to-blue-600',
          secondary: 'from-blue-400 to-cyan-400',
          glow: 'shadow-blue-500/50',
          text: 'text-blue-600 dark:text-blue-400'
        };
      case 'paused':
        return {
          primary: 'from-yellow-500 via-orange-500 to-yellow-600',
          secondary: 'from-yellow-400 to-orange-400',
          glow: 'shadow-yellow-500/50',
          text: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'completed':
        return {
          primary: 'from-green-500 via-emerald-500 to-green-600',
          secondary: 'from-green-400 to-emerald-400',
          glow: 'shadow-green-500/50',
          text: 'text-green-600 dark:text-green-400'
        };
      case 'error':
        return {
          primary: 'from-red-500 via-pink-500 to-red-600',
          secondary: 'from-red-400 to-pink-400',
          glow: 'shadow-red-500/50',
          text: 'text-red-600 dark:text-red-400'
        };
      default:
        return {
          primary: 'from-gray-500 via-slate-500 to-gray-600',
          secondary: 'from-gray-400 to-slate-400',
          glow: 'shadow-gray-500/50',
          text: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const colors = getStatusColor();
  const isActive = status === 'downloading';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 rounded-2xl glass ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background glow effect */}
      <motion.div
        className={`absolute inset-0 rounded-2xl blur-xl ${colors.glow} opacity-20`}
        animate={{
          opacity: isActive ? [0.2, 0.4, 0.2] : 0.2,
        }}
        transition={{
          duration: 2,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut"
        }}
      />

      {/* Header */}
      {showDetails && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <motion.div
              className={`p-2 rounded-lg bg-gradient-to-r ${colors.primary}`}
              animate={{
                rotate: isActive ? [0, 360] : 0
              }}
              transition={{
                duration: 2,
                repeat: isActive ? Infinity : 0,
                ease: "linear"
              }}
            >
              <Download className="w-4 h-4 text-white" />
            </motion.div>
            <div>
              <h3 className="font-medium text-primary-900 dark:text-primary-100 truncate max-w-48">
                {title}
              </h3>
              <p className={`text-sm ${colors.text}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {status === 'downloading' && onPause && (
              <motion.button
                onClick={onPause}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg bg-primary-200 dark:bg-primary-700 hover:bg-primary-300 dark:hover:bg-primary-600 transition-colors"
              >
                <Pause className="w-4 h-4" />
              </motion.button>
            )}
            
            {status === 'paused' && onResume && (
              <motion.button
                onClick={onResume}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg bg-primary-200 dark:bg-primary-700 hover:bg-primary-300 dark:hover:bg-primary-600 transition-colors"
              >
                <Play className="w-4 h-4" />
              </motion.button>
            )}

            {onCancel && status !== 'completed' && (
              <motion.button
                onClick={onCancel}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* 3D Progress Bar Container */}
      <div className="relative mb-4">
        {/* Background track with 3D effect */}
        <div className="relative h-3 bg-gradient-to-r from-primary-200 to-primary-300 dark:from-primary-700 dark:to-primary-600 rounded-full overflow-hidden shadow-inner">
          {/* 3D inner shadow */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent rounded-full" />
          
          {/* Progress fill with 3D gradient */}
          <motion.div
            className={`relative h-full bg-gradient-to-r ${colors.primary} rounded-full shadow-lg`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Top highlight for 3D effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent rounded-full" />
            
            {/* Bottom shadow for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 rounded-full" />
            
            {/* Animated shimmer effect */}
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ width: '50%' }}
              />
            )}

            {/* Progress indicator dot */}
            {progress > 5 && (
              <motion.div
                className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                animate={{
                  scale: isActive ? [1, 1.2, 1] : 1,
                  boxShadow: isActive 
                    ? ['0 0 10px rgba(255,255,255,0.5)', '0 0 20px rgba(255,255,255,0.8)', '0 0 10px rgba(255,255,255,0.5)']
                    : '0 0 10px rgba(255,255,255,0.5)'
                }}
                transition={{
                  duration: 1.5,
                  repeat: isActive ? Infinity : 0,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Progress percentage floating label */}
        <motion.div
          className="absolute -top-8 left-0 bg-primary-900 dark:bg-primary-100 text-primary-100 dark:text-primary-900 px-2 py-1 rounded-md text-xs font-medium shadow-lg"
          style={{ left: `${Math.max(0, Math.min(progress - 5, 90))}%` }}
          animate={{
            y: isActive ? [-2, 2, -2] : 0
          }}
          transition={{
            duration: 2,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {Math.round(progress)}%
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-primary-900 dark:border-t-primary-100" />
        </motion.div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="grid grid-cols-3 gap-4 text-sm">
          {/* Speed */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: isActive ? 360 : 0 }}
              transition={{ duration: 3, repeat: isActive ? Infinity : 0, ease: "linear" }}
            >
              <Download className="w-4 h-4 text-primary-500" />
            </motion.div>
            <div>
              <div className="text-primary-600 dark:text-primary-400 text-xs">Speed</div>
              <div className="font-medium text-primary-900 dark:text-primary-100">
                {speed || '-- B/s'}
              </div>
            </div>
          </div>

          {/* ETA */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" />
            <div>
              <div className="text-primary-600 dark:text-primary-400 text-xs">ETA</div>
              <div className="font-medium text-primary-900 dark:text-primary-100">
                {eta || '--:--'}
              </div>
            </div>
          </div>

          {/* Size */}
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-primary-500" />
            <div>
              <div className="text-primary-600 dark:text-primary-400 text-xs">Size</div>
              <div className="font-medium text-primary-900 dark:text-primary-100">
                {size || '-- MB'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion celebration */}
      {status === 'completed' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-green-500/10 rounded-2xl backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-green-500 text-white p-3 rounded-full shadow-2xl"
          >
            <Download className="w-6 h-6" />
          </motion.div>
          
          {/* Celebration particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos(i * 45 * Math.PI / 180) * 50,
                y: Math.sin(i * 45 * Math.PI / 180) * 50,
              }}
              transition={{
                duration: 1.5,
                delay: 0.2,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}