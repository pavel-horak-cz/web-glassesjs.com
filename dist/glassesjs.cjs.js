"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// dist/index.js
var dist_exports = {};
__export(dist_exports, {
  GlassesDetector: () => GlassesDetector
});
module.exports = __toCommonJS(dist_exports);

// dist/types.js
var DEFAULT_WEIGHTS = {
  bridge: 0.25,
  temple: 0.2,
  iris: 0.2,
  depth: 0.15,
  contrast: 0.1,
  color: 0.1
};

// dist/utils/landmarks.js
var NOSE_BRIDGE = [6, 168, 197, 195, 5];
var LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133];
var RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263];
var LEFT_IRIS = [468, 469, 470, 471, 472];
var RIGHT_IRIS = [473, 474, 475, 476, 477];
var LEFT_TEMPLE = 234;
var RIGHT_TEMPLE = 454;
var LEFT_EYEBROW = [46, 53, 52, 65, 55, 70];
var RIGHT_EYEBROW = [276, 283, 282, 295, 285, 300];
var LEFT_CHEEK = [116, 117, 118, 119, 100];
var RIGHT_CHEEK = [345, 346, 347, 348, 329];
function getLandmarks(allLandmarks, indices) {
  return indices.map((i) => allLandmarks[i]);
}
function getLandmark(allLandmarks, index) {
  return allLandmarks[index];
}
function landmarkCenter(landmarks) {
  const n = landmarks.length;
  if (n === 0)
    return { x: 0, y: 0, z: 0 };
  let sx = 0, sy = 0, sz = 0;
  for (const lm of landmarks) {
    sx += lm.x;
    sy += lm.y;
    sz += lm.z;
  }
  return { x: sx / n, y: sy / n, z: sz / n };
}
function landmarkDistance2D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function landmarkBBox(landmarks, imageWidth, imageHeight, padding = 0) {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  for (const lm of landmarks) {
    const px = lm.x * imageWidth;
    const py = lm.y * imageHeight;
    if (px < minX)
      minX = px;
    if (py < minY)
      minY = py;
    if (px > maxX)
      maxX = px;
    if (py > maxY)
      maxY = py;
  }
  minX = Math.max(0, Math.floor(minX - padding));
  minY = Math.max(0, Math.floor(minY - padding));
  maxX = Math.min(imageWidth, Math.ceil(maxX + padding));
  maxY = Math.min(imageHeight, Math.ceil(maxY + padding));
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

// dist/utils/pixels.js
var _canvas = null;
var _ctx = null;
function getInternalCanvas(width, height) {
  if (_canvas && _ctx && _canvas.width === width && _canvas.height === height) {
    return _ctx;
  }
  if (typeof OffscreenCanvas !== "undefined") {
    _canvas = new OffscreenCanvas(width, height);
  } else {
    _canvas = document.createElement("canvas");
    _canvas.width = width;
    _canvas.height = height;
  }
  _ctx = _canvas.getContext("2d");
  return _ctx;
}
function getSourceDimensions(source) {
  if (source instanceof HTMLVideoElement) {
    return { width: source.videoWidth, height: source.videoHeight };
  }
  return { width: source.width, height: source.height };
}
function extractRegion(source, x, y, width, height) {
  if (width <= 0 || height <= 0) {
    return {
      data: new Uint8ClampedArray(0),
      width: 0,
      height: 0
    };
  }
  const ctx = getInternalCanvas(width, height);
  ctx.drawImage(source, x, y, width, height, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  return {
    data: imageData.data,
    width,
    height
  };
}
function extractLandmarkRegion(source, landmarks, indices, padding = 5) {
  const { width: imgW, height: imgH } = getSourceDimensions(source);
  const lms = getLandmarks(landmarks, indices);
  const bbox = landmarkBBox(lms, imgW, imgH, padding);
  return extractRegion(source, bbox.x, bbox.y, bbox.width, bbox.height);
}
function toGrayscale(region) {
  const { data, width, height } = region;
  const gray = new Float64Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const offset = i * 4;
    gray[i] = 0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2];
  }
  return { data: gray, width, height };
}
function averageColor(region) {
  const { data, width, height } = region;
  const n = width * height;
  if (n === 0)
    return { r: 0, g: 0, b: 0 };
  let sr = 0, sg = 0, sb = 0;
  for (let i = 0; i < n; i++) {
    const offset = i * 4;
    sr += data[offset];
    sg += data[offset + 1];
    sb += data[offset + 2];
  }
  return {
    r: sr / n,
    g: sg / n,
    b: sb / n
  };
}
function sampleColorGrid(region, gridSize = 5) {
  const { data, width, height } = region;
  if (width === 0 || height === 0)
    return [];
  const colors = [];
  const stepX = Math.max(1, Math.floor(width / gridSize));
  const stepY = Math.max(1, Math.floor(height / gridSize));
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const px = Math.min(gx * stepX, width - 1);
      const py = Math.min(gy * stepY, height - 1);
      const offset = (py * width + px) * 4;
      colors.push({
        r: data[offset],
        g: data[offset + 1],
        b: data[offset + 2]
      });
    }
  }
  return colors;
}
function colorDistance(a, b) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}
function colorTemperatureShift(a, b) {
  const warmthA = a.r - a.b;
  const warmthB = b.r - b.b;
  return warmthB - warmthA;
}

