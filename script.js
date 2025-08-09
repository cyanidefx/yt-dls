// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000/api';

// --- 3D Background (No changes needed here) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const geometry = new THREE.IcosahedronGeometry(4, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff99, wireframe: true });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
camera.position.z = 8;

function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.x += 0.0005;
    sphere.rotation.y += 0.0005;
    renderer.render(scene, camera);
}
animate();
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// --- Sidebar & Theme Toggle ---
const sidebar = document.getElementById('sidebar');
const collapseBtn = document.getElementById('sidebar-collapse-btn');
const mainContentWrapper = document.getElementById('main-content-wrapper');

function setSidebarState(collapsed) {
    const wrapper = document.getElementById('main-content-wrapper');
        if (collapsed) {
        sidebar.classList.add('collapsed');
        // Set margin for collapsed sidebar (5rem width + 1rem gap)
        wrapper.style.marginLeft = '6rem'; 
        collapseBtn.querySelector('svg').style.transform = 'rotate(180deg)';
    } else {
        sidebar.classList.remove('collapsed');
        // Set margin for expanded sidebar (15rem width + 1rem gap)
        wrapper.style.marginLeft = '16rem';
        collapseBtn.querySelector('svg').style.transform = 'rotate(0deg)';
    }
}

// Expand sidebar on mouse enter
sidebar.addEventListener('mouseenter', () => {
    setSidebarState(false);
});

// Collapse sidebar on mouse leave
sidebar.addEventListener('mouseleave', () => {
    setSidebarState(true);
});

// Set sidebar to collapsed by default on page load
document.addEventListener('DOMContentLoaded', () => {
        setSidebarState(true);
});

const themeToggle = document.getElementById('theme-toggle');
const darkIcon = document.getElementById('theme-icon-dark'); // Moon icon
const lightIcon = document.getElementById('theme-icon-light'); // Sun icon
const htmlEl = document.documentElement;

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
        // Dark theme: white button with black sun icon
        htmlEl.classList.add('dark');
        htmlEl.classList.remove('light');
        
        // Update button styling for dark theme
        themeToggle.className = 'p-3 rounded-full transition-colors duration-300 shadow-lg bg-white text-black hover:bg-gray-100';
        
        // Show sun icon (to toggle back to light), hide moon icon
        lightIcon.style.display = 'block';
        darkIcon.style.display = 'none';
        
    } else {
        // Light theme: black button with white moon icon
        htmlEl.classList.remove('dark');
        htmlEl.classList.add('light');
        
        // Update button styling for light theme
        themeToggle.className = 'p-3 rounded-full transition-colors duration-300 shadow-lg bg-black text-white hover:bg-gray-800';
        
        // Show moon icon (to toggle to dark), hide sun icon
        darkIcon.style.display = 'block';
        lightIcon.style.display = 'none';
    }
}

themeToggle.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// Initialize theme on page load
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

// --- CORRECTED APPLICATION LOGIC ---

const configSection = document.getElementById('config-section');
const downloadsSection = document.getElementById('downloads-section');
const showDownloadsBtn = document.getElementById('show-downloads-btn');
const downloadItemTemplate = document.getElementById('download-item-template');
const descriptionSection = document.querySelector('#description-section');

let currentUrl = '';
let currentVideoInfo = null;
let selectedVideoIds = new Set();
let selectedAudioIds = new Set();
let currentDownloadMode = 'both';

const configTemplate = document.getElementById('config-section-template');
configSection.innerHTML = configTemplate.innerHTML;

const configContentLoading = document.getElementById('config-content-loading');
const configContentLoaded = document.getElementById('config-content-loaded');
const configCloseBtn = document.getElementById('config-close-btn');
const configCancelBtn = document.getElementById('config-cancel-btn');
const configConfirmBtn = document.getElementById('config-confirm-download-btn');
const configTitle = document.getElementById('config-title');
const configSummary = document.getElementById('config-summary');
// MODIFIED: Reference to the new base filename input
const configFilenameBase = document.getElementById('config-filename-base');
const configThumbnail = document.getElementById('config-thumbnail');
const videoFormatsTableBody = document.getElementById('video-formats-table-body');
const audioFormatsTableBody = document.getElementById('audio-formats-table-body');
const subtitlesTableBody = document.getElementById('subtitles-table-body');
const videoFormatsSection = document.getElementById('video-formats-section');
const audioFormatsSection = document.getElementById('audio-formats-section');
const downloadModeGroup = document.getElementById('download-mode-group');
const finalCommandTextarea = document.getElementById('final-command');
const subtitlesToggle = document.getElementById('enable-subtitles');
const subtitlesOptions = document.getElementById('subtitles-options');
const postprocessingToggle = document.getElementById('enable-postprocessing');
const postprocessingOptions = document.getElementById('postprocessing-options');
const presetsGroup = document.getElementById('presets-group');
const allConfigInputs = configSection.querySelectorAll('input, select, button');

function showConfigSection() {
    configSection.classList.remove('hidden');
    configSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    configContentLoading.style.display = 'block';
    configContentLoaded.style.display = 'none';
    configContentLoading.innerHTML = `
        <div role="status" class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--primary-green)] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p class="mt-2 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">Fetching video information...</p>`;
}

function hideConfigSection() {
    configSection.classList.add('hidden');
}

configCloseBtn.addEventListener('click', hideConfigSection);
configCancelBtn.addEventListener('click', hideConfigSection);
configConfirmBtn.addEventListener('click', () => {
    startRealDownload();
    hideConfigSection();
    // Show and scroll to the download queue
    downloadsSection.classList.remove('hidden');
    downloadsSection.scrollIntoView({ behavior: 'smooth' });
});

showDownloadsBtn.addEventListener('click', () => {
    downloadsSection.classList.toggle('hidden');
    if (!downloadsSection.classList.contains('hidden')) {
        downloadsSection.scrollIntoView({ behavior: 'smooth' });
    }
});
    
subtitlesToggle.addEventListener('change', () => {
    subtitlesOptions.classList.toggle('hidden', !subtitlesToggle.checked);
    generateCommand();
});

postprocessingToggle.addEventListener('change', () => {
    postprocessingOptions.classList.toggle('hidden', !postprocessingToggle.checked);
    generateCommand();
});

function setupCheckboxToggle(checkboxId, dropdownId) {
    const checkbox = document.getElementById(checkboxId);
    const dropdown = document.getElementById(dropdownId);
    if (checkbox && dropdown) {
        checkbox.addEventListener('change', () => {
            dropdown.disabled = !checkbox.checked;
            generateCommand();
        });
    }
}

