import React from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  History, 
  Users, 
  Activity, 
  Settings, 
  Plus,
  Folder,
  Star,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react';
import { useDownloads } from '@/contexts/DownloadContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { downloads, activeDownloads, completedDownloads, failedDownloads } = useDownloads();

  const navigationItems = [
    {
      id: 'downloads',
      icon: Download,
      label: 'Active Downloads',
      count: activeDownloads.length,
      color: 'from-blue-500 to-cyan-500',
      description: 'Currently downloading'
    },
    {
      id: 'queue',
      icon: Users,
      label: 'Download Queue',
      count: 0, // TODO: Implement queue
      color: 'from-purple-500 to-pink-500',
      description: 'Pending downloads'
    },
    {
      id: 'history',
      icon: History,
      label: 'Download History',
      count: completedDownloads.length,
      color: 'from-green-500 to-emerald-500',
      description: 'Completed downloads'
    },
    {
      id: 'analytics',
      icon: Activity,
      label: 'Analytics',
      count: downloads.length,
      color: 'from-orange-500 to-red-500',
      description: 'Download statistics'
    }
  ];

  const quickActions = [
    {
      icon: Plus,
      label: 'Add Download',
      action: () => {}, // TODO: Implement
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Folder,
      label: 'Open Downloads',
      action: () => {}, // TODO: Implement
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Settings,
      label: 'Settings',
      action: () => onViewChange('settings'),
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const stats = [
    {
      icon: CheckCircle,
      label: 'Completed',
      value: completedDownloads.length,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: Download,
      label: 'Active',
      value: activeDownloads.length,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: XCircle,
      label: 'Failed',
      value: failedDownloads.length,
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    }
  ];

  return (
    <motion.aside
      className="h-full bg-gradient-to-b from-primary-50/80 to-primary-100/80 dark:from-primary-900/80 dark:to-primary-800/80 backdrop-blur-xl border-r border-primary-200/50 dark:border-primary-700/50 p-6 overflow-y-auto custom-scrollbar"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold text-primary-900 dark:text-primary-100 mb-2">
          Navigation
        </h2>
        <p className="text-sm text-primary-600 dark:text-primary-400">
          Manage your downloads and explore features
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-4 uppercase tracking-wider">
          Quick Stats
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`p-3 rounded-xl ${stat.bg} border border-primary-200/50 dark:border-primary-700/50`}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-xs text-primary-600 dark:text-primary-400">
                      {stat.label}
                    </div>
                    <div className="text-lg font-bold text-primary-900 dark:text-primary-100">
                      {stat.value}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-4 uppercase tracking-wider">
          Views
        </h3>
        <div className="space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  w-full p-4 rounded-xl text-left transition-all duration-300 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-accent-500/20 to-accent-600/20 text-accent-700 dark:text-accent-300 shadow-lg border border-accent-500/30' 
                    : 'hover:bg-primary-200/50 dark:hover:bg-primary-700/50 text-primary-700 dark:text-primary-300'
                  }
                `}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                      : 'bg-primary-200/50 dark:bg-primary-700/50 group-hover:bg-primary-300/50 dark:group-hover:bg-primary-600/50'
                    }
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.label}</span>
                      {item.count > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`
                            px-2 py-0.5 rounded-full text-xs font-bold
                            ${isActive 
                              ? 'bg-white/20 text-accent-700 dark:text-accent-300' 
                              : 'bg-accent-500 text-white'
                            }
                          `}
                        >
                          {item.count}
                        </motion.span>
                      )}
                    </div>
                    <div className="text-xs text-primary-500 dark:text-primary-400 mt-1">
                      {item.description}
                    </div>
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-500 to-accent-600 rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.nav>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-4 uppercase tracking-wider">
          Quick Actions
        </h3>
        <div className="space-y-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                onClick={action.action}
                className="w-full p-3 rounded-xl bg-primary-200/30 dark:bg-primary-700/30 hover:bg-primary-200/50 dark:hover:bg-primary-700/50 text-primary-700 dark:text-primary-300 transition-all duration-300 group"
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} text-white transition-all duration-300 group-hover:shadow-lg`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="mb-8"
      >
        <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-4 uppercase tracking-wider">
          Recent Activity
        </h3>
        
        {downloads.length === 0 ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 bg-primary-200 dark:bg-primary-700 rounded-full flex items-center justify-center mx-auto mb-3"
            >
              <Download className="w-6 h-6 text-primary-500" />
            </motion.div>
            <p className="text-sm text-primary-500 dark:text-primary-400">
              No downloads yet
            </p>
            <p className="text-xs text-primary-400 dark:text-primary-500 mt-1">
              Start your first download!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {downloads.slice(0, 3).map((download, index) => (
              <motion.div
                key={download.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="p-3 rounded-lg bg-primary-100/50 dark:bg-primary-800/50 border border-primary-200/50 dark:border-primary-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-2 h-2 rounded-full
                    ${download.status === 'downloading' ? 'bg-blue-500 animate-pulse' : ''}
                    ${download.status === 'completed' ? 'bg-green-500' : ''}
                    ${download.status === 'failed' ? 'bg-red-500' : ''}
                    ${download.status === 'paused' ? 'bg-yellow-500' : ''}
                  `} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-primary-900 dark:text-primary-100 truncate">
                      {download.title}
                    </div>
                    <div className="text-xs text-primary-500 dark:text-primary-400">
                      {download.status === 'downloading' && `${Math.round(download.progress)}%`}
                      {download.status === 'completed' && 'Completed'}
                      {download.status === 'failed' && 'Failed'}
                      {download.status === 'paused' && 'Paused'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-auto pt-6 border-t border-primary-200/50 dark:border-primary-700/50"
      >
        <div className="text-center">
          <p className="text-xs text-primary-500 dark:text-primary-400">
            YT-DL Studio v1.0.0
          </p>
          <p className="text-xs text-primary-400 dark:text-primary-500 mt-1">
            Built with ❤️ for creators
          </p>
        </div>
      </motion.div>
    </motion.aside>
  );
}