// dist/utils/math.js
var SOBEL_X = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1]
];
var SOBEL_Y = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1]
];
function sobelHorizontal(region) {
  const { data, width, height } = region;
  const result = new Float64Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = data[(y + ky) * width + (x + kx)];
          gy += pixel * SOBEL_Y[ky + 1][kx + 1];
        }
      }
      result[y * width + x] = Math.abs(gy);
    }
  }
  return { data: result, width, height };
}
function sobelVertical(region) {
  const { data, width, height } = region;
  const result = new Float64Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = data[(y + ky) * width + (x + kx)];
          gx += pixel * SOBEL_X[ky + 1][kx + 1];
        }
      }
      result[y * width + x] = Math.abs(gx);
    }
  }
  return { data: result, width, height };
}
function mean(values) {
  if (values.length === 0)
    return 0;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }
  return sum / values.length;
}
function variance(values) {
  if (values.length < 2)
    return 0;
  const avg = mean(values);
  let sumSq = 0;
  for (let i = 0; i < values.length; i++) {
    const diff = values[i] - avg;
    sumSq += diff * diff;
  }
  return sumSq / values.length;
}
function standardDeviation(values) {
  return Math.sqrt(variance(values));
}
function normalize(value, min, max) {
  if (max <= min)
    return 0;
  const normalized = (value - min) / (max - min) * 100;
  return Math.max(0, Math.min(100, normalized));
}
function regionMean(region) {
  return mean(region.data);
}
function regionContrast(region) {
  return standardDeviation(region.data);
}
function regionAboveThreshold(region, threshold) {
  if (region.data.length === 0)
    return 0;
  let count = 0;
  for (let i = 0; i < region.data.length; i++) {
    if (region.data[i] > threshold)
      count++;
  }
  return count / region.data.length * 100;
}

