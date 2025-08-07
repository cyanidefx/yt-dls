# YT-DL Studio

![YT-DL Studio Banner](https://placehold.co/1200x400/0a0a0a/00ff99?text=YT-DL%20Studio)

**YT-DL Studio** is a sleek, modern, and powerful web-based graphical user interface (GUI) for the incredible `yt-dlp` command-line tool. It provides a comprehensive suite of features for downloading video and audio from thousands of websites, offering both simplicity for beginners and deep customization for advanced users.

The application is designed with a focus on privacy, security, and ease of use, ensuring a safe and ad-free experience. It features a reactive frontend built with vanilla JavaScript and Tailwind CSS, and a robust backend powered by Flask and Python.

---

## ✨ Features

YT-DL Studio is packed with features to make your download experience seamless and powerful.

### Core Download Functionality
* **Universal URL Support**: Paste any video or playlist URL supported by `yt-dlp`.
* **Intelligent Metadata Fetching**: Automatically retrieves video title, description, thumbnail, and all available formats.
* **Advanced Format Selection**:
    * Choose between combined video/audio, video-only, or audio-only downloads.
    * View detailed tables of all available video and audio streams, including resolution, bitrate, file size, and codecs.
    * Select multiple streams for custom downloads.
* **Download Presets**: Quickly select common download configurations like "Best Quality MP4" or "Audio Only (MP3)".
* **Real-time Download Queue**:
    * Track all your active and completed downloads in a clean, organized queue.
    * **Dual Progress Bars**: Monitor video and audio track download progress independently.
    * View real-time stats: download speed, ETA, and total size.
* **Download Management**:
    * **Pause & Resume**: Pause and resume downloads at any time.
    * **Cancel**: Stop a download in progress.
    * **Clear Queue**: Remove completed or failed downloads from the queue.
    * **Live Logs**: View the raw `yt-dlp` log output for any download in real-time.

### Extensive Post-Processing & Customization
* **Custom Filename Templating**: Define your own file naming structure using `yt-dlp` variables.
* **Container Formats**: Choose your desired output container (MP4, MKV, WebM, etc.).
* **Subtitle Handling**:
    * Download subtitles for specific languages or all available languages.
    * Choose subtitle format (SRT, VTT, ASS).
    * Embed subtitles directly into the video file.
* **Metadata & Thumbnails**:
    * Embed video thumbnail, metadata, and chapters into the final file.
    * Write file extended attributes (`xattrs`).
* **FFmpeg Integration**:
    * **Audio Extraction**: Extract audio from a video file into formats like MP3, M4A, WAV, and FLAC with adjustable quality.
    * **Re-muxing & Re-coding**: Remux or recode video into different formats.
    * **Custom Arguments**: Pass custom post-processor arguments directly to FFmpeg.
* **Final Command Review**: Inspect and edit the final `yt-dlp` command before starting the download for ultimate control.

### Advanced Settings Page
A dedicated page to configure the global behavior of `yt-dlp`:
* **Network**: Configure proxies, timeouts, and source IP addresses.
* **Geo-Restriction**: Bypass geo-blocking with proxy settings or X-Forwarded-For headers.
* **Authentication**: Provide credentials for sites that require a login, including two-factor authentication and Adobe Pass support.
* **SponsorBlock**: Automatically mark or remove sponsored segments and other unwanted categories from videos.
* **Extractor Options**: Pass specific arguments to individual extractors for fine-grained control.

---

## 🛠️ Tech Stack

* **Backend**: Python 3, Flask, yt-dlp
* **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
* **3D Background**: Three.js

---

## 🚀 Setup and Installation

Follow these steps to get YT-DL Studio running on your local machine.

### Prerequisites
* Python 3.7+
* `yt-dlp` installed and available in your system's PATH.
* `ffmpeg` installed and available in your system's PATH (for post-processing).

### Installation Steps
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/ytdl-studio.git](https://github.com/your-username/ytdl-studio.git)
    cd ytdl-studio
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install the required Python packages:**
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: A `requirements.txt` file should be created with the following content:)*
    ```
    Flask
    Flask-Cors
    yt-dlp
    psutil
    ```

4.  **Run the Flask backend server:**
    ```bash
    python server.py
    ```
    The server will start on `http://localhost:5000`.

5.  **Open the application:**
    Open the `index.html` file in your web browser. The application will connect to the local backend server automatically.

---

## 📖 Usage

1.  Ensure the `server.py` backend is running.
2.  Open `index.html` in your browser.
3.  Paste a video or playlist URL into the input field and press Enter or click the fetch button.
4.  The configuration panel will appear. Select your desired formats and options.
5.  Click the "Download" button to add the video to the queue and start the download.
6.  Monitor the progress in the "Download Queue" section.

---

## 📂 Project Structure

/├── downloads/              # Default directory for downloaded files├── index.html              # Main application page├── settings.html           # Advanced settings page├── about.html              # About, Privacy, and ToS page├── donate.html             # Donation and support page├── style.css               # Main stylesheet with theming variables├── script.js               # Core frontend JavaScript logic├── server.py               # Flask backend server└── README.md               # This file
---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or improvements, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

## 🙏 Acknowledgements

This project would not be possible without the incredible work done by the `yt-dlp` team and its many contributors. YT-DL Studio is, at its core, a user-friendly interface built upon their powerful and versatile tool.
