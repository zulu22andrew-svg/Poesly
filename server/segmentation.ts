import * as ort from 'onnxruntime-node';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

let segmentationSession: ort.InferenceSession | null = null;
let sessionLoadingPromise: Promise<ort.InferenceSession> | null = null;

const MODEL_PATH = path.join(process.cwd(), 'models', 'modnet.onnx');

/**
 * Lazily loads and caches the MODNet neural portrait segmentation ONNX session
 */
export async function getSegmentationSession(): Promise<ort.InferenceSession> {
  if (segmentationSession) return segmentationSession;
  if (sessionLoadingPromise) return sessionLoadingPromise;

  sessionLoadingPromise = (async () => {
    if (!fs.existsSync(MODEL_PATH)) {
      throw new Error(`MODNet model not found at ${MODEL_PATH}`);
    }

    console.log('[Segmentation] Initializing MODNet Neural Human Matting Session...');
    const session = await ort.InferenceSession.create(MODEL_PATH, {
      executionProviders: ['cpu'],
      graphOptimizationLevel: 'all'
    });

    segmentationSession = session;
    console.log('[Segmentation] MODNet session loaded successfully.');
    return session;
  })();

  return sessionLoadingPromise;
}

export interface SegmentFrameOptions {
  referenceId: string;
  frameId: string; // e.g. "frame-0001" or "frame-0001.jpg"
  useEnhancedIfAvailable?: boolean; // Default true
}

export interface SegmentationResult {
  success: boolean;
  referenceId: string;
  frameId: string;
  sourceType: 'enhanced' | 'original';
  sourceUrl: string;
  maskUrl: string;
  cutoutUrl: string;
  overlayUrl: string;
  dimensions: { width: number; height: number };
  subjectCoveragePct: number;
  averageConfidencePct: number;
  edgeGradientScore: number;
  confidenceStatus: 'high' | 'moderate' | 'low_confidence' | 'no_subject_detected';
  warningMessage?: string;
  processingTimeMs: number;
  segmentedAt: string;
}

/**
 * Performs neural portrait segmentation on a frame and outputs:
 * 1. Grayscale Alpha Mask (PNG)
 * 2. Cutout RGBA transparent subject image (PNG)
 * 3. Inspection Color Overlay (JPG)
 */
