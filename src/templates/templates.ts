import { TemplateRecipe } from '../types';
import { FILTER_PRESETS } from '../filters/presets';

/**
 * Stage 21 Built-In Professional Photo Template Recipes
 * 
 * Reusable professional editing recipes combining:
 * - Color grading & tone curves
 * - Background treatment (original / bokeh / cutout / white / black)
 * - Aspect ratio & crop
 * - Lighting treatment & retouch level
 * - Deterministic filter parameters & default intensity
 */
export const BUILT_IN_TEMPLATES: TemplateRecipe[] = [
  // ==========================================
  // PORTRAIT CATEGORY
  // ==========================================
  {
    id: 'natural-portrait',
    name: 'Natural Portrait',
    category: 'portrait',
    description: 'Clean, realistic professional portrait with organic skin tones and balanced contrast.',
    badge: 'Popular',
    colorGrade: 'natural',
    backgroundMode: 'original',
    aspectRatio: '4:5',
    retouchLevel: 'natural',
    enhancementLevel: 'enhanced-2x',
    lightingTreatment: 'Balanced Natural Sunlight',
    defaultIntensity: 70,
    tags: ['Clean', 'Realistic', 'Natural Tones', 'Everyday'],
    processingParameters: {
      ...FILTER_PRESETS.natural.parameters
    }
  },
  {
    id: 'luxury-portrait',
    name: 'Luxury Portrait',
    category: 'portrait',
    description: 'Premium, polished portrait look with velvety shadow roll-off and warm highlight glow.',
    badge: 'Pro Choice',
    colorGrade: 'editorial',
    backgroundMode: 'blur',
    aspectRatio: '4:5',
    retouchLevel: 'natural',
    enhancementLevel: 'enhanced-2x',
    lightingTreatment: 'Warm Golden Hour Softbox',
    defaultIntensity: 70,
    tags: ['Premium', 'Luxury', 'DSLR Bokeh', 'Golden Warmth'],
    processingParameters: {
      exposure: 0.03,
      contrast: 1.14,
      brightness: 1.02,
      saturation: 1.04,
      temperature: 2.8,
      tint: -0.8,
      highlights: -0.09,
      shadows: 0.05,
      clarity: 1.08,
      vignette: 0.08,
      channelGains: { r: 1.04, g: 1.01, b: 0.96 },
      toneCurve: { shadowsLift: 0.02, midtonesBoost: 0.04, highlightsRolloff: -0.06 }
    }
  },
  {
    id: 'editorial',
    name: 'Editorial',
    category: 'portrait',
    description: 'Fashion & magazine-inspired aesthetic with strong tonal separation and deep blacks.',
    badge: 'Fashion',
    colorGrade: 'editorial',
    backgroundMode: 'original',
    aspectRatio: '4:5',
    retouchLevel: 'editorial',
    enhancementLevel: 'enhanced-2x',
    lightingTreatment: 'High-Key Magazine Strobe',
    defaultIntensity: 70,
    tags: ['Fashion', 'High Contrast', 'Vogue', 'Filmic'],
    processingParameters: {
      ...FILTER_PRESETS.editorial.parameters
    }
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    category: 'portrait',
    description: 'Controlled cinematic contrast, anamorphic mood, and rich atmospheric depth.',
    badge: 'Dramatic',
    colorGrade: 'editorial',
    backgroundMode: 'blur',
    aspectRatio: '16:9',
    retouchLevel: 'studio',
    enhancementLevel: 'enhanced-2x',
    lightingTreatment: 'Anamorphic Split Toning',
    defaultIntensity: 70,
    tags: ['Cinematic', 'Widescreen', 'Atmospheric', 'Moody'],
    processingParameters: {
      exposure: 0.01,
      contrast: 1.18,
      brightness: 0.99,
      saturation: 0.95,
      temperature: 1.6,
      tint: -1.8,
      highlights: 0.04,
      shadows: -0.08,
      clarity: 1.12,
      vignette: 0.14,
      channelGains: { r: 1.03, g: 1.01, b: 0.97 },
      toneCurve: { shadowsLift: -0.05, midtonesBoost: 0.05, highlightsRolloff: 0.02 }
    }
  },

  // ==========================================
  // STUDIO CATEGORY
  // ==========================================
  {
    id: 'studio-classic',
    name: 'Studio Classic',
    category: 'studio',
    description: 'Clean commercial strobe appearance with sculpted contrast and crisp clarity.',
    badge: 'Standard',
    colorGrade: 'studio',
    backgroundMode: 'original',
    aspectRatio: '4:5',
    retouchLevel: 'studio',
    enhancementLevel: 'enhanced-2x',
    lightingTreatment: 'Classic 3-Point Studio Strobe',
    defaultIntensity: 70,
    tags: ['Studio', 'Strobe', 'Commercial', 'Crisp'],
    processingParameters: {
      ...FILTER_PRESETS.studio.parameters
    }
  },
  {
    id: 'soft-studio',
    name: 'Soft Studio',
    category: 'studio',
    description: 'Diffused octabox soft lighting with luminous highlights and natural skin softness.',
    badge: 'Gentle',
    colorGrade: 'studio',
    backgroundMode: 'blur',
    aspectRatio: '4:5',
    retouchLevel: 'natural',
    enhancementLevel: 'enhanced-2x',
    lightingTreatment: 'Octabox Diffused Softlight',
    defaultIntensity: 70,
    tags: ['Softbox', 'Gentle', 'Luminous', 'Smooth Skin'],
    processingParameters: {
      exposure: 0.03,
      contrast: 1.06,
      brightness: 1.03,
      saturation: 1.03,
      temperature: 0.8,
      tint: 0.5,
      highlights: -0.10,
      shadows: 0.07,
      clarity: 1.02,
      vignette: 0.04,
      channelGains: { r: 1.02, g: 1.01, b: 1.01 },
      toneCurve: { shadowsLift: 0.05, midtonesBoost: 0.03, highlightsRolloff: -0.08 }
    }
  },

  // ==========================================
  // PROFESSIONAL CATEGORY
  // ==========================================
  {
    id: 'corporate',
    name: 'Corporate',
    category: 'professional',
    description: 'Clean executive business portrait optimized for LinkedIn, team bios, and press kits.',
    badge: 'Executive',
    colorGrade: 'studio',
    backgroundMode: 'blur',
    aspectRatio: '4:5',
    retouchLevel: 'natural',
    enhancementLevel: 'enhanced-2x',
    lightingTreatment: 'Executive Keylight & Soft Fill',
    defaultIntensity: 70,
    tags: ['Executive', 'LinkedIn', 'Business', 'Sharp'],
    processingParameters: {
      exposure: 0.02,
      contrast: 1.10,
      brightness: 1.02,
      saturation: 1.02,
      temperature: -0.5,
      tint: 0.6,
      highlights: -0.06,
      shadows: 0.02,
      clarity: 1.08,
      vignette: 0.04,
      channelGains: { r: 1.02, g: 1.01, b: 1.01 },
      toneCurve: { shadowsLift: 0.01, midtonesBoost: 0.04, highlightsRolloff: -0.04 }
    }
  },
  {
    id: 'profile',
    name: 'Profile',
    category: 'professional',
    description: 'Square headshot framing with eye catchlights and background separation.',
    badge: 'Avatar',
    colorGrade: 'natural',
    backgroundMode: 'blur',
    aspectRatio: '1:1',
    retouchLevel: 'natural',
    enhancementLevel: 'enhanced-2x',
    lightingTreatment: 'Clean Catchlight Aperture',
    defaultIntensity: 70,
    tags: ['Avatar', 'Square 1:1', 'Resume', 'Clean Focus'],
    processingParameters: {
      exposure: 0.03,
      contrast: 1.07,
      brightness: 1.03,
      saturation: 1.04,
      temperature: 1.2,
      tint: 0.0,
      highlights: -0.05,
      shadows: 0.04,
      clarity: 1.07,
      vignette: 0.05,
      channelGains: { r: 1.02, g: 1.01, b: 0.99 },
      toneCurve: { shadowsLift: 0.03, midtonesBoost: 0.03, highlightsRolloff: -0.04 }
    }
  },

  // ==========================================
  // SOCIAL CATEGORY
  // ==========================================
  {
    id: 'social-clean',
    name: 'Social Clean',
    category: 'social',
    description: 'Vibrant and modern social-media-ready appearance that pops on mobile feeds.',
    badge: 'Trending',
    colorGrade: 'natural',
    backgroundMode: 'original',
    aspectRatio: '4:5',
    retouchLevel: 'subtle',
    enhancementLevel: 'enhanced-2x',
    lightingTreatment: 'Bright Ambient Daylight',
    defaultIntensity: 70,
    tags: ['Feed Ready', 'Vibrant', 'Crisp Colors', 'Modern'],
    processingParameters: {
      exposure: 0.04,
      contrast: 1.09,
      brightness: 1.04,
      saturation: 1.10,
      temperature: 1.5,
      tint: 0.0,
      highlights: -0.04,
      shadows: 0.06,
      clarity: 1.06,
      vignette: 0.03,
      channelGains: { r: 1.03, g: 1.01, b: 0.98 },
      toneCurve: { shadowsLift: 0.04, midtonesBoost: 0.04, highlightsRolloff: -0.03 }
    }
  },
  {
    id: 'social-portrait',
    name: 'Social Portrait',
    category: 'social',
    description: 'Vertical 9:16 portrait presentation with ring light catchlights and smooth glow.',
    badge: 'Stories',
    colorGrade: 'studio',
    backgroundMode: 'blur',
    aspectRatio: '9:16',
    retouchLevel: 'natural',
    enhancementLevel: 'enhanced-2x',
    lightingTreatment: 'Ring Light Glow & Bokeh',
    defaultIntensity: 70,
    tags: ['Stories', 'Vertical 9:16', 'Ring Light', 'Mobile'],
    processingParameters: {
      exposure: 0.03,
      contrast: 1.11,
      brightness: 1.03,
      saturation: 1.06,
      temperature: 0.5,
      tint: 0.8,
      highlights: -0.06,
      shadows: 0.03,
      clarity: 1.08,
      vignette: 0.06,
      channelGains: { r: 1.03, g: 1.01, b: 1.01 },
      toneCurve: { shadowsLift: 0.02, midtonesBoost: 0.04, highlightsRolloff: -0.05 }
    }
  },

  // ==========================================
  // SPECIAL CATEGORY
  // ==========================================
  {
    id: 'graduation',
    name: 'Graduation',
    category: 'special',
    description: 'Celebratory academic portrait with warm sunlight, crisp cap & gown definition, and soft bokeh.',
    badge: 'Academic',
    colorGrade: 'natural',
    backgroundMode: 'blur',
    aspectRatio: '4:5',
    retouchLevel: 'natural',
    enhancementLevel: 'enhanced-2x',
    lightingTreatment: 'Campus Golden Sunshine',
    defaultIntensity: 70,
    tags: ['Commencement', 'Academic', 'Celebratory', 'Warm'],
    processingParameters: {
      exposure: 0.04,
      contrast: 1.09,
      brightness: 1.04,
      saturation: 1.07,
      temperature: 2.2,
      tint: -0.4,
      highlights: -0.06,
      shadows: 0.05,
      clarity: 1.07,
      vignette: 0.05,
      channelGains: { r: 1.03, g: 1.01, b: 0.97 },
      toneCurve: { shadowsLift: 0.04, midtonesBoost: 0.03, highlightsRolloff: -0.04 }
    }
  },
  {
    id: 'wedding',
    name: 'Wedding',
    category: 'special',
    description: 'Ethereal romantic treatment with delicate highlight roll-off, soft pastel warmth, and dreamy depth.',
    badge: 'Romance',
    colorGrade: 'editorial',
    backgroundMode: 'blur',
    aspectRatio: '4:5',
    retouchLevel: 'natural',
    enhancementLevel: 'enhanced-2x',
    lightingTreatment: 'Romantic Ethereal Glow',
    defaultIntensity: 70,
    tags: ['Ethereal', 'Romance', 'Delicate', 'Dreamy Softness'],
    processingParameters: {
      exposure: 0.05,
      contrast: 1.06,
      brightness: 1.05,
      saturation: 0.98,
      temperature: 1.8,
      tint: 0.2,
      highlights: -0.12,
      shadows: 0.09,
      clarity: 1.02,
      vignette: 0.04,
      channelGains: { r: 1.03, g: 1.01, b: 0.98 },
      toneCurve: { shadowsLift: 0.07, midtonesBoost: 0.03, highlightsRolloff: -0.09 }
    }
  }
];

export const TEMPLATE_MAP: Record<string, TemplateRecipe> = BUILT_IN_TEMPLATES.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, TemplateRecipe>
);
