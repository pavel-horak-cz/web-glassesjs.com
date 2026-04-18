/**
 * GlassesJS — Main entry point
 *
 * Zero-model glasses detection for the browser.
 * Detects whether a person is wearing glasses using webcam video frames
 * and MediaPipe facial landmarks — no AI models, no server, no dependencies.
 *
 * @author Pavel Horak
 * @license MIT
 * @see https://glassesjs.com
 */
import { GlassesDetectorConfig, DetectionResult, ImageSource, Landmarks478 } from './types.js';
/**
 * Main glasses detection class.
 *
 * Supports two usage modes:
 *
 * 1. **Single frame** (fast, lower accuracy):
 *    ```js
 *    const result = detector.detect(canvas, landmarks);
 *    ```
 *
 * 2. **Accumulated** (more accurate, over multiple frames):
 *    ```js
 *    detector.addFrame(canvas, landmarks);
 *    // ... after 10+ frames:
 *    const result = detector.getResult();
 *    ```
 */
export declare class GlassesDetector {
    private config;
    private methods;
    private irisData;
    private frameScores;
    private framesAnalyzed;
    constructor(config?: GlassesDetectorConfig);
    /**
     * Detect glasses in a single frame.
     *
     * Fast but lower accuracy — iris method will not contribute
     * as it requires multiple frames.
     *
     * @param source - Canvas, video, or OffscreenCanvas with the current frame
     * @param landmarks - Array of 478 MediaPipe facial landmarks
     * @returns Detection result with confidence and per-method scores
     */
    detect(source: ImageSource, landmarks: Landmarks478): DetectionResult;
    /**
     * Add a frame to the accumulation buffer.
     *
     * Call this every frame in your detection loop.
     * After enough frames (10+), use `getResult()` for higher accuracy.
     *
     * @param source - Canvas, video, or OffscreenCanvas with the current frame
     * @param landmarks - Array of 478 MediaPipe facial landmarks
     */
    addFrame(source: ImageSource, landmarks: Landmarks478): void;
    /**
     * Get the accumulated detection result.
     *
     * Best called after 10+ frames for accurate results.
     * Uses averaged scores from all accumulated frames plus
     * iris stability analysis.
     *
     * @returns Detection result with confidence and per-method scores
     */
    getResult(): DetectionResult;
    /**
     * Reset the accumulation buffer.
     *
     * Call this when the user changes or when you want to start fresh.
     */
    reset(): void;
    /**
     * Run all enabled detection methods on a single frame.
     */
    private runMethods;
    /**
     * Get accumulated method results (averaged scores).
     */
    private getAccumulatedMethods;
    /**
     * Calculate overall weighted confidence from method results.
     * Adjusts weights when some methods are disabled or have no data.
     */
    private calculateConfidence;
    /**
     * Push a score to the accumulation buffer, keeping it within limits.
     */
    private pushScore;
}
export type { GlassesDetectorConfig, DetectionResult, MethodResults, MethodResult, MethodsConfig, ImageSource, Landmarks478, Landmark, } from './types.js';
