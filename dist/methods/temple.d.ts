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
import { MethodResult, ImageSource, Landmarks478 } from '../types.js';
/**
 * Detect glasses by analyzing symmetric vertical edges at the temples.
 */
export declare function detectTemple(source: ImageSource, landmarks: Landmarks478): MethodResult;