// dist/methods/bridge.js
var EDGE_THRESHOLD_MIN = 15;
var EDGE_THRESHOLD_MAX = 60;
var STRONG_EDGE_PIXEL_THRESHOLD = 30;
var STRONG_EDGE_VALUE = 40;
function detectBridge(source, landmarks) {
  try {
    const bridgeIndices = [...NOSE_BRIDGE, LEFT_EYE[0], RIGHT_EYE[RIGHT_EYE.length - 1]];
    const region = extractLandmarkRegion(source, landmarks, bridgeIndices, 8);
    if (region.width === 0 || region.height === 0) {
      return { score: 0, description: "Could not extract bridge region" };
    }
    const gray = toGrayscale(region);
    const edges = sobelHorizontal(gray);
    const meanEdge = regionMean(edges);
    const strongEdgePercent = regionAboveThreshold(edges, STRONG_EDGE_VALUE);
    const edgeScore = normalize(meanEdge, EDGE_THRESHOLD_MIN, EDGE_THRESHOLD_MAX);
    const densityScore = normalize(strongEdgePercent, 5, STRONG_EDGE_PIXEL_THRESHOLD);
    const score = Math.round(edgeScore * 0.6 + densityScore * 0.4);
    let description;
    if (score >= 75) {
      description = "Strong horizontal edge on nose bridge";
    } else if (score >= 40) {
      description = "Moderate horizontal edge detected on nose bridge";
    } else if (score > 0) {
      description = "Weak horizontal edge on nose bridge";
    } else {
      description = "No significant horizontal edge on nose bridge";
    }
    return { score, description };
  } catch {
    return { score: 0, description: "Bridge detection failed" };
  }
}

// dist/methods/temple.js
var MIN_TEMPLE_EDGE = 10;
var MAX_TEMPLE_EDGE = 50;
var SYMMETRY_TOLERANCE = 0.3;
function extractTempleRegion(source, landmarks, templeLandmarkIndex, eyeIndices) {
  const { width: imgW, height: imgH } = getSourceDimensions(source);
  const temple = getLandmark(landmarks, templeLandmarkIndex);
  const eyeLms = getLandmarks(landmarks, eyeIndices);
  const eyeBBox = landmarkBBox(eyeLms, imgW, imgH, 0);
  const regionWidth = Math.max(10, Math.round(eyeBBox.width * 0.3));
  const regionHeight = Math.max(10, eyeBBox.height + 10);
  const px = Math.round(temple.x * imgW);
  const py = Math.round(temple.y * imgH - regionHeight / 2);
  const x = Math.max(0, Math.min(imgW - regionWidth, px - regionWidth / 2));
  const y = Math.max(0, Math.min(imgH - regionHeight, py));
  return extractRegion(source, x, y, regionWidth, regionHeight);
}
function detectTemple(source, landmarks) {
  try {
    const leftRegion = extractTempleRegion(source, landmarks, LEFT_TEMPLE, LEFT_EYE);
    const rightRegion = extractTempleRegion(source, landmarks, RIGHT_TEMPLE, RIGHT_EYE);
    if (leftRegion.width === 0 || leftRegion.height === 0 || rightRegion.width === 0 || rightRegion.height === 0) {
      return { score: 0, description: "Could not extract temple regions" };
    }
    const leftGray = toGrayscale(leftRegion);
    const rightGray = toGrayscale(rightRegion);
    const leftEdges = sobelVertical(leftGray);
    const rightEdges = sobelVertical(rightGray);
    const leftMean = regionMean(leftEdges);
    const rightMean = regionMean(rightEdges);
    const avgEdge = (leftMean + rightMean) / 2;
    const edgeScore = normalize(avgEdge, MIN_TEMPLE_EDGE, MAX_TEMPLE_EDGE);
    const maxMean = Math.max(leftMean, rightMean, 1e-3);
    const minMean = Math.min(leftMean, rightMean);
    const asymmetry = 1 - minMean / maxMean;
    const symmetryScore = normalize(SYMMETRY_TOLERANCE - asymmetry, 0, SYMMETRY_TOLERANCE);
    const score = Math.round(edgeScore * 0.5 + symmetryScore * 0.5);
    let description;
    if (score >= 75) {
      description = "Symmetric edges at both temples";
    } else if (score >= 40) {
      description = "Moderate edge symmetry at temples";
    } else if (score > 0) {
      description = "Weak or asymmetric edges at temples";
    } else {
      description = "No symmetric temple edges detected";
    }
    return { score, description };
  } catch {
    return { score: 0, description: "Temple detection failed" };
  }
}

