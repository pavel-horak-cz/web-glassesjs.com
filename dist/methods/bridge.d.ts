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
/**
 * Detect glasses by analyzing horizontal edges on the nose bridge.
 */
export declare function detectBridge(source: ImageSource, landmarks: Landmarks478): MethodResult;
