/**
 * GlassesJS — Method 5: Local Contrast Analysis
 *
 * Weight: 10%
 *
 * Compares pixel contrast in the eye region vs. cheek region (reference).
 * Glass lenses alter local contrast through reflections and tinting.
 *
 * Score = contrast deviation from expected skin-to-eye ratio.
 */
import { LEFT_EYE, RIGHT_EYE, LEFT_CHEEK, RIGHT_CHEEK, LEFT_EYEBROW, RIGHT_EYEBROW, } from '../utils/landmarks.js';
import { extractLandmarkRegion, toGrayscale } from '../utils/pixels.js';
import { regionContrast, normalize } from '../utils/math.js';
// ─── Thresholds ──────────────────────────────────────────────────────
/**
 * Expected contrast ratio (eye region / cheek region) without glasses.
 * Eye region naturally has higher contrast than cheeks (iris, sclera, lashes).
 */
const NORMAL_CONTRAST_RATIO = 1.3;
/** Deviation from normal ratio below this is not significant */
const DEVIATION_MIN = 0.2;
/** Deviation above this strongly suggests glasses */
const DEVIATION_MAX = 1.0;
// ─── Detection ───────────────────────────────────────────────────────
/**
 * Detect glasses by comparing eye region contrast to cheek region contrast.
 */
export function detectContrast(source, landmarks) {
    try {
        // Extract eye regions (combine eye outline + eyebrow for full eye area)
        const leftEyeIndices = [...LEFT_EYE, ...LEFT_EYEBROW];
        const rightEyeIndices = [...RIGHT_EYE, ...RIGHT_EYEBROW];
        const leftEyeRegion = extractLandmarkRegion(source, landmarks, leftEyeIndices, 3);
        const rightEyeRegion = extractLandmarkRegion(source, landmarks, rightEyeIndices, 3);
        // Extract cheek regions (reference — skin without glasses interference)
        const leftCheekRegion = extractLandmarkRegion(source, landmarks, [...LEFT_CHEEK], 5);
        const rightCheekRegion = extractLandmarkRegion(source, landmarks, [...RIGHT_CHEEK], 5);
        // Check valid regions
        if (leftEyeRegion.width === 0 || rightEyeRegion.width === 0 ||
            leftCheekRegion.width === 0 || rightCheekRegion.width === 0) {
            return { score: 0, description: 'Could not extract contrast regions' };
        }
        // Convert to grayscale
        const leftEyeGray = toGrayscale(leftEyeRegion);
        const rightEyeGray = toGrayscale(rightEyeRegion);
        const leftCheekGray = toGrayscale(leftCheekRegion);
        const rightCheekGray = toGrayscale(rightCheekRegion);
        // Calculate contrast (standard deviation of pixel intensities)
        const leftEyeContrast = regionContrast(leftEyeGray);
        const rightEyeContrast = regionContrast(rightEyeGray);
        const leftCheekContrast = regionContrast(leftCheekGray);
        const rightCheekContrast = regionContrast(rightCheekGray);
        // Average eye and cheek contrast
        const avgEyeContrast = (leftEyeContrast + rightEyeContrast) / 2;
        const avgCheekContrast = Math.max(leftCheekContrast + rightCheekContrast, 0.001) / 2;
        // Calculate contrast ratio
        const contrastRatio = avgEyeContrast / Math.max(avgCheekContrast, 0.001);
        // Calculate deviation from normal
        const deviation = Math.abs(contrastRatio - NORMAL_CONTRAST_RATIO);
        // Normalize to score
        const score = Math.round(normalize(deviation, DEVIATION_MIN, DEVIATION_MAX));
        // Generate description
        let description;
        if (score >= 75) {
            description = 'Altered contrast in eye region';
        }
        else if (score >= 40) {
            description = 'Moderate contrast deviation in eye region';
        }
        else if (score > 0) {
            description = 'Slight contrast deviation in eye region';
        }
        else {
            description = 'Normal eye-to-skin contrast ratio';
        }
        return { score, description };
    }
    catch {
        return { score: 0, description: 'Contrast analysis failed' };
    }
}
//# sourceMappingURL=contrast.js.map