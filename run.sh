#!/bin/bash

echo "🚀 Starting YT-DL Studio..."

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
else
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Check if Node.js is available
if command -v node &> /dev/null; then
    echo "✅ Node.js found"
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Install Python dependencies (if possible)
echo "📦 Installing Python dependencies..."
if pip3 install --user flask flask-cors yt-dlp requests 2>/dev/null; then
    echo "✅ Python dependencies installed"
else
    echo "⚠️  Could not install Python dependencies automatically"
    echo "   Please install manually: pip3 install flask flask-cors yt-dlp requests"
fi

# Start the application
echo "🎯 Starting development server..."
npm run dev