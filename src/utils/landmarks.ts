/**
 * GlassesJS — Landmark index constants
 *
 * MediaPipe 478-point FaceLandmarker indices organized by region.
 */

import { Landmark, Landmarks478 } from '../types.js';

// ─── Nose bridge ─────────────────────────────────────────────────────

/** Nose bridge landmark indices — where glasses frame sits */
export const NOSE_BRIDGE = [6, 168, 197, 195, 5] as const;

// ─── Eye outlines ────────────────────────────────────────────────────

/** Left eye outline landmark indices */
export const LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133] as const;

/** Right eye outline landmark indices */
export const RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263] as const;

// ─── Iris ────────────────────────────────────────────────────────────

/** Left iris landmark indices */
export const LEFT_IRIS = [468, 469, 470, 471, 472] as const;

/** Right iris landmark indices */
export const RIGHT_IRIS = [473, 474, 475, 476, 477] as const;

// ─── Temples (sides of face where glasses arms sit) ──────────────────

/** Left temple landmark index */
export const LEFT_TEMPLE = 234;

/** Right temple landmark index */
export const RIGHT_TEMPLE = 454;

// ─── Eyebrows ────────────────────────────────────────────────────────

/** Left eyebrow landmark indices */
export const LEFT_EYEBROW = [46, 53, 52, 65, 55, 70] as const;

/** Right eyebrow landmark indices */
export const RIGHT_EYEBROW = [276, 283, 282, 295, 285, 300] as const;

// ─── Reference regions (cheeks — used for skin color baseline) ───────

/** Left cheek region landmark indices */
export const LEFT_CHEEK = [116, 117, 118, 119, 100] as const;

/** Right cheek region landmark indices */
export const RIGHT_CHEEK = [345, 346, 347, 348, 329] as const;

// ─── Helper functions ────────────────────────────────────────────────

/**
 * Extract specific landmarks by their indices.
 */
export function getLandmarks(
  allLandmarks: Landmarks478,
  indices: readonly number[]
): Landmark[] {
  return indices.map((i) => allLandmarks[i]);
}

/**
 * Get a single landmark by index.
 */
export function getLandmark(
  allLandmarks: Landmarks478,
  index: number
): Landmark {
  return allLandmarks[index];
}

/**
 * Calculate the center (average) of a set of landmarks.
 */
export function landmarkCenter(landmarks: Landmark[]): Landmark {
  const n = landmarks.length;
  if (n === 0) return { x: 0, y: 0, z: 0 };

  let sx = 0, sy = 0, sz = 0;
  for (const lm of landmarks) {
    sx += lm.x;
    sy += lm.y;
    sz += lm.z;
  }
  return { x: sx / n, y: sy / n, z: sz / n };
}

/**
 * Calculate Euclidean distance between two landmarks (2D, ignoring Z).
 */
export function landmarkDistance2D(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the bounding box of a set of landmarks in pixel coordinates.
 */
export function landmarkBBox(
  landmarks: Landmark[],
  imageWidth: number,
  imageHeight: number,
  padding: number = 0
): { x: number; y: number; width: number; height: number } {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const lm of landmarks) {
    const px = lm.x * imageWidth;
    const py = lm.y * imageHeight;
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }

  // Apply padding
  minX = Math.max(0, Math.floor(minX - padding));
  minY = Math.max(0, Math.floor(minY - padding));
  maxX = Math.min(imageWidth, Math.ceil(maxX + padding));
  maxY = Math.min(imageHeight, Math.ceil(maxY + padding));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