setupCheckboxToggle('pp-remux-check', 'pp-remux-format');
setupCheckboxToggle('pp-recode-check', 'pp-recode-format');
setupCheckboxToggle('pp-convert-subs-check', 'pp-convert-subs-format');
setupCheckboxToggle('pp-convert-thumb-check', 'pp-convert-thumb-format');

const keepVideoCheck = document.getElementById('pp-keep-video');
const overwriteCheck = document.getElementById('pp-overwrite');

if (keepVideoCheck && overwriteCheck) {
    keepVideoCheck.addEventListener('change', () => {
        if (keepVideoCheck.checked) {
            overwriteCheck.checked = true;
            overwriteCheck.disabled = true;
        } else {
            overwriteCheck.disabled = false;
        }
        generateCommand();
    });
}

function setActivePreset(presetName) {
    presetsGroup.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('active', 'bg-white', 'dark:bg-gray-700', 'text-black', 'dark:text-white');
        btn.classList.add('text-gray-600', 'dark:text-gray-400');
    });
    
    const activeBtn = presetsGroup.querySelector(`[data-preset="${presetName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.classList.remove('text-gray-600', 'dark:text-gray-400');
        activeBtn.classList.add('bg-white', 'dark:bg-gray-700', 'text-black', 'dark:text-white');
    }
}

function applyPreset(presetName) {
    // Clear previous selections first
    selectedVideoIds.clear();
    selectedAudioIds.clear();
    document.querySelectorAll('.format-table-row').forEach(row => row.classList.remove('selected'));
    
    const videoMultistreams = document.getElementById('config-video-multistreams');
    const audioMultistreams = document.getElementById('config-audio-multistreams');
    if (videoMultistreams) videoMultistreams.checked = false;
    if (audioMultistreams) audioMultistreams.checked = false;
    
    const extractAudio = document.getElementById('pp-extract-audio');
    if (extractAudio) extractAudio.checked = false;
    
    // Logic for selecting best formats, used by multiple presets
    const selectBestFormats = () => {
        if (!currentVideoInfo) return;

        const bestVideoIds = currentVideoInfo.best_video_ids || [];
        const bestAudioIds = currentVideoInfo.best_audio_ids || [];
        
        bestVideoIds.forEach(id => selectedVideoIds.add(id));
        bestAudioIds.forEach(id => selectedAudioIds.add(id));

        document.querySelectorAll('#video-formats-table-body tr, #audio-formats-table-body tr').forEach(row => {
            if (selectedVideoIds.has(row.dataset.id) || selectedAudioIds.has(row.dataset.id)) {
                row.classList.add('selected');
            }
        });
    };

    switch(presetName) {
        case 'default':
            currentDownloadMode = 'both';
            document.getElementById('config-output-format').value = 'default';
            selectBestFormats(); // Select best video and audio
            break;
        case 'hq-mp4':
            currentDownloadMode = 'both';
            document.getElementById('config-output-format').value = 'mp4';
            selectBestFormats(); // Also select best for this preset
            break;
        case 'mp3':
            currentDownloadMode = 'audio';
            if (extractAudio) extractAudio.checked = true;
            // Select best audio for MP3 preset
            const bestAudioIds = currentVideoInfo?.best_audio_ids || [];
            bestAudioIds.forEach(id => selectedAudioIds.add(id));
            document.querySelectorAll('#audio-formats-table-body tr').forEach(row => {
                    if(selectedAudioIds.has(row.dataset.id)) row.classList.add('selected');
            });
            break;
        case 'mkv':
            currentDownloadMode = 'both';
            document.getElementById('config-output-format').value = 'mkv';
            selectBestFormats();
            break;
    }
    
    // Scroll selected formats into view
    setTimeout(() => {
        const firstSelectedVideo = document.querySelector('#video-formats-table-body tr.selected');
        if (firstSelectedVideo) {
            firstSelectedVideo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        const firstSelectedAudio = document.querySelector('#audio-formats-table-body tr.selected');
        if (firstSelectedAudio) {
            firstSelectedAudio.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);

    updateDownloadModeUI();
    generateCommand();
}

presetsGroup.addEventListener('click', (e) => {
    if (e.target.classList.contains('preset-btn')) {
        const preset = e.target.dataset.preset;
        setActivePreset(preset);
        if (preset !== 'custom') {
            applyPreset(preset);
        }
    }
});

function updateDownloadModeUI() {
    downloadModeGroup.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('bg-white', 'dark:bg-gray-700', 'text-black', 'dark:text-white');
        btn.classList.add('text-gray-600', 'dark:text-gray-400');
    });
    
    const activeBtn = downloadModeGroup.querySelector(`[data-mode="${currentDownloadMode}"]`);
    if (activeBtn) {
        activeBtn.classList.add('bg-white', 'dark:bg-gray-700', 'text-black', 'dark:text-white');
        activeBtn.classList.remove('text-gray-600', 'dark:text-gray-400');
    }
    
    if (currentDownloadMode === 'audio') {
        videoFormatsSection.classList.add('disabled-section');
        audioFormatsSection.classList.remove('disabled-section');
    } else if (currentDownloadMode === 'video') {
        videoFormatsSection.classList.remove('disabled-section');
        audioFormatsSection.classList.add('disabled-section');
    } else {
        videoFormatsSection.classList.remove('disabled-section');
        audioFormatsSection.classList.remove('disabled-section');
    }
}

downloadModeGroup.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    const mode = e.target.dataset.mode;
    currentDownloadMode = mode;
    
    if (mode === 'audio') {
        selectedVideoIds.clear();
        document.querySelectorAll('#video-formats-table-body tr').forEach(row => row.classList.remove('selected'));
        const videoMultistreams = document.getElementById('config-video-multistreams');
        if (videoMultistreams) videoMultistreams.checked = false;
    } else if (mode === 'video') {
        selectedAudioIds.clear();
        document.querySelectorAll('#audio-formats-table-body tr').forEach(row => row.classList.remove('selected'));
        const audioMultistreams = document.getElementById('config-audio-multistreams');
        if (audioMultistreams) audioMultistreams.checked = false;
    }

    updateDownloadModeUI();
    setActivePreset('custom');
    generateCommand();
});

function generateCommand() {
    let command = 'yt-dlp';

    // Helper to get value from an element if it exists
    const getValue = (id) => document.getElementById(id)?.value?.trim() || '';
    const getChecked = (id) => document.getElementById(id)?.checked || false;

    // --- Format Selection ---
    let formatString = '';
    if (currentDownloadMode === 'both') {
        const video = selectedVideoIds.size > 0 ? [...selectedVideoIds].join(',') : 'bestvideo';
        const audio = selectedAudioIds.size > 0 ? [...selectedAudioIds].join(',') : 'bestaudio';
        formatString = `${video}+${audio}/best`;
    } else if (currentDownloadMode === 'video') {
        formatString = selectedVideoIds.size > 0 ? [...selectedVideoIds].join(',') : 'bestvideo';
    } else if (currentDownloadMode === 'audio') {
        formatString = selectedAudioIds.size > 0 ? [...selectedAudioIds].join(',') : 'bestaudio';
    }
    command += ` -f "${formatString}"`;

    // --- Output and Container ---
    const outputFormat = getValue('config-output-format');
    if (outputFormat && outputFormat !== 'default') {
        command += ` --merge-output-format ${outputFormat}`;
    }
    const finalFilename = `${getValue('config-filename-base') || '%(title)s'}.%(ext)s`;
    command += ` -o "${finalFilename}"`;

    // --- Subtitles ---
    if (getChecked('enable-subtitles')) {
        const subLang = getValue('config-subtitle-lang');
        if (subLang !== 'none') {
            command += ' --write-subs --write-auto-subs';
            if (subLang !== 'all') command += ` --sub-langs ${subLang}`;
            
            const subFormat = getValue('config-subtitle-format');
            if (subFormat !== 'best') command += ` --sub-format ${subFormat}`;
        }
    }
    if (getChecked('pp-embed-subs')) command += ' --embed-subs';
    if (getChecked('pp-convert-subs-check') && getValue('pp-convert-subs-format')) {
        command += ` --convert-subs ${getValue('pp-convert-subs-format')}`;
    }

    // --- Embedding and Metadata ---
    if (getChecked('pp-embed-thumbnail')) command += ' --embed-thumbnail';
    if (getChecked('pp-embed-metadata')) command += ' --embed-metadata';
    if (getChecked('pp-add-chapters')) command += ' --add-chapters';
    if (getChecked('pp-embed-info-json')) command += ' --embed-info-json';
    if (getChecked('pp-xattrs')) command += ' --xattrs';
    
    const parseMeta = getValue('pp-parse-metadata');
    if (parseMeta) command += ` --parse-metadata "${parseMeta}"`;
    
    const replaceMeta = getValue('pp-replace-metadata');
    if (replaceMeta) command += ` --replace-in-metadata "${replaceMeta}"`;

    // --- Post-processing ---
    if (getChecked('enable-postprocessing')) {
        if (getChecked('pp-extract-audio')) {
            command += ' -x';
            const audioFormat = getValue('pp-audio-format');
            if (audioFormat && audioFormat !== 'best') {
                command += ` --audio-format ${audioFormat}`;
            }
            const audioQuality = getValue('pp-audio-quality');
            if (audioQuality) {
                command += ` --audio-quality ${audioQuality}`;
            }
        }

        if (getChecked('pp-keep-video')) command += ' -k';
        if (!getChecked('pp-overwrite')) command += ' --no-post-overwrites';

        const remuxFormat = getValue('pp-remux-format');
        if (getChecked('pp-remux-check') && remuxFormat) {
            command += ` --remux-video "${remuxFormat}"`;
        }

        const recodeFormat = getValue('pp-recode-format');
        if (getChecked('pp-recode-check') && recodeFormat) {
            command += ` --recode-video "${recodeFormat}"`;
        }
        
        const convertThumbFormat = getValue('pp-convert-thumb-format');
        if (getChecked('pp-convert-thumb-check') && convertThumbFormat) {
             command += ` --convert-thumbnails ${convertThumbFormat}`;
        }

        const ppa = getValue('pp-args');
        if (ppa) {
            command += ` --ppa "${ppa}"`;
        }
    }

    // --- Splicing, Correction & Playlist ---
    if (getChecked('pp-split-chapters')) command += ' --split-chapters';
    if (getChecked('pp-force-keyframes')) command += ' --force-keyframes-at-cuts';
    
    const fixupPolicy = getValue('pp-fixup');
    if (fixupPolicy && fixupPolicy !== 'detect_or_warn') {
        command += ` --fixup ${fixupPolicy}`;
    }

    const concatPolicy = getValue('pp-concat-playlist');
    if (concatPolicy && concatPolicy !== 'multi_video') {
         command += ` --concat-playlist ${concatPolicy}`;
    }

    // --- Final URL ---
    command += ` "${currentUrl}"`;
    finalCommandTextarea.value = command;
}

allConfigInputs.forEach(input => {
    const isPresetButton = input.classList.contains('preset-btn');
    const isDownloadModeButton = input.closest('#download-mode-group');
    if (!isPresetButton && !isDownloadModeButton) {
        input.addEventListener('change', () => {
            setActivePreset('custom');
            generateCommand();
        });
        // Use 'input' event for real-time update on text fields
        input.addEventListener('input', () => {
            setActivePreset('custom');
            generateCommand();
        });
    }
});
function parseCommandAndUpdateUI() {
    const command = finalCommandTextarea.value;
    if (!command) return;

    // This is a simplified parser. A full implementation is extremely complex.
    // It demonstrates the concept of two-way binding.
    
    // 1. Parse filename (-o "filename")
    const filenameMatch = command.match(/-o "([^"]+)"/);
    if (filenameMatch && filenameMatch[1]) {
        const fullFilename = filenameMatch[1];
        // Check if it's different to prevent cursor jumping
        if (configFilenameBase.value !== fullFilename) {
            configFilenameBase.value = fullFilename;
        }
    }

    // 2. Parse format (-f "format")
    const formatMatch = command.match(/-f "([^"]+)"/);
    if (formatMatch && formatMatch[1]) {
        const formatString = formatMatch[1];
        const parts = formatString.split('+');
        const videoIds = new Set(parts[0].split(','));
        const audioIds = parts.length > 1 ? new Set(parts[1].split(',')) : new Set();

        selectedVideoIds = videoIds;
        selectedAudioIds = audioIds;
        
        // Update UI selection
        document.querySelectorAll('#video-formats-table-body tr').forEach(row => {
            row.classList.toggle('selected', selectedVideoIds.has(row.dataset.id));
        });
        document.querySelectorAll('#audio-formats-table-body tr').forEach(row => {
            row.classList.toggle('selected', selectedAudioIds.has(row.dataset.id));
        });
    }

    // 3. Parse boolean flags (e.g., --embed-thumbnail)
    document.getElementById('pp-embed-thumbnail').checked = /--embed-thumbnail/.test(command);
    document.getElementById('pp-embed-metadata').checked = /--embed-metadata/.test(command);
    document.getElementById('pp-add-chapters').checked = /--add-chapters/.test(command);
    document.getElementById('pp-extract-audio').checked = /-x/.test(command) || /--extract-audio/.test(command);

    // 4. Parse merge format
    const mergeMatch = command.match(/--merge-output-format (\w+)/);
    if (mergeMatch && mergeMatch[1]) {
        document.getElementById('config-output-format').value = mergeMatch[1];
    }
}

// Add event listener for real-time parsing
finalCommandTextarea.addEventListener('input', parseCommandAndUpdateUI);

// --- API Functions ---
async function fetchVideoInfo(url) {
    try {
        const response = await fetch(`${API_BASE_URL}/info?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data;
    } catch (error) {
        console.error('Error fetching video info:', error);
        throw error;
    }
}

