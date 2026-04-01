/**
 * GlassesJS — Live Demo
 *
 * Handles webcam access, StandaloneDetector integration,
 * and UI updates for the live demo section.
 */

// ─── State ───────────────────────────────────────────────────────────

let detector = null;
let videoStream = null;
let isRunning = false;

// ─── DOM references ──────────────────────────────────────────────────

const videoEl = document.getElementById('demo-video');
const startBtn = document.getElementById('demo-start-btn');
const stopBtn = document.getElementById('demo-stop-btn');
const placeholder = document.getElementById('demo-placeholder');
const resultPanel = document.getElementById('demo-result-main');
const resultIcon = document.getElementById('result-icon');
const resultLabel = document.getElementById('result-label');
const resultConfidence = document.getElementById('result-confidence');
const resultFrames = document.getElementById('result-frames');
const statusText = document.getElementById('demo-status');

// Method bar elements
const methodBars = {
  bridge: {
    bar: document.getElementById('bar-bridge'),
    score: document.getElementById('score-bridge'),
  },
  temple: {
    bar: document.getElementById('bar-temple'),
    score: document.getElementById('score-temple'),
  },
  iris: {
    bar: document.getElementById('bar-iris'),
    score: document.getElementById('score-iris'),
  },
  depth: {
    bar: document.getElementById('bar-depth'),
    score: document.getElementById('score-depth'),
  },
  contrast: {
    bar: document.getElementById('bar-contrast'),
    score: document.getElementById('score-contrast'),
  },
  color: {
    bar: document.getElementById('bar-color'),
    score: document.getElementById('score-color'),
  },
};

// ─── Start webcam + detection ────────────────────────────────────────

async function startDemo() {
  if (isRunning) return;

  // Check browser support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showStatus(t('demoNotSupported'), true);
    return;
  }

  try {
    // Show initializing status
    showStatus(t('demoInitializing'));
    startBtn.disabled = true;

    // Get webcam stream
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    });

    // Attach to video element
    videoEl.srcObject = videoStream;
    await videoEl.play();

    // Show video, hide placeholder
    videoEl.style.display = 'block';
    placeholder.style.display = 'none';

    // Dynamic import of standalone detector from CDN
    const { StandaloneDetector } = await import(
      'https://cdn.jsdelivr.net/npm/glassesjs/dist/glassesjs.standalone.esm.js'
    ).catch(async () => {
      // Fallback: try loading from local dist (for development)
      return await import('../dist/glassesjs.standalone.esm.js');
    }).catch(() => {
      // Final fallback: inline error
      throw new Error('Could not load GlassesJS standalone module');
    });

    // Create detector
    detector = await StandaloneDetector.create({
      video: videoEl,
      framesForResult: 30,
      interval: 3000,
      confidenceThreshold: 70,
    });

    // Start continuous detection
    isRunning = true;
    detector.start(onResult, 3000);

    // Update UI
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-flex';
    showStatus(t('demoWaiting'));

  } catch (err) {
    console.error('GlassesJS Demo Error:', err);
    showStatus(t('demoError'), true);
    startBtn.disabled = false;
    stopDemo();
  }
}

// ─── Stop detection ──────────────────────────────────────────────────

function stopDemo() {
  isRunning = false;

  // Stop detector
  if (detector) {
    detector.stop();
    detector.destroy();
    detector = null;
  }

  // Stop webcam
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
    videoStream = null;
  }

  // Reset video
  videoEl.srcObject = null;
  videoEl.style.display = 'none';
  placeholder.style.display = 'flex';

  // Reset UI
  startBtn.style.display = 'inline-flex';
  startBtn.disabled = false;
  stopBtn.style.display = 'none';
  resetResults();
}

// ─── Handle detection result ─────────────────────────────────────────

function onResult(result) {
  if (!isRunning) return;

  // Update main result
  if (result.hasGlasses) {
    resultIcon.textContent = '👓';
    resultLabel.textContent = t('demoGlasses');
    resultPanel.className = 'demo-result-main glasses';
  } else {
    resultIcon.textContent = '👤';
    resultLabel.textContent = t('demoNoGlasses');
    resultPanel.className = 'demo-result-main no-glasses';
  }

  resultConfidence.textContent = result.confidence + '%';
  resultFrames.textContent =
    t('demoFrames') + ': ' + result.framesAnalyzed;

  // Update method bars
  const methods = result.methods;
  for (const [name, els] of Object.entries(methodBars)) {
    const method = methods[name];
    if (method && els.bar && els.score) {
      els.bar.style.width = method.score + '%';
      els.score.textContent = method.score;
    }
  }

  // Clear status
  hideStatus();
}

// ─── UI helpers ──────────────────────────────────────────────────────

function showStatus(message, isError = false) {
  if (statusText) {
    statusText.textContent = message;
    statusText.style.display = 'block';
    statusText.style.color = isError ? '#ef4444' : 'var(--text-muted)';
  }
}

function hideStatus() {
  if (statusText) {
    statusText.style.display = 'none';
  }
}

function resetResults() {
  resultIcon.textContent = '—';
  resultLabel.textContent = '';
  resultConfidence.textContent = '—';
  resultFrames.textContent = '';
  resultPanel.className = 'demo-result-main';
  hideStatus();

  for (const els of Object.values(methodBars)) {
    if (els.bar) els.bar.style.width = '0%';
    if (els.score) els.score.textContent = '0';
  }
}

// ─── Event listeners ─────────────────────────────────────────────────

startBtn?.addEventListener('click', startDemo);
stopBtn?.addEventListener('click', stopDemo);

// ─── API tabs ────────────────────────────────────────────────────────

document.querySelectorAll('.api-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    // Deactivate all tabs and panels
    document.querySelectorAll('.api-tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.api-panel').forEach((p) => p.classList.remove('active'));

    // Activate clicked tab and its panel
    tab.classList.add('active');
    const panel = document.getElementById(tab.dataset.panel);
    if (panel) panel.classList.add('active');
  });
});
