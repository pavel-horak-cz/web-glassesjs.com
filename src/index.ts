/**
 * GlassesJS — Main entry point
 *
 * Zero-model glasses detection for the browser.
 * Detects whether a person is wearing glasses using webcam video frames
 * and MediaPipe facial landmarks — no AI models, no server, no dependencies.
 *
 * @author Pavel Horak
 * @license MIT
 * @see https://glassesjs.com
 */

import {
  GlassesDetectorConfig,
  DetectionResult,
  MethodResults,
  MethodResult,
  ImageSource,
  Landmarks478,
  DEFAULT_WEIGHTS,
  MethodsConfig,
} from './types.js';

import { detectBridge } from './methods/bridge.js';
import { detectTemple } from './methods/temple.js';
import { detectIris, extractIrisData, IrisFrameData } from './methods/iris.js';
import { detectDepth } from './methods/depth.js';
import { detectContrast } from './methods/contrast.js';
import { detectColor } from './methods/color.js';

// ─── Default configuration ───────────────────────────────────────────

const DEFAULT_CONFIG: Required<GlassesDetectorConfig> = {
  frameBuffer: 30,
  confidenceThreshold: 70,
  methods: {
    bridge: true,
    temple: true,
    iris: true,
    depth: true,
    contrast: true,
    color: true,
  },
};

// ─── GlassesDetector class ───────────────────────────────────────────

/**
 * Main glasses detection class.
 *
 * Supports two usage modes:
 *
 * 1. **Single frame** (fast, lower accuracy):
 *    ```js
 *    const result = detector.detect(canvas, landmarks);
 *    ```
 *
 * 2. **Accumulated** (more accurate, over multiple frames):
 *    ```js
 *    detector.addFrame(canvas, landmarks);
 *    // ... after 10+ frames:
 *    const result = detector.getResult();
 *    ```
 */
export class GlassesDetector {
  private config: Required<GlassesDetectorConfig>;
  private methods: Required<MethodsConfig>;

  // Accumulated frame data
  private irisData: IrisFrameData[] = [];
  private frameScores: {
    bridge: number[];
    temple: number[];
    depth: number[];
    contrast: number[];
    color: number[];
  } = {
    bridge: [],
    temple: [],
    depth: [],
    contrast: [],
    color: [],
  };
  private framesAnalyzed: number = 0;

  constructor(config?: GlassesDetectorConfig) {
    this.config = {
      frameBuffer: config?.frameBuffer ?? DEFAULT_CONFIG.frameBuffer,
      confidenceThreshold:
        config?.confidenceThreshold ?? DEFAULT_CONFIG.confidenceThreshold,
      methods: {
        bridge: config?.methods?.bridge ?? true,
        temple: config?.methods?.temple ?? true,
        iris: config?.methods?.iris ?? true,
        depth: config?.methods?.depth ?? true,
        contrast: config?.methods?.contrast ?? true,
        color: config?.methods?.color ?? true,
      },
    };
    this.methods = this.config.methods as Required<MethodsConfig>;
  }

  // ─── Single frame detection ──────────────────────────────────────

  /**
   * Detect glasses in a single frame.
   *
   * Fast but lower accuracy — iris method will not contribute
   * as it requires multiple frames.
   *
   * @param source - Canvas, video, or OffscreenCanvas with the current frame
   * @param landmarks - Array of 478 MediaPipe facial landmarks
   * @returns Detection result with confidence and per-method scores
   */
  detect(source: ImageSource, landmarks: Landmarks478): DetectionResult {
    // Run each enabled method
    const methods = this.runMethods(source, landmarks, []);

    // Calculate weighted confidence
    const confidence = this.calculateConfidence(methods);

    return {
      hasGlasses: confidence >= this.config.confidenceThreshold,
      confidence,
      methods,
      framesAnalyzed: 1,
    };
  }

  // ─── Multi-frame accumulation ────────────────────────────────────

  /**
   * Add a frame to the accumulation buffer.
   *
   * Call this every frame in your detection loop.
   * After enough frames (10+), use `getResult()` for higher accuracy.
   *
   * @param source - Canvas, video, or OffscreenCanvas with the current frame
   * @param landmarks - Array of 478 MediaPipe facial landmarks
   */
  addFrame(source: ImageSource, landmarks: Landmarks478): void {
    this.framesAnalyzed++;

    // Extract iris data for accumulation
    if (this.methods.iris) {
      const irisFrame = extractIrisData(landmarks);
      this.irisData.push(irisFrame);

      // Keep buffer limited
      if (this.irisData.length > this.config.frameBuffer) {
        this.irisData.shift();
      }
    }

    // Run single-frame methods and accumulate scores
    if (this.methods.bridge) {
      const result = detectBridge(source, landmarks);
      this.pushScore('bridge', result.score);
    }

    if (this.methods.temple) {
      const result = detectTemple(source, landmarks);
      this.pushScore('temple', result.score);
    }

    if (this.methods.depth) {
      const result = detectDepth(landmarks);
      this.pushScore('depth', result.score);
    }

    if (this.methods.contrast) {
      const result = detectContrast(source, landmarks);
      this.pushScore('contrast', result.score);
    }

    if (this.methods.color) {
      const result = detectColor(source, landmarks);
      this.pushScore('color', result.score);
    }
  }

