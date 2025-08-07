# YT-DL Studio

[](https://opensource.org/licenses/MIT)
[](https://www.python.org/downloads/)
[](https://flask.palletsprojects.com/)
[](https://github.com/psf/black)

A sleek, modern, and privacy-focused web interface for the powerful command-line video downloader, `yt-dlp`. YT-DL Studio provides a comprehensive GUI to harness the full potential of `yt-dlp` with ease, from simple downloads to complex post-processing workflows.

## ✨ Core Philosophy

This application was built on a few simple but important principles:

  * **🔒 Privacy First:** Your activity is your business. The backend has a strict zero-log policy. We use a self-hosted, privacy-respecting analytics tool (Plausible) just to see the number of active users, with no identifiable information ever being stored.
  * **🚫 No Ads, No Nonsense:** This tool is, and always will be, free from ads, trackers, and malware.
  * **🔓 Open & Accessible:** Our goal is to make the power of `yt-dlp` accessible to everyone—creators, educators, archivists, and enthusiasts—through a clean and intuitive interface.
  * **💪 Powerful & Transparent:** Leverage the full feature set of `yt-dlp` through a detailed configuration UI and see the exact command being generated in real-time.

-----

## 🚀 Features

YT-DL Studio is packed with features that cater to both casual users and power users.

### Powerful Download Configuration

Once you enter a URL, a comprehensive configuration panel appears, giving you granular control over your download.

  * **Presets & Modes:**
      * Quickly select presets like "Best Quality MP4," "Audio Only (MP3)," or "Best Quality MKV."
      * Instantly switch between downloading `Video + Audio`, `Video Only`, or `Audio Only`.
  * **Advanced Format Selection:**
      * View detailed tables of all available video and audio formats, including resolution, bitrate, codec, and estimated file size.
      * "Best" formats are automatically highlighted for quick selection.
      * Enable multi-stream selection to download several quality levels or formats at once.
  * **Comprehensive Subtitle Control:**
      * Download subtitles for specific languages or all available languages.
      * Choose your preferred subtitle format (SRT, VTT, ASS).
      * Embed subtitles directly into the video file.
  * **Extensive Post-Processing:**
      * **Extract Audio:** Rip audio from a video into formats like mp3, m4a, flac, and more, with control over audio quality.
      * **Remux & Recode:** Easily remux a file into a different container (e.g., MKV to MP4) or recode the video to a different format.
      * **Embeds:** Seamlessly embed thumbnails, metadata, and chapters into your media files.
      * **Custom Arguments:** Pass your own custom arguments directly to FFmpeg for specialized workflows.
  * **Metadata & More:**
      * Customize the output filename using `yt-dlp` templates.
      * Automatically parse metadata from the video title.
      * Split videos by their chapter markers.
  * **Live Command Preview:** A text area shows you the exact `yt-dlp` command that will be executed, which updates in real-time as you change options.

### Live Download Queue

All your downloads appear in a clean, organized queue with real-time feedback.

  * **Dual Progress Bars:** For downloads requiring separate video and audio tracks, you get individual progress bars for each, so you know exactly what's happening.
  * **Real-time Stats:** Monitor download speed, estimated time remaining (ETA), and total downloaded size at a glance.
  * **Full Process Control:** Pause, resume, or cancel any active download. Completed or failed downloads can be cleared from the queue.
  * **Detailed Logging:**
      * Click the log button on any download item to view the live `yt-dlp` output.
      * For completed or failed items, you can download the full log file for debugging.

### Advanced Global Settings

A dedicated settings page allows you to configure advanced `yt-dlp` options that apply to all downloads.

  * **Network:** Configure a proxy, set a socket timeout, or force the use of IPv4/IPv6.
  * **Authentication:** Provide credentials for sites that require a login, including support for two-factor authentication and `.netrc` files.
  * **SponsorBlock:** Fine-tune SponsorBlock integration to either mark or remove specific categories like "sponsor" or "selfpromo."
  * **Extractor & Geo-restriction:** Configure geo-bypass options, extractor-specific arguments, and more.

-----

## 🛠️ Technology Stack

| Component | Technology                                                                               |
| :-------- | :--------------------------------------------------------------------------------------- |
| **Backend** | **Python 3**, **Flask**, **yt-dlp**, **psutil**, **Gunicorn** (for production)           |
| **Frontend** | **HTML5**, **CSS3**, **JavaScript (ES6+)**, **TailwindCSS**, **Three.js** (for background) |
| **Core Tools** | `yt-dlp` (for downloading), `ffmpeg` (for post-processing)                             |

-----

## ⚙️ Getting Started

You can run YT-DL Studio on your local machine with just a few commands.

### Prerequisites

  * **Python** (version 3.8 or newer)
  * **FFmpeg:** Must be installed and accessible in your system's PATH. This is essential for merging formats and post-processing.
  * **yt-dlp:** The latest version is recommended.

### Installation

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/your-username/ytdl-studio.git
    cd ytdl-studio
    ```

2.  **Install Backend Dependencies:**
    It's highly recommended to use a virtual environment.

    ```bash
    # Create and activate a virtual environment (optional but recommended)
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

    # Install Python packages
    pip install -r requirements.txt
    ```

    *Note: The `requirements.txt` file should contain `Flask`, `Flask-Cors`, `yt-dlp`, and `psutil`.*

3.  **Run the Backend Server:**

    ```bash
    python server.py
    ```

    The server will start on `http://localhost:5000` by default.

4.  **Launch the Frontend:**
    Simply open the `index.html` file in your web browser. The frontend is pre-configured to communicate with the local server at `http://localhost:5000`.

That's it\! You can now paste a video URL into the input box and start downloading.

-----

## 📁 Project Structure

```
.
├── index.html              # Main application page
├── about.html              # About, Privacy, and TOS page
├── settings.html           # Advanced settings page
├── donate.html             # Donation page
├── style.css               # Main stylesheet (uses TailwindCSS)
├── script.js               # Core frontend JavaScript logic
└── server.py               # Flask backend server
```

-----

## ❤️ Acknowledgements

This project is fundamentally a user interface built on top of the incredible, versatile, and tirelessly maintained **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** project. We extend our deepest gratitude to the `yt-dlp` team and its many contributors. Their work is the engine that powers this entire studio.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.