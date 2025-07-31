export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
  uploader: string;
  upload_date: string;
  view_count: number;
  formats: VideoFormat[];
  subtitles: SubtitleInfo[];
  url: string;
  filesize?: number;
  filesize_approx?: number;
}

export interface VideoFormat {
  format_id: string;
  format_note: string;
  ext: string;
  resolution: string;
  fps: number | null;
  vcodec: string;
  acodec: string;
  tbr: number;
  vbr: number | null;
  abr: number | null;
  filesize: number | null;
  filesize_approx: number | null;
  quality: number;
  url: string;
}

export interface SubtitleInfo {
  language: string;
  name: string;
  url: string;
  ext: string;
}

export interface DownloadOptions {
  url: string;
  format?: string;
  quality?: string;
  extractAudio?: boolean;
  audioFormat?: string;
  outputPath?: string;
  filename?: string;
  writeSubtitles?: boolean;
  writeAutoSubtitles?: boolean;
  subtitleLanguages?: string[];
  writeDescription?: boolean;
  writeInfoJson?: boolean;
  writeThumbnail?: boolean;
  embedSubs?: boolean;
  embedThumbnail?: boolean;
  rateLimit?: string;
  concurrent?: number;
  startTime?: string;
  endTime?: string;
  playlistStart?: number;
  playlistEnd?: number;
  maxDownloads?: number;
  cookies?: string;
  userAgent?: string;
  proxy?: string;
  username?: string;
  password?: string;
  videoPassword?: string;
  geoBypass?: boolean;
  geoBypassCountry?: string;
}

export interface Download {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  status: DownloadStatus;
  progress: number;
  speed: string;
  eta: string;
  size: string;
  downloadedBytes: number;
  totalBytes?: number;
  outputPath: string;
  filename: string;
  format: string;
  quality: string;
  startTime: Date;
  endTime?: Date;
  error?: string;
  options: DownloadOptions;
}

export enum DownloadStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PROCESSING = 'processing',
}

export interface DownloadProgress {
  downloadId: string;
  progress: number;
  speed: string;
  eta: string;
  size: string;
  downloadedBytes: number;
  totalBytes?: number;
}

export interface Settings {
  // General
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoUpdateYtDlp: boolean;
  checkUpdatesOnStartup: boolean;
  minimizeToTray: boolean;
  closeToTray: boolean;
  startMinimized: boolean;
  autoStart: boolean;
  
  // Downloads
  defaultDownloadPath: string;
  maxConcurrentDownloads: number;
  defaultFormat: string;
  defaultQuality: string;
  defaultAudioFormat: string;
  createSubfolders: boolean;
  overwriteFiles: boolean;
  continuePartialDownloads: boolean;
  
  // Network
  maxDownloadSpeed: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  proxy: string;
  useProxy: boolean;
  
  // Advanced
  ffmpegPath: string;
  ytdlpPath: string;
  customArgs: string;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warning' | 'error';
  
  // UI
  showThumbnails: boolean;
  showProgressInTaskbar: boolean;
  showNotifications: boolean;
  soundOnComplete: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;
  
  // Privacy
  clearHistoryOnExit: boolean;
  saveDownloadHistory: boolean;
  anonymizeFilenames: boolean;
}

export interface AppState {
  isInitialized: boolean;
  ytdlpInstalled: boolean;
  appVersion: string;
  platform: string;
  updateAvailable: boolean;
  isUpdating: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  downloadPath: string;
  filename: string;
  fileSize: number;
  downloadTime: Date;
  duration: number;
  format: string;
  quality: string;
}

export interface QueueItem {
  id: string;
  url: string;
  options: DownloadOptions;
  priority: number;
  addedAt: Date;
  scheduledFor?: Date;
}

export interface Statistics {
  totalDownloads: number;
  successfulDownloads: number;
  failedDownloads: number;
  totalDataDownloaded: number;
  averageDownloadSpeed: number;
  totalDownloadTime: number;
  favoriteFormats: Record<string, number>;
  downloadsByDate: Record<string, number>;
}

export interface Playlist {
  id: string;
  title: string;
  uploader: string;
  entries: PlaylistEntry[];
  selected: string[];
}

export interface PlaylistEntry {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  url: string;
}

export interface SupportedSite {
  name: string;
  url: string;
  supported_formats: string[];
  supports_playlists: boolean;
  supports_subtitles: boolean;
  supports_thumbnails: boolean;
  description: string;
}

export interface AuthenticationInfo {
  site: string;
  username: string;
  password: string;
  cookies?: string;
  headers?: Record<string, string>;
}

export interface FilterOptions {
  status?: DownloadStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  format?: string[];
  quality?: string[];
  searchTerm?: string;
  sortBy?: 'title' | 'date' | 'size' | 'progress';
  sortOrder?: 'asc' | 'desc';
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'xml';
  includeMetadata: boolean;
  includeHistory: boolean;
  includeSettings: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ImportOptions {
  format: 'json' | 'csv' | 'xml' | 'txt';
  overwriteExisting: boolean;
  mergeSettings: boolean;
  preserveHistory: boolean;
}

export interface UpdateInfo {
  available: boolean;
  version: string;
  releaseNotes: string;
  downloadUrl: string;
  mandatory: boolean;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
  memory: {
    total: number;
    used: number;
    available: number;
  };
  disk: {
    total: number;
    used: number;
    available: number;
  };
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkSpeed: {
    download: number;
    upload: number;
  };
  activeDownloads: number;
  queueSize: number;
}

// Event types for IPC communication
export interface IPCEvents {
  'download-progress': DownloadProgress;
  'download-complete': { downloadId: string };
  'download-error': { downloadId: string; error: string };
  'download-failed': { downloadId: string; code: number };
  'pause-all-downloads': void;
  'resume-all-downloads': void;
  'show-settings': void;
  'update-available': void;
  'update-downloaded': void;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Modify<T, R> = Omit<T, keyof R> & R;