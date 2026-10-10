import { StudioPreset } from '../types';

/**
 * STAGE 17: BUILT-IN STUDIO PRESETS
 *
 * Professional baseline presets configured for consistent studio workflows.
 * Photographers can use these out-of-the-box or duplicate/customize them.
 */
export const BUILT_IN_STUDIO_PRESETS: StudioPreset[] = [
  {
    id: 'studio-classic',
    name: 'Studio Classic',
    description: 'Natural professional studio appearance with commercial strobe balance.',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    colorGrade: 'studio',
    filterIntensity: 70,
    crop: 'original',
    aspectRatio: 'original',
    enhancement: 'standard',
    backgroundMode: 'original',
    retouchLevel: 'professional',
    watermark: {
      enabled: false,
      text: 'Studio Classic',
      opacity: 40,
      position: 'bottom-right'
    },
    logo: {
      enabled: false,
      position: 'bottom-right',
      scale: 20
    },
    exportSettings: {
      format: 'jpeg',
      quality: 'maximum'
    }
  },
  {
    id: 'editorial-pro',
    name: 'Editorial Pro',
    description: 'Editorial color grade with professional contrast and subtle background blur.',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    colorGrade: 'editorial',
    filterIntensity: 80,
    crop: '4:5',
    aspectRatio: '4:5',
    enhancement: 'high',
    backgroundMode: 'blur',
    retouchLevel: 'professional',
    watermark: {
      enabled: false,
      text: 'Editorial Pro',
      opacity: 40,
      position: 'bottom-right'
    },
    logo: {
      enabled: false,
      position: 'bottom-right',
      scale: 20
    },
    exportSettings: {
      format: 'jpeg',
      quality: 'maximum'
    }
  },
  {
    id: 'clean-portrait',
    name: 'Clean Portrait',
    description: 'Natural skin tones and clean professional appearance with true-to-life color fidelity.',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    colorGrade: 'natural',
    filterIntensity: 70,
    crop: 'original',
    aspectRatio: 'original',
    enhancement: 'standard',
    backgroundMode: 'original',
    retouchLevel: 'natural',
    watermark: {
      enabled: false,
      text: 'Clean Portrait',
      opacity: 40,
      position: 'bottom-right'
    },
    logo: {
      enabled: false,
      position: 'bottom-right',
      scale: 20
    },
    exportSettings: {
      format: 'jpeg',
      quality: 'maximum'
    }
  }
];
