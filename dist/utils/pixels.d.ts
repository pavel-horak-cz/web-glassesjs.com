/**
 * GlassesJS — Pixel extraction utilities
 *
 * Extract pixel regions from canvas/video, convert to grayscale,
 * sample colors, etc.
 */
import { ImageSource, PixelRegion, GrayscaleRegion, Landmarks478 } from '../types.js';
/**
 * Get the dimensions of an image source.
 */
export declare function getSourceDimensions(source: ImageSource): {
    width: number;
    height: number;
};
/**
 * Extract a rectangular pixel region from the source.
 */
export declare function extractRegion(source: ImageSource, x: number, y: number, width: number, height: number): PixelRegion;
/**
 * Extract a pixel region around a set of landmarks with padding.
 */
export declare function extractLandmarkRegion(source: ImageSource, landmarks: Landmarks478, indices: readonly number[], padding?: number): PixelRegion;
/**
 * Convert an RGBA pixel region to grayscale.
 * Uses luminance formula: 0.299R + 0.587G + 0.114B
 */
export declare function toGrayscale(region: PixelRegion): GrayscaleRegion;
/** RGB color */
export interface RGBColor {
    r: number;
    g: number;
    b: number;
}
/**
 * Sample the average RGB color of a pixel region.
 */
export declare function averageColor(region: PixelRegion): RGBColor;
/**
 * Sample colors in a grid pattern across a pixel region.
 * Returns an array of RGB colors.
 */
export declare function sampleColorGrid(region: PixelRegion, gridSize?: number): RGBColor[];
/**
 * Calculate the color distance between two RGB colors.
 * Uses simple Euclidean distance in RGB space.
 */
export declare function colorDistance(a: RGBColor, b: RGBColor): number;
/**
 * Calculate the average color temperature shift (warm/cool).
 * Returns positive for warmer (more red), negative for cooler (more blue).
 */
export declare function colorTemperatureShift(a: RGBColor, b: RGBColor): number;
