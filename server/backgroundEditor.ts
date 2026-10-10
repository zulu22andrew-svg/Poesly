import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { segmentSingleFrame } from './segmentation';
import { BackgroundMode, BackgroundResult, StoredBackgroundVariations } from '../src/types';

export interface ApplyBackgroundOptions {
  referenceId: string;
  frameId: string;
  mode: BackgroundMode;
  blurSigma?: number; // Default 20
  forceReprocess?: boolean;
}

/**
 * Applies background modification (Original, Blur, Remove / Transparent, Solid Color)
 * using the Stage 12 MODNet neural segmentation alpha mask.
 */
export async function applyBackgroundEffect(options: ApplyBackgroundOptions): Promise<BackgroundResult> {
  const startTime = Date.now();
  const { referenceId, frameId, mode, blurSigma = 20, forceReprocess = false } = options;

  const cleanFrameId = frameId.replace(/\.[^/.]+$/, '').replace(/-(enhanced|bg-[a-z0-9]+)$/, '');
  const sessionDir = path.join(process.cwd(), 'uploads', referenceId);

  if (!fs.existsSync(sessionDir)) {
    throw new Error(`Session directory not found for ID: ${referenceId}`);
  }

  // Determine source enhanced or raw image
  const enhancedPath = path.join(sessionDir, `${cleanFrameId}-enhanced.jpg`);
  const originalPath = path.join(sessionDir, `${cleanFrameId}.jpg`);

  let inputPath = originalPath;
  if (fs.existsSync(enhancedPath)) {
    inputPath = enhancedPath;
  } else if (!fs.existsSync(originalPath)) {
    throw new Error(`Frame image not found for ${cleanFrameId} in session ${referenceId}`);
  }

  // Handle 'original' mode (return standard enhanced or raw url)
  if (mode === 'original') {
    const meta = await sharp(inputPath).metadata();
    const isEnhanced = fs.existsSync(enhancedPath);
    const fileName = isEnhanced ? `${cleanFrameId}-enhanced.jpg` : `${cleanFrameId}.jpg`;
    
    const result: BackgroundResult = {
      success: true,
      referenceId,
      frameId: cleanFrameId,
      mode: 'original',
      imageUrl: `/uploads/${referenceId}/${fileName}`,
      mimeType: 'image/jpeg',
      cached: true,
      dimensions: { width: meta.width || 0, height: meta.height || 0 },
      processingTimeMs: Date.now() - startTime,
      appliedAt: new Date().toISOString()
    };

    saveBackgroundRecord(referenceId, cleanFrameId, mode, result.imageUrl);
    return result;
  }

  // Determine output filename and MIME
  let outputFileName = '';
  let mimeType = 'image/jpeg';

  switch (mode) {
    case 'blur':
      outputFileName = `${cleanFrameId}-bg-blur.jpg`;
      mimeType = 'image/jpeg';
      break;
    case 'remove':
      outputFileName = `${cleanFrameId}-bg-remove.png`;
      mimeType = 'image/png';
      break;
    case 'white':
      outputFileName = `${cleanFrameId}-bg-white.jpg`;
      mimeType = 'image/jpeg';
      break;
    case 'black':
      outputFileName = `${cleanFrameId}-bg-black.jpg`;
      mimeType = 'image/jpeg';
      break;
    default:
      outputFileName = `${cleanFrameId}-bg-${mode}.jpg`;
      mimeType = 'image/jpeg';
  }

  const outputPath = path.join(sessionDir, outputFileName);
  const outputUrl = `/uploads/${referenceId}/${outputFileName}`;

  // Check cache: if file exists on disk and reprocess not forced, return immediately
  if (!forceReprocess && fs.existsSync(outputPath)) {
    const meta = await sharp(outputPath).metadata();
    const result: BackgroundResult = {
      success: true,
      referenceId,
      frameId: cleanFrameId,
      mode,
      imageUrl: outputUrl,
      mimeType,
      cached: true,
      dimensions: { width: meta.width || 0, height: meta.height || 0 },
      processingTimeMs: Date.now() - startTime,
      appliedAt: new Date().toISOString()
    };
    saveBackgroundRecord(referenceId, cleanFrameId, mode, outputUrl);
    return result;
  }

  // 1. Ensure segmentation mask is available
  const maskPath = path.join(sessionDir, `${cleanFrameId}-mask.png`);
  if (!fs.existsSync(maskPath)) {
    console.log(`[BackgroundEditor] Mask not found for ${cleanFrameId}. Running MODNet segmentation...`);
    await segmentSingleFrame({
      referenceId,
      frameId: cleanFrameId,
      useEnhancedIfAvailable: true
    });
  }

  if (!fs.existsSync(maskPath)) {
    throw new Error(`Failed to generate or locate segmentation mask for ${cleanFrameId}`);
  }

  // 2. Load input image & mask metadata and raw buffers
  const inputMeta = await sharp(inputPath).metadata();
  const width = inputMeta.width || 640;
  const height = inputMeta.height || 480;

  const { data: inputRgb } = await sharp(inputPath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data: maskRaw } = await sharp(maskPath)
    .resize(width, height, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelCount = width * height;

  if (mode === 'blur') {
    // Generate smoothly blurred background with natural bokeh (e.g. sigma 20)
    const { data: blurredRgb } = await sharp(inputPath)
      .blur(Math.max(3, Math.min(50, blurSigma)))
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const outBuffer = Buffer.alloc(pixelCount * 3);

    for (let i = 0; i < pixelCount; i++) {
      const alpha = maskRaw[i] / 255; // 0 (background) to 1 (subject)
      // Subject gets 100% crisp enhanced pixels, background gets smooth bokeh blur
      outBuffer[i * 3 + 0] = Math.round(inputRgb[i * 3 + 0] * alpha + blurredRgb[i * 3 + 0] * (1 - alpha));
      outBuffer[i * 3 + 1] = Math.round(inputRgb[i * 3 + 1] * alpha + blurredRgb[i * 3 + 1] * (1 - alpha));
      outBuffer[i * 3 + 2] = Math.round(inputRgb[i * 3 + 2] * alpha + blurredRgb[i * 3 + 2] * (1 - alpha));
    }

    await sharp(outBuffer, {
      raw: { width, height, channels: 3 }
    })
      .jpeg({ quality: 95, mozjpeg: true })
      .toFile(outputPath);

  } else if (mode === 'remove') {
    // Generate transparent PNG cutout
    const outBuffer = Buffer.alloc(pixelCount * 4);

    for (let i = 0; i < pixelCount; i++) {
      outBuffer[i * 4 + 0] = inputRgb[i * 3 + 0];
      outBuffer[i * 4 + 1] = inputRgb[i * 3 + 1];
      outBuffer[i * 4 + 2] = inputRgb[i * 3 + 2];
      outBuffer[i * 4 + 3] = maskRaw[i]; // Alpha channel
    }

    await sharp(outBuffer, {
      raw: { width, height, channels: 4 }
    })
      .png({ compressionLevel: 6 })
      .toFile(outputPath);

  } else if (mode === 'white' || mode === 'black') {
    // Solid color background studio fill
    const bgR = mode === 'white' ? 255 : 18;
    const bgG = mode === 'white' ? 255 : 18;
    const bgB = mode === 'white' ? 255 : 22;

    const outBuffer = Buffer.alloc(pixelCount * 3);

    for (let i = 0; i < pixelCount; i++) {
      const alpha = maskRaw[i] / 255;
      outBuffer[i * 3 + 0] = Math.round(inputRgb[i * 3 + 0] * alpha + bgR * (1 - alpha));
      outBuffer[i * 3 + 1] = Math.round(inputRgb[i * 3 + 1] * alpha + bgG * (1 - alpha));
      outBuffer[i * 3 + 2] = Math.round(inputRgb[i * 3 + 2] * alpha + bgB * (1 - alpha));
    }

    await sharp(outBuffer, {
      raw: { width, height, channels: 3 }
    })
      .jpeg({ quality: 95, mozjpeg: true })
      .toFile(outputPath);
  }

  const processingTimeMs = Date.now() - startTime;

  const result: BackgroundResult = {
    success: true,
    referenceId,
    frameId: cleanFrameId,
    mode,
    imageUrl: outputUrl,
    mimeType,
    cached: false,
    dimensions: { width, height },
    processingTimeMs,
    appliedAt: new Date().toISOString()
  };

  saveBackgroundRecord(referenceId, cleanFrameId, mode, outputUrl);

  return result;
}

/**
 * Persists background variations in session directory
 */
function saveBackgroundRecord(referenceId: string, frameId: string, mode: BackgroundMode, imageUrl: string) {
  try {
    const sessionDir = path.join(process.cwd(), 'uploads', referenceId);
    const catalogPath = path.join(sessionDir, 'backgrounds.json');
    let records: StoredBackgroundVariations = {};
    if (fs.existsSync(catalogPath)) {
      try {
        records = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
      } catch (e) {
        records = {};
      }
    }
    if (!records[frameId]) {
      records[frameId] = {};
    }
    records[frameId][mode] = {
      imageUrl,
      appliedAt: new Date().toISOString()
    };
    fs.writeFileSync(catalogPath, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('[BackgroundEditor] Failed to persist background record:', err);
  }
}

/**
 * Retrieves stored background variations catalog
 */
export function getStoredBackgrounds(referenceId: string): StoredBackgroundVariations {
  try {
    const catalogPath = path.join(process.cwd(), 'uploads', referenceId, 'backgrounds.json');
    if (fs.existsSync(catalogPath)) {
      return JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    }
  } catch (err) {
    console.error('[BackgroundEditor] Failed to read background records:', err);
  }
  return {};
}
