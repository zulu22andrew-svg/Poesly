import { FilterPreset, FilterPresetId } from '../types';

/**
 * Stage 14: Professional Style Filter Presets (Deterministic LUT-grade color parameters)
 *
 * Each preset defines calibrated radiometric and color-grading parameters
 * designed to preserve skin tones, identity, and avoid clipping or banding.
 */
export const FILTER_PRESETS: Record<FilterPresetId, FilterPreset> = {
  none: {
    id: 'none',
    name: 'Original',
    tagline: 'Unfiltered Source',
    description: 'Crisp neural enhancement without color grading.',
    defaultIntensity: 0,
    accentColor: '#94a3b8',
    characteristics: [
      'Unmodified color balance',
      'True-to-source tones',
      'Neutral rendition'
    ],
    parameters: {
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
    }
  },

  natural: {
    id: 'natural',
    name: 'Natural',
    tagline: 'Clean & Realistic Pro Balance',
    description: 'Subtle professional color correction with natural skin tones and balanced contrast.',
    defaultIntensity: 70,
    accentColor: '#10b981', // emerald
    characteristics: [
      'Natural skin tones',
      'Balanced contrast (+5%)',
      'Neutral white balance',
      'Moderate natural saturation',
      'Clean highlights with roll-off',
      'Controlled open shadows'
    ],
    parameters: {
      exposure: 0.02,
      contrast: 1.05,
      brightness: 1.02,
      saturation: 1.03,
      temperature: 2.0, // subtle warmth for healthy skin
      tint: 0.0,
      highlights: -0.04, // slight highlight recovery
      shadows: 0.05, // gently lifted shadows
      clarity: 1.04,
      vignette: 0.02,
      channelGains: { r: 1.02, g: 1.005, b: 0.99 },
      toneCurve: { shadowsLift: 0.04, midtonesBoost: 0.02, highlightsRolloff: -0.03 }
    }
  },

  studio: {
    id: 'studio',
    name: 'Studio',
    tagline: 'Polished Commercial Lighting',
    description: 'Crisp lighting, sculpted contrast, and richer colors inspired by commercial strobe setups.',
    defaultIntensity: 70,
    accentColor: '#a855f7', // purple
    characteristics: [
      'Clean punchy contrast (+12%)',
      'Controlled softbox highlights',
      'Slightly richer skin tones',
      'Professional tonal balance',
      'Micro-contrast clarity (+10%)',
      'Polished studio look'
    ],
    parameters: {
      exposure: 0.04,
      contrast: 1.12,
      brightness: 1.03,
      saturation: 1.08,
      temperature: -1.5, // crisp daylight studio strobe
      tint: 1.0,
      highlights: -0.08, // softbox specular control
      shadows: -0.04, // deep, clean studio blacks
      clarity: 1.10,
      vignette: 0.06,
      channelGains: { r: 1.03, g: 1.01, b: 1.02 },
      toneCurve: { shadowsLift: -0.02, midtonesBoost: 0.05, highlightsRolloff: -0.06 }
    }
  },

  editorial: {
    id: 'editorial',
    name: 'Editorial',
    tagline: 'Vogue & High-Fashion Aesthetics',
    description: 'Sophisticated tonal separation, deep velvety shadows, and creamy magazine highlights.',
    defaultIntensity: 70,
    accentColor: '#f59e0b', // amber / gold
    characteristics: [
      'Strong tonal separation (+20% contrast)',
      'Sophisticated cinematic mood',
      'Controlled, elegant saturation',
      'Deep velvety shadows',
      'Creamy fashion highlights',
      'Preserves facial identity'
    ],
    parameters: {
      exposure: 0.0,
      contrast: 1.20,
      brightness: 0.98,
      saturation: 0.92, // controlled magazine palette
      temperature: 3.5, // warm golden tones
      tint: -1.5, // subtle editorial split-toning
      highlights: 0.06, // luminous highlights
      shadows: -0.12, // deep editorial blacks
      clarity: 1.14,
      vignette: 0.12,
      channelGains: { r: 1.05, g: 1.01, b: 0.95 },
      toneCurve: { shadowsLift: -0.08, midtonesBoost: 0.06, highlightsRolloff: 0.04 }
    }
  }
};

export const AVAILABLE_PRESETS: FilterPreset[] = [
  FILTER_PRESETS.natural,
  FILTER_PRESETS.studio,
  FILTER_PRESETS.editorial
];
