@echo off
echo 🚀 Starting YT-DL Studio...

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8+
    pause
    exit /b 1
)
echo ✅ Python found

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install flask flask-cors yt-dlp requests
if %errorlevel% neq 0 (
    echo ⚠️  Could not install Python dependencies automatically
    echo    Please install manually: pip install flask flask-cors yt-dlp requests
)

REM Start the application
echo 🎯 Starting development server...
npm run dev

pause