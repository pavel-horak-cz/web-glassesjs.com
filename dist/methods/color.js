/**
 * GlassesJS — Method 6: Color Anomaly
 *
 * Weight: 10%
 *
 * Samples pixel colors in a grid across the eye region and compares
 * with surrounding skin color. Glass lenses shift color temperature
 * (especially coated lenses — anti-reflective, blue light filter, etc.).
 *
 * Score = color deviation in eye region vs. skin baseline.
 */
import { LEFT_EYE, RIGHT_EYE, LEFT_CHEEK, RIGHT_CHEEK, LEFT_EYEBROW, RIGHT_EYEBROW, } from '../utils/landmarks.js';
import { extractLandmarkRegion, sampleColorGrid, averageColor, colorDistance, colorTemperatureShift, } from '../utils/pixels.js';
import { normalize, mean } from '../utils/math.js';
// ─── Thresholds ──────────────────────────────────────────────────────
/** Minimum color deviation to be considered significant */
const COLOR_DEVIATION_MIN = 8;
/** Strong color deviation — very likely glasses */
const COLOR_DEVIATION_MAX = 35;
/** Minimum temperature shift to be considered */
const TEMP_SHIFT_MIN = 3;
/** Strong temperature shift */
const TEMP_SHIFT_MAX = 20;
// ─── Detection ───────────────────────────────────────────────────────
/**
 * Detect glasses by analyzing color anomalies in the eye region.
 */
export function detectColor(source, landmarks) {
    try {
        // Extract eye regions (between eyebrow and eye outline)
        const leftEyeIndices = [...LEFT_EYE, ...LEFT_EYEBROW];
        const rightEyeIndices = [...RIGHT_EYE, ...RIGHT_EYEBROW];
        const leftEyeRegion = extractLandmarkRegion(source, landmarks, leftEyeIndices, 2);
        const rightEyeRegion = extractLandmarkRegion(source, landmarks, rightEyeIndices, 2);
        // Extract cheek regions (skin baseline)
        const leftCheekRegion = extractLandmarkRegion(source, landmarks, [...LEFT_CHEEK], 5);
        const rightCheekRegion = extractLandmarkRegion(source, landmarks, [...RIGHT_CHEEK], 5);
        // Check valid regions
        if (leftEyeRegion.width === 0 || rightEyeRegion.width === 0 ||
            leftCheekRegion.width === 0 || rightCheekRegion.width === 0) {
            return { score: 0, description: 'Could not extract color regions' };
        }
        // Sample colors in grid across eye regions
        const leftEyeColors = sampleColorGrid(leftEyeRegion, 5);
        const rightEyeColors = sampleColorGrid(rightEyeRegion, 5);
        // Get skin baseline from cheeks
        const leftSkinColor = averageColor(leftCheekRegion);
        const rightSkinColor = averageColor(rightCheekRegion);
        const skinColor = {
            r: (leftSkinColor.r + rightSkinColor.r) / 2,
            g: (leftSkinColor.g + rightSkinColor.g) / 2,
            b: (leftSkinColor.b + rightSkinColor.b) / 2,
        };
        // Calculate color distances from skin baseline for each grid sample
        const allEyeColors = [...leftEyeColors, ...rightEyeColors];
        const distances = allEyeColors.map((c) => colorDistance(c, skinColor));
        const avgDistance = mean(distances);
        // Calculate temperature shifts
        const tempShifts = allEyeColors.map((c) => Math.abs(colorTemperatureShift(skinColor, c)));
        const avgTempShift = mean(tempShifts);
        // Normalize scores
        const distanceScore = normalize(avgDistance, COLOR_DEVIATION_MIN, COLOR_DEVIATION_MAX);
        const tempScore = normalize(avgTempShift, TEMP_SHIFT_MIN, TEMP_SHIFT_MAX);
        // Combine (color distance is primary, temperature shift is secondary)
        const score = Math.round(distanceScore * 0.6 + tempScore * 0.4);
        // Generate description
        let description;
        if (score >= 75) {
            description = 'Color shift detected in lens area';
        }
        else if (score >= 40) {
            description = 'Moderate color anomaly in eye region';
        }
        else if (score > 0) {
            description = 'Slight color variation in eye region';
        }
        else {
            description = 'No significant color anomaly in eye region';
        }
        return { score, description };
    }
    catch {
        return { score: 0, description: 'Color analysis failed' };
    }
}
//# sourceMappingURL=color.js.map