# YT-DL Studio

<div align="center">
  <img src="assets/icons/icon.png" alt="YT-DL Studio Logo" width="128" height="128">
  
  **A modern, visually attractive and monochrome frontend GUI for yt-dlp**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
  [![Electron](https://img.shields.io/badge/Electron-191970?logo=Electron&logoColor=white)](https://www.electronjs.org/)
  [![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Development](#-development)
- [Building](#-building)
- [Configuration](#-configuration)
- [Technologies Used](#-technologies-used)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Overview

**YT-DL Studio** is a modern, cross-platform desktop application that provides a beautiful graphical interface for the powerful `yt-dlp` command-line tool. It combines all the features from **Parabolic** and **Stacher** with a modern **Motrix-inspired** design, featuring a floating navbar, 3D effects, and a monochrome theme with smooth light/dark mode transitions.

### Key Highlights
- 🎨 **Modern UI**: Motrix-inspired design with floating navbar and glass-morphism effects
- 🔥 **Full Feature Set**: All capabilities from Parabolic + Stacher combined
- ⚡ **High Performance**: Built with Electron + React + TypeScript
- 🌓 **Theme Support**: Beautiful light/dark theme with system preference detection
- 🎯 **User-Friendly**: Intuitive interface with drag-and-drop support
- 🚀 **Cross-Platform**: Windows, macOS, and Linux support

## ✨ Features

### 🎯 Core Download Features
- **Multi-format Support**: Download videos in MP4, WebM, MOV, AVI, etc.
- **Audio Extraction**: Extract audio in MP3, OPUS, FLAC, M4A, WAV formats
- **Quality Selection**: Choose from 360p to 8K quality options
- **Concurrent Downloads**: Up to 10 simultaneous downloads
- **Batch Processing**: Download multiple URLs at once
- **Playlist Support**: Download entire playlists with selective picking
- **Resume Downloads**: Continue interrupted downloads seamlessly
- **Real-time Progress**: Live progress with speed, ETA, and file size

### 🎨 UI/UX Features
- **Floating Navigation**: Glass-morphism navbar detached from top
- **3D Download Bars**: Futuristic progress bars with animations
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Design**: Adapts to all screen sizes
- **Dark/Light Theme**: System preference with manual toggle
- **Monochrome Palette**: Beautiful grayscale design with accent colors

### 🔧 Advanced Features
- **Metadata Download**: Video descriptions, thumbnails, subtitles
- **Queue Management**: Organize and prioritize downloads
- **User Authentication**: Login support for private content
- **Custom Output**: Configurable file paths and naming
- **Download History**: Track all downloads with statistics
- **System Tray**: Background operation with tray integration
- **Auto-Updates**: Keep yt-dlp and app up-to-date

## 📁 Project Structure

```
yt-dls/
├── 📁 electron/                    # Electron main process
│   ├── 📄 main.ts                 # Main application entry point
│   └── 📄 preload.ts              # Secure IPC communication bridge
├── 📁 src/                        # React renderer process
│   ├── 📁 components/             # React UI components
│   │   ├── 📁 layout/             # Layout components (Navbar, Sidebar, etc.)
│   │   ├── 📁 ui/                 # Reusable UI components
│   │   ├── 📁 modals/             # Modal dialogs
│   │   └── 📁 download/           # Download-related components
│   ├── 📁 contexts/               # React Context providers
│   │   ├── 📄 ThemeContext.tsx    # Theme management (light/dark)
│   │   ├── 📄 DownloadContext.tsx # Download state management
│   │   ├── 📄 SettingsContext.tsx # Application settings
│   │   └── 📄 ToastContext.tsx    # Notification system
│   ├── 📁 types/                  # TypeScript type definitions
│   │   └── 📄 index.ts            # All application interfaces
│   ├── 📁 utils/                  # Utility functions
│   ├── 📄 App.tsx                 # Main React application
│   ├── 📄 main.tsx                # React entry point
│   └── 📄 index.css               # Global styles with Tailwind
├── 📁 assets/                     # Static assets
│   └── 📁 icons/                  # Application icons
├── 📁 build/                      # Build output directory
├── 📁 dist/                       # Distribution files
├── 📁 release/                    # Packaged applications
├── 📄 package.json                # Dependencies and scripts
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 tsconfig.main.json          # Electron main process TS config
├── 📄 vite.config.ts              # Vite build configuration
├── 📄 tailwind.config.js          # Tailwind CSS configuration
├── 📄 postcss.config.js           # PostCSS configuration
├── 📄 electron-builder.yml        # Electron builder configuration
└── 📄 README.md                   # This file
```

### 📂 Detailed Component Structure

```
src/components/
├── layout/
│   ├── Navbar.tsx                 # Floating navigation bar
│   ├── Sidebar.tsx                # Side navigation panel
│   └── MainContent.tsx            # Main content area
├── ui/
│   ├── LoadingScreen.tsx          # Animated loading screen
│   ├── ToastContainer.tsx         # Notification container
│   ├── Button.tsx                 # Custom button component
│   ├── Input.tsx                  # Form input components
│   ├── ProgressBar.tsx            # 3D progress bars
│   └── ThemeToggle.tsx            # Theme switcher
├── modals/
│   ├── SettingsModal.tsx          # Settings dialog
│   ├── DownloadModal.tsx          # Download configuration
│   └── AboutModal.tsx             # About application
└── download/
    ├── DownloadQueue.tsx          # Download queue manager
    ├── DownloadItem.tsx           # Individual download item
    ├── DownloadHistory.tsx        # Download history view
    └── URLInput.tsx               # URL input with validation
```

## 🔧 Prerequisites

Before running YT-DL Studio, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** (for cloning the repository)
- **Python** (v3.8+ recommended, for yt-dlp)

### Platform-Specific Requirements

#### Windows
- **Visual Studio Build Tools** or **Visual Studio 2022**
- **Windows SDK** (latest version)

#### macOS
- **Xcode Command Line Tools**: `xcode-select --install`

#### Linux
- **build-essential**: `sudo apt install build-essential`
- **libnss3-dev**: `sudo apt install libnss3-dev`

## 🚀 Installation & Setup

### Method 1: Clone from GitHub

```bash
# Clone the repository
git clone https://github.com/cyanide-fx/yt-dls.git

# Navigate to project directory
cd yt-dls

# Install dependencies
npm install

# Start development server
npm run dev
```

### Method 2: Download Release

1. Visit the [Releases](https://github.com/cyanide-fx/yt-dls/releases) page
2. Download the appropriate installer for your platform:
   - **Windows**: `YT-DL-Studio-Setup-x.x.x.exe`
   - **macOS**: `YT-DL-Studio-x.x.x.dmg`
   - **Linux**: `YT-DL-Studio-x.x.x.AppImage`

### yt-dlp Installation

YT-DL Studio will attempt to install yt-dlp automatically. If needed, install manually:

```bash
# Using pip
pip install yt-dlp

# Using conda
conda install -c conda-forge yt-dlp

# Using homebrew (macOS)
brew install yt-dlp
```

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run dev:renderer` | Start only the React development server |
| `npm run dev:main` | Compile and run Electron main process |
| `npm run build` | Build both renderer and main processes |
| `npm run build:renderer` | Build React application for production |
| `npm run build:main` | Compile Electron main process |
| `npm run build:all` | Build and package the application |
| `npm run build:win` | Build Windows installer |
| `npm run build:mac` | Build macOS DMG |
| `npm run build:linux` | Build Linux packages |
| `npm run pack` | Package without installer |
| `npm run dist` | Create distribution packages |
| `npm start` | Run the built application |

### Development Workflow

1. **Start Development Environment**
   ```bash
   npm run dev
   ```
   This starts both the React dev server (port 5173) and Electron

2. **Hot Reload**
   - React components hot reload automatically
   - Electron main process requires restart for changes

3. **Debugging**
   - React DevTools available in development
   - Electron DevTools accessible via `Ctrl+Shift+I`

### Environment Variables

Create a `.env` file in the root directory:

```env
# Development mode
NODE_ENV=development

# API endpoints (if needed)
API_BASE_URL=https://api.example.com

# Feature flags
ENABLE_DEBUG=true
ENABLE_AUTO_UPDATE=false
```

## 🏗️ Building

### Development Build
```bash
npm run build
```

### Production Builds

#### All Platforms
```bash
npm run build:all
```

#### Platform-Specific
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

### Build Outputs

- **Windows**: `release/YT-DL-Studio-Setup-x.x.x.exe`
- **macOS**: `release/YT-DL-Studio-x.x.x.dmg`
- **Linux**: `release/YT-DL-Studio-x.x.x.AppImage`

## ⚙️ Configuration

### Application Settings

The application stores settings in platform-specific locations:

- **Windows**: `%APPDATA%/yt-dl-studio/`
- **macOS**: `~/Library/Application Support/yt-dl-studio/`
- **Linux**: `~/.config/yt-dl-studio/`

### Configuration Files

- `config.json` - Application settings
- `downloads.json` - Download history
- `queue.json` - Download queue state

### Customization

#### Theme Customization
Edit `tailwind.config.js` to modify colors and styling:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Custom color palette
        },
        accent: {
          // Accent colors
        }
      }
    }
  }
}
```

#### Default Settings
Modify `src/contexts/SettingsContext.tsx` to change default values.

## 🔧 Technologies Used

### Core Technologies
- **[Electron](https://electronjs.org/)** - Cross-platform desktop app framework
- **[React 18](https://reactjs.org/)** - UI library with hooks and concurrent features
- **[TypeScript](https://typescriptlang.org/)** - Type-safe JavaScript development
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://framer.com/motion/)** - Animation library
- **[Radix UI](https://radix-ui.com/)** - Accessible UI components
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend & Tools
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** - Video download engine
- **[electron-builder](https://electron.build/)** - Package and distribute
- **[electron-store](https://github.com/sindresorhus/electron-store)** - Data persistence
- **[node-cron](https://github.com/node-cron/node-cron)** - Task scheduling

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages

## 🐛 Troubleshooting

### Common Issues

#### yt-dlp Not Found
```bash
# Install yt-dlp manually
pip install yt-dlp

# Verify installation
yt-dlp --version
```

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild native modules
npm run postinstall
```

#### Permission Issues (Linux/macOS)
```bash
# Make AppImage executable
chmod +x YT-DL-Studio-x.x.x.AppImage

# Run with elevated privileges if needed
sudo ./YT-DL-Studio-x.x.x.AppImage
```

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` or use the debug menu in the application.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses
- **yt-dlp**: The Unlicense
- **Electron**: MIT License
- **React**: MIT License
- **Tailwind CSS**: MIT License

## 🙏 Acknowledgments

- **[yt-dlp team](https://github.com/yt-dlp/yt-dlp)** - Amazing download engine
- **[Parabolic](https://github.com/NickvisionApps/Parabolic)** - Feature inspiration
- **[Stacher](https://stacher.io/)** - UI/UX reference
- **[Motrix](https://motrix.app/)** - Design inspiration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/cyanide-fx/yt-dls/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cyanide-fx/yt-dls/discussions)
- **Email**: [cyanide-fx@users.noreply.github.com](mailto:cyanide-fx@users.noreply.github.com)

---

<div align="center">
  <p>
    <strong>Made with ❤️ by <a href="https://github.com/cyanide-fx">cyanide-fx</a></strong>
  </p>
  <p>
    <a href="https://github.com/cyanide-fx/yt-dls/stargazers">⭐ Star this repo</a> •
    <a href="https://github.com/cyanide-fx/yt-dls/issues">🐛 Report Bug</a> •
    <a href="https://github.com/cyanide-fx/yt-dls/discussions">💡 Request Feature</a>
  </p>
</div>
