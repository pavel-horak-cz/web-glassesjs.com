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
import { MethodResult, ImageSource, Landmarks478 } from '../types.js';
/**
 * Detect glasses by analyzing color anomalies in the eye region.
 */
export declare function detectColor(source: ImageSource, landmarks: Landmarks478): MethodResult;
