/**
 * GlassesJS — Method 2: Temple Symmetry
 *
 * Weight: 20%
 *
 * Analyzes pixel regions at both temples (near ears) for symmetric
 * vertical edges. Glasses arms create symmetric vertical edge patterns
 * on both sides of the face.
 *
 * Score = symmetry of edge intensity between left and right sides.
 */
import { LEFT_TEMPLE, RIGHT_TEMPLE, LEFT_EYE, RIGHT_EYE, getLandmark, getLandmarks, landmarkBBox, } from '../utils/landmarks.js';
import { extractRegion, toGrayscale, getSourceDimensions, } from '../utils/pixels.js';
import { sobelVertical, regionMean, normalize, } from '../utils/math.js';
// ─── Thresholds ──────────────────────────────────────────────────────
/** Minimum edge intensity at temples to be considered */
const MIN_TEMPLE_EDGE = 10;
/** Strong temple edge */
const MAX_TEMPLE_EDGE = 50;
/** Maximum allowed asymmetry ratio (1.0 = perfect symmetry) */
const SYMMETRY_TOLERANCE = 0.3;
// ─── Detection ───────────────────────────────────────────────────────
/**
 * Extract a temple region given the temple landmark and nearby eye landmarks.
 */
function extractTempleRegion(source, landmarks, templeLandmarkIndex, eyeIndices) {
    const { width: imgW, height: imgH } = getSourceDimensions(source);
    const temple = getLandmark(landmarks, templeLandmarkIndex);
    const eyeLms = getLandmarks(landmarks, eyeIndices);
    const eyeBBox = landmarkBBox(eyeLms, imgW, imgH, 0);
    // Temple region: area around the temple landmark,
    // vertically aligned with the eye region
    const regionWidth = Math.max(10, Math.round(eyeBBox.width * 0.3));
    const regionHeight = Math.max(10, eyeBBox.height + 10);
    const px = Math.round(temple.x * imgW);
    const py = Math.round(temple.y * imgH - regionHeight / 2);
    const x = Math.max(0, Math.min(imgW - regionWidth, px - regionWidth / 2));
    const y = Math.max(0, Math.min(imgH - regionHeight, py));
    return extractRegion(source, x, y, regionWidth, regionHeight);
}
/**
 * Detect glasses by analyzing symmetric vertical edges at the temples.
 */
export function detectTemple(source, landmarks) {
    try {
        // Extract left and right temple regions
        const leftRegion = extractTempleRegion(source, landmarks, LEFT_TEMPLE, LEFT_EYE);
        const rightRegion = extractTempleRegion(source, landmarks, RIGHT_TEMPLE, RIGHT_EYE);
        if (leftRegion.width === 0 || leftRegion.height === 0 ||
            rightRegion.width === 0 || rightRegion.height === 0) {
            return { score: 0, description: 'Could not extract temple regions' };
        }
        // Convert to grayscale
        const leftGray = toGrayscale(leftRegion);
        const rightGray = toGrayscale(rightRegion);
        // Apply vertical Sobel
        const leftEdges = sobelVertical(leftGray);
        const rightEdges = sobelVertical(rightGray);
        // Calculate mean edge intensity for each side
        const leftMean = regionMean(leftEdges);
        const rightMean = regionMean(rightEdges);
        // Both sides need to have some edge intensity
        const avgEdge = (leftMean + rightMean) / 2;
        const edgeScore = normalize(avgEdge, MIN_TEMPLE_EDGE, MAX_TEMPLE_EDGE);
        // Calculate symmetry — glasses arms should create similar edges on both sides
        const maxMean = Math.max(leftMean, rightMean, 0.001);
        const minMean = Math.min(leftMean, rightMean);
        const asymmetry = 1 - (minMean / maxMean);
        // Symmetry score: 100 when perfect, 0 when asymmetry exceeds tolerance
        const symmetryScore = normalize(SYMMETRY_TOLERANCE - asymmetry, 0, SYMMETRY_TOLERANCE);
        // Combine: both edge strength and symmetry matter
        const score = Math.round(edgeScore * 0.5 + symmetryScore * 0.5);
        // Generate description
        let description;
        if (score >= 75) {
            description = 'Symmetric edges at both temples';
        }
        else if (score >= 40) {
            description = 'Moderate edge symmetry at temples';
        }
        else if (score > 0) {
            description = 'Weak or asymmetric edges at temples';
        }
        else {
            description = 'No symmetric temple edges detected';
        }
        return { score, description };
    }
    catch {
        return { score: 0, description: 'Temple detection failed' };
    }
}
//# sourceMappingURL=temple.js.map