async function startDownload(options) {
    try {
        const response = await fetch(`${API_BASE_URL}/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(options)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data;
    } catch (error) {
        console.error('Error starting download:', error);
        throw error;
    }
}

// --- Download Logic ---
const urlInput = document.getElementById('url-input');
const fetchBtn = document.getElementById('fetch-info-btn');
const downloadsContainer = document.getElementById('downloads-container');
const template = document.getElementById('download-item-template');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

let downloadIdCounter = 0;
let activeDownloadPolling = new Map();

function buildDownloadOptions() {
    const advancedSettings = JSON.parse(localStorage.getItem('yt-dls-advanced-settings') || '{}');
    
    // Helper to get value from an element if it exists
    const getValue = (id) => document.getElementById(id)?.value || null;
    const getChecked = (id) => document.getElementById(id)?.checked || false;

    // Determine format code
    let formatCode = 'bestvideo+bestaudio/best';
    if (currentDownloadMode === 'both') {
        const video = selectedVideoIds.size > 0 ? [...selectedVideoIds].join('+') : 'bestvideo';
        const audio = selectedAudioIds.size > 0 ? [...selectedAudioIds].join('+') : 'bestaudio';
        formatCode = `${video}+${audio}/best`;
    } else if (currentDownloadMode === 'video') {
        formatCode = selectedVideoIds.size > 0 ? [...selectedVideoIds].join('+') : 'bestvideo';
    } else if (currentDownloadMode === 'audio') {
        formatCode = selectedAudioIds.size > 0 ? [...selectedAudioIds].join('+') : 'bestaudio';
    }

    return {
        url: currentUrl,
        formatCode: formatCode,
        filename: getValue('config-filename-base'),
        outputFormat: getValue('config-output-format'),
        
        // Subtitles
        enableSubtitles: getChecked('enable-subtitles'),
        subtitleLang: getValue('config-subtitle-lang'),
        subtitleFormat: getValue('config-subtitle-format'),
        embedSubs: getChecked('pp-embed-subs'),

        // Post-processing
        enablePostprocessing: getChecked('enable-postprocessing'),
        extractAudio: getChecked('pp-extract-audio'),
        audioFormat: getValue('pp-audio-format'),
        audioQuality: getValue('pp-audio-quality'),
        remuxVideo: getChecked('pp-remux-check') ? getValue('pp-remux-format') : null,
        recodeVideo: getChecked('pp-recode-check') ? getValue('pp-recode-format') : null,
        convertSubs: getChecked('pp-convert-subs-check') ? getValue('pp-convert-subs-format') : null,
        convertThumb: getChecked('pp-convert-thumb-check') ? getValue('pp-convert-thumb-format') : null,
        postprocessorArgs: getValue('pp-args'),
        keepVideo: getChecked('pp-keep-video'),
        postOverwrites: getChecked('pp-overwrite'),

        // Embedding
        embedThumbnail: getChecked('pp-embed-thumbnail'),
        embedMetadata: getChecked('pp-embed-metadata'),
        addChapters: getChecked('pp-add-chapters'),
        embedInfoJson: getChecked('pp-embed-info-json'),
        
        // Metadata & Correction
        parseMetadata: getValue('pp-parse-metadata'),
        replaceInMetadata: getValue('pp-replace-metadata'),
        xattrs: getChecked('pp-xattrs'),
        fixup: getValue('pp-fixup'),

        // Cutting & Splicing
        splitChapters: getChecked('pp-split-chapters'),
        forceKeyframes: getChecked('pp-force-keyframes'),
        concatPlaylist: getValue('pp-concat-playlist'),
        
        // Overwrite is a base option
        overwrite: getChecked('pp-overwrite'),

        // Advanced Settings from settings page
        advancedSettings: advancedSettings
    };
}

async function startRealDownload() {
    try {
        const options = buildDownloadOptions();
        const response = await startDownload(options);
        
        addDownload({
            title: configTitle.textContent,
            thumbnail: configThumbnail.src,
            downloadId: response.download_id
        });
        
        if (downloadsContainer.children.length > 1) {
            clearCompletedBtn.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('Error starting download:', error);
        showNotification(`Failed to start download: ${error.message}`, 'error');
    }
}

function stopPolling(downloadId) {
    if (activeDownloadPolling.has(downloadId)) {
        clearInterval(activeDownloadPolling.get(downloadId));
        activeDownloadPolling.delete(downloadId);
        console.log(`Stopped polling for download: ${downloadId}`);
    }
}

async function updateDownloadStatus(downloadId, downloadItem) {
    try {
        const response = await fetch(`${API_BASE_URL}/download/${downloadId}/status`);
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Download ${downloadId} not found, stopping polling`);
                stopPolling(downloadId);
                return;
            }
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();

        // Get DOM elements
        const statusText = downloadItem.querySelector('.status-text');
        const videoProgressBar = downloadItem.querySelector('.video-progress-bar');
        const audioProgressBar = downloadItem.querySelector('.audio-progress-bar');
        const videoProgressText = downloadItem.querySelector('.video-progress-text');
        const audioProgressText = downloadItem.querySelector('.audio-progress-text');
        const videoContainer = downloadItem.querySelector('.video-progress-container');
        const audioContainer = downloadItem.querySelector('.audio-progress-container');
        const speedText = downloadItem.querySelector('.speed-text');
        const etaText = downloadItem.querySelector('.eta-text');
        const sizeText = downloadItem.querySelector('.size-text');
        const pauseResumeBtn = downloadItem.querySelector('.pause-resume-btn');
        const cancelBtn = downloadItem.querySelector('.cancel-btn');
        const removeBtn = downloadItem.querySelector('.remove-btn');
        const downloadLogBtn = downloadItem.querySelector('.download-log-btn');
        const pauseIcon = downloadItem.querySelector('.pause-icon');
        const playIcon = downloadItem.querySelector('.play-icon');

        // Handle dual progress bars
        if (data.video_progress) {
            const vp = data.video_progress;
            videoProgressBar.style.width = `${Math.max(vp.progress || 0, 0)}%`;
            videoProgressText.textContent = `${(vp.progress || 0).toFixed(1)}%`;
            
            if (vp.status === 'downloading') {
                videoContainer.style.display = 'block';
            } else if (vp.status === 'waiting' || vp.status === 'completed') {
                videoContainer.style.display = vp.status === 'completed' ? 'block' : 'none';
            }
        } else {
            videoContainer.style.display = 'none';
        }

        if (data.audio_progress) {
            const ap = data.audio_progress;
            audioProgressBar.style.width = `${Math.max(ap.progress || 0, 0)}%`;
            audioProgressText.textContent = `${(ap.progress || 0).toFixed(1)}%`;
            
            if (ap.status === 'downloading') {
                audioContainer.style.display = 'block';
            } else if (ap.status === 'waiting' || ap.status === 'completed') {
                audioContainer.style.display = ap.status === 'completed' ? 'block' : 'none';
            }
        } else {
            audioContainer.style.display = 'none';
        }

        // Update real-time statistics
        if (data.speed && data.speed > 0) {
            speedText.textContent = `${formatFileSize(data.speed)}/s`;
        } else {
            speedText.textContent = data.status === 'completed' ? 'Completed' : 
                                data.status === 'processing' ? 'Processing' : 
                                data.status === 'paused' ? 'Paused' : '...';
        }

        if (data.eta && data.eta > 0 && data.status === 'downloading') {
            etaText.textContent = formatTime(data.eta);
        } else {
            etaText.textContent = data.status === 'completed' ? 'Done' :
                                data.status === 'processing' ? 'Processing' :
                                data.status === 'paused' ? 'Paused' : '---';
        }

        // Update file size information
        if (data.total_bytes > 0) {
            const downloadedStr = formatFileSize(data.downloaded_bytes || 0);
            const totalStr = formatFileSize(data.total_bytes);
            sizeText.textContent = `${downloadedStr} / ${totalStr}`;
        } else if (data.downloaded_bytes > 0) {
            sizeText.textContent = formatFileSize(data.downloaded_bytes);
        } else {
            sizeText.textContent = '... / ...';
        }

        // Handle different download states
        const isTerminalState = ['completed', 'failed', 'cancelled'].includes(data.status);
        
        if (isTerminalState) {
            stopPolling(downloadId);
            pauseResumeBtn.classList.add('hidden');
            cancelBtn.classList.add('hidden');
            removeBtn.classList.remove('hidden');
            downloadLogBtn.classList.remove('hidden');
            
            if (data.status === 'completed') {
                videoProgressBar.style.width = '100%';
                audioProgressBar.style.width = '100%';
                videoProgressText.textContent = '100%';
                audioProgressText.textContent = '100%';
            }
        } else {
            pauseResumeBtn.classList.remove('hidden');
            cancelBtn.classList.remove('hidden');
            removeBtn.classList.add('hidden');
            downloadLogBtn.classList.add('hidden');
        }

        // Update progress bar colors based on status
        const progressBars = [videoProgressBar, audioProgressBar];
        progressBars.forEach(bar => {
            bar.classList.remove('bg-red-500', 'bg-yellow-500', 'bg-green-400', 'bg-white', 'bg-black');
            if (data.status === 'paused') {
                bar.classList.add(document.documentElement.classList.contains('dark') ? 'bg-white' : 'bg-black');
            } else if (data.status === 'failed') {
                bar.classList.add('bg-red-500');
            } else if (data.status === 'cancelled') {
                bar.classList.add('bg-yellow-500');
            } else {
                bar.classList.add('bg-green-400');
            }
        });

        // Update status text and button states
        switch (data.status) {
            case 'downloading':
                statusText.innerHTML = `<span class="font-semibold text-blue-400">Status:</span> Downloading...`;
                pauseIcon.classList.remove('hidden');
                playIcon.classList.add('hidden');
                pauseResumeBtn.disabled = false;
                break;
                
            case 'processing':
                statusText.innerHTML = `<span class="font-semibold text-cyan-400">Status:</span> Processing...`;
                pauseResumeBtn.disabled = true;
                break;
                
            case 'completed':
                statusText.innerHTML = `<span class="font-semibold text-green-400">✓ Completed</span>`;
                if (data.total_bytes > 0) {
                    sizeText.textContent = formatFileSize(data.total_bytes);
                }
                break;
                
            case 'failed':
                statusText.innerHTML = `<span class="font-semibold text-red-400">✗ Failed:</span> <span class="text-xs text-red-300 truncate" title="${data.error || ''}">${data.error || 'Unknown error'}</span>`;
                break;
                
            case 'cancelled':
                statusText.innerHTML = `<span class="font-semibold text-yellow-400">⏸ Cancelled</span>`;
                break;
                
            case 'paused':
                statusText.innerHTML = `<span class="font-semibold text-yellow-400">Status:</span> Paused`;
                pauseIcon.classList.add('hidden');
                playIcon.classList.remove('hidden');
                pauseResumeBtn.disabled = false;
                break;
                
            default:
                statusText.innerHTML = `<span class="font-semibold">Status:</span> ${data.status}...`;
                pauseResumeBtn.disabled = true;
        }

        // Update live log if visible
        const logContainer = downloadItem.querySelector('.log-container');
        if (!logContainer.classList.contains('hidden')) {
            try {
                const logResponse = await fetch(`${API_BASE_URL}/download/${downloadId}/log`);
                const logData = await logResponse.json();
                if (logData.log && logData.log.length > 0) {
                    const logContent = downloadItem.querySelector('.log-content');
                    logContent.textContent = logData.log.slice(-100).join('\n');
                    logContainer.scrollTop = logContainer.scrollHeight;
                }
            } catch (logError) {
                console.warn(`Failed to update log for ${downloadId}:`, logError);
            }
        }

    } catch (error) {
        console.error(`Error updating status for ${downloadId}:`, error);
        const retryCount = downloadItem.dataset.retryCount || 0;
        if (retryCount > 5) {
            console.warn(`Stopping polling for ${downloadId} due to repeated errors`);
            stopPolling(downloadId);
        } else {
            downloadItem.dataset.retryCount = parseInt(retryCount) + 1;
        }
    }
}

