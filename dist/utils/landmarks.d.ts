/**
 * GlassesJS — Landmark index constants
 *
 * MediaPipe 478-point FaceLandmarker indices organized by region.
 */
import { Landmark, Landmarks478 } from '../types.js';
/** Nose bridge landmark indices — where glasses frame sits */
export declare const NOSE_BRIDGE: readonly [6, 168, 197, 195, 5];
/** Left eye outline landmark indices */
export declare const LEFT_EYE: readonly [33, 7, 163, 144, 145, 153, 154, 155, 133];
/** Right eye outline landmark indices */
export declare const RIGHT_EYE: readonly [362, 382, 381, 380, 374, 373, 390, 249, 263];
/** Left iris landmark indices */
export declare const LEFT_IRIS: readonly [468, 469, 470, 471, 472];
/** Right iris landmark indices */
export declare const RIGHT_IRIS: readonly [473, 474, 475, 476, 477];
/** Left temple landmark index */
export declare const LEFT_TEMPLE = 234;
/** Right temple landmark index */
export declare const RIGHT_TEMPLE = 454;
/** Left eyebrow landmark indices */
export declare const LEFT_EYEBROW: readonly [46, 53, 52, 65, 55, 70];
/** Right eyebrow landmark indices */
export declare const RIGHT_EYEBROW: readonly [276, 283, 282, 295, 285, 300];
/** Left cheek region landmark indices */
export declare const LEFT_CHEEK: readonly [116, 117, 118, 119, 100];
/** Right cheek region landmark indices */
export declare const RIGHT_CHEEK: readonly [345, 346, 347, 348, 329];
/**
 * Extract specific landmarks by their indices.
 */
export declare function getLandmarks(allLandmarks: Landmarks478, indices: readonly number[]): Landmark[];
/**
 * Get a single landmark by index.
 */
export declare function getLandmark(allLandmarks: Landmarks478, index: number): Landmark;
/**
 * Calculate the center (average) of a set of landmarks.
 */
export declare function landmarkCenter(landmarks: Landmark[]): Landmark;
/**
 * Calculate Euclidean distance between two landmarks (2D, ignoring Z).
 */
export declare function landmarkDistance2D(a: Landmark, b: Landmark): number;
/**
 * Calculate the bounding box of a set of landmarks in pixel coordinates.
 */
export declare function landmarkBBox(landmarks: Landmark[], imageWidth: number, imageHeight: number, padding?: number): {
    x: number;
    y: number;
    width: number;
    height: number;
};
