import { StudioPreset, AppliedPresetState, FilterPresetId, BackgroundMode, AspectRatioOption, EnhancementLevelOption, StudioRetouchLevel } from '../types';
import { BUILT_IN_STUDIO_PRESETS } from './defaultPresets';

const STORAGE_KEY = 'posely_studio_presets_v1';
const FRAME_PRESET_PREFIX = 'posely_frame_preset_';

/**
 * Validates a StudioPreset data object
 */
export function validatePreset(preset: Partial<StudioPreset>, existingPresets: StudioPreset[], isNew: boolean = false): { isValid: boolean; error?: string } {
  if (!preset.name || typeof preset.name !== 'string' || preset.name.trim().length === 0) {
    return { isValid: false, error: 'Preset name is required and cannot be empty.' };
  }

  if (preset.name.trim().length > 50) {
    return { isValid: false, error: 'Preset name cannot exceed 50 characters.' };
  }

  if (isNew) {
    const trimmedName = preset.name.trim().toLowerCase();
    const nameExists = existingPresets.some(p => p.name.trim().toLowerCase() === trimmedName);
    if (nameExists) {
      return { isValid: false, error: `A preset named "${preset.name.trim()}" already exists.` };
    }
  }

  if (typeof preset.filterIntensity === 'number' && (preset.filterIntensity < 0 || preset.filterIntensity > 100)) {
    return { isValid: false, error: 'Filter intensity must be between 0% and 100%.' };
  }

  const validColorGrades: FilterPresetId[] = ['none', 'natural', 'studio', 'editorial'];
  if (preset.colorGrade && !validColorGrades.includes(preset.colorGrade)) {
    return { isValid: false, error: `Invalid color grade "${preset.colorGrade}".` };
  }

  const validBgModes: BackgroundMode[] = ['original', 'blur', 'remove', 'white', 'black'];
  if (preset.backgroundMode && !validBgModes.includes(preset.backgroundMode)) {
    return { isValid: false, error: `Invalid background mode "${preset.backgroundMode}".` };
  }

  return { isValid: true };
}

/**
 * Loads all studio presets (combining built-in and user-saved presets)
 */
export function getStudioPresets(): StudioPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [...BUILT_IN_STUDIO_PRESETS];
    }

    const customPresets: StudioPreset[] = JSON.parse(raw);
    if (!Array.isArray(customPresets)) {
      console.warn('[StudioPresets] Corrupted presets in localStorage, reverting to built-ins');
      return [...BUILT_IN_STUDIO_PRESETS];
    }

    // Merge built-in presets with user presets (avoiding duplicate IDs)
    const customIds = new Set(customPresets.map(p => p.id));
    const nonOverriddenBuiltIns = BUILT_IN_STUDIO_PRESETS.filter(p => !customIds.has(p.id));

    return [...nonOverriddenBuiltIns, ...customPresets];
  } catch (err) {
    console.error('[StudioPresets] Failed to load presets:', err);
    return [...BUILT_IN_STUDIO_PRESETS];
  }
}

/**
 * Finds a preset by ID
 */
export function getStudioPresetById(id: string): StudioPreset | null {
  const all = getStudioPresets();
  return all.find(p => p.id === id) || null;
}

/**
 * Saves a new studio preset
 */
