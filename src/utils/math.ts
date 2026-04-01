/**
 * GlassesJS — Math utilities
 *
 * Sobel edge detection, variance, normalization, and other math helpers.
 */

import { GrayscaleRegion } from '../types.js';

// ─── Sobel Edge Detection ────────────────────────────────────────────

/** Sobel kernel for horizontal edges (Gx) */
const SOBEL_X = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
];

/** Sobel kernel for vertical edges (Gy) */
const SOBEL_Y = [
  [-1, -2, -1],
  [ 0,  0,  0],
  [ 1,  2,  1],
];

/**
 * Apply Sobel edge detection to a grayscale region.
 * Returns a new region with edge magnitude values.
 */
export function sobelEdge(region: GrayscaleRegion): GrayscaleRegion {
  const { data, width, height } = region;
  const result = new Float64Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = data[(y + ky) * width + (x + kx)];
          gx += pixel * SOBEL_X[ky + 1][kx + 1];
          gy += pixel * SOBEL_Y[ky + 1][kx + 1];
        }
      }

      result[y * width + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  return { data: result, width, height };
}

/**
 * Apply horizontal Sobel only (detect horizontal edges).
 * Glasses frames create strong horizontal edges across the nose bridge.
 */
export function sobelHorizontal(region: GrayscaleRegion): GrayscaleRegion {
  const { data, width, height } = region;
  const result = new Float64Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = data[(y + ky) * width + (x + kx)];
          gy += pixel * SOBEL_Y[ky + 1][kx + 1];
        }
      }

      result[y * width + x] = Math.abs(gy);
    }
  }

  return { data: result, width, height };
}

/**
 * Apply vertical Sobel only (detect vertical edges).
 * Glasses arms create vertical edges at the temples.
 */
export function sobelVertical(region: GrayscaleRegion): GrayscaleRegion {
  const { data, width, height } = region;
  const result = new Float64Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = data[(y + ky) * width + (x + kx)];
          gx += pixel * SOBEL_X[ky + 1][kx + 1];
        }
      }

      result[y * width + x] = Math.abs(gx);
    }
  }

  return { data: result, width, height };
}

// ─── Statistical functions ───────────────────────────────────────────

/**
 * Calculate the mean (average) of an array of numbers.
 */
export function mean(values: number[] | Float64Array): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }
  return sum / values.length;
}

/**
 * Calculate variance of an array of numbers.
 */
export function variance(values: number[] | Float64Array): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  let sumSq = 0;
  for (let i = 0; i < values.length; i++) {
    const diff = values[i] - avg;
    sumSq += diff * diff;
  }
  return sumSq / values.length;
}

/**
 * Calculate standard deviation.
 */
export function standardDeviation(values: number[] | Float64Array): number {
  return Math.sqrt(variance(values));
}

// ─── Normalization ───────────────────────────────────────────────────

/**
 * Normalize a value to 0–100 range using min/max thresholds.
 * Values below min → 0, above max → 100.
 */
export function normalize(
  value: number,
  min: number,
  max: number
): number {
  if (max <= min) return 0;
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Region statistics ───────────────────────────────────────────────

/**
 * Calculate mean intensity of a grayscale region.
 */
export function regionMean(region: GrayscaleRegion): number {
  return mean(region.data);
}

/**
 * Calculate the contrast (standard deviation of intensities) of a region.
 */
export function regionContrast(region: GrayscaleRegion): number {
  return standardDeviation(region.data);
}

/**
 * Calculate the maximum value in a region.
 */
export function regionMax(region: GrayscaleRegion): number {
  let max = -Infinity;
  for (let i = 0; i < region.data.length; i++) {
    if (region.data[i] > max) max = region.data[i];
  }
  return max;
}

/**
 * Calculate the percentage of pixels above a threshold.
 */
export function regionAboveThreshold(
  region: GrayscaleRegion,
  threshold: number
): number {
  if (region.data.length === 0) return 0;
  let count = 0;
  for (let i = 0; i < region.data.length; i++) {
    if (region.data[i] > threshold) count++;
  }
  return (count / region.data.length) * 100;
}
