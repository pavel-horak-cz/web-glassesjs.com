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
/**
 * Detect glasses by analyzing Z-depth discontinuities.
 */
export declare function detectDepth(landmarks: Landmarks478): MethodResult;
