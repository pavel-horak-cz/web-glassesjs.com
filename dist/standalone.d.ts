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
 * @author Pavel Horak
 * @license MIT
 */
import { GlassesDetectorConfig, DetectionResult } from './types.js';
/** Configuration for StandaloneDetector */
export interface StandaloneDetectorConfig extends GlassesDetectorConfig {
    /** The video element to analyze (required) */
    video: HTMLVideoElement;
    /**
     * How many frames to accumulate for detectOnce().
     * Default: 30
     */
    framesForResult?: number;
    /**
     * Interval in ms for continuous mode (start/stop).
     * The detector collects frames continuously and evaluates
     * the accumulated result every `interval` ms.
     * Default: 5000
     */
    interval?: number;
    /**
     * Path to MediaPipe FaceLandmarker WASM + model files.
     * Default: Google CDN (https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm)
     */
    modelPath?: string;
    /**
     * Which delegate to use for MediaPipe inference.
     * 'GPU' is faster but not available everywhere.
     * Default: 'GPU'
     */
    delegate?: 'GPU' | 'CPU';
}
/** Callback for continuous detection mode */
export type OnResultCallback = (result: DetectionResult) => void;
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
export declare class StandaloneDetector {
    private video;
    private detector;
    private faceLandmarker;
    private canvas;
    private ctx;
    private framesForResult;
    private interval;
    private modelPath;
    private delegate;
    private animationFrameId;
    private intervalTimerId;
    private isRunning;
    private onResultCallback;
    private constructor();
    /**
     * Create and initialize a StandaloneDetector.
     *
     * This is async because it needs to download and initialize
     * the MediaPipe FaceLandmarker WASM module and model.
     *
     * @param config - Configuration including the video element
     * @returns Initialized StandaloneDetector ready to use
     */
    static create(config: StandaloneDetectorConfig): Promise<StandaloneDetector>;
    /**
     * Detect glasses by accumulating frames, then return the result.
     *
     * Collects `framesForResult` frames from the video, then returns
     * the accumulated detection result as a Promise.
     *
     * @param frames - Override number of frames to collect (default: framesForResult from config)
     * @returns Detection result after accumulating frames
     */
    detectOnce(frames?: number): Promise<DetectionResult>;
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
    start(onResult: OnResultCallback, interval?: number): void;
    /**
     * Stop continuous detection.
     *
     * Stops frame collection and interval evaluation.
     * Does NOT destroy the detector — you can call start() again.
     */
    stop(): void;
    /**
     * Reset the accumulated detection data.
     *
     * Useful when the person in front of the camera changes.
     * Does NOT stop continuous detection if running.
     */
    reset(): void;
    /**
     * Get the current accumulated result without waiting for interval.
     *
     * Useful in continuous mode when you need the result immediately.
     */
    getResult(): DetectionResult;
    /**
     * Destroy the detector and release all resources.
     *
     * Closes MediaPipe FaceLandmarker, stops detection,
     * and cleans up internal canvas. Cannot be used after this.
     */
    destroy(): void;
    /**
     * Initialize MediaPipe FaceLandmarker.
     * Dynamically imports @mediapipe/tasks-vision to avoid hard dependency.
     */
    private initMediaPipe;
    /**
     * Load the MediaPipe vision module.
     * Tries npm import first, falls back to CDN.
     */
    private loadVisionModule;
    /**
     * Create internal canvas for video frame extraction.
     */
    private initCanvas;
    /**
     * Draw current video frame to internal canvas.
     */
    private drawVideoToCanvas;
    /**
     * Extract facial landmarks from the current video frame using MediaPipe.
     * Returns null if no face is detected.
     */
    private extractLandmarks;
}
