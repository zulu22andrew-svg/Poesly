import { AspectRatioOption, BackgroundMode, FilterParameters, TemplateCategory, TemplateExecutionResult, TemplateRecipe } from '../types';
import { BUILT_IN_TEMPLATES, TEMPLATE_MAP } from './templates';
import { NEUTRAL_PARAMETERS, computeCSSFilterString } from '../filters/filterEngine';

/**
 * Stage 21: Professional Template Engine
 * 
 * Modular service responsible for:
 * - Template recipe resolution and category filtering
 * - Continuous deterministic parameter interpolation based on intensity (0%–100%)
 * - Seamless integration with existing Filter (LUT) engine, Background segmenter, and GFPGAN upscaler
 * - Safe non-destructive previewing and zero-degradation template switching
 */

export function getTemplateById(id: string): TemplateRecipe | undefined {
  return TEMPLATE_MAP[id];
}

export function getAllTemplates(): TemplateRecipe[] {
  return BUILT_IN_TEMPLATES;
}

export function getTemplatesByCategory(category: TemplateCategory): TemplateRecipe[] {
  if (category === 'all') {
    return BUILT_IN_TEMPLATES;
  }
  return BUILT_IN_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Linearly interpolates template parameters based on intensity (0% - 100%)
 * 0% = neutral unfiltered original
 * 100% = full template recipe
 */
export function interpolateTemplateParameters(
  template: TemplateRecipe,
  intensity: number
): FilterParameters {
  const clampedIntensity = Math.max(0, Math.min(100, intensity));
  if (clampedIntensity === 0) {
    return { ...NEUTRAL_PARAMETERS };
  }

  const t = clampedIntensity / 100.0;
  const p = template.processingParameters;
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
 * Computes instant real-time CSS filter style for template previews
 */
export function computeTemplateCSSFilter(
  template: TemplateRecipe,
  intensity: number
): string {
  const effectiveParams = interpolateTemplateParameters(template, intensity);
  return computeCSSFilterString(effectiveParams);
}

/**
 * Converts aspect ratio option into Tailwind CSS aspect-ratio classes
 */
export function getAspectRatioClass(aspectRatio: AspectRatioOption): string {
  switch (aspectRatio) {
    case '1:1':
      return 'aspect-square';
    case '4:5':
      return 'aspect-[4/5]';
    case '9:16':
      return 'aspect-[9/16]';
    case '16:9':
      return 'aspect-[16/9]';
    case '3:4':
      return 'aspect-[3/4]';
    case 'original':
    default:
      return 'aspect-[4/3]';
  }
}

/**
 * Evaluates the full execution state of a template
 */
export function executeTemplate(
  template: TemplateRecipe,
  intensity: number = 70
): TemplateExecutionResult {
  const effectiveParams = interpolateTemplateParameters(template, intensity);
  const cssFilter = computeCSSFilterString(effectiveParams);

  // If intensity is 0, background remains original
  const effectiveBgMode: BackgroundMode = intensity === 0 ? 'original' : template.backgroundMode;

  return {
    recipe: template,
    effectiveParameters: effectiveParams,
    backgroundMode: effectiveBgMode,
    aspectRatio: template.aspectRatio,
    intensity,
    cssFilter
  };
}
