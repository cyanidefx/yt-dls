# -*- coding: utf-8 -*-
"""
Enhanced YT-DL Studio Backend
A robust Flask backend for YouTube video downloading with real-time progress tracking,
better error handling, and advanced features.
"""

import json
import subprocess
import threading
import time
import os
import re
import logging
import uuid
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
from werkzeug.exceptions import RequestEntityTooLarge
import psutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ytdl_backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max request size
DOWNLOAD_DIR = Path('downloads')
DOWNLOAD_DIR.mkdir(exist_ok=True)

# Global dictionaries to track downloads and progress
active_downloads = {}
download_progress = {}

class DownloadProgress:
    """Class to track download progress"""
    def __init__(self, download_id):
        self.download_id = download_id
        self.status = 'initializing'
        self.progress = 0.0
        self.speed = 0
        self.eta = None
        self.downloaded_bytes = 0
        self.total_bytes = 0
        self.filename = None
        self.error = None
        self.started_at = datetime.now()
        self.completed_at = None
        self.log = []
        self.log_lock = threading.Lock()
        
    def to_dict(self):
        base_dict = {
            'download_id': self.download_id,
            'status': self.status,
            'progress': self.progress,
            'speed': self.speed,
            'eta': self.eta,
            'downloaded_bytes': self.downloaded_bytes,
            'total_bytes': self.total_bytes,
            'filename': self.filename,
            'error': self.error,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        }
        
        # Add dual progress tracking
        if hasattr(self, 'video_progress'):
            base_dict['video_progress'] = self.video_progress
        if hasattr(self, 'audio_progress'):
            base_dict['audio_progress'] = self.audio_progress
            
        return base_dict


def progress_hook(d, download_id):
    """Enhanced hook function for yt-dlp to track download progress with dual progress bars"""
    progress = download_progress.get(download_id)
    if not progress:
        return
    
    # Handle both direct hook calls and JSON-parsed data
    if isinstance(d, str):
        try:
            d = json.loads(d)
        except:
            return
    
    status = d.get('status', 'unknown')
    filename = d.get('filename', '')
    
    # Determine if this is video or audio based on filename or format info
    is_video = any(ext in filename.lower() for ext in ['.mp4', '.mkv', '.webm', '.avi']) and 'audio' not in filename.lower()
    is_audio = any(ext in filename.lower() for ext in ['.mp3', '.m4a', '.wav', '.aac']) or 'audio' in filename.lower()
    
    # Initialize progress trackers if they don't exist
    if not hasattr(progress, 'video_progress'):
        progress.video_progress = {'status': 'waiting', 'progress': 0, 'speed': 0, 'eta': None, 'downloaded_bytes': 0, 'total_bytes': 0}
    if not hasattr(progress, 'audio_progress'):
        progress.audio_progress = {'status': 'waiting', 'progress': 0, 'speed': 0, 'eta': None, 'downloaded_bytes': 0, 'total_bytes': 0}
    
    if status == 'downloading':
        progress.status = 'downloading'
        progress.filename = filename
        
        # Handle total bytes with priority: total_bytes > total_bytes_estimate
        total_bytes = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
        downloaded_bytes = d.get('downloaded_bytes', 0)
        
        # Update the appropriate progress tracker
        if is_video:
            progress.video_progress['status'] = 'downloading'
            progress.video_progress['total_bytes'] = total_bytes
            progress.video_progress['downloaded_bytes'] = downloaded_bytes
            progress.video_progress['progress'] = min((downloaded_bytes / total_bytes) * 100, 100.0) if total_bytes > 0 else 0
            progress.video_progress['speed'] = d.get('speed', 0) or 0
            progress.video_progress['eta'] = d.get('eta')
        elif is_audio:
            progress.audio_progress['status'] = 'downloading'
            progress.audio_progress['total_bytes'] = total_bytes
            progress.audio_progress['downloaded_bytes'] = downloaded_bytes
            progress.audio_progress['progress'] = min((downloaded_bytes / total_bytes) * 100, 100.0) if total_bytes > 0 else 0
            progress.audio_progress['speed'] = d.get('speed', 0) or 0
            progress.audio_progress['eta'] = d.get('eta')
        
        # Update main progress (for backward compatibility)
        progress.total_bytes = total_bytes
        progress.downloaded_bytes = downloaded_bytes
        if total_bytes > 0:
            progress.progress = min((downloaded_bytes / total_bytes) * 100, 100.0)
        else:
            progress.progress = 0
        progress.speed = d.get('speed', 0) or 0
        progress.eta = d.get('eta')
        
    elif status == 'finished':
        # Mark the appropriate track as completed
        if is_video:
            progress.video_progress['status'] = 'completed'
            progress.video_progress['progress'] = 100.0
        elif is_audio:
            progress.audio_progress['status'] = 'completed'
            progress.audio_progress['progress'] = 100.0
        
        # Check if both tracks are completed or if only one track was expected
        video_done = progress.video_progress['status'] == 'completed' or progress.video_progress['status'] == 'waiting'
        audio_done = progress.audio_progress['status'] == 'completed' or progress.audio_progress['status'] == 'waiting'
        
        if video_done and audio_done:
            progress.status = 'completed'
            progress.progress = 100.0
            progress.completed_at = datetime.now()
        else:
            progress.status = 'processing'
        
        progress.filename = filename
        progress.speed = 0
        progress.eta = None
        
    elif status == 'error':
        progress.status = 'failed'
        progress.error = str(d.get('error', 'Unknown error'))
        if is_video:
            progress.video_progress['status'] = 'failed'
        elif is_audio:
            progress.audio_progress['status'] = 'failed'
        
