/**
 * GlassesJS — Method 1: Bridge Edge Detection
 *
 * Weight: 25%
 *
 * Extracts the pixel region around the nose bridge and applies
 * horizontal Sobel edge detection. Glasses frames create strong
 * horizontal edges across the nose bridge area.
 *
 * Score = normalized edge intensity vs. threshold.
 */

import { MethodResult, ImageSource, Landmarks478 } from '../types.js';
import { NOSE_BRIDGE, LEFT_EYE, RIGHT_EYE, getLandmarks } from '../utils/landmarks.js';
import { extractLandmarkRegion, toGrayscale } from '../utils/pixels.js';
import { sobelHorizontal, regionMean, regionAboveThreshold, normalize } from '../utils/math.js';

// ─── Thresholds (tuned empirically) ─────────────────────────────────

/** Minimum mean edge intensity that suggests glasses */
const EDGE_THRESHOLD_MIN = 15;

/** Strong edge intensity — very likely glasses */
const EDGE_THRESHOLD_MAX = 60;

/** Minimum percentage of pixels with strong edges */
const STRONG_EDGE_PIXEL_THRESHOLD = 30;

/** What counts as a "strong" edge pixel */
const STRONG_EDGE_VALUE = 40;

// ─── Detection ───────────────────────────────────────────────────────

/**
 * Detect glasses by analyzing horizontal edges on the nose bridge.
 */
export function detectBridge(
  source: ImageSource,
  landmarks: Landmarks478
): MethodResult {
  try {
    // Combine nose bridge with inner eye landmarks for a wider region
    const bridgeIndices = [...NOSE_BRIDGE, LEFT_EYE[0], RIGHT_EYE[RIGHT_EYE.length - 1]];

    // Extract the region around the nose bridge with padding
    const region = extractLandmarkRegion(source, landmarks, bridgeIndices, 8);
    if (region.width === 0 || region.height === 0) {
      return { score: 0, description: 'Could not extract bridge region' };
    }

    // Convert to grayscale
    const gray = toGrayscale(region);

    // Apply horizontal Sobel
    const edges = sobelHorizontal(gray);

    // Calculate metrics
    const meanEdge = regionMean(edges);
    const strongEdgePercent = regionAboveThreshold(edges, STRONG_EDGE_VALUE);

    // Combine mean edge intensity and strong edge percentage
    const edgeScore = normalize(meanEdge, EDGE_THRESHOLD_MIN, EDGE_THRESHOLD_MAX);
    const densityScore = normalize(strongEdgePercent, 5, STRONG_EDGE_PIXEL_THRESHOLD);

    // Weighted combination (edge intensity matters more)
    const score = Math.round(edgeScore * 0.6 + densityScore * 0.4);

    // Generate description
    let description: string;
    if (score >= 75) {
      description = 'Strong horizontal edge on nose bridge';
    } else if (score >= 40) {
      description = 'Moderate horizontal edge detected on nose bridge';
    } else if (score > 0) {
      description = 'Weak horizontal edge on nose bridge';
    } else {
      description = 'No significant horizontal edge on nose bridge';
    }

    return { score, description };
  } catch {
    return { score: 0, description: 'Bridge detection failed' };
  }
}