// dist/methods/iris.js
var MIN_FRAMES = 10;
var VARIANCE_MIN = 1e-5;
var VARIANCE_MAX = 2e-4;
function extractIrisData(landmarks) {
  const leftIris = getLandmarks(landmarks, LEFT_IRIS);
  const rightIris = getLandmarks(landmarks, RIGHT_IRIS);
  const leftEye = getLandmarks(landmarks, LEFT_EYE);
  const rightEye = getLandmarks(landmarks, RIGHT_EYE);
  const leftIrisCenter = landmarkCenter(leftIris);
  const rightIrisCenter = landmarkCenter(rightIris);
  const leftEyeCenter = landmarkCenter(leftEye);
  const rightEyeCenter = landmarkCenter(rightEye);
  const leftOffset = landmarkDistance2D(leftIrisCenter, leftEyeCenter);
  const rightOffset = landmarkDistance2D(rightIrisCenter, rightEyeCenter);
  return { leftOffset, rightOffset };
}
function detectIris(frameData) {
  if (frameData.length < MIN_FRAMES) {
    return {
      score: 0,
      description: `Requires multiple frames (${frameData.length}/${MIN_FRAMES})`
    };
  }
  try {
    const leftOffsets = frameData.map((d) => d.leftOffset);
    const rightOffsets = frameData.map((d) => d.rightOffset);
    const leftVariance = variance(leftOffsets);
    const rightVariance = variance(rightOffsets);
    const avgVariance = (leftVariance + rightVariance) / 2;
    const score = Math.round(normalize(avgVariance, VARIANCE_MIN, VARIANCE_MAX));
    let description;
    if (score >= 75) {
      description = "High iris position variance (lens refraction)";
    } else if (score >= 40) {
      description = "Moderate iris position variance";
    } else if (score > 0) {
      description = "Low iris position variance";
    } else {
      description = "Stable iris position (no refraction detected)";
    }
    return { score, description };
  } catch {
    return { score: 0, description: "Iris stability analysis failed" };
  }
}

// dist/methods/depth.js
var DISCONTINUITY_MIN = 2e-3;
var DISCONTINUITY_MAX = 0.015;
function detectDepth(landmarks) {
  try {
    const noseLandmarks = getLandmarks(landmarks, NOSE_BRIDGE);
    const noseZ = noseLandmarks.map((lm) => lm.z);
    const noseZMean = mean(noseZ);
    const leftEyeLandmarks = getLandmarks(landmarks, LEFT_EYE);
    const rightEyeLandmarks = getLandmarks(landmarks, RIGHT_EYE);
    const leftEyeZ = leftEyeLandmarks.map((lm) => lm.z);
    const rightEyeZ = rightEyeLandmarks.map((lm) => lm.z);
    const leftInnerZ = leftEyeLandmarks[0].z;
    const leftOuterZ = leftEyeLandmarks[leftEyeLandmarks.length - 1].z;
    const rightInnerZ = rightEyeLandmarks[rightEyeLandmarks.length - 1].z;
    const rightOuterZ = rightEyeLandmarks[0].z;
    const leftDiscontinuity = Math.abs(leftInnerZ - noseZMean);
    const rightDiscontinuity = Math.abs(rightInnerZ - noseZMean);
    const leftEyeZStd = standardDeviation(leftEyeZ);
    const rightEyeZStd = standardDeviation(rightEyeZ);
    const eyeZFlatness = (leftEyeZStd + rightEyeZStd) / 2;
    const avgDiscontinuity = (leftDiscontinuity + rightDiscontinuity) / 2;
    const discontinuityScore = normalize(avgDiscontinuity, DISCONTINUITY_MIN, DISCONTINUITY_MAX);
    const flatnessScore = normalize(
      0.01 - eyeZFlatness,
      // Lower flatness std = more likely glasses
      0,
      8e-3
    );
    const score = Math.round(discontinuityScore * 0.6 + flatnessScore * 0.4);
    let description;
    if (score >= 75) {
      description = "Z-depth discontinuity detected";
    } else if (score >= 40) {
      description = "Moderate Z-depth anomaly";
    } else if (score > 0) {
      description = "Slight Z-depth variation";
    } else {
      description = "Normal Z-depth profile (no discontinuity)";
    }
    return { score, description };
  } catch {
    return { score: 0, description: "Depth analysis failed" };
  }
}

