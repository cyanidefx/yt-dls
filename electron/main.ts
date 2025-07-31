import { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage } from 'electron';
import { autoUpdater } from 'electron-updater';
import windowStateKeeper from 'electron-window-state';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs-extra';
import Store from 'electron-store';
import cron from 'node-cron';

// Initialize store for persistent settings
const store = new Store();

// Global variables
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let downloadProcesses: Map<string, ChildProcess> = new Map();
let isQuitting = false;

const isDev = process.env.NODE_ENV === 'development';
const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';

// Create the application window
function createWindow(): void {
  // Manage window state
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 800,
  });

  // Create the browser window
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    frame: false,
    transparent: true,
    vibrancy: 'under-window',
    backgroundMaterial: 'acrylic',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev,
    },
  });

  // Let windowStateKeeper manage the window
  mainWindowState.manage(mainWindow);

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    if (isDev) {
      mainWindow?.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window close event
  mainWindow.on('close', (event) => {
    if (!isQuitting && store.get('minimizeToTray', true)) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle navigation
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'http://localhost:5173' && !isDev) {
      event.preventDefault();
    }
  });
}

// Create system tray
function createTray(): void {
  const trayIcon = nativeImage.createFromPath(
    path.join(__dirname, '../assets/icons/tray.png')
  );
  
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show YT-DL Studio',
      click: () => {
        mainWindow?.show();
        if (isMac) {
          app.dock.show();
        }
      },
    },
    {
      label: 'Downloads',
      submenu: [
        {
          label: 'Active Downloads: 0',
          enabled: false,
        },
        { type: 'separator' },
        {
          label: 'Pause All',
          click: () => {
            mainWindow?.webContents.send('pause-all-downloads');
          },
        },
        {
          label: 'Resume All',
          click: () => {
            mainWindow?.webContents.send('resume-all-downloads');
          },
        },
      ],
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send('show-settings');
      },
    },
    {
      label: 'Quit YT-DL Studio',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('YT-DL Studio');

  // Show window on tray click
  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
    }
  });
}

// IPC Handlers
function setupIpcHandlers(): void {
  // Window controls
  ipcMain.handle('window-minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle('window-close', () => {
    mainWindow?.close();
  });

  // File system operations
  ipcMain.handle('select-download-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory'],
      title: 'Select Download Folder',
    });
    
    if (!result.canceled) {
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.handle('open-folder', async (_, folderPath: string) => {
    shell.openPath(folderPath);
  });

  ipcMain.handle('open-file', async (_, filePath: string) => {
    shell.openPath(filePath);
  });

  // yt-dlp operations
  ipcMain.handle('check-ytdlp', async () => {
    return checkYtDlpInstallation();
  });

  ipcMain.handle('install-ytdlp', async () => {
    return installYtDlp();
  });

  ipcMain.handle('update-ytdlp', async () => {
    return updateYtDlp();
  });

  ipcMain.handle('get-video-info', async (_, url: string) => {
    return getVideoInfo(url);
  });

  ipcMain.handle('start-download', async (_, downloadOptions: any) => {
    return startDownload(downloadOptions);
  });

  ipcMain.handle('cancel-download', async (_, downloadId: string) => {
    return cancelDownload(downloadId);
  });

  ipcMain.handle('pause-download', async (_, downloadId: string) => {
    return pauseDownload(downloadId);
  });

  ipcMain.handle('resume-download', async (_, downloadId: string) => {
    return resumeDownload(downloadId);
  });

  // Settings
  ipcMain.handle('get-settings', () => {
    return store.store;
  });

  ipcMain.handle('set-setting', (_, key: string, value: any) => {
    store.set(key, value);
  });

  ipcMain.handle('reset-settings', () => {
    store.clear();
  });

  // App info
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('get-platform', () => {
    return process.platform;
  });

  // Updates
  ipcMain.handle('check-for-updates', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

// yt-dlp functions
async function checkYtDlpInstallation(): Promise<boolean> {
  return new Promise((resolve) => {
    const ytdlp = spawn('yt-dlp', ['--version']);
    
    ytdlp.on('close', (code) => {
      resolve(code === 0);
    });

    ytdlp.on('error', () => {
      resolve(false);
    });
  });
}

async function installYtDlp(): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    let command: string;
    let args: string[];

    if (isWindows) {
      command = 'powershell';
      args = ['-Command', 'pip install yt-dlp'];
    } else {
      command = 'pip3';
      args = ['install', 'yt-dlp'];
    }

    const install = spawn(command, args);
    let output = '';

    install.stdout?.on('data', (data) => {
      output += data.toString();
    });

    install.stderr?.on('data', (data) => {
      output += data.toString();
    });

    install.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, message: 'yt-dlp installed successfully' });
      } else {
        resolve({ success: false, message: `Installation failed: ${output}` });
      }
    });
  });
}

