/**
 * GlassesJS — Type definitions
 *
 * All public types and interfaces for the library.
 */
/** Result from a single detection method */
export interface MethodResult {
    /** Confidence score 0–100 */
    score: number;
    /** Human-readable description of the result */
    description: string;
}
/** Per-method breakdown in a detection result */
export interface MethodResults {
    bridge: MethodResult;
    temple: MethodResult;
    iris: MethodResult;
    depth: MethodResult;
    contrast: MethodResult;
    color: MethodResult;
}
/** Full detection result returned by detect() and getResult() */
export interface DetectionResult {
    /** Whether glasses were detected */
    hasGlasses: boolean;
    /** Overall confidence 0–100 */
    confidence: number;
    /** Per-method breakdown */
    methods: MethodResults;
    /** Number of frames analyzed (1 for single-frame, N for accumulated) */
    framesAnalyzed: number;
}
/** Enable/disable individual detection methods */
export interface MethodsConfig {
    bridge?: boolean;
    temple?: boolean;
    iris?: boolean;
    depth?: boolean;
    contrast?: boolean;
    color?: boolean;
}
/** Configuration options for GlassesDetector */
export interface GlassesDetectorConfig {
    /** How many frames to keep in the accumulation buffer (default: 30) */
    frameBuffer?: number;
    /** Minimum confidence to report hasGlasses=true (default: 70) */
    confidenceThreshold?: number;
    /** Enable/disable individual methods (all enabled by default) */
    methods?: MethodsConfig;
}
/** A single MediaPipe landmark point (normalized 0–1) */
export interface Landmark {
    x: number;
    y: number;
    z: number;
}
/** Array of 478 MediaPipe facial landmarks */
export type Landmarks478 = Landmark[];
/** Pixel data extracted from a rectangular region */
export interface PixelRegion {
    /** Raw pixel data (RGBA) */
    data: Uint8ClampedArray;
    /** Width of the region in pixels */
    width: number;
    /** Height of the region in pixels */
    height: number;
}
/** Grayscale pixel data */
export interface GrayscaleRegion {
    /** Single-channel grayscale values (0–255) */
    data: Float64Array;
    /** Width */
    width: number;
    /** Height */
    height: number;
}
/** Canvas-like source for pixel extraction */
export type ImageSource = HTMLCanvasElement | HTMLVideoElement | OffscreenCanvas;
/** Weight configuration for combining method scores */
export interface MethodWeights {
    bridge: number;
    temple: number;
    iris: number;
    depth: number;
    contrast: number;
    color: number;
}
/** Default weights as specified */
export declare const DEFAULT_WEIGHTS: MethodWeights;
