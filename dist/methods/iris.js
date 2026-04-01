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
import { LEFT_IRIS, RIGHT_IRIS, LEFT_EYE, RIGHT_EYE, getLandmarks, landmarkCenter, landmarkDistance2D, } from '../utils/landmarks.js';
import { variance, normalize } from '../utils/math.js';
// ─── Thresholds ──────────────────────────────────────────────────────
/** Minimum frames needed for meaningful variance calculation */
const MIN_FRAMES = 10;
/** Variance threshold — below this is normal (no glasses) */
const VARIANCE_MIN = 0.00001;
/** Variance threshold — above this strongly suggests glasses */
const VARIANCE_MAX = 0.0002;
// ─── Detection ───────────────────────────────────────────────────────
/**
 * Extract iris-to-eye offset data from a single frame.
 * This data is accumulated over multiple frames.
 */
export function extractIrisData(landmarks) {
    // Get iris and eye landmarks
    const leftIris = getLandmarks(landmarks, LEFT_IRIS);
    const rightIris = getLandmarks(landmarks, RIGHT_IRIS);
    const leftEye = getLandmarks(landmarks, LEFT_EYE);
    const rightEye = getLandmarks(landmarks, RIGHT_EYE);
    // Calculate centers
    const leftIrisCenter = landmarkCenter(leftIris);
    const rightIrisCenter = landmarkCenter(rightIris);
    const leftEyeCenter = landmarkCenter(leftEye);
    const rightEyeCenter = landmarkCenter(rightEye);
    // Calculate offset (distance from iris center to eye center)
    const leftOffset = landmarkDistance2D(leftIrisCenter, leftEyeCenter);
    const rightOffset = landmarkDistance2D(rightIrisCenter, rightEyeCenter);
    return { leftOffset, rightOffset };
}
/**
 * Analyze accumulated iris data to detect glasses.
 * Requires at least MIN_FRAMES of data.
 */
export function detectIris(frameData) {
    if (frameData.length < MIN_FRAMES) {
        return {
            score: 0,
            description: `Requires multiple frames (${frameData.length}/${MIN_FRAMES})`,
        };
    }
    try {
        // Calculate variance of iris offsets
        const leftOffsets = frameData.map((d) => d.leftOffset);
        const rightOffsets = frameData.map((d) => d.rightOffset);
        const leftVariance = variance(leftOffsets);
        const rightVariance = variance(rightOffsets);
        // Average variance from both eyes
        const avgVariance = (leftVariance + rightVariance) / 2;
        // Normalize to score
        const score = Math.round(normalize(avgVariance, VARIANCE_MIN, VARIANCE_MAX));
        // Generate description
        let description;
        if (score >= 75) {
            description = 'High iris position variance (lens refraction)';
        }
        else if (score >= 40) {
            description = 'Moderate iris position variance';
        }
        else if (score > 0) {
            description = 'Low iris position variance';
        }
        else {
            description = 'Stable iris position (no refraction detected)';
        }
        return { score, description };
    }
    catch {
        return { score: 0, description: 'Iris stability analysis failed' };
    }
}
//# sourceMappingURL=iris.js.map