function addDownload(options) {
    const clone = downloadItemTemplate.cloneNode(true);
    clone.id = `download-${options.downloadId}`;
    clone.style.display = 'flex';
    clone.dataset.downloadId = options.downloadId;
    clone.dataset.retryCount = '0'; // Initialize retry counter
    
    clone.querySelector('h3').textContent = options.title || `Download`;
    clone.querySelector('img').src = options.thumbnail || `https://placehold.co/128x72/1a1a1a/e5e5e5?text=...`;
    downloadsContainer.prepend(clone);
    
    // Smooth entrance animation
    setTimeout(() => {
        clone.classList.remove('opacity-0', 'translate-y-4');
        clone.classList.add('opacity-100', 'translate-y-0');
    }, 10);

    // FIXED: Cancel button event listener
    clone.querySelector('.cancel-btn').addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/download/${options.downloadId}/cancel`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                const error = await response.json();
                showNotification(`Cancel failed: ${error.error}`, 'error');
            } else {
                showNotification('Download cancelled', 'info');
            }
        } catch (error) {
            console.error('Cancel request failed:', error);
            showNotification('Failed to cancel download', 'error');
        }
    });

    // FIXED: Remove button event listener  
    clone.querySelector('.remove-btn').addEventListener('click', async () => {
        try {
            stopPolling(options.downloadId);
            
            const response = await fetch(`${API_BASE_URL}/download/${options.downloadId}`, { 
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            
            // Remove from UI regardless of server response
            clone.classList.add('opacity-0', 'scale-95');
            setTimeout(() => clone.remove(), 300);
            
        } catch (error) {
            console.warn('Remove request failed:', error);
            // Still remove from UI
            clone.classList.add('opacity-0', 'scale-95');
            setTimeout(() => clone.remove(), 300);
        }
    });

    // FIXED: Pause/Resume button event listener
    clone.querySelector('.pause-resume-btn').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const statusText = clone.querySelector('.status-text');
        const pauseIcon = btn.querySelector('.pause-icon');
        const playIcon = btn.querySelector('.play-icon');
        
        // Determine current state and target action
        const isCurrentlyPaused = !playIcon.classList.contains('hidden');
        const action = isCurrentlyPaused ? 'resume' : 'pause';
        
        // Optimistic UI update
        btn.disabled = true;
        statusText.innerHTML = `<span class="font-semibold text-yellow-400">Status:</span> ${action === 'pause' ? 'Pausing' : 'Resuming'}...`;
        
        try {
            const response = await fetch(`${API_BASE_URL}/download/${options.downloadId}/${action}`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                showNotification(`Failed to ${action}: ${errorData.error}`, 'error');
                
                // Revert optimistic UI changes
                btn.disabled = false;
                if (isCurrentlyPaused) {
                    pauseIcon.classList.add('hidden');
                    playIcon.classList.remove('hidden');
                } else {
                    pauseIcon.classList.remove('hidden');
                    playIcon.classList.add('hidden');
                }
            } else {
                showNotification(`Download ${action}d`, 'success');
                // The polling will update the UI to the correct state
            }
        } catch (error) {
            console.error(`${action} request failed:`, error);
            showNotification(`Failed to ${action} download`, 'error');
            btn.disabled = false;
        }
        
        // Re-enable button after a short delay
        setTimeout(() => {
            btn.disabled = false;
        }, 1000);
    });
    
    // Log button functionality (unchanged but included for completeness)
    const logContainer = clone.querySelector('.log-container');
    const logContent = clone.querySelector('.log-content');
    clone.querySelector('.log-btn').addEventListener('click', async () => {
        const isHidden = logContainer.classList.contains('hidden');
        if (isHidden) {
            try {
                logContent.textContent = 'Loading log...';
                logContainer.classList.remove('hidden');
                const response = await fetch(`${API_BASE_URL}/download/${options.downloadId}/log`);
                const data = await response.json();
                if (data.log && data.log.length > 0) {
                    logContent.textContent = data.log.join('\n');
                } else {
                    logContent.textContent = 'No log data available.';
                }
                logContainer.scrollTop = logContainer.scrollHeight;
            } catch (err) {
                logContent.textContent = 'Failed to load log.';
            }
        } else {
            logContainer.classList.add('hidden');
        }
    });

    // Initial status
    clone.querySelector('.status-text').innerHTML = `<span class="font-semibold text-blue-400">Status:</span> Initializing...`;
    
    // Download log button functionality
    clone.querySelector('.download-log-btn').addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/download/${options.downloadId}/log`);
            const data = await response.json();
            if (data.log && data.log.length > 0) {
                const logText = data.log.join('\n');
                const blob = new Blob([logText], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${options.downloadId}_log.txt`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                showNotification('Log downloaded successfully!', 'success');
            } else {
                showNotification('No log data available', 'info');
            }
        } catch (error) {
            console.error('Failed to download log:', error);
            showNotification('Failed to download log', 'error');
        }
    });

    // Start polling for updates every 1000ms (reduced from 500ms to reduce server load)
    const statusInterval = setInterval(() => updateDownloadStatus(options.downloadId, clone), 1000);
    activeDownloadPolling.set(options.downloadId, statusInterval);
}

function handleNetworkError(error) {
    if (error.message.includes('Failed to fetch')) return 'Cannot connect to backend server. Is it running on http://localhost:5000?';
    return error.message;
}

async function fetchVideoInfoWithErrorHandling(url) {
    try {
        return await fetchVideoInfo(url);
    } catch (error) {
        throw new Error(handleNetworkError(error));
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    // The only change is here: z-50 is now z-[9999]
    notification.className = `fixed top-20 right-4 z-[9999] p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };
    notification.classList.add(colors[type] || 'bg-blue-500', 'text-white');
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.remove('translate-x-full'), 10);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