def sanitize_filename(filename):
    """Sanitize filename for cross-platform compatibility"""
    # Remove or replace invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Remove control characters
    filename = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', filename)
    # Limit length
    if len(filename) > 200:
        name, ext = os.path.splitext(filename)
        filename = name[:200-len(ext)] + ext
    return filename.strip()

def get_video_summary(info_dict):
    """Generate a summary of the video using available metadata"""
    title = info_dict.get('title', 'Unknown Title')
    description = info_dict.get('description', '')
    uploader = info_dict.get('uploader', 'Unknown')
    duration = info_dict.get('duration')
    
    # Create a basic summary
    summary_parts = []
    
    if uploader != 'Unknown':
        summary_parts.append(f"Uploaded by: {uploader}")
    
    if duration:
        mins, secs = divmod(duration, 60)
        hours, mins = divmod(mins, 60)
        if hours:
            duration_str = f"{hours:02d}:{mins:02d}:{secs:02d}"
        else:
            duration_str = f"{mins:02d}:{secs:02d}"
        summary_parts.append(f"Duration: {duration_str}")
    
    # Use first 200 characters of description as summary
    if description:
        clean_desc = re.sub(r'\s+', ' ', description.strip())
        if len(clean_desc) > 200:
            clean_desc = clean_desc[:200] + "..."
        summary_parts.append(clean_desc)
    
    return " | ".join(summary_parts) if summary_parts else "No additional information available."

# --- API Endpoints ---

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_downloads": len(active_downloads)
    })

