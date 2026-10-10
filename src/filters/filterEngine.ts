import { FilterParameters, FilterPreset, FilterPresetId } from '../types';
import { FILTER_PRESETS } from './presets';

/**
 * Filter Engine: Core deterministic color grading & interpolation module
 */

export const NEUTRAL_PARAMETERS: FilterParameters = {
  exposure: 0.0,
  contrast: 1.0,
  brightness: 1.0,
  saturation: 1.0,
  temperature: 0.0,
  tint: 0.0,
  highlights: 0.0,
  shadows: 0.0,
  clarity: 1.0,
  vignette: 0.0,
  channelGains: { r: 1.0, g: 1.0, b: 1.0 },
  toneCurve: { shadowsLift: 0.0, midtonesBoost: 0.0, highlightsRolloff: 0.0 }
};

/**
 * Linearly interpolates between neutral (0% intensity) and preset target (100% intensity)
 */
export function interpolateParameters(presetId: FilterPresetId, intensity: number): FilterParameters {
  const clampedIntensity = Math.max(0, Math.min(100, intensity));
  if (presetId === 'none' || clampedIntensity === 0) {
    return { ...NEUTRAL_PARAMETERS };
  }

  const preset = FILTER_PRESETS[presetId] || FILTER_PRESETS.none;
  const t = clampedIntensity / 100.0;
  const p = preset.parameters;

  const lerp = (a: number, b: number) => a + (b - a) * t;

  return {
    exposure: lerp(0.0, p.exposure),
    contrast: lerp(1.0, p.contrast),
    brightness: lerp(1.0, p.brightness),
    saturation: lerp(1.0, p.saturation),
    temperature: lerp(0.0, p.temperature),
    tint: lerp(0.0, p.tint),
    highlights: lerp(0.0, p.highlights),
    shadows: lerp(0.0, p.shadows),
    clarity: lerp(1.0, p.clarity),
    vignette: lerp(0.0, p.vignette || 0.0),
    channelGains: {
      r: lerp(1.0, p.channelGains?.r ?? 1.0),
      g: lerp(1.0, p.channelGains?.g ?? 1.0),
      b: lerp(1.0, p.channelGains?.b ?? 1.0)
    },
    toneCurve: {
      shadowsLift: lerp(0.0, p.toneCurve?.shadowsLift ?? 0.0),
      midtonesBoost: lerp(0.0, p.toneCurve?.midtonesBoost ?? 0.0),
      highlightsRolloff: lerp(0.0, p.toneCurve?.highlightsRolloff ?? 0.0)
    }
  };
}

/**
 * Computes deterministic CSS filter string for instant 0ms latency rendering
 */
export function computeCSSFilterString(params: FilterParameters): string {
  // 1. Brightness from exposure + brightness
  const exposureMultiplier = Math.pow(2, params.exposure);
  const effectiveBrightness = params.brightness * exposureMultiplier;

  // 2. Contrast
  const effectiveContrast = params.contrast;

  // 3. Saturation
  const effectiveSaturation = params.saturation;

  // 4. Hue rotation from tint & temperature
  const effectiveHue = params.tint * 1.5; // subtle degree shift

  // 5. Sepia / Warmth blend from temperature
  const sepiaFactor = params.temperature > 0 ? Math.min(0.25, (params.temperature / 100) * 0.25) : 0;

  const filters: string[] = [];
  if (Math.abs(effectiveBrightness - 1.0) > 0.001) {
    filters.push(`brightness(${effectiveBrightness.toFixed(3)})`);
  }
  if (Math.abs(effectiveContrast - 1.0) > 0.001) {
    filters.push(`contrast(${effectiveContrast.toFixed(3)})`);
  }
  if (Math.abs(effectiveSaturation - 1.0) > 0.001) {
    filters.push(`saturate(${effectiveSaturation.toFixed(3)})`);
  }
  if (Math.abs(effectiveHue) > 0.1) {
    filters.push(`hue-rotate(${effectiveHue.toFixed(1)}deg)`);
  }
  if (sepiaFactor > 0.005) {
    filters.push(`sepia(${sepiaFactor.toFixed(3)})`);
  }

  return filters.length > 0 ? filters.join(' ') : 'none';
}

/**
 * Computes an SVG 5x4 color matrix for precise temperature, tint, and channel gains
 */
