import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { BackgroundMode, ExportFormat, ExportOptions, ExportResult, FilterPresetId, FilterParameters } from '../src/types';
import { interpolateParameters } from '../src/filters/filterEngine';
import { applyBackgroundEffect } from './backgroundEditor';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

/**
 * Format bytes into human-readable string (KB, MB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Generate a clean, descriptive, readable filename for exported photos
 */
export function generateExportFilename(options: {
  sessionName?: string;
  frameId: string;
  backgroundMode: BackgroundMode;
  filterId: FilterPresetId;
  filterIntensity: number;
  format: ExportFormat;
  isEnhanced: boolean;
}): string {
  const { sessionName, frameId, backgroundMode, filterId, filterIntensity, format, isEnhanced } = options;

  const cleanFrame = frameId.replace(/\.[^/.]+$/, '').replace(/-(enhanced|bg-[a-z0-9]+)$/, '');
  
  // Format prefix
  let prefix = 'posely';
  if (sessionName && sessionName.trim().length > 0) {
    const sanitizedSession = sessionName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (sanitizedSession) {
      prefix = `posely-${sanitizedSession}`;
    }
  }

  // Format descriptors
  const parts = [prefix, cleanFrame];

  if (isEnhanced) {
    parts.push('enhanced');
  }

  if (backgroundMode === 'blur') {
    parts.push('bokeh');
  } else if (backgroundMode === 'remove') {
    parts.push('cutout');
  } else if (backgroundMode === 'white') {
    parts.push('studio-white');
  } else if (backgroundMode === 'black') {
    parts.push('studio-black');
  }

  if (filterId !== 'none' && filterIntensity > 0) {
    parts.push(`${filterId}-i${filterIntensity}`);
  }

  const ext = format === 'png' ? 'png' : 'jpg';
  return `${parts.join('-')}.${ext}`;
}

/**
 * Stage 15 Full-Resolution Photo Export Pipeline
 * 
 * Takes the master resolution source (GFPGAN 2x enhanced or raw master),
 * composites background modifications (MODNet neural segmentation alpha),
 * applies deterministic color-grading filter transforms (LUT-equivalent),
 * and encodes to pristine JPEG (quality: 95, 4:4:4 subsampling) or PNG.
 */
