/**
 * GlassesJS — Method 4: Z-Depth Profile
 *
 * Weight: 15%
 *
 * Analyzes Z-coordinate profile across eye landmarks vs. nose bridge.
 * Glasses create a "false plane" in front of the face — without glasses
 * there's a smooth Z transition from nose to eye corners, but with
 * glasses there's a Z discontinuity at the frame edges.
 *
 * Score = magnitude of Z discontinuity.
 */

import { MethodResult, Landmarks478 } from '../types.js';
import {
  NOSE_BRIDGE,
  LEFT_EYE,
  RIGHT_EYE,
  getLandmarks,
  getLandmark,
} from '../utils/landmarks.js';
import { normalize, mean, standardDeviation } from '../utils/math.js';

// ─── Thresholds ──────────────────────────────────────────────────────

/** Z-depth discontinuity below this is normal */
const DISCONTINUITY_MIN = 0.002;

/** Z-depth discontinuity above this strongly suggests glasses */
const DISCONTINUITY_MAX = 0.015;

// ─── Detection ───────────────────────────────────────────────────────

/**
 * Detect glasses by analyzing Z-depth discontinuities.
 */
export function detectDepth(landmarks: Landmarks478): MethodResult {
  try {
    // Get Z values for nose bridge
    const noseLandmarks = getLandmarks(landmarks, NOSE_BRIDGE);
    const noseZ = noseLandmarks.map((lm) => lm.z);
    const noseZMean = mean(noseZ);

    // Get Z values for left and right eye outlines
    const leftEyeLandmarks = getLandmarks(landmarks, LEFT_EYE);
    const rightEyeLandmarks = getLandmarks(landmarks, RIGHT_EYE);

    const leftEyeZ = leftEyeLandmarks.map((lm) => lm.z);
    const rightEyeZ = rightEyeLandmarks.map((lm) => lm.z);

    // Expected: nose bridge Z should be closer to camera (more negative)
    // than eye corners. With glasses, the eye region Z gets pulled forward
    // by the lens/frame, creating an unnatural flat plane.

    // Calculate Z discontinuity: difference between nose bridge Z
    // and the inner/outer eye corners
    const leftInnerZ = leftEyeLandmarks[0].z;  // landmark 33 (inner corner)
    const leftOuterZ = leftEyeLandmarks[leftEyeLandmarks.length - 1].z;  // landmark 133
    const rightInnerZ = rightEyeLandmarks[rightEyeLandmarks.length - 1].z;  // landmark 263
    const rightOuterZ = rightEyeLandmarks[0].z;  // landmark 362

    // Without glasses: smooth gradient from nose to eye edges
    // With glasses: inner eye corners have similar Z to nose (frame sits there)
    const leftDiscontinuity = Math.abs(leftInnerZ - noseZMean);
    const rightDiscontinuity = Math.abs(rightInnerZ - noseZMean);

    // Also check if the eye region is unusually flat (glasses create flat plane)
    const leftEyeZStd = standardDeviation(leftEyeZ);
    const rightEyeZStd = standardDeviation(rightEyeZ);
    const eyeZFlatness = (leftEyeZStd + rightEyeZStd) / 2;

    // Glasses make the eye region MORE flat (lower std dev)
    // But we detect the discontinuity at the edges
    const avgDiscontinuity = (leftDiscontinuity + rightDiscontinuity) / 2;

    // Normalize to score — smaller discontinuity between nose and inner
    // eye corners = glasses frame connecting them
    // We invert: if inner eye corners are close in Z to nose bridge = glasses
    const discontinuityScore = normalize(
      avgDiscontinuity,
      DISCONTINUITY_MIN,
      DISCONTINUITY_MAX
    );

    // Check for flatness anomaly
    const flatnessScore = normalize(
      0.01 - eyeZFlatness, // Lower flatness std = more likely glasses
      0,
      0.008
    );

    // Combine
    const score = Math.round(discontinuityScore * 0.6 + flatnessScore * 0.4);

    // Generate description
    let description: string;
    if (score >= 75) {
      description = 'Z-depth discontinuity detected';
    } else if (score >= 40) {
      description = 'Moderate Z-depth anomaly';
    } else if (score > 0) {
      description = 'Slight Z-depth variation';
    } else {
      description = 'Normal Z-depth profile (no discontinuity)';
    }

    return { score, description };
  } catch {
    return { score: 0, description: 'Depth analysis failed' };
  }
}