// dist/methods/contrast.js
var NORMAL_CONTRAST_RATIO = 1.3;
var DEVIATION_MIN = 0.2;
var DEVIATION_MAX = 1;
function detectContrast(source, landmarks) {
  try {
    const leftEyeIndices = [...LEFT_EYE, ...LEFT_EYEBROW];
    const rightEyeIndices = [...RIGHT_EYE, ...RIGHT_EYEBROW];
    const leftEyeRegion = extractLandmarkRegion(source, landmarks, leftEyeIndices, 3);
    const rightEyeRegion = extractLandmarkRegion(source, landmarks, rightEyeIndices, 3);
    const leftCheekRegion = extractLandmarkRegion(source, landmarks, [...LEFT_CHEEK], 5);
    const rightCheekRegion = extractLandmarkRegion(source, landmarks, [...RIGHT_CHEEK], 5);
    if (leftEyeRegion.width === 0 || rightEyeRegion.width === 0 || leftCheekRegion.width === 0 || rightCheekRegion.width === 0) {
      return { score: 0, description: "Could not extract contrast regions" };
    }
    const leftEyeGray = toGrayscale(leftEyeRegion);
    const rightEyeGray = toGrayscale(rightEyeRegion);
    const leftCheekGray = toGrayscale(leftCheekRegion);
    const rightCheekGray = toGrayscale(rightCheekRegion);
    const leftEyeContrast = regionContrast(leftEyeGray);
    const rightEyeContrast = regionContrast(rightEyeGray);
    const leftCheekContrast = regionContrast(leftCheekGray);
    const rightCheekContrast = regionContrast(rightCheekGray);
    const avgEyeContrast = (leftEyeContrast + rightEyeContrast) / 2;
    const avgCheekContrast = Math.max(leftCheekContrast + rightCheekContrast, 1e-3) / 2;
    const contrastRatio = avgEyeContrast / Math.max(avgCheekContrast, 1e-3);
    const deviation = Math.abs(contrastRatio - NORMAL_CONTRAST_RATIO);
    const score = Math.round(normalize(deviation, DEVIATION_MIN, DEVIATION_MAX));
    let description;
    if (score >= 75) {
      description = "Altered contrast in eye region";
    } else if (score >= 40) {
      description = "Moderate contrast deviation in eye region";
    } else if (score > 0) {
      description = "Slight contrast deviation in eye region";
    } else {
      description = "Normal eye-to-skin contrast ratio";
    }
    return { score, description };
  } catch {
    return { score: 0, description: "Contrast analysis failed" };
  }
}

