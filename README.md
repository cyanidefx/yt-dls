# YT-DL Studio

A modern, visually attractive, and feature-rich GUI application for yt-dlp with a monochrome design inspired by Motrix.

![YT-DL Studio](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

## 🎨 Features

### Core Download Features
- **Multi-platform Support**: Download from YouTube, Vimeo, Twitch, and 1000+ other sites
- **Format Selection**: Choose from available video/audio formats
- **Quality Options**: Select resolution, bitrate, and codec preferences
- **Audio Extraction**: Convert videos to MP3, M4A, WAV, and other audio formats
- **Playlist Support**: Download entire playlists with custom options
- **Subtitle Download**: Extract subtitles in various languages and formats
- **Metadata Embedding**: Automatically add title, artist, and other metadata
- **Thumbnail Download**: Save video thumbnails automatically

### Advanced Features
- **Concurrent Downloads**: Download multiple files simultaneously
- **Resume Downloads**: Continue interrupted downloads
- **Download Queue**: Manage and prioritize downloads
- **Progress Tracking**: Real-time progress bars with speed and ETA
- **Download History**: Track all completed downloads
- **Custom Output Paths**: Specify download directories
- **Filename Templates**: Customize file naming patterns

### User Interface
- **Modern Design**: Clean, monochrome interface inspired by Motrix
- **Dark/Light Theme**: Toggle between themes with smooth transitions
- **Floating Navigation**: Detached navbar with smooth animations
- **3D Elements**: Futuristic progress bars and UI components
- **Responsive Layout**: Works on different screen sizes
- **Smooth Animations**: Framer Motion powered transitions
- **Real-time Updates**: Live progress and status updates

### Technical Features
- **Electron App**: Cross-platform desktop application
- **React Frontend**: Modern, responsive UI with TypeScript
- **Python Backend**: Robust yt-dlp integration
- **Real-time Communication**: WebSocket-like updates
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed download logs and debugging

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- yt-dlp (will be installed automatically)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/yt-dls.git
   cd yt-dls
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## 📖 Usage

### Basic Download
1. Launch YT-DL Studio
2. Enter a video URL in the input field
3. Click "Download" or press Enter
4. Monitor progress in the downloads section

### Advanced Options
- **Format Selection**: Click the format button to choose quality
- **Audio Only**: Toggle audio-only mode for music downloads
- **Custom Path**: Select download directory in settings
- **Batch Download**: Add multiple URLs for queue processing

### Navigation
- **Downloads**: Main download interface and queue management
- **Settings**: Configure download paths, formats, and preferences
- **History**: View completed downloads and statistics

## 🛠️ Development

### Project Structure
```
yt-dls/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── store/             # Zustand state management
│   ├── styles/            # CSS stylesheets
│   └── types/             # TypeScript type definitions
├── backend/               # Python Flask backend
│   └── app.py            # Main backend application
├── electron/              # Electron main process
│   ├── main.js           # Main process file
│   └── preload.js        # Preload script
└── dist/                  # Built application
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run dist` - Create distributable package
- `npm start` - Start production application

### Backend API Endpoints
- `POST /api/extract` - Extract video information
- `POST /api/download` - Start download
- `GET /api/downloads` - Get all downloads
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update settings

## 🎯 Features Comparison

| Feature | YT-DL Studio | Parabolic | Stacher |
|---------|-------------|-----------|---------|
| Modern UI | ✅ | ✅ | ✅ |
| Dark/Light Theme | ✅ | ✅ | ✅ |
| Format Selection | ✅ | ✅ | ✅ |
| Audio Extraction | ✅ | ✅ | ✅ |
| Playlist Support | ✅ | ✅ | ✅ |
| Concurrent Downloads | ✅ | ✅ | ✅ |
| Download History | ✅ | ✅ | ✅ |
| Custom Paths | ✅ | ✅ | ✅ |
| Subtitle Download | ✅ | ✅ | ✅ |
| Metadata Embedding | ✅ | ✅ | ✅ |
| Floating Navigation | ✅ | ❌ | ❌ |
| 3D UI Elements | ✅ | ❌ | ❌ |
| Real-time Progress | ✅ | ✅ | ✅ |
| Cross-platform | ✅ | ✅ | ✅ |

## 🔧 Configuration

### Settings Options
- **Download Path**: Default download directory
- **Format Preference**: Default video/audio format
- **Audio Format**: Default audio extraction format
- **Subtitles**: Enable/disable subtitle download
- **Thumbnails**: Enable/disable thumbnail download
- **Metadata**: Enable/disable metadata embedding
- **Concurrent Downloads**: Number of simultaneous downloads

### Advanced Settings
- **Custom yt-dlp Options**: Add custom command-line arguments
- **Proxy Settings**: Configure proxy for downloads
- **Authentication**: Add cookies and credentials
- **Rate Limiting**: Control download speed

## 🐛 Troubleshooting

### Common Issues
1. **Python not found**: Ensure Python 3.8+ is installed and in PATH
2. **yt-dlp not working**: Update yt-dlp with `pip install --upgrade yt-dlp`
3. **Download fails**: Check internet connection and URL validity
4. **Permission errors**: Run as administrator or check folder permissions

### Debug Mode
```bash
# Enable debug logging
npm run dev -- --debug

# View backend logs
python backend/app.py --debug
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The powerful video downloader
- [Parabolic](https://github.com/NickvisionApps/Parabolic) - Inspiration for features
- [Stacher](https://stacher.io/) - UI/UX inspiration
- [Motrix](https://motrix.app/) - Design inspiration
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide React](https://lucide.dev/) - Icon library

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/yt-dls/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/yt-dls/discussions)
- **Email**: support@ytdls.app

---

Made with ❤️ by the YT-DL Studio Team