async function triggerMetadataFetch() {
    if (urlInput.value.trim() === '') {
        urlInput.focus();
        urlInput.classList.add('ring-2', 'ring-red-500');
        setTimeout(() => urlInput.classList.remove('ring-2', 'ring-red-500'), 2000);
        return;
    }
    
    currentUrl = urlInput.value.trim();
    showConfigSection();

    try {
        const videoInfo = await fetchVideoInfoWithErrorHandling(currentUrl);
        currentVideoInfo = videoInfo;
        
        configTitle.textContent = videoInfo.title || 'Unknown Title';
        configFilenameBase.value = (videoInfo.suggested_filename || `${(videoInfo.title || 'video')}`).replace(/\.%\(ext\)s$/, '');
        configSummary.textContent = videoInfo.description || 'No description available.';
        configThumbnail.src = videoInfo.thumbnail || 'https://placehold.co/256x144/1a1a1a/e5e5e5?text=No+Thumbnail';
        
        videoFormatsTableBody.innerHTML = '';
        audioFormatsTableBody.innerHTML = '';
        subtitlesTableBody.innerHTML = '';
        selectedVideoIds.clear();
        selectedAudioIds.clear();

        const bestVideoIds = videoInfo.best_video_ids || [];
        const bestAudioIds = videoInfo.best_audio_ids || [];

        if (videoInfo.video_formats && videoInfo.video_formats.length > 0) {
            const firstBestVideoCodec = videoInfo.video_formats.find(f => bestVideoIds.includes(f.id))?.vcodec;
            videoInfo.video_formats.forEach(format => {
                const isBest = bestVideoIds.includes(format.id);
                const row = document.createElement('tr');
                row.className = 'format-table-row cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors';
                row.dataset.id = format.id;
                row.dataset.type = 'video';
                if (isBest) row.classList.add('best-row');
                
                // FIXED: Removed tilde from bitrate
                const bitrate = format.vbr ? `${Math.round(format.vbr)} kbps` : (format.tbr ? `${Math.round(format.tbr)} kbps` : 'N/A');
                const codecClass = (isBest && format.vcodec !== firstBestVideoCodec) ? 'diff-codec' : '';
                // FIXED: Conditionally add tilde to filesize
                const fileSizeStr = `${format.filesize_is_approx ? '~' : ''}${formatFileSize(format.filesize)}`;

                row.innerHTML = `
                    <td class="p-2 font-mono text-xs">${format.id}</td>
                    <td class="p-2">${format.ext}</td>
                    <td class="p-2">${format.resolution || 'N/A'}</td>
                    <td class="p-2">${bitrate}</td>
                    <td class="p-2">${fileSizeStr}</td>
                    <td class="p-2 truncate ${codecClass}" title="${format.vcodec}">${format.vcodec}</td>
                `;
                videoFormatsTableBody.appendChild(row);
            });
        } else {
            videoFormatsTableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-400">No video formats available.</td></tr>';
        }

        if (videoInfo.audio_formats && videoInfo.audio_formats.length > 0) {
                const firstBestAudioCodec = videoInfo.audio_formats.find(f => bestAudioIds.includes(f.id))?.acodec;
            videoInfo.audio_formats.forEach(format => {
                const isBest = bestAudioIds.includes(format.id);
                const row = document.createElement('tr');
                row.className = 'format-table-row cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors';
                row.dataset.id = format.id;
                row.dataset.type = 'audio';
                if (isBest) row.classList.add('best-row');
                
                const bitrate = format.abr ? `${Math.round(format.abr)} kbps` : 'N/A';
                const codecClass = (isBest && format.acodec !== firstBestAudioCodec) ? 'diff-codec' : '';
                const fileSizeStr = `${format.filesize_is_approx ? '~' : ''}${formatFileSize(format.filesize)}`;

                row.innerHTML = `
                    <td class="p-2 font-mono text-xs">${format.id}</td>
                    <td class="p-2">${format.ext}</td>
                    <td class="p-2">${bitrate}</td>
                    <td class="p-2">${fileSizeStr}</td>
                    <td class="p-2 truncate ${codecClass}" title="${format.acodec}">${format.acodec}</td>
                `;
                audioFormatsTableBody.appendChild(row);
            });
        } else {
            audioFormatsTableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-400">No audio-only formats available.</td></tr>';
        }

        const subtitleLangSelect = document.getElementById('config-subtitle-lang');
        subtitleLangSelect.innerHTML = '<option value="none">No Subtitles</option><option value="all">All Languages</option>';
        if (videoInfo.subtitle_languages && videoInfo.subtitle_languages.length > 0) {
            videoInfo.subtitle_languages.forEach(lang => {
                const option = new Option(lang, lang);
                subtitleLangSelect.add(option);
            });
        }
        if (videoInfo.subtitles && videoInfo.subtitles.length > 0) {
                videoInfo.subtitles.forEach(subtitle => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="p-2">${subtitle.lang}</td>
                    <td class="p-2">${subtitle.name}</td>
                    <td class="p-2">${subtitle.auto ? 'Yes' : 'No'}</td>
                `;
                subtitlesTableBody.appendChild(row);
            });
        } else {
            subtitlesTableBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-gray-400">No subtitles available.</td></tr>';
        }

        configContentLoading.style.display = 'none';
        configContentLoaded.style.display = 'block';
        setActivePreset('default');
        applyPreset('default');
        showNotification('Video information loaded successfully!', 'success');
        
    } catch (error) {
        configContentLoading.innerHTML = `<div class="text-center text-red-500 p-4"><p class="font-semibold">Error fetching video information</p><p class="text-sm mt-1">${error.message}</p><button class="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onclick="hideConfigSection()">Close</button></div>`;
        showNotification('Failed to load video information', 'error');
    }

    urlInput.value = '';
}

function handleFormatSelection(e) {
    const row = e.target.closest('tr.format-table-row');
    if (!row || !row.dataset.id) return;

    const id = row.dataset.id;
    const type = row.dataset.type;
    const targetSet = type === 'video' ? selectedVideoIds : selectedAudioIds;
    const multiSelect = document.getElementById(`config-${type}-multistreams`).checked;
    const tableBody = type === 'video' ? videoFormatsTableBody : audioFormatsTableBody;

    if (!multiSelect) {
        targetSet.clear();
        tableBody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
    }

    if (targetSet.has(id)) {
        targetSet.delete(id);
        row.classList.remove('selected');
    } else {
        targetSet.add(id);
        row.classList.add('selected');
    }
    
    setActivePreset('custom');
    generateCommand();
}

videoFormatsTableBody.addEventListener('click', handleFormatSelection);
audioFormatsTableBody.addEventListener('click', handleFormatSelection);
urlInput.addEventListener('keypress', (e) => e.key === 'Enter' && triggerMetadataFetch());
fetchBtn.addEventListener('click', triggerMetadataFetch);

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Page loaded. Checking for existing downloads...");
    try {
        const response = await fetch(`${API_BASE_URL}/downloads`);
        if (!response.ok) throw new Error("Could not connect to backend.");
        const data = await response.json();
        if (data.downloads && data.downloads.length > 0) {
            // descriptionSection.style.display = 'none'; // Keep description visible
            clearCompletedBtn.classList.remove('hidden');
            data.downloads.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
            data.downloads.forEach(d => addDownload({ title: d.filename || d.url, thumbnail: '', downloadId: d.download_id }));
            showNotification(`Restored ${data.downloads.length} active download(s).`, 'info');
        }
    } catch (error) {
        console.error("Error restoring downloads:", error);
        showNotification(error.message, 'error');
    }
    
    clearCompletedBtn.addEventListener('click', () => {
        let clearedCount = 0;
        document.querySelectorAll('#downloads-container > div[id^="download-"]').forEach(item => {
            const statusText = item.querySelector('.status-text')?.textContent.toLowerCase() || '';
            if (statusText.includes('completed') || statusText.includes('failed') || statusText.includes('cancelled')) {
                const removeBtn = item.querySelector('.remove-btn');
                if (removeBtn && !removeBtn.classList.contains('hidden')) {
                    removeBtn.click();
                    clearedCount++;
                }
            }
        });
        showNotification(clearedCount > 0 ? `Cleared ${clearedCount} finished downloads.` : 'No completed downloads to clear.', 'info');
    });
});

