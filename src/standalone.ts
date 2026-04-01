/**
 * GlassesJS — Standalone Detector
 *
 * Self-contained detector that handles MediaPipe FaceLandmarker
 * initialization internally. User just provides a video element.
 *
 * Two modes:
 * - detectOnce() — accumulate N frames, return Promise with result
 * - start(callback) — continuous detection, callback every X ms
 *
 * @author Pavel Horak / MELIORO Systems
 * @license MIT
 */

import {
  GlassesDetectorConfig,
  DetectionResult,
  Landmarks478,
  Landmark,
} from './types.js';
import { GlassesDetector } from './index.js';

// ─── Types ───────────────────────────────────────────────────────────

/** Configuration for StandaloneDetector */
export interface StandaloneDetectorConfig extends GlassesDetectorConfig {
  /** The video element to analyze (required) */
  video: HTMLVideoElement;

  /**
   * How many frames to accumulate for detectOnce().
   * Default: 30
   */
  framesForResult?: number;

  /**
   * Interval in ms for continuous mode (start/stop).
   * The detector collects frames continuously and evaluates
   * the accumulated result every `interval` ms.
   * Default: 5000
   */
  interval?: number;

  /**
   * Path to MediaPipe FaceLandmarker WASM + model files.
   * Default: Google CDN (https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm)
   */
  modelPath?: string;

  /**
   * Which delegate to use for MediaPipe inference.
   * 'GPU' is faster but not available everywhere.
   * Default: 'GPU'
   */
  delegate?: 'GPU' | 'CPU';
}

/** Callback for continuous detection mode */
export type OnResultCallback = (result: DetectionResult) => void;

// ─── MediaPipe types (minimal, to avoid hard dependency) ─────────────

interface FaceLandmarkerInstance {
  detectForVideo(
    video: HTMLVideoElement,
    timestamp: number
  ): FaceLandmarkerResult;
  close(): void;
}

interface FaceLandmarkerResult {
  faceLandmarks: Array<Array<{ x: number; y: number; z: number }>>;
}

interface FaceLandmarkerStatic {
  createFromOptions(
    vision: any,
    options: any
  ): Promise<FaceLandmarkerInstance>;
}

interface FilesetResolverStatic {
  forVisionTasks(wasmPath: string): Promise<any>;
}

// ─── Constants ───────────────────────────────────────────────────────

const DEFAULT_MODEL_CDN =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm';

const DEFAULT_FRAMES_FOR_RESULT = 30;
const DEFAULT_INTERVAL = 5000;

// ─── StandaloneDetector ──────────────────────────────────────────────

/**
 * Self-contained glasses detector with built-in MediaPipe support.
 *
 * Usage:
 * ```js
 * const detector = await StandaloneDetector.create({ video: myVideoEl });
 *
 * // One-shot:
 * const result = await detector.detectOnce();
 *
 * // Continuous:
 * detector.start((result) => console.log(result));
 * detector.stop();
 *
 * // Cleanup:
 * detector.destroy();
 * ```
 */
export class StandaloneDetector {
  private video: HTMLVideoElement;
  private detector: GlassesDetector;
  private faceLandmarker: FaceLandmarkerInstance | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  private framesForResult: number;
  private interval: number;
  private modelPath: string;
  private delegate: 'GPU' | 'CPU';

  // Continuous mode state
  private animationFrameId: number | null = null;
  private intervalTimerId: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;
  private onResultCallback: OnResultCallback | null = null;

  // ─── Constructor (private — use create()) ────────────────────────

  private constructor(config: StandaloneDetectorConfig) {
    this.video = config.video;
    this.framesForResult = config.framesForResult ?? DEFAULT_FRAMES_FOR_RESULT;
    this.interval = config.interval ?? DEFAULT_INTERVAL;
    this.modelPath = config.modelPath ?? DEFAULT_MODEL_CDN;
    this.delegate = config.delegate ?? 'GPU';

    // Create internal GlassesDetector with detection config
    this.detector = new GlassesDetector({
      frameBuffer: config.frameBuffer,
      confidenceThreshold: config.confidenceThreshold,
      methods: config.methods,
    });
  }

  // ─── Factory method ──────────────────────────────────────────────

  /**
   * Create and initialize a StandaloneDetector.
   *
   * This is async because it needs to download and initialize
   * the MediaPipe FaceLandmarker WASM module and model.
   *
   * @param config - Configuration including the video element
   * @returns Initialized StandaloneDetector ready to use
   */
  static async create(
    config: StandaloneDetectorConfig
  ): Promise<StandaloneDetector> {
    const instance = new StandaloneDetector(config);
    await instance.initMediaPipe();
    instance.initCanvas();
    return instance;
  }

  // ─── One-shot detection ──────────────────────────────────────────

  /**
   * Detect glasses by accumulating frames, then return the result.
   *
   * Collects `framesForResult` frames from the video, then returns
   * the accumulated detection result as a Promise.
   *
   * @param frames - Override number of frames to collect (default: framesForResult from config)
   * @returns Detection result after accumulating frames
   */
  async detectOnce(frames?: number): Promise<DetectionResult> {
    const targetFrames = frames ?? this.framesForResult;

    this.detector.reset();

    return new Promise((resolve, reject) => {
      let collected = 0;

      const collectFrame = () => {
        try {
          const landmarks = this.extractLandmarks();

          if (landmarks) {
            this.drawVideoToCanvas();
            this.detector.addFrame(this.canvas!, landmarks);
            collected++;
          }

          if (collected >= targetFrames) {
            resolve(this.detector.getResult());
          } else {
            requestAnimationFrame(collectFrame);
          }
        } catch (err) {
          reject(err);
        }
      };

      requestAnimationFrame(collectFrame);
    });
  }