// dist/methods/color.js
var COLOR_DEVIATION_MIN = 8;
var COLOR_DEVIATION_MAX = 35;
var TEMP_SHIFT_MIN = 3;
var TEMP_SHIFT_MAX = 20;
function detectColor(source, landmarks) {
  try {
    const leftEyeIndices = [...LEFT_EYE, ...LEFT_EYEBROW];
    const rightEyeIndices = [...RIGHT_EYE, ...RIGHT_EYEBROW];
    const leftEyeRegion = extractLandmarkRegion(source, landmarks, leftEyeIndices, 2);
    const rightEyeRegion = extractLandmarkRegion(source, landmarks, rightEyeIndices, 2);
    const leftCheekRegion = extractLandmarkRegion(source, landmarks, [...LEFT_CHEEK], 5);
    const rightCheekRegion = extractLandmarkRegion(source, landmarks, [...RIGHT_CHEEK], 5);
    if (leftEyeRegion.width === 0 || rightEyeRegion.width === 0 || leftCheekRegion.width === 0 || rightCheekRegion.width === 0) {
      return { score: 0, description: "Could not extract color regions" };
    }
    const leftEyeColors = sampleColorGrid(leftEyeRegion, 5);
    const rightEyeColors = sampleColorGrid(rightEyeRegion, 5);
    const leftSkinColor = averageColor(leftCheekRegion);
    const rightSkinColor = averageColor(rightCheekRegion);
    const skinColor = {
      r: (leftSkinColor.r + rightSkinColor.r) / 2,
      g: (leftSkinColor.g + rightSkinColor.g) / 2,
      b: (leftSkinColor.b + rightSkinColor.b) / 2
    };
    const allEyeColors = [...leftEyeColors, ...rightEyeColors];
    const distances = allEyeColors.map((c) => colorDistance(c, skinColor));
    const avgDistance = mean(distances);
    const tempShifts = allEyeColors.map((c) => Math.abs(colorTemperatureShift(skinColor, c)));
    const avgTempShift = mean(tempShifts);
    const distanceScore = normalize(avgDistance, COLOR_DEVIATION_MIN, COLOR_DEVIATION_MAX);
    const tempScore = normalize(avgTempShift, TEMP_SHIFT_MIN, TEMP_SHIFT_MAX);
    const score = Math.round(distanceScore * 0.6 + tempScore * 0.4);
    let description;
    if (score >= 75) {
      description = "Color shift detected in lens area";
    } else if (score >= 40) {
      description = "Moderate color anomaly in eye region";
    } else if (score > 0) {
      description = "Slight color variation in eye region";
    } else {
      description = "No significant color anomaly in eye region";
    }
    return { score, description };
  } catch {
    return { score: 0, description: "Color analysis failed" };
  }
}

