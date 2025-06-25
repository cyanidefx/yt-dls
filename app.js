const BASE = "http://localhost:5001";
const urlInput = document.getElementById("url");

function checkURL() {
  const valid = urlInput.value.includes("youtu");
  document.querySelectorAll("#meta select, #meta input[type=checkbox], #downloadBtn").forEach(el => {
    el.disabled = !valid;
  });
}

function fetchMetadata() {
  const url = document.getElementById("url").value;
  if (!url) return;

  // Show shimmer and hide metadata
  document.getElementById("shimmer").classList.remove("hidden");
  document.getElementById("meta").classList.add("hidden");

  fetch("http://localhost:5001/metadata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  })
    .then(response => response.json())
    .then(data => {
      // Hide shimmer and show metadata
      document.getElementById("shimmer").classList.add("hidden");
      document.getElementById("meta").classList.remove("hidden");

      // Update metadata fields
      document.getElementById("title").innerText = data.title || "Untitled";
      document.getElementById("thumb").src = data.thumbnail || "";

      // Populate formats
      const formatSelect = document.getElementById("format");
      formatSelect.innerHTML = "";
      data.formats.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f.id;
        opt.textContent = `${f.note || ""} (${f.ext}, ${f.vbr || f.abr || ""}kbps)`;
        formatSelect.appendChild(opt);
      });

      // Enable inputs
      formatSelect.disabled = false;
      document.getElementById("audio_only").disabled = false;
      document.getElementById("audio_format").disabled = false;
      document.getElementById("downloadBtn").disabled = false;
    })
    .catch(err => {
      console.error("Error fetching metadata:", err);
      alert("Failed to fetch metadata. Please check the URL.");
      document.getElementById("shimmer").classList.add("hidden");
    });
}

function toggleAudioFormat() {
  const isAudio = document.getElementById("audio_only").checked;
  document.getElementById("audio_format").disabled = !isAudio;
}

function queueDownload() {
  const url = urlInput.value;
  const format = document.getElementById("format").value;
  const audio_only = document.getElementById("audio_only").checked;
  const audio_format = document.getElementById("audio_format").value;

  const job = { url, format, audio_only, audio_format };

  fetch(`${BASE}/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job)
  });

  const ul = document.getElementById("queue");
  const li = document.createElement("li");
  li.textContent = `${audio_only ? "Audio" : "Video"} → ${url}`;
  ul.appendChild(li);
}
document.getElementById("shimmer").classList.remove("hidden"); // show shimmer
document.getElementById("meta").classList.add("hidden");        // hide actual content

document.getElementById("shimmer").classList.add("hidden");     // hide shimmer
document.getElementById("meta").classList.remove("hidden");     // show real content
function checkEnter(event) {
  if (event.key === "Enter") {
    fetchMetadata();
  }
}