export function saveStudioPreset(data: Omit<StudioPreset, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'> & { id?: string }): { success: boolean; preset?: StudioPreset; error?: string } {
  try {
    const existing = getStudioPresets();
    const validation = validatePreset(data, existing, true);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const timestamp = new Date().toISOString();
    const generatedId = data.id || `preset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newPreset: StudioPreset = {
      id: generatedId,
      name: data.name.trim(),
      description: data.description ? data.description.trim() : '',
      isBuiltIn: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      colorGrade: data.colorGrade || 'natural',
      filterIntensity: typeof data.filterIntensity === 'number' ? data.filterIntensity : 70,
      crop: data.crop || 'original',
      aspectRatio: data.aspectRatio || 'original',
      enhancement: data.enhancement || 'standard',
      backgroundMode: data.backgroundMode || 'original',
      retouchLevel: data.retouchLevel || 'natural',
      watermark: data.watermark || { enabled: false, text: data.name.trim(), opacity: 40, position: 'bottom-right' },
      logo: data.logo || { enabled: false, position: 'bottom-right', scale: 20 },
      exportSettings: data.exportSettings || { format: 'jpeg', quality: 'maximum' }
    };

    const raw = localStorage.getItem(STORAGE_KEY);
    const customPresets: StudioPreset[] = raw ? JSON.parse(raw) : [];
    customPresets.unshift(newPreset);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(customPresets));
    return { success: true, preset: newPreset };
  } catch (err: any) {
    return { success: false, error: 'Failed to save preset: ' + (err.message || 'Unknown error') };
  }
}

/**
 * Updates an existing studio preset
 */
export function updateStudioPreset(id: string, updates: Partial<StudioPreset>): { success: boolean; preset?: StudioPreset; error?: string } {
  try {
    const existing = getStudioPresets();
    const current = existing.find(p => p.id === id);
    if (!current) {
      return { success: false, error: `Preset with ID "${id}" was not found.` };
    }

    const validation = validatePreset({ ...current, ...updates }, existing.filter(p => p.id !== id), false);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const timestamp = new Date().toISOString();
    const updatedPreset: StudioPreset = {
      ...current,
      ...updates,
      id: current.id,
      name: updates.name !== undefined ? updates.name.trim() : current.name,
      description: updates.description !== undefined ? updates.description.trim() : current.description,
      isBuiltIn: current.isBuiltIn,
      updatedAt: timestamp
    };

    const raw = localStorage.getItem(STORAGE_KEY);
    let customPresets: StudioPreset[] = raw ? JSON.parse(raw) : [];

    if (current.isBuiltIn) {
      // If editing a built-in preset, convert it to a customized version in user storage
      customPresets = customPresets.filter(p => p.id !== id);
      customPresets.unshift({ ...updatedPreset, isBuiltIn: false });
    } else {
      customPresets = customPresets.map(p => (p.id === id ? updatedPreset : p));
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(customPresets));
    return { success: true, preset: updatedPreset };
  } catch (err: any) {
    return { success: false, error: 'Failed to update preset: ' + (err.message || 'Unknown error') };
  }
}

/**
 * Deletes a studio preset (Preserves photos completely)
 */
export function deleteStudioPreset(id: string): { success: boolean; error?: string } {
  try {
    const isBuiltIn = BUILT_IN_STUDIO_PRESETS.some(p => p.id === id);
    const raw = localStorage.getItem(STORAGE_KEY);
    let customPresets: StudioPreset[] = raw ? JSON.parse(raw) : [];

    if (isBuiltIn) {
      // If it's a customized override of a built-in, remove the override to restore default
      const hasOverride = customPresets.some(p => p.id === id);
      if (hasOverride) {
        customPresets = customPresets.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customPresets));
        return { success: true };
      }
      return { success: false, error: 'Default built-in studio presets cannot be deleted.' };
    }

    customPresets = customPresets.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customPresets));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to delete preset: ' + (err.message || 'Unknown error') };
  }
}

/**
 * Frame-level applied preset state management
 */
export function getAppliedPresetForFrame(referenceId: string, frameId: string): AppliedPresetState | null {
  try {
    const key = `${FRAME_PRESET_PREFIX}${referenceId}_${frameId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAppliedPresetForFrame(referenceId: string, frameId: string, state: AppliedPresetState): void {
  try {
    const key = `${FRAME_PRESET_PREFIX}${referenceId}_${frameId}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error('[StudioPresets] Failed to save applied preset to frame:', e);
  }
}

export function clearAppliedPresetForFrame(referenceId: string, frameId: string): void {
  try {
    const key = `${FRAME_PRESET_PREFIX}${referenceId}_${frameId}`;
    localStorage.removeItem(key);
  } catch (e) {
    console.error('[StudioPresets] Failed to clear applied preset for frame:', e);
  }
}