async function updateYtDlp(): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const update = spawn('yt-dlp', ['-U']);
    let output = '';

    update.stdout?.on('data', (data) => {
      output += data.toString();
    });

    update.stderr?.on('data', (data) => {
      output += data.toString();
    });

    update.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, message: 'yt-dlp updated successfully' });
      } else {
        resolve({ success: false, message: `Update failed: ${output}` });
      }
    });
  });
}

async function getVideoInfo(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const ytdlp = spawn('yt-dlp', ['-J', url]);
    let output = '';
    let error = '';

    ytdlp.stdout?.on('data', (data) => {
      output += data.toString();
    });

    ytdlp.stderr?.on('data', (data) => {
      error += data.toString();
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        try {
          const info = JSON.parse(output);
          resolve(info);
        } catch (err) {
          reject(new Error('Failed to parse video info'));
        }
      } else {
        reject(new Error(error || 'Failed to get video info'));
      }
    });
  });
}

async function startDownload(options: any): Promise<string> {
  const downloadId = generateId();
  const args = buildYtDlpArgs(options);

  const ytdlp = spawn('yt-dlp', args);
  downloadProcesses.set(downloadId, ytdlp);

  ytdlp.stdout?.on('data', (data) => {
    const output = data.toString();
    parseDownloadProgress(downloadId, output);
  });

  ytdlp.stderr?.on('data', (data) => {
    const error = data.toString();
    mainWindow?.webContents.send('download-error', { downloadId, error });
  });

  ytdlp.on('close', (code) => {
    downloadProcesses.delete(downloadId);
    if (code === 0) {
      mainWindow?.webContents.send('download-complete', { downloadId });
    } else {
      mainWindow?.webContents.send('download-failed', { downloadId, code });
    }
  });

  return downloadId;
}

function buildYtDlpArgs(options: any): string[] {
  const args = [
    '--newline',
    '--progress',
    '-o', options.outputPath || '%(title)s.%(ext)s',
  ];

  if (options.format) {
    args.push('-f', options.format);
  }

  if (options.extractAudio) {
    args.push('--extract-audio');
    if (options.audioFormat) {
      args.push('--audio-format', options.audioFormat);
    }
  }

  if (options.writeSubtitles) {
    args.push('--write-subs');
  }

  if (options.writeAutoSubtitles) {
    args.push('--write-auto-subs');
  }

  if (options.subtitleLanguages) {
    args.push('--sub-langs', options.subtitleLanguages.join(','));
  }

  if (options.writeDescription) {
    args.push('--write-description');
  }

  if (options.writeInfoJson) {
    args.push('--write-info-json');
  }

  if (options.writeThumbnail) {
    args.push('--write-thumbnail');
  }

  if (options.rateLimit) {
    args.push('--limit-rate', options.rateLimit);
  }

  if (options.concurrent) {
    args.push('--concurrent-fragments', options.concurrent.toString());
  }

  args.push(options.url);
  return args;
}

function parseDownloadProgress(downloadId: string, output: string): void {
  const lines = output.split('\n');
  
  for (const line of lines) {
    if (line.includes('[download]')) {
      const progressMatch = line.match(/(\d+\.?\d*)%/);
      const speedMatch = line.match(/(\d+\.?\d*\w+\/s)/);
      const etaMatch = line.match(/ETA (\d+:\d+)/);
      const sizeMatch = line.match(/(\d+\.?\d*\w+B)/);

      if (progressMatch) {
        const progress = parseFloat(progressMatch[1]);
        const speed = speedMatch ? speedMatch[1] : '';
        const eta = etaMatch ? etaMatch[1] : '';
        const size = sizeMatch ? sizeMatch[1] : '';

        mainWindow?.webContents.send('download-progress', {
          downloadId,
          progress,
          speed,
          eta,
          size,
        });
      }
    }
  }
}

async function cancelDownload(downloadId: string): Promise<void> {
  const process = downloadProcesses.get(downloadId);
  if (process) {
    process.kill('SIGTERM');
    downloadProcesses.delete(downloadId);
  }
}

async function pauseDownload(downloadId: string): Promise<void> {
  const process = downloadProcesses.get(downloadId);
  if (process && !isWindows) {
    process.kill('SIGSTOP');
  }
}

async function resumeDownload(downloadId: string): Promise<void> {
  const process = downloadProcesses.get(downloadId);
  if (process && !isWindows) {
    process.kill('SIGCONT');
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createTray();
  setupIpcHandlers();

  // Auto-updater
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  // Schedule daily yt-dlp updates
  cron.schedule('0 2 * * *', () => {
    if (store.get('autoUpdateYtDlp', true)) {
      updateYtDlp();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

// Security
app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Auto updater events
autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update-downloaded');
});