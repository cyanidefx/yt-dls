// app.js

const selection = {
  videoRes: "1080",
  audioBitrate: "128",
  videoCodec: "avc1"
};

function checkEnter(e) {
  if (e.key === "Enter") fetchMetadata();
}

function fetchMetadata() {
  const urlInput = document.getElementById("videoUrl");
  const shimmer = document.getElementById("shimmer");
  const preview = document.getElementById("metadata-preview");
  const titleElem = document.getElementById("title");
  const thumb = document.getElementById("thumbnail");

  if (!urlInput) return alert("URL input missing");
  const url = urlInput.value.trim();
  if (!url) return alert("Please enter a URL");

  shimmer?.classList.remove("hidden");

  fetch("http://localhost:5001/metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  })
    .then(res => res.json())
    .then(data => {
      shimmer?.classList.add("hidden");

      if (!data || data.error) return alert("Failed to fetch metadata");

      titleElem.textContent = data.title || "";
      if (data.thumbnail) thumb.src = data.thumbnail;
      preview.classList.remove("hidden");

      populateFormatButtons(data.formats);
    })
    .catch(err => {
      shimmer?.classList.add("hidden");
      console.error("Error fetching metadata:", err);
      alert("Error fetching metadata. Check URL.");
    });
}

function populateFormatButtons(formats) {
  const videoGroup = document.getElementById("video-quality-buttons");
  const audioGroup = document.getElementById("audio-bitrate-buttons");
  const codecGroup = document.getElementById("video-codec-buttons");

  if (!formats || !videoGroup || !audioGroup || !codecGroup) return;

  videoGroup.innerHTML = "";
  audioGroup.innerHTML = "";
  codecGroup.innerHTML = "";

  const resolutions = ["2160", "1440", "1080", "720", "480", "360"];
  const bitrates = ["320", "256", "192", "128", "64"];
  const allowedCodecs = ["av01", "vp9", "avc1"];

  const availableRes = new Set();
  const availableABRs = new Set();
  const availableCodecs = new Set();

  formats.forEach(f => {
    if (f.vbr && f.height) {
      const h = Math.round(f.height / 10) * 10;
      resolutions.forEach(r => {
        if (Math.abs(h - parseInt(r)) <= 10) {
          availableRes.add(r);
        }
      });
    }

    if (f.vcodec && f.vcodec !== "none") {
      const codec = f.vcodec.split(".")[0];
      if (allowedCodecs.includes(codec)) {
        availableCodecs.add(codec);
      }
    }

    if (f.abr) {
      const abr = Math.round(f.abr / 10) * 10;
      bitrates.forEach(b => {
        if (Math.abs(abr - parseInt(b)) <= 16) {
          availableABRs.add(b);
        }
      });
    }
  });

  resolutions.forEach(r => {
    const btn = document.createElement("button");
    btn.textContent = `${r}p`;
    if (!availableRes.has(r)) {
      btn.disabled = true;
    } else {
      btn.onclick = () => selectButton(videoGroup, btn, "videoRes");
    }
    videoGroup.appendChild(btn);
  });

  bitrates.forEach(a => {
    const btn = document.createElement("button");
    btn.textContent = `${a} kbps`;
    if (!availableABRs.has(a)) {
      btn.disabled = true;
    } else {
      btn.onclick = () => selectButton(audioGroup, btn, "audioBitrate");
    }
    audioGroup.appendChild(btn);
  });

  allowedCodecs.forEach(c => {
    const btn = document.createElement("button");
    btn.textContent = c.toUpperCase();
    if (!availableCodecs.has(c)) {
      btn.disabled = true;
    } else {
      btn.onclick = () => selectButton(codecGroup, btn, "videoCodec");
    }
    codecGroup.appendChild(btn);
  });
}

function selectButton(group, button, key) {
  Array.from(group.children).forEach(b => b.classList.remove("active"));
  button.classList.add("active");
  selection[key] = button.textContent.split(" ")[0].toLowerCase(); // Lowercase for codec
}

function queueDownload() {
  const urlInput = document.getElementById("videoUrl");
  if (!urlInput || !urlInput.value.trim()) return alert("Enter a valid URL");

  const audioOnly = document.getElementById("audioOnlyToggle")?.checked || false;
  const hls = document.getElementById("preferHLS")?.checked || false;
  const h265 = document.getElementById("allowH265")?.checked || false;
  const gif = document.getElementById("convertGIF")?.checked || false;

  fetch("http://localhost:5001/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: urlInput.value.trim(),
      audio_only: audioOnly,
      prefer_hls: hls,
      allow_h265: h265,
      convert_gif: gif,
      video_quality: selection.videoRes,
      video_codec: selection.videoCodec,
      audio_bitrate: selection.audioBitrate
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("Download failed: " + data.error);
      } else {
        alert("Download queued successfully.");
      }
    })
    .catch(err => {
      console.error("Download error:", err);
      alert("Failed to queue download.");
    });
}

// 🌗 Theme Toggle Support
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const stylesheet = document.getElementById("themeStylesheet");

  const saved = localStorage.getItem("theme");

  if (saved === "dark") {
    themeToggle.checked = true;
    stylesheet.href = "style-dark.css";
  } else if (saved === "light") {
    themeToggle.checked = false;
    stylesheet.href = "style-light.css";
  } else {
    // Default to system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    themeToggle.checked = prefersDark;
    stylesheet.href = prefersDark ? "style-dark.css" : "style-light.css";
  }

  themeToggle?.addEventListener("change", () => {
    if (themeToggle.checked) {
      stylesheet.href = "style-dark.css";
      localStorage.setItem("theme", "dark");
    } else {
      stylesheet.href = "style-light.css";
      localStorage.setItem("theme", "light");
    }
  });
});
