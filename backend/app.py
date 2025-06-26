from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from functools import lru_cache
import yt_dlp
import os
import subprocess
import threading
import uuid

app = Flask(__name__, static_folder="../frontend", static_url_path='')
CORS(app)

# yt_dlp options for metadata
ydl_opts = {
    "quiet": True,
    "no_warnings": True,
    "skip_download": True,
    "nocheckcertificate": True,
    "noplaylist": True,
    "force_generic_extractor": False,
    "extract_flat": False,
    "cachedir": False
}

@lru_cache(maxsize=32)
def get_video_info_cached(url):
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(url, download=False)

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/metadata", methods=["POST"])
def metadata():
    url = request.json.get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        info = get_video_info_cached(url)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    formats = sorted([
        {
            "id": f["format_id"],
            "ext": f["ext"],
            "note": f.get("format_note", ""),
            "abr": f.get("abr"),
            "vbr": f.get("vbr"),
            "filesize": f.get("filesize"),
            "height": f.get("height"),
            "acodec": f.get("acodec"),
            "vcodec": f.get("vcodec")
        }
        for f in info.get("formats", [])
        if f.get("format_id")
    ], key=lambda f: f.get("vbr") or f.get("abr") or 0, reverse=True)

    return jsonify({
        "title": info.get("title"),
        "thumbnail": info.get("thumbnail"),
        "formats": formats
    })

@app.route("/download", methods=["POST"])
def download():
    data = request.json
    url = data.get("url")
    fmt = data.get("format")        # format ID
    audio_only = data.get("audio_only", False)
    audio_format = data.get("audio_format", "mp3")

    if not url:
        return jsonify({"error": "Missing URL"}), 400

    uid = str(uuid.uuid4())[:8]
    base_path = f"downloads/{uid}"
    os.makedirs(base_path, exist_ok=True)
    video_file = os.path.join(base_path, "video.mp4")
    audio_file = os.path.join(base_path, "audio.m4a")
    final_file = os.path.join(base_path, "output.mp4")

    def run_download():
        if audio_only:
            # Audio-only mode, simple yt-dlp call
            cmd = [
                "yt-dlp", "-o", f"{base_path}/%(title)s.%(ext)s",
                "-x", "--audio-format", audio_format,
                url
            ]
            subprocess.run(cmd)
        else:
            # First download video-only stream
            video_cmd = [
                "yt-dlp", "-f", fmt,
                "-o", video_file,
                url
            ]
            subprocess.run(video_cmd)

            # Then best audio separately
            audio_cmd = [
                "yt-dlp", "-f", "bestaudio",
                "-o", audio_file,
                url
            ]
            subprocess.run(audio_cmd)

            # Then merge with ffmpeg
            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-i", video_file,
                "-i", audio_file,
                "-c:v", "copy",
                "-c:a", "aac",
                "-strict", "experimental",
                final_file
            ]
            subprocess.run(ffmpeg_cmd)

    threading.Thread(target=run_download).start()
    return jsonify({"status": "queued", "output": final_file})

if __name__ == "__main__":
    os.makedirs("downloads", exist_ok=True)
    app.run(port=5001)
