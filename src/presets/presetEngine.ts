import { StudioPreset, PresetExecutionResult, AspectRatioOption, FilterParameters } from '../types';
import { interpolateParameters, computeCSSFilterString } from '../filters/filterEngine';

/**
 * STAGE 17: STUDIO PRESET PROCESSING ENGINE
 *
 * Deterministic, non-destructive execution pipeline:
 * Photo -> Studio Preset -> Enhancement Selection -> Background Mode -> Filter System -> Studio Look
 *
 * Designed with a reusable batch-ready signature ready for Stage 18.
 */

/**
 * Computes deterministic CSS filter string from a Studio Preset's color grade and intensity
 */
export function computePresetCSSFilter(preset: StudioPreset, customIntensity?: number): string {
  const intensity = typeof customIntensity === 'number' ? customIntensity : preset.filterIntensity;
  const params: FilterParameters = interpolateParameters(preset.colorGrade, intensity);
  return computeCSSFilterString(params);
}

/**
 * Returns Tailwind CSS aspect ratio class corresponding to preset crop option
 */
export function getPresetAspectRatioClass(aspectRatio: AspectRatioOption): string {
  switch (aspectRatio) {
    case '1:1':
      return 'aspect-square';
    case '4:5':
      return 'aspect-[4/5]';
    case '3:4':
      return 'aspect-[3/4]';
    case '16:9':
      return 'aspect-video';
    case '9:16':
      return 'aspect-[9/16]';
    case 'original':
    default:
      return 'aspect-[3/4]';
  }
}

/**
 * Executes a preset on a single frame in a purely non-destructive manner.
 * Evaluates the visual configuration without altering original source images.
 */
export function executePresetOnFrame(
  frame: { frameId: string; url: string; enhancedUrl?: string },
  preset: StudioPreset,
  customIntensity?: number
): PresetExecutionResult {
  const intensity = typeof customIntensity === 'number' ? customIntensity : preset.filterIntensity;
  const cssFilter = computePresetCSSFilter(preset, intensity);

  return {
    preset: {
      ...preset,
      filterIntensity: intensity
    },
    cssFilter,
    backgroundMode: preset.backgroundMode,
    aspectRatio: preset.aspectRatio,
    enhancement: preset.enhancement,
    retouchLevel: preset.retouchLevel
  };
}

/**
 * Batch-ready execution helper for Stage 18.
 * Applies the same deterministic preset across multiple photos in a single pass.
 */
export function executePresetBatch(
  frames: Array<{ frameId: string; url: string; enhancedUrl?: string }>,
  preset: StudioPreset,
  customIntensity?: number
): Array<{ frameId: string; url: string; result: PresetExecutionResult }> {
  return frames.map(frame => ({
    frameId: frame.frameId,
    url: frame.url,
    result: executePresetOnFrame(frame, preset, customIntensity)
  }));
}
