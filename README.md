# GlassesJS

**Zero-model glasses detection for the browser.**

Detects whether a person is wearing glasses using webcam video frames and [MediaPipe FaceLandmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) facial landmarks — no AI models, no server, no heavy dependencies. Pure mathematical and pixel analysis running entirely client-side.

[![npm version](https://img.shields.io/npm/v/glassesjs.svg)](https://www.npmjs.com/package/glassesjs)
[![license](https://img.shields.io/npm/l/glassesjs.svg)](https://github.com/pavel-horak-cz/web-glassesjs.com/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/glassesjs.svg)](https://bundlephobia.com/package/glassesjs)

## Why?

- MediaPipe FaceLandmarker does **not** output glasses detection
- Existing solutions require heavy AI models (TensorFlow, ONNX) or server-side processing
- Many applications need to know if the user wears glasses (iris tracking, blink detection, gaze estimation)
- There was no lightweight client-side library for this on npm

## Install

```bash
npm install glassesjs
```

Or via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/glassesjs/dist/glassesjs.min.js"></script>
```

Or as ES module:

```javascript
import { GlassesDetector } from 'glassesjs';
```

## Quick Start

### If you already have MediaPipe landmarks

```javascript
import { GlassesDetector } from 'glassesjs';

const detector = new GlassesDetector();

// Single frame detection (fast, lower accuracy)
const result = detector.detect(canvas, faceLandmarks);
console.log(result.hasGlasses);  // true/false
console.log(result.confidence);  // 0–100
```

### Accumulated detection (higher accuracy)

```javascript
const detector = new GlassesDetector();

// In your detection loop, every frame:
detector.addFrame(canvas, faceLandmarks);

// After 10+ frames, get result:
const result = detector.getResult();
console.log(result.hasGlasses);    // true/false
console.log(result.confidence);    // 0–100
console.log(result.framesAnalyzed); // 30
```

## API

### `new GlassesDetector(config?)`

Create a new detector instance.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `frameBuffer` | `number` | `30` | How many frames to accumulate |
| `confidenceThreshold` | `number` | `70` | Min confidence to report `hasGlasses=true` |
| `methods` | `object` | all `true` | Enable/disable individual methods |

```javascript
const detector = new GlassesDetector({
  frameBuffer: 30,
  confidenceThreshold: 70,
  methods: {
    bridge: true,    // Bridge edge detection (25%)
    temple: true,    // Temple symmetry (20%)
    iris: true,      // Iris stability — multi-frame (20%)
    depth: true,     // Z-depth profile (15%)
    contrast: true,  // Local contrast analysis (10%)
    color: true,     // Color anomaly (10%)
  }
});
```

### `detector.detect(source, landmarks)`

Single-frame detection. Returns immediately.

- `source` — `HTMLCanvasElement | HTMLVideoElement | OffscreenCanvas`
- `landmarks` — Array of 478 MediaPipe facial landmarks (`{ x, y, z }`)

### `detector.addFrame(source, landmarks)`

Add a frame to the accumulation buffer. Call every frame.

### `detector.getResult()`

Get accumulated result. Best after 10+ frames.

### `detector.reset()`

Clear accumulation buffer. Call when the user changes.

## Detection Result

```javascript
{
  hasGlasses: true,
  confidence: 87,
  framesAnalyzed: 1,
  methods: {
    bridge:   { score: 92, description: "Strong horizontal edge on nose bridge" },
    temple:   { score: 85, description: "Symmetric edges at both temples" },
    iris:     { score: 0,  description: "Requires multiple frames (0/10)" },
    depth:    { score: 91, description: "Z-depth discontinuity detected" },
    contrast: { score: 83, description: "Altered contrast in eye region" },
    color:    { score: 78, description: "Color shift detected in lens area" }
  }
}
```

## How It Works

GlassesJS combines 6 independent detection methods, each returning a score 0–100. The final confidence is a weighted average:

| Method | Weight | What it detects |
|--------|--------|----------------|
| **Bridge Edge** | 25% | Horizontal edges across nose bridge (glasses frame) |
| **Temple Symmetry** | 20% | Symmetric vertical edges at temples (glasses arms) |
| **Iris Stability** | 20% | Iris position variance over time (lens refraction) |
| **Z-Depth Profile** | 15% | Z-coordinate discontinuity (glasses plane) |
| **Local Contrast** | 10% | Contrast deviation in eye region (reflections) |
| **Color Anomaly** | 10% | Color shift in lens area (coated lenses) |

## Performance

- Single frame detection: **< 2ms**
- Library size: **< 5KB** minified + gzipped
- Zero runtime dependencies
- Works in all modern browsers

## License

MIT — [Pavel Horak](https://phorak.cz)