const extractAudioCheck = document.getElementById('pp-extract-audio');
const extractAudioOptions = document.getElementById('extract-audio-options');

if (extractAudioCheck && extractAudioOptions) {
    extractAudioCheck.addEventListener('change', () => {
        extractAudioOptions.classList.toggle('hidden', !extractAudioCheck.checked);
        // If enabling extract audio, also enable post-processing
        if (extractAudioCheck.checked) {
            postprocessingToggle.checked = true;
            postprocessingOptions.classList.remove('hidden');
        }
        generateCommand();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !configSection.classList.contains('hidden')) hideConfigSection();
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !configSection.classList.contains('hidden')) {
        e.preventDefault();
        configConfirmBtn.click();
    }
});

window.addEventListener('beforeunload', () => activeDownloadPolling.forEach(interval => clearInterval(interval)));
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        const theme = htmlEl.classList.contains('dark') ? 'dark' : 'light';
        const bgColor = theme === 'dark' ? '1a1a1a' : 'ffffff';
        const textColor = theme === 'dark' ? 'e5e5e5' : '1a1a1a';
        e.target.src = `https://placehold.co/128x72/${bgColor}/${textColor}?text=No+Image`;
    }
}, true);

function formatTime(seconds) {
    if (seconds === null || isNaN(seconds) || seconds < 0) return '...';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const pad = (n) => n.toString().padStart(2, '0');

    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    // MODIFIED: Use toFixed(2) for better precision on smaller files
    return `${(bytes / Math.pow(1024, i)).toFixed(i < 2 ? 0 : 2)} ${sizes[i]}`;
}
// --- Settings Page Logic (from settings.js) ---
document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('settings-form');

    // Only run this code if we are on the settings page
    if (settingsForm) {
        const saveBtn = document.getElementById('save-settings-btn');
        const listImpersonateBtn = document.getElementById('list-impersonate-btn');
        const impersonateSelect = document.getElementById('impersonate');
        const listMsoBtn = document.getElementById('list-mso-btn');
        const msoSelect = document.getElementById('ap-mso');

        const SETTINGS_KEY = 'yt-dls-advanced-settings';

        // --- Settings Persistence ---
        function saveSettings(showSuccessNotification = true) {
            const settings = {};
            const formData = new FormData(settingsForm);

            for (const [key, value] of formData.entries()) {
                const input = settingsForm.elements[key];
                if (input.type === 'checkbox') {
                    settings[key] = input.checked;
                } else if (value.trim() !== '') {
                    settings[key] = value;
                }
            }
            
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            if (showSuccessNotification) {
                 showNotification('Settings saved automatically.', 'success');
            }
        }

        function loadSettings() {
            const savedSettings = localStorage.getItem(SETTINGS_KEY);
            if (!savedSettings) return;

            const settings = JSON.parse(savedSettings);

            for (const key in settings) {
                if (settingsForm.elements[key]) {
                    const element = settingsForm.elements[key];
                    if (element.type === 'checkbox') {
                        element.checked = settings[key];
                    } else {
                        element.value = settings[key];
                    }
                }
            }
        }
        
        // --- API Fetching for Selects ---
        async function fetchAndPopulate(url, selectElement, placeholder) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
                const data = await response.json();
                if (data.error) throw new Error(data.error);

                const currentValue = selectElement.value;
                selectElement.innerHTML = `<option value="">${placeholder}</option>`;
                
                data.items.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item;
                    option.textContent = item;
                    selectElement.appendChild(option);
                });
                
                if (data.items.includes(currentValue)) {
                    selectElement.value = currentValue;
                }
                showNotification(`${placeholder} list updated.`, 'info');
            } catch (error) {
                console.error(`Error populating select:`, error);
                showNotification(handleNetworkError(error), 'error');
            }
        }

        // --- Validation and Redirection Logic ---
        function handleSaveAndRedirect(event) {
            event.preventDefault(); // Prevent form submission
            
            // 1. Validation Logic
            const socketTimeoutInput = document.getElementById('socket-timeout');
            const timeoutValue = socketTimeoutInput.value;
            
            // Remove previous error styles
            socketTimeoutInput.classList.remove('ring-2', 'ring-red-500');

            // Example validation: check if timeout is a non-negative number
            if (timeoutValue && (isNaN(timeoutValue) || Number(timeoutValue) < 0)) {
                // If validation fails:
                showNotification('Error: Socket Timeout must be a valid, non-negative number.', 'error');
                socketTimeoutInput.classList.add('ring-2', 'ring-red-500'); // Highlight the error field
                socketTimeoutInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to it
                socketTimeoutInput.focus(); // Focus the input
                return; // Stop the function
            }
            
            // 2. If validation is successful:
            saveSettings(false); // Save without showing the default message
            showNotification('Settings saved! Redirecting now...', 'success');
            
            // 3. Redirect to index.html after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500); // 1.5-second delay for the user to read the message
        }

        // --- Event Listeners ---
        if(saveBtn) {
            // Attach the new handler to the save button
            saveBtn.addEventListener('click', handleSaveAndRedirect);
        }
        
        // This keeps the auto-save functionality on individual fields
        settingsForm.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', () => saveSettings());
        });

        if(listImpersonateBtn) {
            listImpersonateBtn.addEventListener('click', () => {
                fetchAndPopulate(`${API_BASE_URL}/list-impersonate-targets`, impersonateSelect, 'None');
            });
        }

        if(listMsoBtn) {
            listMsoBtn.addEventListener('click', () => {
                fetchAndPopulate(`${API_BASE_URL}/list-ap-msos`, msoSelect, 'None');
            });
        }

        // Initial load
        loadSettings();
    }
});
// Donation grid scrolling
const donationGrid = document.getElementById('donationGrid');
const scrollLeftBtn = document.getElementById('scrollLeftBtn');
const scrollRightBtn = document.getElementById('scrollRightBtn');

if (donationGrid && scrollLeftBtn && scrollRightBtn) {
    const scrollAmount = 300; // Adjust scroll distance as needed

    scrollLeftBtn.addEventListener('click', () => {
        donationGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    scrollRightBtn.addEventListener('click', () => {
        donationGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
}