  /**
   * Get the accumulated detection result.
   *
   * Best called after 10+ frames for accurate results.
   * Uses averaged scores from all accumulated frames plus
   * iris stability analysis.
   *
   * @returns Detection result with confidence and per-method scores
   */
  getResult(): DetectionResult {
    const methods = this.getAccumulatedMethods();
    const confidence = this.calculateConfidence(methods);

    return {
      hasGlasses: confidence >= this.config.confidenceThreshold,
      confidence,
      methods,
      framesAnalyzed: this.framesAnalyzed,
    };
  }

  /**
   * Reset the accumulation buffer.
   *
   * Call this when the user changes or when you want to start fresh.
   */
  reset(): void {
    this.irisData = [];
    this.frameScores = {
      bridge: [],
      temple: [],
      depth: [],
      contrast: [],
      color: [],
    };
    this.framesAnalyzed = 0;
  }

  // ─── Internal methods ────────────────────────────────────────────

  /**
   * Run all enabled detection methods on a single frame.
   */
  private runMethods(
    source: ImageSource,
    landmarks: Landmarks478,
    irisData: IrisFrameData[]
  ): MethodResults {
    const disabled: MethodResult = { score: 0, description: 'Disabled' };

    return {
      bridge: this.methods.bridge
        ? detectBridge(source, landmarks)
        : disabled,
      temple: this.methods.temple
        ? detectTemple(source, landmarks)
        : disabled,
      iris: this.methods.iris
        ? detectIris(irisData)
        : disabled,
      depth: this.methods.depth
        ? detectDepth(landmarks)
        : disabled,
      contrast: this.methods.contrast
        ? detectContrast(source, landmarks)
        : disabled,
      color: this.methods.color
        ? detectColor(source, landmarks)
        : disabled,
    };
  }

  /**
   * Get accumulated method results (averaged scores).
   */
  private getAccumulatedMethods(): MethodResults {
    const disabled: MethodResult = { score: 0, description: 'Disabled' };

    const makeResult = (
      scores: number[],
      describer: (score: number) => string
    ): MethodResult => {
      if (scores.length === 0) return { score: 0, description: 'No data' };
      const avg = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length
      );
      return { score: avg, description: describer(avg) };
    };

    return {
      bridge: this.methods.bridge
        ? makeResult(this.frameScores.bridge, (s) =>
            s >= 75 ? 'Strong horizontal edge on nose bridge' :
            s >= 40 ? 'Moderate horizontal edge detected on nose bridge' :
            s > 0  ? 'Weak horizontal edge on nose bridge' :
                     'No significant horizontal edge on nose bridge'
          )
        : disabled,

      temple: this.methods.temple
        ? makeResult(this.frameScores.temple, (s) =>
            s >= 75 ? 'Symmetric edges at both temples' :
            s >= 40 ? 'Moderate edge symmetry at temples' :
            s > 0  ? 'Weak or asymmetric edges at temples' :
                     'No symmetric temple edges detected'
          )
        : disabled,

      iris: this.methods.iris
        ? detectIris(this.irisData)
        : disabled,

      depth: this.methods.depth
        ? makeResult(this.frameScores.depth, (s) =>
            s >= 75 ? 'Z-depth discontinuity detected' :
            s >= 40 ? 'Moderate Z-depth anomaly' :
            s > 0  ? 'Slight Z-depth variation' :
                     'Normal Z-depth profile (no discontinuity)'
          )
        : disabled,

      contrast: this.methods.contrast
        ? makeResult(this.frameScores.contrast, (s) =>
            s >= 75 ? 'Altered contrast in eye region' :
            s >= 40 ? 'Moderate contrast deviation in eye region' :
            s > 0  ? 'Slight contrast deviation in eye region' :
                     'Normal eye-to-skin contrast ratio'
          )
        : disabled,

      color: this.methods.color
        ? makeResult(this.frameScores.color, (s) =>
            s >= 75 ? 'Color shift detected in lens area' :
            s >= 40 ? 'Moderate color anomaly in eye region' :
            s > 0  ? 'Slight color variation in eye region' :
                     'No significant color anomaly in eye region'
          )
        : disabled,
    };
  }

  /**
   * Calculate overall weighted confidence from method results.
   * Adjusts weights when some methods are disabled or have no data.
   */
  private calculateConfidence(methods: MethodResults): number {
    const weights = { ...DEFAULT_WEIGHTS };

    // Zero out weights for disabled methods
    const methodNames = Object.keys(weights) as Array<keyof typeof weights>;
    for (const name of methodNames) {
      if (!this.methods[name]) {
        weights[name] = 0;
      }
      // If iris has no data yet (score 0 with "Requires" description), zero its weight
      if (name === 'iris' && methods.iris.description.startsWith('Requires')) {
        weights[name] = 0;
      }
    }

    // Normalize weights so they sum to 1
    const totalWeight = methodNames.reduce((sum, name) => sum + weights[name], 0);
    if (totalWeight === 0) return 0;

    // Calculate weighted average
    let confidence = 0;
    for (const name of methodNames) {
      const normalizedWeight = weights[name] / totalWeight;
      confidence += methods[name].score * normalizedWeight;
    }

    return Math.round(confidence);
  }

  /**
   * Push a score to the accumulation buffer, keeping it within limits.
   */
  private pushScore(
    method: keyof typeof this.frameScores,
    score: number
  ): void {
    this.frameScores[method].push(score);
    if (this.frameScores[method].length > this.config.frameBuffer) {
      this.frameScores[method].shift();
    }
  }
}

// ─── Re-exports ──────────────────────────────────────────────────────

export type {
  GlassesDetectorConfig,
  DetectionResult,
  MethodResults,
  MethodResult,
  MethodsConfig,
  ImageSource,
  Landmarks478,
  Landmark,
} from './types.js';
