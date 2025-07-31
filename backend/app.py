#!/usr/bin/env python3
import os
import sys
import json
import subprocess
import threading
import time
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import re
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Global variables
downloads = {}
download_history = []
settings = {
    'download_path': str(Path.home() / 'Downloads'),
    'format': 'best',
    'audio_format': 'mp3',
    'video_format': 'mp4',
    'subtitles': False,
    'thumbnail': True,
    'metadata': True,
    'playlist': False,
    'concurrent_downloads': 3
}

class DownloadManager:
    def __init__(self):
        self.downloads = {}
        self.history = []
        
    def add_download(self, url, options):
        download_id = str(int(time.time() * 1000))
        download = {
            'id': download_id,
            'url': url,
            'status': 'queued',
            'progress': 0,
            'speed': '0 B/s',
            'eta': 'Unknown',
            'filename': '',
            'filesize': 0,
            'downloaded': 0,
            'options': options,
            'start_time': datetime.now().isoformat(),
            'error': None
        }
        self.downloads[download_id] = download
        return download_id
    
    def get_download(self, download_id):
        return self.downloads.get(download_id)
    
    def get_all_downloads(self):
        return list(self.downloads.values())
    
    def update_download(self, download_id, **kwargs):
        if download_id in self.downloads:
            self.downloads[download_id].update(kwargs)
    
    def remove_download(self, download_id):
        if download_id in self.downloads:
            del self.downloads[download_id]

download_manager = DownloadManager()

def progress_hook(d):
    if d['status'] == 'downloading':
        download_id = d.get('info_dict', {}).get('_download_id')
        if download_id and download_id in download_manager.downloads:
            progress = d.get('_percent_str', '0%').replace('%', '')
            speed = d.get('_speed_str', '0 B/s')
            eta = d.get('_eta_str', 'Unknown')
            
            download_manager.update_download(download_id, 
                progress=float(progress),
                speed=speed,
                eta=eta,
                downloaded=d.get('downloaded_bytes', 0),
                status='downloading'
            )
    
    elif d['status'] == 'finished':
        download_id = d.get('info_dict', {}).get('_download_id')
        if download_id:
            download_manager.update_download(download_id, 
                status='completed',
                progress=100
            )

@app.route('/api/extract', methods=['POST'])
def extract_info():
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
        return jsonify({
            'title': info.get('title'),
            'duration': info.get('duration'),
            'uploader': info.get('uploader'),
            'thumbnail': info.get('thumbnail'),
            'formats': info.get('formats', []),
            'webpage_url': info.get('webpage_url'),
            'upload_date': info.get('upload_date'),
            'view_count': info.get('view_count'),
            'like_count': info.get('like_count'),
            'description': info.get('description', '')[:500] + '...' if info.get('description') else ''
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download', methods=['POST'])
def start_download():
    data = request.json
    url = data.get('url')
    options = data.get('options', {})
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    download_id = download_manager.add_download(url, options)
    
    # Start download in background thread
    thread = threading.Thread(target=download_file, args=(download_id, url, options))
    thread.daemon = True
    thread.start()
    
    return jsonify({'download_id': download_id})

def download_file(download_id, url, options):
    try:
        ydl_opts = {
            'outtmpl': os.path.join(settings['download_path'], '%(title)s.%(ext)s'),
            'progress_hooks': [progress_hook],
            'format': options.get('format', settings['format']),
            'writesubtitles': options.get('subtitles', settings['subtitles']),
            'writethumbnail': options.get('thumbnail', settings['thumbnail']),
            'writemetadata': options.get('metadata', settings['metadata']),
            'extractaudio': options.get('audio_only', False),
            'audioformat': options.get('audio_format', settings['audio_format']),
            'postprocessors': []
        }
        
        if options.get('audio_only'):
            ydl_opts['postprocessors'].append({
                'key': 'FFmpegExtractAudio',
                'preferredcodec': options.get('audio_format', 'mp3')
            })
        
        download_manager.update_download(download_id, status='downloading')
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            
        download_manager.update_download(download_id, status='completed', progress=100)
        
    except Exception as e:
        download_manager.update_download(download_id, status='error', error=str(e))

@app.route('/api/downloads', methods=['GET'])
def get_downloads():
    return jsonify(download_manager.get_all_downloads())

@app.route('/api/downloads/<download_id>', methods=['GET'])
def get_download(download_id):
    download = download_manager.get_download(download_id)
    if download:
        return jsonify(download)
    return jsonify({'error': 'Download not found'}), 404

@app.route('/api/downloads/<download_id>', methods=['DELETE'])
def cancel_download(download_id):
    download_manager.remove_download(download_id)
    return jsonify({'message': 'Download cancelled'})

@app.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify(settings)

@app.route('/api/settings', methods=['PUT'])
def update_settings():
    data = request.json
    settings.update(data)
    return jsonify(settings)

@app.route('/api/formats', methods=['POST'])
def get_formats():
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    try:
        ydl_opts = {'quiet': True, 'no_warnings': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = info.get('formats', [])
            
            # Filter and organize formats
            video_formats = []
            audio_formats = []
            
            for fmt in formats:
                if fmt.get('vcodec') != 'none':
                    video_formats.append({
                        'format_id': fmt.get('format_id'),
                        'ext': fmt.get('ext'),
                        'resolution': fmt.get('resolution'),
                        'filesize': fmt.get('filesize'),
                        'fps': fmt.get('fps'),
                        'vcodec': fmt.get('vcodec'),
                        'acodec': fmt.get('acodec')
                    })
                elif fmt.get('acodec') != 'none':
                    audio_formats.append({
                        'format_id': fmt.get('format_id'),
                        'ext': fmt.get('ext'),
                        'filesize': fmt.get('filesize'),
                        'acodec': fmt.get('acodec'),
                        'abr': fmt.get('abr')
                    })
            
            return jsonify({
                'video_formats': video_formats,
                'audio_formats': audio_formats
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("YT-DL Studio Backend starting on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