export async function exportFullResolutionPhoto(options: ExportOptions): Promise<ExportResult> {
  const startTime = Date.now();
  const {
    referenceId,
    frameId,
    backgroundMode = 'original',
    filterId = 'none',
    filterIntensity = 70,
    format: requestedFormat = 'auto',
    sessionName,
    customFilename
  } = options;

  const sessionDir = path.join(UPLOADS_DIR, referenceId);
  if (!fs.existsSync(sessionDir)) {
    throw new Error(`Session directory not found for ID: ${referenceId}`);
  }

  const cleanFrameId = frameId.replace(/\.[^/.]+$/, '').replace(/-(enhanced|bg-[a-z0-9]+)$/, '');

  // 1. Locate highest-quality source master
  const enhancedPath = path.join(sessionDir, `${cleanFrameId}-enhanced.jpg`);
  const rawPath = path.join(sessionDir, `${cleanFrameId}.jpg`);

  const hasEnhanced = fs.existsSync(enhancedPath);
  let masterSourcePath = rawPath;

  if (hasEnhanced) {
    masterSourcePath = enhancedPath;
  } else if (!fs.existsSync(rawPath)) {
    throw new Error(`Master source photo not found for frame ${cleanFrameId} in session ${referenceId}`);
  }

  // 2. Determine base background stage image
  let baseImagePath = masterSourcePath;

  if (backgroundMode !== 'original') {
    // Generate or fetch cached background variation
    const bgResult = await applyBackgroundEffect({
      referenceId,
      frameId: cleanFrameId,
      mode: backgroundMode,
      blurSigma: 20,
      forceReprocess: false
    });

    const bgLocalFileName = path.basename(bgResult.imageUrl);
    const bgFullPath = path.join(sessionDir, bgLocalFileName);
    if (fs.existsSync(bgFullPath)) {
      baseImagePath = bgFullPath;
    } else {
      throw new Error(`Failed to resolve background image: ${bgLocalFileName}`);
    }
  }

  // 3. Determine export format
  let finalFormat: ExportFormat = 'jpeg';
  if (backgroundMode === 'remove' || requestedFormat === 'png' || baseImagePath.endsWith('.png')) {
    finalFormat = 'png';
  } else if (requestedFormat === 'jpeg') {
    finalFormat = 'jpeg';
  }

  // 4. Generate clean filename
  const clampedIntensity = Math.max(0, Math.min(100, Math.round(filterIntensity)));
  const filename = customFilename || generateExportFilename({
    sessionName,
    frameId: cleanFrameId,
    backgroundMode,
    filterId,
    filterIntensity: clampedIntensity,
    format: finalFormat,
    isEnhanced: hasEnhanced
  });

  // Target output export path in session exports dir
  const exportsDir = path.join(sessionDir, 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const exportFilePath = path.join(exportsDir, filename);
  const downloadUrl = `/api/download/${referenceId}/${filename}`;

  // 5. Build High-Fidelity Processing Pipeline
  let pipeline = sharp(baseImagePath);

  // Apply Filter if active
  if (filterId !== 'none' && clampedIntensity > 0) {
    const params: FilterParameters = interpolateParameters(filterId, clampedIntensity);

    // Color Recombination Matrix (Temperature, Tint, Channel Gains)
    const tempR = 1 + params.temperature * 0.005;
    const tempB = 1 - params.temperature * 0.005;
    const tintG = 1 + params.tint * 0.003;

    const rGain = (params.channelGains?.r ?? 1.0) * tempR;
    const gGain = (params.channelGains?.g ?? 1.0) * tintG;
    const bGain = (params.channelGains?.b ?? 1.0) * tempB;

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

    // Brightness and Saturation
    const expMult = Math.pow(2, params.exposure);
    const totalBrightness = params.brightness * expMult;
    const hueShift = Math.round(params.tint * 1.2);

    pipeline = pipeline.modulate({
      brightness: totalBrightness,
      saturation: params.saturation,
      ...(hueShift !== 0 ? { hue: hueShift } : {})
    });

    // Contrast via linear scaling
    if (Math.abs(params.contrast - 1.0) > 0.01) {
      const a = params.contrast;
      const b = 128 * (1 - a);
      pipeline = pipeline.linear(a, b);
    }

    // Clarity / subtle unsharp mask
    if (params.clarity > 1.02) {
      const sharpnessSigma = 0.5 + (params.clarity - 1.0) * 1.5;
      pipeline = pipeline.sharpen({ sigma: sharpnessSigma, m1: 0.5, m2: 2.0 });
    }
  }

  // 6. Encode with Master Quality settings
  if (finalFormat === 'png') {
    await pipeline
      .png({
        compressionLevel: 8,
        adaptiveFiltering: true,
        quality: 100
      })
      .toFile(exportFilePath);
  } else {
    await pipeline
      .jpeg({
        quality: 96,
        mozjpeg: true,
        chromaSubsampling: '4:4:4', // Preserve complete chroma resolution for studio quality
        trellisQuantisation: true,
        overshootDeringing: true,
        optimizeScans: true
      })
      .toFile(exportFilePath);
  }

  // 7. Verify exported file metadata & dimensions
  const exportedMeta = await sharp(exportFilePath).metadata();
  const fileStats = await fs.promises.stat(exportFilePath);

  return {
    success: true,
    referenceId,
    frameId: cleanFrameId,
    downloadUrl,
    filename,
    format: finalFormat,
    dimensions: {
      width: exportedMeta.width || 0,
      height: exportedMeta.height || 0
    },
    fileSizeBytes: fileStats.size,
    formattedSize: formatBytes(fileStats.size),
    processingTimeMs: Date.now() - startTime,
    cached: false,
    appliedPipeline: {
      enhanced: hasEnhanced,
      background: backgroundMode,
      filter: filterId,
      intensity: clampedIntensity
    },
    exportedAt: new Date().toISOString()
  };
}
