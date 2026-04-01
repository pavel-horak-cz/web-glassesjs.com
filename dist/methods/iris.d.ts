/**
 * GlassesJS — Method 3: Iris Landmark Stability
 *
 * Weight: 20%
 *
 * Tracks iris landmarks (468–477) position variance over N frames.
 * Glasses lenses refract light, causing higher variance in the
 * detected iris position relative to the eye outline.
 *
 * Requires accumulation over 10+ frames — returns score 0 for
 * single-frame detection.
 */
import { MethodResult, Landmarks478 } from '../types.js';
/** Stored iris-to-eye-center ratios per frame */
export interface IrisFrameData {
    /** Left iris offset from left eye center (normalized) */
    leftOffset: number;
    /** Right iris offset from right eye center (normalized) */
    rightOffset: number;
}
/**
 * Extract iris-to-eye offset data from a single frame.
 * This data is accumulated over multiple frames.
 */
export declare function extractIrisData(landmarks: Landmarks478): IrisFrameData;
/**
 * Analyze accumulated iris data to detect glasses.
 * Requires at least MIN_FRAMES of data.
 */
export declare function detectIris(frameData: IrisFrameData[]): MethodResult;
