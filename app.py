from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import subprocess, yt_dlp, os, threading

app = Flask(__name__, static_folder="../frontend", static_url_path='')
CORS(app)  # ← this allows all origins (for now)

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/metadata", methods=["POST"])
def metadata():
    url = request.json.get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "simulate": True,
        "force_generic_extractor": False,
        "nocheckcertificate": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
    formats = [{
        "id": f["format_id"],
        "ext": f["ext"],
        "note": f.get("format_note", ""),
        "abr": f.get("abr"),
        "vbr": f.get("vbr"),
        "filesize": f.get("filesize")
    } for f in info.get("formats", []) if f.get("format_id")]
    return jsonify({
        "title": info.get("title"),
        "thumbnail": info.get("thumbnail"),
        "formats": formats
    })

@app.route("/download", methods=["POST"])
def download():
    data = request.json
    url = data["url"]
    fmt = data.get("format")
    audio_only = data.get("audio_only", False)
    audio_format = data.get("audio_format", "mp3")
    output_dir = "downloads/%(title)s.%(ext)s"

    cmd = ["yt-dlp", "-o", output_dir]
    if audio_only:
        cmd += ["-x", "--audio-format", audio_format]
    if fmt:
        cmd += ["-f", fmt]
    cmd.append(url)

    def run_download():
        subprocess.run(cmd)

    threading.Thread(target=run_download).start()
    return jsonify({"status": "queued"})

if __name__ == "__main__":
    os.makedirs("downloads", exist_ok=True)
    app.run(port=5001)
