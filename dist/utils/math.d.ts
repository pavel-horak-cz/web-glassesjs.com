/**
 * GlassesJS — Math utilities
 *
 * Sobel edge detection, variance, normalization, and other math helpers.
 */
import { GrayscaleRegion } from '../types.js';
/**
 * Apply Sobel edge detection to a grayscale region.
 * Returns a new region with edge magnitude values.
 */
export declare function sobelEdge(region: GrayscaleRegion): GrayscaleRegion;
/**
 * Apply horizontal Sobel only (detect horizontal edges).
 * Glasses frames create strong horizontal edges across the nose bridge.
 */
export declare function sobelHorizontal(region: GrayscaleRegion): GrayscaleRegion;
/**
 * Apply vertical Sobel only (detect vertical edges).
 * Glasses arms create vertical edges at the temples.
 */
export declare function sobelVertical(region: GrayscaleRegion): GrayscaleRegion;
/**
 * Calculate the mean (average) of an array of numbers.
 */
export declare function mean(values: number[] | Float64Array): number;
/**
 * Calculate variance of an array of numbers.
 */
export declare function variance(values: number[] | Float64Array): number;
/**
 * Calculate standard deviation.
 */
export declare function standardDeviation(values: number[] | Float64Array): number;
/**
 * Normalize a value to 0–100 range using min/max thresholds.
 * Values below min → 0, above max → 100.
 */
export declare function normalize(value: number, min: number, max: number): number;
/**
 * Clamp a value between min and max.
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Calculate mean intensity of a grayscale region.
 */
export declare function regionMean(region: GrayscaleRegion): number;
/**
 * Calculate the contrast (standard deviation of intensities) of a region.
 */
export declare function regionContrast(region: GrayscaleRegion): number;
/**
 * Calculate the maximum value in a region.
 */
export declare function regionMax(region: GrayscaleRegion): number;
/**
 * Calculate the percentage of pixels above a threshold.
 */
export declare function regionAboveThreshold(region: GrayscaleRegion, threshold: number): number;
