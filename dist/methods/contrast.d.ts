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
import { MethodResult, ImageSource, Landmarks478 } from '../types.js';
/**
 * Detect glasses by comparing eye region contrast to cheek region contrast.
 */
export declare function detectContrast(source: ImageSource, landmarks: Landmarks478): MethodResult;
