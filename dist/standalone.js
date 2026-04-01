/**
 * GlassesJS — Standalone Detector
 *
 * Self-contained detector that handles MediaPipe FaceLandmarker
 * initialization internally. User just provides a video element.
 *
 * Two modes:
 * - detectOnce() — accumulate N frames, return Promise with result
 * - start(callback) — continuous detection, callback every X ms
 *
 * @author Pavel Horak / MELIORO Systems
 * @license MIT
 */
import { GlassesDetector } from './index.js';
// ─── Constants ───────────────────────────────────────────────────────
const DEFAULT_MODEL_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm';
const DEFAULT_FRAMES_FOR_RESULT = 30;
const DEFAULT_INTERVAL = 5000;
// ─── StandaloneDetector ──────────────────────────────────────────────
/**
 * Self-contained glasses detector with built-in MediaPipe support.
 *
 * Usage:
 * ```js
 * const detector = await StandaloneDetector.create({ video: myVideoEl });
 *
 * // One-shot:
 * const result = await detector.detectOnce();
 *
 * // Continuous:
 * detector.start((result) => console.log(result));
 * detector.stop();
 *
 * // Cleanup:
 * detector.destroy();
 * ```
 */
export class StandaloneDetector {
    // ─── Constructor (private — use create()) ────────────────────────
    constructor(config) {
        this.faceLandmarker = null;
        this.canvas = null;
        this.ctx = null;
        // Continuous mode state
        this.animationFrameId = null;
        this.intervalTimerId = null;
        this.isRunning = false;
        this.onResultCallback = null;
        this.video = config.video;
        this.framesForResult = config.framesForResult ?? DEFAULT_FRAMES_FOR_RESULT;
        this.interval = config.interval ?? DEFAULT_INTERVAL;
        this.modelPath = config.modelPath ?? DEFAULT_MODEL_CDN;
        this.delegate = config.delegate ?? 'GPU';
        // Create internal GlassesDetector with detection config
        this.detector = new GlassesDetector({
            frameBuffer: config.frameBuffer,
            confidenceThreshold: config.confidenceThreshold,
            methods: config.methods,
        });
    }
    // ─── Factory method ──────────────────────────────────────────────
    /**
     * Create and initialize a StandaloneDetector.
     *
     * This is async because it needs to download and initialize
     * the MediaPipe FaceLandmarker WASM module and model.
     *
     * @param config - Configuration including the video element
     * @returns Initialized StandaloneDetector ready to use
     */
    static async create(config) {
        const instance = new StandaloneDetector(config);
        await instance.initMediaPipe();
        instance.initCanvas();
        return instance;
    }
    // ─── One-shot detection ──────────────────────────────────────────
    /**
     * Detect glasses by accumulating frames, then return the result.
     *
     * Collects `framesForResult` frames from the video, then returns
     * the accumulated detection result as a Promise.
     *
     * @param frames - Override number of frames to collect (default: framesForResult from config)
     * @returns Detection result after accumulating frames
     */
    async detectOnce(frames) {
        const targetFrames = frames ?? this.framesForResult;
        this.detector.reset();
        return new Promise((resolve, reject) => {
            let collected = 0;
            const collectFrame = () => {
                try {
                    const landmarks = this.extractLandmarks();
                    if (landmarks) {
                        this.drawVideoToCanvas();
                        this.detector.addFrame(this.canvas, landmarks);
                        collected++;
                    }
                    if (collected >= targetFrames) {
                        resolve(this.detector.getResult());
                    }
                    else {
                        requestAnimationFrame(collectFrame);
                    }
                }
                catch (err) {
                    reject(err);
                }
            };
            requestAnimationFrame(collectFrame);
        });
    }
    // ─── Continuous detection ────────────────────────────────────────
    /**
     * Start continuous detection.
     *
     * Collects frames every animation frame and evaluates the result
     * every `interval` ms (default 5000), calling the callback with
     * the latest accumulated result.
     *
     * @param onResult - Callback called every interval with detection result
     * @param interval - Override interval in ms (default: interval from config)
     */
    start(onResult, interval) {
        if (this.isRunning) {
            this.stop();
        }
        this.isRunning = true;
        this.onResultCallback = onResult;
        this.detector.reset();
        // Continuous frame collection
        const collectFrame = () => {
            if (!this.isRunning)
                return;
            try {
                const landmarks = this.extractLandmarks();
                if (landmarks) {
                    this.drawVideoToCanvas();
                    this.detector.addFrame(this.canvas, landmarks);
                }
            }
            catch {
                // Skip frame on error, continue collecting
            }
            this.animationFrameId = requestAnimationFrame(collectFrame);
        };
        // Start frame collection
        this.animationFrameId = requestAnimationFrame(collectFrame);
        // Evaluate and report at interval
        const evalInterval = interval ?? this.interval;
        this.intervalTimerId = setInterval(() => {
            if (!this.isRunning || !this.onResultCallback)
                return;
            const result = this.detector.getResult();
            this.onResultCallback(result);
        }, evalInterval);
    }
    /**
     * Stop continuous detection.
     *
     * Stops frame collection and interval evaluation.
     * Does NOT destroy the detector — you can call start() again.
     */
    stop() {
        this.isRunning = false;
        this.onResultCallback = null;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.intervalTimerId !== null) {
            clearInterval(this.intervalTimerId);
            this.intervalTimerId = null;
        }
    }
    /**
     * Reset the accumulated detection data.
     *
     * Useful when the person in front of the camera changes.
     * Does NOT stop continuous detection if running.
     */
    reset() {
        this.detector.reset();
    }
    /**
     * Get the current accumulated result without waiting for interval.
     *
     * Useful in continuous mode when you need the result immediately.
     */
    getResult() {
        return this.detector.getResult();
    }
    // ─── Cleanup ─────────────────────────────────────────────────────
    /**
     * Destroy the detector and release all resources.
     *
     * Closes MediaPipe FaceLandmarker, stops detection,
     * and cleans up internal canvas. Cannot be used after this.
     */
    destroy() {
        this.stop();
        if (this.faceLandmarker) {
            this.faceLandmarker.close();
            this.faceLandmarker = null;
        }
        this.canvas = null;
        this.ctx = null;
    }
    // ─── Internal: MediaPipe initialization ──────────────────────────
    /**
     * Initialize MediaPipe FaceLandmarker.
     * Dynamically imports @mediapipe/tasks-vision to avoid hard dependency.
     */
    async initMediaPipe() {
        try {
            // Dynamic import — works whether user installed the package or uses CDN
            const vision = await this.loadVisionModule();
            const filesetResolver = await vision.FilesetResolver.forVisionTasks(this.modelPath);
            this.faceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                    delegate: this.delegate,
                },
                runningMode: 'VIDEO',
                numFaces: 1,
                outputFaceBlendshapes: false,
                outputFacialTransformationMatrixes: false,
            });
        }
        catch (err) {
            throw new Error(`GlassesJS: Failed to initialize MediaPipe FaceLandmarker. ` +
                `Make sure @mediapipe/tasks-vision is installed or accessible. ` +
                `Error: ${err}`);
        }
    }
    /**
     * Load the MediaPipe vision module.
     * Tries npm import first, falls back to CDN.
     */
    async loadVisionModule() {
        // Use dynamic string to prevent bundlers from resolving at build time
        const npmModule = '@mediapipe/tasks-vision';
        const cdnModule = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs';
        // Try npm import
        try {
            return await Function('m', 'return import(m)')(npmModule);
        }
        catch {
            // npm package not available
        }
        // Try CDN import
        try {
            return await Function('m', 'return import(m)')(cdnModule);
        }
        catch {
            // CDN not available
        }
        throw new Error('GlassesJS: Could not load @mediapipe/tasks-vision. ' +
            'Install it via npm (npm install @mediapipe/tasks-vision) or ' +
            'ensure CDN access is available.');
    }
    // ─── Internal: Canvas and frame processing ──────────────────────
    /**
     * Create internal canvas for video frame extraction.
     */
    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    /**
     * Draw current video frame to internal canvas.
     */
    drawVideoToCanvas() {
        if (!this.canvas || !this.ctx)
            return;
        const w = this.video.videoWidth;
        const h = this.video.videoHeight;
        if (this.canvas.width !== w)
            this.canvas.width = w;
        if (this.canvas.height !== h)
            this.canvas.height = h;
        this.ctx.drawImage(this.video, 0, 0, w, h);
    }
    /**
     * Extract facial landmarks from the current video frame using MediaPipe.
     * Returns null if no face is detected.
     */
    extractLandmarks() {
        if (!this.faceLandmarker)
            return null;
        // MediaPipe needs a timestamp
        const timestamp = performance.now();
        try {
            const result = this.faceLandmarker.detectForVideo(this.video, timestamp);
            if (result.faceLandmarks &&
                result.faceLandmarks.length > 0 &&
                result.faceLandmarks[0].length >= 478) {
                // Convert MediaPipe landmarks to our format
                return result.faceLandmarks[0].map((lm) => ({
                    x: lm.x,
                    y: lm.y,
                    z: lm.z,
                }));
            }
        }
        catch {
            // Detection failed for this frame, skip
        }
        return null;
    }
}
//# sourceMappingURL=standalone.js.map