// dist/index.js
var DEFAULT_CONFIG = {
  frameBuffer: 30,
  confidenceThreshold: 70,
  methods: {
    bridge: true,
    temple: true,
    iris: true,
    depth: true,
    contrast: true,
    color: true
  }
};
var GlassesDetector = class {
  constructor(config) {
    this.irisData = [];
    this.frameScores = {
      bridge: [],
      temple: [],
      depth: [],
      contrast: [],
      color: []
    };
    this.framesAnalyzed = 0;
    this.config = {
      frameBuffer: config?.frameBuffer ?? DEFAULT_CONFIG.frameBuffer,
      confidenceThreshold: config?.confidenceThreshold ?? DEFAULT_CONFIG.confidenceThreshold,
      methods: {
        bridge: config?.methods?.bridge ?? true,
        temple: config?.methods?.temple ?? true,
        iris: config?.methods?.iris ?? true,
        depth: config?.methods?.depth ?? true,
        contrast: config?.methods?.contrast ?? true,
        color: config?.methods?.color ?? true
      }
    };
    this.methods = this.config.methods;
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
  detect(source, landmarks) {
    const methods = this.runMethods(source, landmarks, []);
    const confidence = this.calculateConfidence(methods);
    return {
      hasGlasses: confidence >= this.config.confidenceThreshold,
      confidence,
      methods,
      framesAnalyzed: 1
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
  addFrame(source, landmarks) {
    this.framesAnalyzed++;
    if (this.methods.iris) {
      const irisFrame = extractIrisData(landmarks);
      this.irisData.push(irisFrame);
      if (this.irisData.length > this.config.frameBuffer) {
        this.irisData.shift();
      }
    }
    if (this.methods.bridge) {
      const result = detectBridge(source, landmarks);
      this.pushScore("bridge", result.score);
    }
    if (this.methods.temple) {
      const result = detectTemple(source, landmarks);
      this.pushScore("temple", result.score);
    }
    if (this.methods.depth) {
      const result = detectDepth(landmarks);
      this.pushScore("depth", result.score);
    }
    if (this.methods.contrast) {
      const result = detectContrast(source, landmarks);
      this.pushScore("contrast", result.score);
    }
    if (this.methods.color) {
      const result = detectColor(source, landmarks);
      this.pushScore("color", result.score);
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
  getResult() {
    const methods = this.getAccumulatedMethods();
    const confidence = this.calculateConfidence(methods);
    return {
      hasGlasses: confidence >= this.config.confidenceThreshold,
      confidence,
      methods,
      framesAnalyzed: this.framesAnalyzed
    };
  }
  /**
   * Reset the accumulation buffer.
   *
   * Call this when the user changes or when you want to start fresh.
   */
  reset() {
    this.irisData = [];
    this.frameScores = {
      bridge: [],
      temple: [],
      depth: [],
      contrast: [],
      color: []
    };
    this.framesAnalyzed = 0;
  }
  // ─── Internal methods ────────────────────────────────────────────
  /**
   * Run all enabled detection methods on a single frame.
   */
  runMethods(source, landmarks, irisData) {
    const disabled = { score: 0, description: "Disabled" };
    return {
      bridge: this.methods.bridge ? detectBridge(source, landmarks) : disabled,
      temple: this.methods.temple ? detectTemple(source, landmarks) : disabled,
      iris: this.methods.iris ? detectIris(irisData) : disabled,
      depth: this.methods.depth ? detectDepth(landmarks) : disabled,
      contrast: this.methods.contrast ? detectContrast(source, landmarks) : disabled,
      color: this.methods.color ? detectColor(source, landmarks) : disabled
    };
  }
  /**
   * Get accumulated method results (averaged scores).
   */
  getAccumulatedMethods() {
    const disabled = { score: 0, description: "Disabled" };
    const makeResult = (scores, describer) => {
      if (scores.length === 0)
        return { score: 0, description: "No data" };
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      return { score: avg, description: describer(avg) };
    };
    return {
      bridge: this.methods.bridge ? makeResult(this.frameScores.bridge, (s) => s >= 75 ? "Strong horizontal edge on nose bridge" : s >= 40 ? "Moderate horizontal edge detected on nose bridge" : s > 0 ? "Weak horizontal edge on nose bridge" : "No significant horizontal edge on nose bridge") : disabled,
      temple: this.methods.temple ? makeResult(this.frameScores.temple, (s) => s >= 75 ? "Symmetric edges at both temples" : s >= 40 ? "Moderate edge symmetry at temples" : s > 0 ? "Weak or asymmetric edges at temples" : "No symmetric temple edges detected") : disabled,
      iris: this.methods.iris ? detectIris(this.irisData) : disabled,
      depth: this.methods.depth ? makeResult(this.frameScores.depth, (s) => s >= 75 ? "Z-depth discontinuity detected" : s >= 40 ? "Moderate Z-depth anomaly" : s > 0 ? "Slight Z-depth variation" : "Normal Z-depth profile (no discontinuity)") : disabled,
      contrast: this.methods.contrast ? makeResult(this.frameScores.contrast, (s) => s >= 75 ? "Altered contrast in eye region" : s >= 40 ? "Moderate contrast deviation in eye region" : s > 0 ? "Slight contrast deviation in eye region" : "Normal eye-to-skin contrast ratio") : disabled,
      color: this.methods.color ? makeResult(this.frameScores.color, (s) => s >= 75 ? "Color shift detected in lens area" : s >= 40 ? "Moderate color anomaly in eye region" : s > 0 ? "Slight color variation in eye region" : "No significant color anomaly in eye region") : disabled
    };
  }
  /**
   * Calculate overall weighted confidence from method results.
   * Adjusts weights when some methods are disabled or have no data.
   */
  calculateConfidence(methods) {
    const weights = { ...DEFAULT_WEIGHTS };
    const methodNames = Object.keys(weights);
    for (const name of methodNames) {
      if (!this.methods[name]) {
        weights[name] = 0;
      }
      if (name === "iris" && methods.iris.description.startsWith("Requires")) {
        weights[name] = 0;
      }
    }
    const totalWeight = methodNames.reduce((sum, name) => sum + weights[name], 0);
    if (totalWeight === 0)
      return 0;
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
  pushScore(method, score) {
    this.frameScores[method].push(score);
    if (this.frameScores[method].length > this.config.frameBuffer) {
      this.frameScores[method].shift();
    }
  }
};
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
//# sourceMappingURL=glassesjs.cjs.js.map