export function computeSVGColorMatrix(params: FilterParameters): string {
  const rGain = (params.channelGains?.r ?? 1.0) * (1 + params.temperature * 0.005);
  const gGain = (params.channelGains?.g ?? 1.0) * (1 - Math.abs(params.tint) * 0.003);
  const bGain = (params.channelGains?.b ?? 1.0) * (1 - params.temperature * 0.005);

  const shadowLift = (params.toneCurve?.shadowsLift ?? 0.0) * 0.08;
  const rOffset = shadowLift * 0.8;
  const gOffset = shadowLift * 0.8;
  const bOffset = shadowLift * 0.8;

  // 5x4 matrix format:
  // R_out = rGain*R + 0*G + 0*B + 0*A + rOffset
  // G_out = 0*R + gGain*G + 0*B + 0*A + gOffset
  // B_out = 0*R + 0*G + bGain*B + 0*A + bOffset
  // A_out = 0*R + 0*G + 0*B + 1*A + 0
  return [
    `${rGain.toFixed(4)} 0 0 0 ${rOffset.toFixed(4)}`,
    `0 ${gGain.toFixed(4)} 0 0 ${gOffset.toFixed(4)}`,
    `0 0 ${bGain.toFixed(4)} 0 ${bOffset.toFixed(4)}`,
    `0 0 0 1 0`
  ].join(' ');
}

/**
 * Deterministically applies filter parameters to HTML Canvas pixel data
 */
export function applyFilterToCanvas(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  params: FilterParameters,
  targetCanvas: HTMLCanvasElement
): void {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const width = sourceImage instanceof HTMLImageElement ? sourceImage.naturalWidth : sourceImage.width;
  const height = sourceImage instanceof HTMLImageElement ? sourceImage.naturalHeight : sourceImage.height;

  if (targetCanvas.width !== width || targetCanvas.height !== height) {
    targetCanvas.width = width;
    targetCanvas.height = height;
  }

  // Draw source image
  ctx.drawImage(sourceImage, 0, 0);

  // If parameters are neutral, return directly
  if (
    params.contrast === 1.0 &&
    params.brightness === 1.0 &&
    params.saturation === 1.0 &&
    params.exposure === 0.0 &&
    params.temperature === 0.0 &&
    params.tint === 0.0 &&
    params.highlights === 0.0 &&
    params.shadows === 0.0 &&
    (!params.channelGains || (params.channelGains.r === 1 && params.channelGains.g === 1 && params.channelGains.b === 1))
  ) {
    return;
  }

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Precompute tone curves and lookup tables
  const expMult = Math.pow(2, params.exposure);
  const bright = params.brightness * expMult;
  const contrast = params.contrast;
  const sat = params.saturation;

  const tempR = 1 + params.temperature * 0.005;
  const tempB = 1 - params.temperature * 0.005;
  const tintG = 1 + params.tint * 0.003;

  const rGain = (params.channelGains?.r ?? 1.0) * tempR;
  const gGain = (params.channelGains?.g ?? 1.0) * tintG;
  const bGain = (params.channelGains?.b ?? 1.0) * tempB;

  const shadowLift = (params.toneCurve?.shadowsLift ?? 0.0) * 20;
  const highlightRoll = (params.toneCurve?.highlightsRolloff ?? 0.0) * 15;

  // Process pixels deterministically
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue; // Skip transparent pixels

    // 1. Channel gains + White Balance
    r *= rGain;
    g *= gGain;
    b *= bGain;

    // 2. Exposure & Brightness
    r *= bright;
    g *= bright;
    b *= bright;

    // 3. Contrast around midtone 128
    r = 128 + (r - 128) * contrast;
    g = 128 + (g - 128) * contrast;
    b = 128 + (b - 128) * contrast;

    // 4. Tone Curve (Shadows lift / Highlights rolloff)
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const shadowWeight = Math.max(0, 1.0 - lum / 128);
    const highlightWeight = Math.max(0, (lum - 128) / 128);

    const toneAdj = shadowWeight * shadowLift + highlightWeight * highlightRoll;
    r += toneAdj;
    g += toneAdj;
    b += toneAdj;

    // 5. Saturation
    if (sat !== 1.0) {
      const currentLum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = currentLum + (r - currentLum) * sat;
      g = currentLum + (g - currentLum) * sat;
      b = currentLum + (b - currentLum) * sat;
    }

    // Clamp
    data[i] = Math.min(255, Math.max(0, Math.round(r)));
    data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
    data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
  }

  ctx.putImageData(imgData, 0, 0);
}