  // ─── Continuous detection ────────────────────────────────────────

  /**
   * Start continuous detection.
   *
   * Collects frames every animation frame and evaluates the result
   * every `interval` ms (default 5000), calling the callback with
   * the latest accumulated result.
   *
   * @param onResult - Callback called every interval with detection result
   * @param interval - Override interval in ms (default: interval from config)
   */
  start(onResult: OnResultCallback, interval?: number): void {
    if (this.isRunning) {
      this.stop();
    }

    this.isRunning = true;
    this.onResultCallback = onResult;
    this.detector.reset();

    // Continuous frame collection
    const collectFrame = () => {
      if (!this.isRunning) return;

      try {
        const landmarks = this.extractLandmarks();

        if (landmarks) {
          this.drawVideoToCanvas();
          this.detector.addFrame(this.canvas!, landmarks);
        }
      } catch {
        // Skip frame on error, continue collecting
      }

      this.animationFrameId = requestAnimationFrame(collectFrame);
    };

    // Start frame collection
    this.animationFrameId = requestAnimationFrame(collectFrame);

    // Evaluate and report at interval
    const evalInterval = interval ?? this.interval;
    this.intervalTimerId = setInterval(() => {
      if (!this.isRunning || !this.onResultCallback) return;

      const result = this.detector.getResult();
      this.onResultCallback(result);
    }, evalInterval);
  }

  /**
   * Stop continuous detection.
   *
   * Stops frame collection and interval evaluation.
   * Does NOT destroy the detector — you can call start() again.
   */
  stop(): void {
    this.isRunning = false;
    this.onResultCallback = null;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.intervalTimerId !== null) {
      clearInterval(this.intervalTimerId);
      this.intervalTimerId = null;
    }
  }

  /**
   * Reset the accumulated detection data.
   *
   * Useful when the person in front of the camera changes.
   * Does NOT stop continuous detection if running.
   */
  reset(): void {
    this.detector.reset();
  }

  /**
   * Get the current accumulated result without waiting for interval.
   *
   * Useful in continuous mode when you need the result immediately.
   */
  getResult(): DetectionResult {
    return this.detector.getResult();
  }

  // ─── Cleanup ─────────────────────────────────────────────────────

  /**
   * Destroy the detector and release all resources.
   *
   * Closes MediaPipe FaceLandmarker, stops detection,
   * and cleans up internal canvas. Cannot be used after this.
   */
  destroy(): void {
    this.stop();

    if (this.faceLandmarker) {
      this.faceLandmarker.close();
      this.faceLandmarker = null;
    }

    this.canvas = null;
    this.ctx = null;
  }

  // ─── Internal: MediaPipe initialization ──────────────────────────

  /**
   * Initialize MediaPipe FaceLandmarker.
   * Dynamically imports @mediapipe/tasks-vision to avoid hard dependency.
   */
  private async initMediaPipe(): Promise<void> {
    try {
      // Dynamic import — works whether user installed the package or uses CDN
      const vision = await this.loadVisionModule();

      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        this.modelPath
      );

      this.faceLandmarker = await vision.FaceLandmarker.createFromOptions(
        filesetResolver,
        {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: this.delegate,
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        }
      );
    } catch (err) {
      throw new Error(
        `GlassesJS: Failed to initialize MediaPipe FaceLandmarker. ` +
        `Make sure @mediapipe/tasks-vision is installed or accessible. ` +
        `Error: ${err}`
      );
    }
  }

  /**
   * Load the MediaPipe vision module.
   * Tries npm import first, falls back to CDN.
   */
  private async loadVisionModule(): Promise<any> {
    // Use dynamic string to prevent bundlers from resolving at build time
    const npmModule = '@mediapipe/tasks-vision';
    const cdnModule =
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs';

    // Try npm import
    try {
      return await (Function('m', 'return import(m)') as (m: string) => Promise<any>)(npmModule);
    } catch {
      // npm package not available
    }

    // Try CDN import
    try {
      return await (Function('m', 'return import(m)') as (m: string) => Promise<any>)(cdnModule);
    } catch {
      // CDN not available
    }

    throw new Error(
      'GlassesJS: Could not load @mediapipe/tasks-vision. ' +
      'Install it via npm (npm install @mediapipe/tasks-vision) or ' +
      'ensure CDN access is available.'
    );
  }

  // ─── Internal: Canvas and frame processing ──────────────────────

  /**
   * Create internal canvas for video frame extraction.
   */
  private initCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Draw current video frame to internal canvas.
   */
  private drawVideoToCanvas(): void {
    if (!this.canvas || !this.ctx) return;

    const w = this.video.videoWidth;
    const h = this.video.videoHeight;

    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;

    this.ctx.drawImage(this.video, 0, 0, w, h);
  }

  /**
   * Extract facial landmarks from the current video frame using MediaPipe.
   * Returns null if no face is detected.
   */
  private extractLandmarks(): Landmarks478 | null {
    if (!this.faceLandmarker) return null;

    // MediaPipe needs a timestamp
    const timestamp = performance.now();

    try {
      const result = this.faceLandmarker.detectForVideo(
        this.video,
        timestamp
      );

      if (
        result.faceLandmarks &&
        result.faceLandmarks.length > 0 &&
        result.faceLandmarks[0].length >= 478
      ) {
        // Convert MediaPipe landmarks to our format
        return result.faceLandmarks[0].map((lm) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
        })) as Landmarks478;
      }
    } catch {
      // Detection failed for this frame, skip
    }

    return null;
  }
}
