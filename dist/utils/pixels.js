/**
 * GlassesJS — Pixel extraction utilities
 *
 * Extract pixel regions from canvas/video, convert to grayscale,
 * sample colors, etc.
 */
import { landmarkBBox, getLandmarks } from './landmarks.js';
// ─── Canvas helper ───────────────────────────────────────────────────
/** Internal offscreen canvas for pixel extraction */
let _canvas = null;
let _ctx = null;
/**
 * Get or create an internal canvas for pixel extraction.
 */
function getInternalCanvas(width, height) {
    if (_canvas &&
        _ctx &&
        _canvas.width === width &&
        _canvas.height === height) {
        return _ctx;
    }
    if (typeof OffscreenCanvas !== 'undefined') {
        _canvas = new OffscreenCanvas(width, height);
    }
    else {
        _canvas = document.createElement('canvas');
        _canvas.width = width;
        _canvas.height = height;
    }
    _ctx = _canvas.getContext('2d');
    return _ctx;
}
// ─── Pixel extraction ────────────────────────────────────────────────
/**
 * Get the dimensions of an image source.
 */
export function getSourceDimensions(source) {
    if (source instanceof HTMLVideoElement) {
        return { width: source.videoWidth, height: source.videoHeight };
    }
    return { width: source.width, height: source.height };
}
/**
 * Extract a rectangular pixel region from the source.
 */
export function extractRegion(source, x, y, width, height) {
    // Ensure valid dimensions
    if (width <= 0 || height <= 0) {
        return {
            data: new Uint8ClampedArray(0),
            width: 0,
            height: 0,
        };
    }
    const ctx = getInternalCanvas(width, height);
    ctx.drawImage(source, x, y, width, height, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    return {
        data: imageData.data,
        width,
        height,
    };
}
/**
 * Extract a pixel region around a set of landmarks with padding.
 */
export function extractLandmarkRegion(source, landmarks, indices, padding = 5) {
    const { width: imgW, height: imgH } = getSourceDimensions(source);
    const lms = getLandmarks(landmarks, indices);
    const bbox = landmarkBBox(lms, imgW, imgH, padding);
    return extractRegion(source, bbox.x, bbox.y, bbox.width, bbox.height);
}
// ─── Grayscale conversion ────────────────────────────────────────────
/**
 * Convert an RGBA pixel region to grayscale.
 * Uses luminance formula: 0.299R + 0.587G + 0.114B
 */
export function toGrayscale(region) {
    const { data, width, height } = region;
    const gray = new Float64Array(width * height);
    for (let i = 0; i < width * height; i++) {
        const offset = i * 4;
        gray[i] =
            0.299 * data[offset] +
                0.587 * data[offset + 1] +
                0.114 * data[offset + 2];
    }
    return { data: gray, width, height };
}
/**
 * Sample the average RGB color of a pixel region.
 */
export function averageColor(region) {
    const { data, width, height } = region;
    const n = width * height;
    if (n === 0)
        return { r: 0, g: 0, b: 0 };
    let sr = 0, sg = 0, sb = 0;
    for (let i = 0; i < n; i++) {
        const offset = i * 4;
        sr += data[offset];
        sg += data[offset + 1];
        sb += data[offset + 2];
    }
    return {
        r: sr / n,
        g: sg / n,
        b: sb / n,
    };
}
/**
 * Sample colors in a grid pattern across a pixel region.
 * Returns an array of RGB colors.
 */
export function sampleColorGrid(region, gridSize = 5) {
    const { data, width, height } = region;
    if (width === 0 || height === 0)
        return [];
    const colors = [];
    const stepX = Math.max(1, Math.floor(width / gridSize));
    const stepY = Math.max(1, Math.floor(height / gridSize));
    for (let gy = 0; gy < gridSize; gy++) {
        for (let gx = 0; gx < gridSize; gx++) {
            const px = Math.min(gx * stepX, width - 1);
            const py = Math.min(gy * stepY, height - 1);
            const offset = (py * width + px) * 4;
            colors.push({
                r: data[offset],
                g: data[offset + 1],
                b: data[offset + 2],
            });
        }
    }
    return colors;
}
/**
 * Calculate the color distance between two RGB colors.
 * Uses simple Euclidean distance in RGB space.
 */
export function colorDistance(a, b) {
    const dr = a.r - b.r;
    const dg = a.g - b.g;
    const db = a.b - b.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}
/**
 * Calculate the average color temperature shift (warm/cool).
 * Returns positive for warmer (more red), negative for cooler (more blue).
 */
export function colorTemperatureShift(a, b) {
    const warmthA = a.r - a.b;
    const warmthB = b.r - b.b;
    return warmthB - warmthA;
}
//# sourceMappingURL=pixels.js.map