def run_yt_dlp_command_for_listing(args):
    """Helper function to run a yt-dlp command and parse its output for lists."""
    try:
        command = ['yt-dlp'] + args
        logger.info(f"Running command: {' '.join(command)}")
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        if result.returncode != 0:
            logger.error(f"Command failed: {result.stderr}")
            return {"error": result.stderr or "Failed to execute command"}, 500
        
        # Filter out empty lines and potential warnings
        items = [line for line in result.stdout.strip().split('\n') if line and not line.lower().startswith('[')]
        return jsonify({"items": items})
        
    except FileNotFoundError:
        logger.error("yt-dlp command not found.")
        return jsonify({"error": "yt-dlp is not installed or not in PATH"}), 500
    except Exception as e:
        logger.error(f"Error fetching list: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/list-impersonate-targets', methods=['GET'])
def list_impersonate_targets():
    """Endpoint to get available impersonation targets."""
    return run_yt_dlp_command_for_listing(['--list-impersonate-targets'])

@app.route('/api/list-ap-msos', methods=['GET'])
def list_ap_msos():
    """Endpoint to get available Adobe Pass MSOs."""
    return run_yt_dlp_command_for_listing(['--ap-list-mso'])

@app.route('/api/info', methods=['GET'])
def get_video_info():
    """
    Fetches detailed information about a video URL using yt-dlp.
    Enhanced to handle both single videos and playlists.
    """
    video_url = request.args.get('url')
    if not video_url:
        return jsonify({"error": "URL parameter is required"}), 400

    if not re.match(r'https?://', video_url):
        return jsonify({"error": "Invalid URL format. Please provide a valid HTTP/HTTPS URL"}), 400

    # First, run with flat extract to quickly check for playlists
    flat_opts = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
        'extract_flat': True,
        'socket_timeout': 30,
        'retries': 3,
    }

    try:
        logger.info(f"Fetching info for URL (flat check): {video_url}")
        with yt_dlp.YoutubeDL(flat_opts) as ydl:
            info_dict = ydl.extract_info(video_url, download=False)

        if not info_dict:
            return jsonify({"error": "No information could be extracted from this URL"}), 400

        # If it's a playlist, return the list of video entries
        if info_dict.get('_type') == 'playlist':
            logger.info(f"Playlist detected: {info_dict.get('title')}")
            
            playlist_entries = []
            if 'entries' in info_dict and info_dict['entries']:
                for entry in info_dict['entries']:
                    if not entry: continue  # Skip potential null entries
                    playlist_entries.append({
                        'id': entry.get('id'),
                        'url': entry.get('url'),
                        'title': entry.get('title', 'Untitled Video'),
                        'duration': entry.get('duration'),
                        'thumbnail': entry.get('thumbnail'),
                    })
            
            return jsonify({
                '_type': 'playlist',
                'title': info_dict.get('title', 'Untitled Playlist'),
                'uploader': info_dict.get('uploader'),
                'entries': playlist_entries,
                'original_url': video_url,
            })
        
        # If it's a single video, re-fetch with full format details
        else:
            logger.info("Single video detected, re-fetching with detailed info.")
            detailed_opts = flat_opts.copy()
            detailed_opts['extract_flat'] = False
            with yt_dlp.YoutubeDL(detailed_opts) as ydl_detailed:
                detailed_info = ydl_detailed.extract_info(video_url, download=False)
            
            if not detailed_info:
                 return jsonify({"error": "No information could be extracted for this video"}), 400

            processed_info = process_info_dict(detailed_info)
            logger.info(f"Successfully processed info for: {processed_info.get('title', 'Unknown')}")
            return jsonify(processed_info)

    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e)
        logger.error(f"yt-dlp error for URL {video_url}: {error_msg}")
        if "not available" in error_msg.lower():
            return jsonify({"error": "This content is not available (private, deleted, or geo-blocked)"}), 404
        elif "unsupported url" in error_msg.lower():
            return jsonify({"error": "This URL is not supported by the downloader"}), 400
        else:
            return jsonify({"error": f"Could not process URL: {error_msg}"}), 500
            
    except Exception as e:
        logger.error(f"Unexpected error for URL {video_url}: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

def process_info_dict(info):
    """
    Enhanced helper function to parse the raw yt-dlp JSON output into a
    more frontend-friendly structure with better format categorization,
    file size estimation, and more accurate 'best' format selection.
    """
    video_formats = []
    audio_formats = []
    combined_formats = []
    duration = info.get('duration')

    for f in info.get('formats', []):
        if (f.get('vcodec') == 'images' or
            f.get('format_note') == 'storyboard' or
            f.get('ext') in ['jpg', 'jpeg', 'png', 'webp']):
            continue

        filesize = f.get('filesize')
        is_approx = False

        if not filesize and f.get('filesize_approx'):
            filesize = f.get('filesize_approx')
            is_approx = True
        
        # FIXED: More robust fallback filesize estimation
        if not filesize and isinstance(duration, (int, float)) and duration > 0:
            bitrate = f.get('vbr') or f.get('abr') or f.get('tbr')
            if isinstance(bitrate, (int, float)):
                try:
                    # bitrate (kbps) * 1000 / 8 = bytes per second
                    filesize = (bitrate * 1000 / 8) * duration
                    is_approx = True # Mark calculated size as approximate
                except TypeError:
                    filesize = None # Failsafe

        format_info = {
            'id': f.get('format_id'),
            'ext': f.get('ext'),
            'filesize': filesize,
            'filesize_is_approx': is_approx, # Add the new flag
            'tbr': f.get('tbr'),
            'abr': f.get('abr'),
            'vbr': f.get('vbr'),
            'fps': f.get('fps'),
            'vcodec': f.get('vcodec', 'N/A').split('.')[0],
            'acodec': f.get('acodec', 'N/A').split('.')[0],
            'width': f.get('width'),
            'height': f.get('height'),
        }

        has_video = f.get('vcodec') and f.get('vcodec') != 'none'
        has_audio = f.get('acodec') and f.get('acodec') != 'none'

        if has_video and has_audio:
            format_info.update({
                'resolution': f.get('resolution') or f'{f.get("width", "?")}x{f.get("height", "?")}',
                'type': 'combined'
            })
            combined_formats.append(format_info)
        elif has_video:
            format_info.update({
                'resolution': f.get('resolution') or f'{f.get("width", "?")}x{f.get("height", "?")}',
                'type': 'video'
            })
            video_formats.append(format_info)
        elif has_audio:
            format_info.update({
                'resolution': 'audio only',
                'type': 'audio'
            })
            audio_formats.append(format_info)

    all_video_formats = combined_formats + video_formats
    all_video_formats.sort(key=lambda f: (f.get('height', 0) or 0, f.get('vbr', 0) or 0, f.get('fps', 0) or 0), reverse=True)
    audio_formats.sort(key=lambda f: (f.get('abr', 0) or 0), reverse=True)

    best_video_ids = []
    if all_video_formats:
        best_video_format = all_video_formats[0]
        best_video_criteria = (best_video_format.get('height', 0), best_video_format.get('vbr', 0))
        for f in all_video_formats:
            if (f.get('height', 0), f.get('vbr', 0)) == best_video_criteria:
                best_video_ids.append(f['id'])

    best_audio_ids = []
    if audio_formats:
        best_audio_format = audio_formats[0]
        best_audio_bitrate = best_audio_format.get('abr', 0)
        for f in audio_formats:
            if f.get('abr', 0) == best_audio_bitrate:
                best_audio_ids.append(f['id'])

    subtitles = []
    subtitle_languages = set()
    for lang, subs in info.get('subtitles', {}).items():
        subtitle_languages.add(lang)
        for sub in subs:
            if sub.get('ext') in ['vtt', 'srt', 'ass']:
                subtitles.append({'lang': lang, 'name': sub.get('name', lang), 'ext': sub.get('ext'), 'auto': False})

    for lang, subs in info.get('automatic_captions', {}).items():
        if lang not in subtitle_languages:
            for sub in subs:
                if sub.get('ext') in ['vtt', 'srt', 'ass']:
                    subtitles.append({'lang': lang, 'name': f"{sub.get('name', lang)} (auto)", 'ext': sub.get('ext'), 'auto': True})
    
    summary = get_video_summary(info)

    return {
        'title': info.get('title'),
        'thumbnail': info.get('thumbnail'),
        'description': summary,
        'duration': duration,
        'uploader': info.get('uploader'),
        'upload_date': info.get('upload_date'),
        'suggested_filename': f"{sanitize_filename(info.get('title', 'video'))}.%(ext)s",
        'video_formats': all_video_formats,
        'audio_formats': audio_formats,
        'best_video_ids': best_video_ids,
        'best_audio_ids': best_audio_ids,
        'subtitles': subtitles,
        'subtitle_languages': sorted(list(subtitle_languages)),
        'has_chapters': bool(info.get('chapters')),
        'is_live': info.get('is_live', False),
    }

@app.route('/api/download', methods=['POST'])
def start_download():
    """
    Enhanced download endpoint with better error handling and progress tracking.
    """
    try:
        options = request.json
        if not options or 'url' not in options:
            return jsonify({"error": "Invalid request body. URL is required."}), 400

        # Generate a unique download ID
        download_id = str(uuid.uuid4())
        
        # Validate required options
        url = options.get('url')
        if not url or not re.match(r'https?://', url):
            return jsonify({"error": "Invalid URL format"}), 400

        # Create progress tracker
        progress = DownloadProgress(download_id)
        download_progress[download_id] = progress

        # Construct the command from the received options
        command, output_template = build_yt_dlp_command(options, download_id)

        logger.info(f"Starting download {download_id}: {' '.join(command)}")

        # Start the download in a separate thread
        # (This is inside the 'start_download' function)
        # Start the download in a separate thread

        def run_download():
            try:
                progress.status = 'starting'
                old_cwd = os.getcwd()
                os.chdir(DOWNLOAD_DIR)
                
                process = subprocess.Popen(
                    command, 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.STDOUT,
                    universal_newlines=True,
                    encoding='utf-8',
                    errors='replace',
                    bufsize=1  # Line buffered
                )
                
                active_downloads[download_id] = {
                    'process': process, 
                    'status': 'running', 
                    'command': ' '.join(command),
                    'url': url, 
                    'started_at': datetime.now().isoformat()
                }
                progress.status = 'downloading'

                # Read output line by line
                while True:
                    line = process.stdout.readline()
                    if not line and process.poll() is not None:
                        break
                        
                    clean_line = line.strip()
                    if not clean_line:
                        continue
                    
                    # Store in log
                    with progress.log_lock:
                        progress.log.append(clean_line)
                        if len(progress.log) > 500:
                            progress.log.pop(0)

                    # Try to parse as JSON progress update
                    try:
                        progress_data = json.loads(clean_line)
                        # Remove large info_dict to reduce logging
                        if 'info_dict' in progress_data:
                            log_data = {k: v for k, v in progress_data.items() if k != 'info_dict'}
                            logger.debug(f"Progress for {download_id}: {log_data}")
                        progress_hook(progress_data, download_id)
                    except json.JSONDecodeError:
                        # Regular yt-dlp output (merging, post-processing, etc.)
                        logger.debug(f"yt-dlp output: {clean_line}")
                        if any(keyword in clean_line.lower() for keyword in ['merger', 'extract', 'postprocessor', 'converting']):
                            progress.status = 'processing'

                process.wait()
                os.chdir(old_cwd)
                
                # Final status determination
                if progress.status not in ['failed', 'cancelled']:
                    if process.returncode == 0:
                        progress.status = 'completed'
                        progress.completed_at = datetime.now()
                        progress.progress = 100.0
                        progress.speed = 0
                        progress.eta = None
                        if download_id in active_downloads:
                            active_downloads[download_id]['status'] = 'completed'
                        logger.info(f"Download {download_id} completed successfully")
                    else:
                        progress.status = 'failed'
                        error_msg = f"Download failed with exit code {process.returncode}"
                        progress.error = error_msg
                        if download_id in active_downloads:
                            active_downloads[download_id]['status'] = 'failed'
                            active_downloads[download_id]['error'] = error_msg
                        logger.error(f"Download {download_id} failed: {error_msg}")
                        
            except Exception as e:
                error_msg = f"Download thread error: {str(e)}"
                progress.status = 'failed'
                progress.error = error_msg
                if download_id in active_downloads:
                    active_downloads[download_id]['status'] = 'failed'
                    active_downloads[download_id]['error'] = error_msg
                logger.error(f"Exception in download {download_id}: {error_msg}")
                if 'old_cwd' in locals() and os.getcwd() != old_cwd:
                    os.chdir(old_cwd)
                    
        download_thread = threading.Thread(target=run_download, name=f"Download-{download_id}")
        download_thread.daemon = True
        download_thread.start()

        return jsonify({
            "status": "success", 
            "message": "Download started successfully", 
            "download_id": download_id,
            "command": ' '.join(command)
        })

    except Exception as e:
        logger.error(f"Failed to start download: {str(e)}")
        return jsonify({"error": f"Failed to start download: {str(e)}"}), 500

@app.route('/api/download/<download_id>/status', methods=['GET'])
def get_download_status(download_id):
    """
    Get detailed status of a specific download including real-time progress.
    """
    progress = download_progress.get(download_id)
    if not progress:
        return jsonify({"error": "Download not found"}), 404
    
    return jsonify(progress.to_dict())

@app.route('/api/download/<download_id>/cancel', methods=['POST'])
def cancel_download(download_id):
    """
    Cancel a specific download with improved error handling.
    """
    if download_id not in active_downloads:
        return jsonify({"error": "Download not found"}), 404
    
    download_info = active_downloads[download_id]
    progress = download_progress.get(download_id)
    
    if download_info['status'] in ['running', 'starting', 'paused']:
        try:
            # Use psutil to find and manage the process
            p = psutil.Process(download_info['process'].pid)
            if download_info['status'] == 'paused':
                p.resume() # Must resume a paused process before terminating
            
            p.terminate()
            
            # Wait for graceful termination, then kill if necessary
            try:
                p.wait(timeout=5)
            except psutil.TimeoutExpired:
                p.kill()
            
            download_info['status'] = 'cancelled'
            if progress:
                progress.status = 'cancelled'
                
            logger.info(f"Download {download_id} cancelled successfully")
            return jsonify({"status": "success", "message": "Download cancelled successfully"})
            
        except psutil.NoSuchProcess:
            # If the process is already gone, just mark it as cancelled
            download_info['status'] = 'cancelled'
            if progress: progress.status = 'cancelled'
            return jsonify({"status": "success", "message": "Download process was already gone."})
        except Exception as e:
            logger.error(f"Failed to cancel download {download_id}: {str(e)}")
            return jsonify({"error": f"Failed to cancel download: {str(e)}"}), 500
    else:
        return jsonify({"error": f"Download is not running (status: {download_info['status']})"}), 400

@app.route('/api/download/<download_id>/pause', methods=['POST'])
def pause_download(download_id):
    """Pause a running download."""
    if download_id not in active_downloads or not active_downloads[download_id].get('process'):
        return jsonify({"error": "Download not found or process not started"}), 404

    download_info = active_downloads[download_id]
    progress = download_progress.get(download_id)

    if download_info['status'] == 'running':
        try:
            p = psutil.Process(download_info['process'].pid)
            p.suspend()
            download_info['status'] = 'paused'
            if progress:
                progress.status = 'paused'
            logger.info(f"Download {download_id} paused successfully")
            return jsonify({"status": "success", "message": "Download paused"})
        except psutil.NoSuchProcess:
            return jsonify({"error": "Process not found, it may have already completed or failed."}), 404
        except Exception as e:
            logger.error(f"Failed to pause download {download_id}: {str(e)}")
            return jsonify({"error": f"Failed to pause download: {str(e)}"}), 500
    else:
        return jsonify({"error": f"Download is not in a pausable state (status: {download_info['status']})"}), 400


@app.route('/api/download/<download_id>/resume', methods=['POST'])
def resume_download(download_id):
    """Resume a paused download."""
    if download_id not in active_downloads or not active_downloads[download_id].get('process'):
        return jsonify({"error": "Download not found or process not started"}), 404

    download_info = active_downloads[download_id]
    progress = download_progress.get(download_id)

    if download_info['status'] == 'paused':
        try:
            p = psutil.Process(download_info['process'].pid)
            p.resume()
            download_info['status'] = 'running'
            if progress:
                progress.status = 'running'
            logger.info(f"Download {download_id} resumed successfully")
            return jsonify({"status": "success", "message": "Download resumed"})
        except psutil.NoSuchProcess:
             return jsonify({"error": "Process not found, it may have already completed or failed."}), 404
        except Exception as e:
            logger.error(f"Failed to resume download {download_id}: {str(e)}")
            return jsonify({"error": f"Failed to resume download: {str(e)}"}), 500
    else:
        return jsonify({"error": f"Download is not paused (status: {download_info['status']})"}), 400

@app.route('/api/download/<download_id>/log', methods=['GET'])
def get_download_log(download_id):
    """Get the log for a specific download."""
    progress = download_progress.get(download_id)
    if not progress:
        return jsonify({"error": "Download not found"}), 404
    
    with progress.log_lock:
        log_data = list(progress.log)

    return jsonify({"log": log_data})

@app.route('/api/downloads', methods=['GET'])
def list_downloads():
    """
    List all downloads with their current status.
    """
    downloads = []
    for download_id, info in active_downloads.items():
        progress = download_progress.get(download_id)
        download_data = {
            'download_id': download_id,
            'url': info.get('url'),
            'status': info.get('status'),
            'started_at': info.get('started_at'),
            'command': info.get('command'),
            'error': info.get('error')
        }
        
        if progress:
            download_data.update(progress.to_dict())
            
        downloads.append(download_data)
    
    return jsonify({
        'downloads': downloads,
        'total': len(downloads)
    })

@app.route('/api/download/<download_id>', methods=['DELETE'])
def delete_download(download_id):
    """
    Remove a download from the tracking system.
    """
    if download_id in active_downloads:
        # Cancel if still running
        if active_downloads[download_id]['status'] == 'running':
            cancel_download(download_id)
        
        del active_downloads[download_id]
    
    if download_id in download_progress:
        del download_progress[download_id]
    
    return jsonify({"status": "success", "message": "Download removed"})

@app.route('/api/formats/<path:url>', methods=['GET'])
def get_available_formats(url):
    """
    Quick endpoint to get just the available formats for a URL.
    """
    try:
        info = get_video_info()
        if isinstance(info, tuple):  # Error response
            return info
        return jsonify({
            'video_formats': info.get_json()['video_formats'],
            'audio_formats': info.get_json()['audio_formats']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def build_yt_dlp_command(options, download_id):
    """Build yt-dlp command with basic, advanced, and progress reporting options."""
    command = ['yt-dlp']

    # --- Progress Reporting ---
    command.extend([
        '--newline',
        '--progress-template', 
        '{"status": "%(progress.status)s", "downloaded_bytes": %(progress.downloaded_bytes)d, "total_bytes": %(progress.total_bytes)d, "speed": %(progress.speed)d, "eta": %(progress.eta)d, "filename": "%(info.filename)s"}'
    ])

    # --- Basic Download Options ---
    format_string = options.get('formatCode', 'bestvideo+bestaudio/best')
    command.extend(['-f', format_string])

    filename_template = options.get('filename', '%(title)s')
    if not filename_template:
        filename_template = '%(title)s'
    if '.%(ext)s' not in filename_template:
        filename_template += '.%(ext)s'
    command.extend(['-o', filename_template])
    
    output_format = options.get('outputFormat')
    if output_format and output_format != 'default':
        command.extend(['--merge-output-format', output_format])

    if options.get('overwrite'): 
        command.append('--force-overwrites')
    elif options.get('overwrite') == False:
        command.append('--no-overwrites')
    
    # --- Subtitle Options ---
    if options.get('enableSubtitles'):
        sub_lang = options.get('subtitleLang')
        if sub_lang and sub_lang != 'none':
            command.append('--write-subs')
            command.append('--write-auto-subs')
            if sub_lang != 'all':
                 command.extend(['--sub-langs', sub_lang])
    if options.get('embedSubs'):
        command.append('--embed-subs')
    if options.get('convertSubs'):
        command.extend(['--convert-subs', options['convertSubs']])

    # --- Embedding & Metadata ---
    if options.get('embedThumbnail'): command.append('--embed-thumbnail')
    if options.get('embedMetadata'): command.append('--embed-metadata')
    if options.get('addChapters'): command.append('--add-chapters')
    if options.get('embedInfoJson'): command.append('--embed-info-json')
    if options.get('xattrs'): command.append('--xattrs')
    if options.get('parseMetadata'):
        command.extend(['--parse-metadata', options['parseMetadata']])
    if options.get('replaceInMetadata'):
        # Assuming space-delimited: FIELD REGEX REPLACE
        parts = options['replaceInMetadata'].split(' ', 2)
        if len(parts) == 3:
             command.extend(['--replace-in-metadata', *parts])

    # --- Post-processing (FFmpeg) Options ---
    if options.get('enablePostprocessing') or options.get('extractAudio'):
        if options.get('extractAudio'): 
            command.append('-x')
            if options.get('audioFormat') and options['audioFormat'] != 'best':
                command.extend(['--audio-format', options['audioFormat']])
            if options.get('audioQuality'):
                command.extend(['--audio-quality', str(options['audioQuality'])])
        
        if options.get('remuxVideo'): command.extend(['--remux-video', options['remuxVideo']])
        if options.get('recodeVideo'): command.extend(['--recode-video', options['recodeVideo']])
        if options.get('convertThumb'): command.extend(['--convert-thumbnails', options['convertThumb']])
        
        if options.get('postprocessorArgs'):
            command.extend(['--postprocessor-args', options['postprocessorArgs']])
            
        if options.get('keepVideo'): 
            command.append('-k')
        
        if options.get('postOverwrites') == False:
             command.append('--no-post-overwrites')
        else:
             command.append('--post-overwrites')

    # --- Splicing, Correction & Playlist ---
    if options.get('splitChapters'): command.append('--split-chapters')
    if options.get('forceKeyframes'): command.append('--force-keyframes-at-cuts')
    if options.get('concatPlaylist') and options['concatPlaylist'] != 'multi_video':
        command.extend(['--concat-playlist', options['concatPlaylist']])
    if options.get('fixup') and options['fixup'] != 'detect_or_warn':
        command.extend(['--fixup', options['fixup']])
        
    # --- Advanced Settings (from settings page) ---
    adv = options.get('advancedSettings', {})
    if adv.get('ffmpeg-location'):
        command.extend(['--ffmpeg-location', adv['ffmpeg-location']])
    if adv.get('exec') and not adv.get('no-exec'):
        command.extend(['--exec', adv['exec']])
    
    # ... (Keep existing advanced settings logic for network, auth, etc.) ...
    if adv.get('proxy'): command.extend(['--proxy', adv['proxy']])
    if adv.get('socket-timeout'): command.extend(['--socket-timeout', adv['socket-timeout']])
    if adv.get('source-address'): command.extend(['--source-address', adv['source-address']])
    if adv.get('impersonate'): command.extend(['--impersonate', adv['impersonate']])
    if adv.get('force-ipv4'): command.append('--force-ipv4')
    if adv.get('force-ipv6'): command.append('--force-ipv6')
    if adv.get('enable-file-urls'): command.append('--enable-file-urls')
    if adv.get('geo-verification-proxy'): command.extend(['--geo-verification-proxy', adv['geo-verification-proxy']])
    if adv.get('xff'): command.extend(['--xff', adv['xff']])
    if adv.get('username'): command.extend(['--username', adv['username']])
    if adv.get('password'): command.extend(['--password', adv['password']])
    if adv.get('twofactor'): command.extend(['--twofactor', adv['twofactor']])
    if adv.get('netrc'): command.append('--netrc')
    if adv.get('netrc-location'): command.extend(['--netrc-location', adv['netrc-location']])
    if adv.get('netrc-cmd'): command.extend(['--netrc-cmd', adv['netrc-cmd']])
    if adv.get('video-password'): command.extend(['--video-password', adv['video-password']])
    if adv.get('ap-mso'): command.extend(['--ap-mso', adv['ap-mso']])
    if adv.get('ap-username'): command.extend(['--ap-username', adv['ap-username']])
    if adv.get('ap-password'): command.extend(['--ap-password', adv['ap-password']])
    if adv.get('client-certificate'): command.extend(['--client-certificate', adv['client-certificate']])
    if adv.get('client-certificate-key'): command.extend(['--client-certificate-key', adv['client-certificate-key']])
    if adv.get('client-certificate-password'): command.extend(['--client-certificate-password', adv['client-certificate-password']])
    if adv.get('no-sponsorblock'): 
        command.append('--no-sponsorblock')
    else:
        if adv.get('sponsorblock-mark'): command.extend(['--sponsorblock-mark', adv['sponsorblock-mark']])
        if adv.get('sponsorblock-remove'): command.extend(['--sponsorblock-remove', adv['sponsorblock-remove']])
        if adv.get('sponsorblock-chapter-title'): command.extend(['--sponsorblock-chapter-title', adv['sponsorblock-chapter-title']])
        if adv.get('sponsorblock-api'): command.extend(['--sponsorblock-api', adv['sponsorblock-api']])
    if adv.get('extractor-retries'): command.extend(['--extractor-retries', adv['extractor-retries']])
    if adv.get('ignore-dynamic-mpd'): command.append('--ignore-dynamic-mpd')
    if adv.get('hls-split-discontinuity'): command.append('--hls-split-discontinuity')
    if adv.get('extractor-args'): command.extend(['--extractor-args', adv['extractor-args']])

    # --- Final Reliability and URL ---
    command.extend(['--retries', '3', '--fragment-retries', '3', '--no-colors', '--no-warnings'])
    command.append(options['url'])
    return command, filename_template

# --- Error Handlers ---

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(error):
    return jsonify({"error": "Request too large"}), 413

# --- Cleanup Function ---
def cleanup_old_downloads():
    """Clean up old download records (called periodically)"""
    current_time = datetime.now()
    to_remove = []
    
    for download_id, info in active_downloads.items():
        try:
            started_at = datetime.fromisoformat(info['started_at'])
            # Remove downloads older than 24 hours
            if (current_time - started_at).total_seconds() > 86400:
                to_remove.append(download_id)
        except:
            pass
    
    for download_id in to_remove:
        if download_id in active_downloads:
            del active_downloads[download_id]
        if download_id in download_progress:
            del download_progress[download_id]
    
    if to_remove:
        logger.info(f"Cleaned up {len(to_remove)} old download records")

# --- Startup ---
if __name__ == '__main__':
    logger.info("Starting YT-DL Studio Backend...")
    logger.info(f"Download directory: {DOWNLOAD_DIR.absolute()}")
    
    # Start cleanup timer
    import atexit
    atexit.register(lambda: logger.info("YT-DL Studio Backend shutting down..."))
    
    try:
        app.run(debug=True, port=5000, host='0.0.0.0', threaded=True)
    except KeyboardInterrupt:
        logger.info("Received shutdown signal")
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
