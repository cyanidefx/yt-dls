import React from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

export default function LoadingScreen({ 
  message = 'Initializing YT-DL Studio...', 
  progress 
}: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-950 to-primary-900 flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-300/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 text-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1.2, 
            ease: "easeOut",
            scale: { type: "spring", stiffness: 100 } 
          }}
          className="mb-8"
        >
          <div className="relative">
            {/* Glow effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="absolute inset-0 bg-accent-500/30 rounded-3xl blur-xl"
            />
            
            {/* Main logo container */}
            <div className="relative bg-gradient-to-br from-accent-500 to-accent-600 p-6 rounded-3xl shadow-2xl">
              <Download className="w-16 h-16 text-white" />
            </div>
          </div>
        </motion.div>

        {/* App title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            YT-DL Studio
          </h1>
          <p className="text-primary-300 text-lg">
            Modern YouTube Downloader
          </p>
        </motion.div>

        {/* Loading message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Loader2 className="w-5 h-5 text-accent-400 animate-spin" />
            <span className="text-primary-200">{message}</span>
          </div>
          
          {/* Progress bar */}
          {progress !== undefined && (
            <div className="w-64 mx-auto">
              <div className="bg-primary-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full"
                />
              </div>
              <div className="text-sm text-primary-300 mt-2">
                {Math.round(progress)}%
              </div>
            </div>
          )}
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          <div className="text-center p-4">
            <div className="w-8 h-8 bg-accent-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Download className="w-4 h-4 text-accent-400" />
            </div>
            <p className="text-primary-300 text-sm">High Quality Downloads</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-8 h-8 bg-accent-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Loader2 className="w-4 h-4 text-accent-400" />
            </div>
            <p className="text-primary-300 text-sm">Batch Processing</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-8 h-8 bg-accent-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Download className="w-4 h-4 text-accent-400" />
            </div>
            <p className="text-primary-300 text-sm">Multiple Formats</p>
          </div>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="flex justify-center gap-2 mt-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 bg-accent-400 rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}