export async function segmentSingleFrame(options: SegmentFrameOptions): Promise<SegmentationResult> {
  const startTime = Date.now();
  const { referenceId, frameId, useEnhancedIfAvailable = true } = options;

  const cleanFrameId = frameId.replace(/\.[^/.]+$/, '').replace(/-enhanced$/, '');
  const sessionDir = path.join(process.cwd(), 'uploads', referenceId);

  if (!fs.existsSync(sessionDir)) {
    throw new Error(`Session directory not found: ${referenceId}`);
  }

  // Determine source file: check for enhanced version first if requested
  const enhancedPath = path.join(sessionDir, `${cleanFrameId}-enhanced.jpg`);
  const originalPath = path.join(sessionDir, `${cleanFrameId}.jpg`);

  let inputPath = originalPath;
  let sourceType: 'enhanced' | 'original' = 'original';

  if (useEnhancedIfAvailable && fs.existsSync(enhancedPath)) {
    inputPath = enhancedPath;
    sourceType = 'enhanced';
  } else if (!fs.existsSync(originalPath)) {
    throw new Error(`Frame image not found for frame ID ${cleanFrameId} in session ${referenceId}`);
  }

  const session = await getSegmentationSession();

  // Read metadata
  const meta = await sharp(inputPath).metadata();
  const origW = meta.width || 640;
  const origH = meta.height || 480;

  // Calculate inference dimensions divisible by 32 preserving aspect ratio
  const maxDim = 512;
  let targetW: number;
  let targetH: number;

  if (origW >= origH) {
    targetW = maxDim;
    targetH = Math.max(32, Math.round((maxDim * (origH / origW)) / 32) * 32);
  } else {
    targetH = maxDim;
    targetW = Math.max(32, Math.round((maxDim * (origW / origH)) / 32) * 32);
  }

  // Preprocess image for MODNet (Normalized RGB in [-1, 1], NCHW float32)
  const { data: rawRgb } = await sharp(inputPath)
    .resize(targetW, targetH, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const inputTensorData = new Float32Array(1 * 3 * targetH * targetW);
  const planeSize = targetH * targetW;

  for (let c = 0; c < 3; c++) {
    for (let h = 0; h < targetH; h++) {
      for (let w = 0; w < targetW; w++) {
        const srcIdx = (h * targetW + w) * 3 + c;
        const dstIdx = c * planeSize + (h * targetW + w);
        inputTensorData[dstIdx] = (rawRgb[srcIdx] / 127.5) - 1.0;
      }
    }
  }

  const inputTensor = new ort.Tensor('float32', inputTensorData, [1, 3, targetH, targetW]);
  
  // Run Neural Inference
  const inferenceOutput = await session.run({ input: inputTensor });
  const rawMatte = inferenceOutput.output.data as Float32Array;

  // Convert float [0, 1] matte to 8-bit buffer and compute quality metrics
  const matte8Bit = Buffer.alloc(planeSize);
  let foregroundCount = 0;
  let confidenceSum = 0;
  let subjectPixelsCount = 0;

  for (let i = 0; i < rawMatte.length; i++) {
    const val = Math.min(1, Math.max(0, rawMatte[i]));
    const intVal = Math.round(val * 255);
    matte8Bit[i] = intVal;

    if (val > 0.4) {
      foregroundCount++;
      confidenceSum += val;
      subjectPixelsCount++;
    }
  }

  const subjectCoveragePct = Number(((foregroundCount / planeSize) * 100).toFixed(1));
  const averageConfidencePct = subjectPixelsCount > 0 
    ? Number(((confidenceSum / subjectPixelsCount) * 100).toFixed(1))
    : 0;

  // Measure edge gradient score to check border clarity
  let edgeGradientSum = 0;
  let edgeSampleCount = 0;
  for (let y = 1; y < targetH - 1; y++) {
    for (let x = 1; x < targetW - 1; x++) {
      const idx = y * targetW + x;
      const center = matte8Bit[idx];
      if (center > 20 && center < 235) { // Transition edge band
        const gx = Math.abs(matte8Bit[idx + 1] - matte8Bit[idx - 1]);
        const gy = Math.abs(matte8Bit[(y + 1) * targetW + x] - matte8Bit[(y - 1) * targetW + x]);
        edgeGradientSum += Math.sqrt(gx * gx + gy * gy);
        edgeSampleCount++;
      }
    }
  }
  const edgeGradientScore = edgeSampleCount > 0 
    ? Number((edgeGradientSum / edgeSampleCount).toFixed(1))
    : 50.0;

  // Evaluate Confidence & Edge Cases
  let confidenceStatus: 'high' | 'moderate' | 'low_confidence' | 'no_subject_detected' = 'high';
  let warningMessage: string | undefined = undefined;

  if (subjectCoveragePct < 1.0) {
    confidenceStatus = 'no_subject_detected';
    warningMessage = 'No prominent human subject was detected in this frame.';
  } else if (subjectCoveragePct < 4.0 || averageConfidencePct < 65) {
    confidenceStatus = 'low_confidence';
    warningMessage = 'Low subject confidence detected. Edge boundaries may be subtle or occluded.';
  } else if (subjectCoveragePct > 95.0) {
    confidenceStatus = 'moderate';
    warningMessage = 'Subject occupies almost the entire frame with minimal background visible.';
  } else if (averageConfidencePct < 80) {
    confidenceStatus = 'moderate';
  }

  // 1. Generate full-resolution 8-bit Alpha Mask PNG
  const fullResolutionMaskBuffer = await sharp(matte8Bit, {
    raw: { width: targetW, height: targetH, channels: 1 }
  })
    .resize(origW, origH, { kernel: 'lanczos3' })
    .png({ compressionLevel: 8 })
    .toBuffer();

  const maskFileName = `${cleanFrameId}-mask.png`;
  const maskFilePath = path.join(sessionDir, maskFileName);
  fs.writeFileSync(maskFilePath, fullResolutionMaskBuffer);

  // 2. Generate Transparent Cutout RGBA PNG
  // Combine original RGB image with alpha matte channel
  const { data: fullRgb } = await sharp(inputPath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data: fullMaskRaw } = await sharp(fullResolutionMaskBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgbaBuffer = Buffer.alloc(origW * origH * 4);
  for (let i = 0; i < origW * origH; i++) {
    rgbaBuffer[i * 4 + 0] = fullRgb[i * 3 + 0]; // R
    rgbaBuffer[i * 4 + 1] = fullRgb[i * 3 + 1]; // G
    rgbaBuffer[i * 4 + 2] = fullRgb[i * 3 + 2]; // B
    rgbaBuffer[i * 4 + 3] = fullMaskRaw[i];     // Alpha from mask
  }

  const cutoutFileName = `${cleanFrameId}-cutout.png`;
  const cutoutFilePath = path.join(sessionDir, cutoutFileName);
  await sharp(rgbaBuffer, {
    raw: { width: origW, height: origH, channels: 4 }
  })
    .png({ compressionLevel: 6 })
    .toFile(cutoutFilePath);

  // 3. Generate Inspection Overlay JPG
  // Subject stays original full color, background gets a clean dark studio tint with neon boundary glow
  const overlayRgb = Buffer.alloc(origW * origH * 3);
  for (let i = 0; i < origW * origH; i++) {
    const alpha = fullMaskRaw[i] / 255; // 0 to 1
    const r = fullRgb[i * 3 + 0];
    const g = fullRgb[i * 3 + 1];
    const b = fullRgb[i * 3 + 2];

    // Background tint: subtle studio indigo/slate (20, 20, 35)
    const bgR = 22;
    const bgG = 22;
    const bgB = 36;

    // Edge highlight glow if near boundary (alpha between 0.15 and 0.85)
    const isEdge = alpha > 0.15 && alpha < 0.85;
    if (isEdge) {
      // Purple-cyan edge tint
      overlayRgb[i * 3 + 0] = Math.min(255, Math.round(r * 0.7 + 124 * 0.3));
      overlayRgb[i * 3 + 1] = Math.min(255, Math.round(g * 0.7 + 58 * 0.3));
      overlayRgb[i * 3 + 2] = Math.min(255, Math.round(b * 0.7 + 237 * 0.3));
    } else {
      overlayRgb[i * 3 + 0] = Math.round(r * alpha + bgR * (1 - alpha));
      overlayRgb[i * 3 + 1] = Math.round(g * alpha + bgG * (1 - alpha));
      overlayRgb[i * 3 + 2] = Math.round(b * alpha + bgB * (1 - alpha));
    }
  }

  const overlayFileName = `${cleanFrameId}-overlay.jpg`;
  const overlayFilePath = path.join(sessionDir, overlayFileName);
  await sharp(overlayRgb, {
    raw: { width: origW, height: origH, channels: 3 }
  })
    .jpeg({ quality: 92 })
    .toFile(overlayFilePath);

  const processingTimeMs = Date.now() - startTime;

  const result: SegmentationResult = {
    success: true,
    referenceId,
    frameId: cleanFrameId,
    sourceType,
    sourceUrl: `/uploads/${referenceId}/${path.basename(inputPath)}`,
    maskUrl: `/uploads/${referenceId}/${maskFileName}`,
    cutoutUrl: `/uploads/${referenceId}/${cutoutFileName}`,
    overlayUrl: `/uploads/${referenceId}/${overlayFileName}`,
    dimensions: { width: origW, height: origH },
    subjectCoveragePct,
    averageConfidencePct,
    edgeGradientScore,
    confidenceStatus,
    warningMessage,
    processingTimeMs,
    segmentedAt: new Date().toISOString()
  };

  // Save to segmentations catalog in session dir
  saveSegmentationRecord(referenceId, cleanFrameId, result);

  return result;
}

export interface BatchSegmentOptions {
  referenceId: string;
  frameIds: string[];
  useEnhancedIfAvailable?: boolean;
}

export interface BatchSegmentResult {
  success: boolean;
  referenceId: string;
  total: number;
  segmentedCount: number;
  failedCount: number;
  results: SegmentationResult[];
  failed: Array<{ frameId: string; error: string; originalUrl: string }>;
}

export async function segmentBatchFrames(options: BatchSegmentOptions): Promise<BatchSegmentResult> {
  const { referenceId, frameIds, useEnhancedIfAvailable = true } = options;
  const results: SegmentationResult[] = [];
  const failed: Array<{ frameId: string; error: string; originalUrl: string }> = [];

  for (const frameId of frameIds) {
    try {
      const res = await segmentSingleFrame({
        referenceId,
        frameId,
        useEnhancedIfAvailable
      });
      results.push(res);
    } catch (err: any) {
      console.error(`[BatchSegmentation] Failed on ${frameId}:`, err);
      const cleanId = frameId.replace(/\.[^/.]+$/, '');
      failed.push({
        frameId: cleanId,
        error: err.message || 'Segmentation model inference failed',
        originalUrl: `/uploads/${referenceId}/${cleanId}.jpg`
      });
    }
  }

  return {
    success: results.length > 0 || failed.length === 0,
    referenceId,
    total: frameIds.length,
    segmentedCount: results.length,
    failedCount: failed.length,
    results,
    failed
  };
}

/**
 * Persists segmentation results in uploads/<referenceId>/segmentations.json
 */
function saveSegmentationRecord(referenceId: string, frameId: string, data: SegmentationResult) {
  try {
    const sessionDir = path.join(process.cwd(), 'uploads', referenceId);
    const catalogPath = path.join(sessionDir, 'segmentations.json');
    let records: Record<string, SegmentationResult> = {};
    if (fs.existsSync(catalogPath)) {
      try {
        records = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
      } catch (e) {
        records = {};
      }
    }
    records[frameId] = data;
    fs.writeFileSync(catalogPath, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save segmentation record:', err);
  }
}

/**
 * Retrieves all stored segmentation records for a session
 */
export function getStoredSegmentations(referenceId: string): Record<string, SegmentationResult> {
  try {
    const catalogPath = path.join(process.cwd(), 'uploads', referenceId, 'segmentations.json');
    if (fs.existsSync(catalogPath)) {
      return JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to read segmentation records:', err);
  }
  return {};
}
