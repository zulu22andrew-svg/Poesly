import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { FilterParameters, FilterPresetId, FilterResult, BackgroundMode } from '../src/types';
import { FILTER_PRESETS } from '../src/filters/presets';
import { interpolateParameters } from '../src/filters/filterEngine';

export interface ApplyFilterOptions {
  referenceId: string;
  frameId: string;
  filterId: FilterPresetId;
  intensity?: number; // 0 to 100, default 70
  backgroundMode?: BackgroundMode;
  forceReprocess?: boolean;
}

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

/**
 * Server-side deterministic color grading using Sharp
 */
export async function applyFilterOnServer(options: ApplyFilterOptions): Promise<FilterResult> {
  const startTime = Date.now();
  const {
    referenceId,
    frameId,
    filterId,
    intensity = 70,
    backgroundMode = 'original',
    forceReprocess = false
  } = options;

  const sessionDir = path.join(UPLOADS_DIR, referenceId);
  if (!fs.existsSync(sessionDir)) {
    throw new Error(`Session directory not found for referenceId: ${referenceId}`);
  }

  const cleanFrameId = frameId.replace(/\.[^/.]+$/, '');
  const clampedIntensity = Math.max(0, Math.min(100, Math.round(intensity)));

  // Determine source file based on background mode
  let sourceFileName = `${cleanFrameId}-enhanced.jpg`;
  if (backgroundMode === 'blur') {
    sourceFileName = `${cleanFrameId}-bg-blur.jpg`;
  } else if (backgroundMode === 'remove') {
    sourceFileName = `${cleanFrameId}-bg-remove.png`;
  } else if (backgroundMode === 'white') {
    sourceFileName = `${cleanFrameId}-bg-white.jpg`;
  } else if (backgroundMode === 'black') {
    sourceFileName = `${cleanFrameId}-bg-black.jpg`;
  }

  let sourcePath = path.join(sessionDir, sourceFileName);
  if (!fs.existsSync(sourcePath)) {
    // Fallback to enhanced, then to raw
    const enhancedPath = path.join(sessionDir, `${cleanFrameId}-enhanced.jpg`);
    const rawPath = path.join(sessionDir, `${cleanFrameId}.jpg`);
    if (fs.existsSync(enhancedPath)) {
      sourcePath = enhancedPath;
    } else if (fs.existsSync(rawPath)) {
      sourcePath = rawPath;
    } else {
      throw new Error(`Source photo not found for frame ${cleanFrameId}`);
    }
  }

  // Determine target output filename
  const isPng = sourcePath.endsWith('.png');
  const ext = isPng ? 'png' : 'jpg';
  const outputFileName = `${cleanFrameId}-bg-${backgroundMode}-filter-${filterId}-i${clampedIntensity}.${ext}`;
  const outputPath = path.join(sessionDir, outputFileName);
  const outputUrl = `/uploads/${referenceId}/${outputFileName}`;

  // If filter is 'none' or intensity is 0, return the source image URL directly
  if (filterId === 'none' || clampedIntensity === 0) {
    const existingSourceUrl = `/uploads/${referenceId}/${path.basename(sourcePath)}`;
    return {
      success: true,
      referenceId,
      frameId: cleanFrameId,
      filterId: 'none',
      intensity: 0,
      imageUrl: existingSourceUrl,
      cached: true,
      processingTimeMs: Date.now() - startTime,
      appliedAt: new Date().toISOString()
    };
  }

  // Check cache
  if (!forceReprocess && fs.existsSync(outputPath)) {
    return {
      success: true,
      referenceId,
      frameId: cleanFrameId,
      filterId,
      intensity: clampedIntensity,
      imageUrl: outputUrl,
      cached: true,
      processingTimeMs: Date.now() - startTime,
      appliedAt: new Date().toISOString()
    };
  }

  // Interpolate parameters based on intensity
  const params: FilterParameters = interpolateParameters(filterId, clampedIntensity);

  // Build Sharp processing pipeline
  let pipeline = sharp(sourcePath);

  // 1. Color Recombination Matrix (Temperature, Tint, Channel Gains)
  const tempR = 1 + params.temperature * 0.005;
  const tempB = 1 - params.temperature * 0.005;
  const tintG = 1 + params.tint * 0.003;

  const rGain = (params.channelGains?.r ?? 1.0) * tempR;
  const gGain = (params.channelGains?.g ?? 1.0) * tintG;
  const bGain = (params.channelGains?.b ?? 1.0) * tempB;

  // 3x3 color matrix for Sharp
  const recombMatrix: [
    [number, number, number],
    [number, number, number],
    [number, number, number]
  ] = [
    [rGain, 0, 0],
    [0, gGain, 0],
    [0, 0, bGain]
  ];

  pipeline = pipeline.recomb(recombMatrix);

  // 2. Modulate: Brightness and Saturation
  const expMult = Math.pow(2, params.exposure);
  const totalBrightness = params.brightness * expMult;
  const hueShift = Math.round(params.tint * 1.2);

  pipeline = pipeline.modulate({
    brightness: totalBrightness,
    saturation: params.saturation,
    ...(hueShift !== 0 ? { hue: hueShift } : {})
  });

  // 3. Contrast via linear scaling
  if (Math.abs(params.contrast - 1.0) > 0.01) {
    // y = a * x + b where a is contrast, b centers around midtone 128
    const a = params.contrast;
    const b = 128 * (1 - a);
    pipeline = pipeline.linear(a, b);
  }

  // 4. Clarity / subtle unsharp mask if specified
  if (params.clarity > 1.02) {
    const sharpnessSigma = 0.5 + (params.clarity - 1.0) * 1.5;
    pipeline = pipeline.sharpen({ sigma: sharpnessSigma, m1: 0.5, m2: 2.0 });
  }

  // Output with high visual fidelity and preserve non-destructive original
  if (isPng) {
    await pipeline.png({ compressionLevel: 8 }).toFile(outputPath);
  } else {
    await pipeline.jpeg({ quality: 95, mozjpeg: true }).toFile(outputPath);
  }

  return {
    success: true,
    referenceId,
    frameId: cleanFrameId,
    filterId,
    intensity: clampedIntensity,
    imageUrl: outputUrl,
    cached: false,
    processingTimeMs: Date.now() - startTime,
    appliedAt: new Date().toISOString()
  };
}
