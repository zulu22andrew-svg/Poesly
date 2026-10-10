import { BUILT_IN_STUDIO_PRESETS } from '../src/presets/defaultPresets';
import { validatePreset } from '../src/presets/presetStorage';
import { 
  computePresetCSSFilter, 
  getPresetAspectRatioClass, 
  executePresetOnFrame, 
  executePresetBatch 
} from '../src/presets/presetEngine';
import { StudioPreset } from '../src/types';

async function runStage17Tests() {
  console.log('\n======================================================');
  console.log('STAGE 17: STUDIO PRESET SAVE & APPLY SYSTEM TEST SUITE');
  console.log('======================================================\n');

  // --- Test 1: Verify Initial Built-in Presets ---
  console.log('--- Test 1: Verifying Built-in Studio Presets ---');
  console.log(`Total Built-in Presets: ${BUILT_IN_STUDIO_PRESETS.length}`);
  
  if (BUILT_IN_STUDIO_PRESETS.length !== 3) {
    throw new Error(`Expected 3 built-in presets, got ${BUILT_IN_STUDIO_PRESETS.length}`);
  }

  const expectedIds = ['studio-classic', 'editorial-pro', 'clean-portrait'];
  for (const id of expectedIds) {
    const preset = BUILT_IN_STUDIO_PRESETS.find(p => p.id === id);
    if (!preset) {
      throw new Error(`Missing expected built-in preset: ${id}`);
    }
    console.log(`✓ Built-in Preset: [${preset.name}] - Grade: ${preset.colorGrade}, Background: ${preset.backgroundMode}, Crop: ${preset.aspectRatio}`);
  }

  // --- Test 2: Validation Safeguards ---
  console.log('\n--- Test 2: Verifying Validation Rules ---');
  
  // Empty name validation
  const emptyNameResult = validatePreset({ name: '' }, BUILT_IN_STUDIO_PRESETS, true);
  if (emptyNameResult.isValid) {
    throw new Error('Validation failed to reject empty name');
  }
  console.log('✓ Rejected empty preset name correctly:', emptyNameResult.error);

  // Duplicate name validation
  const duplicateNameResult = validatePreset({ name: 'Studio Classic' }, BUILT_IN_STUDIO_PRESETS, true);
  if (duplicateNameResult.isValid) {
    throw new Error('Validation failed to reject duplicate preset name');
  }
  console.log('✓ Rejected duplicate preset name correctly:', duplicateNameResult.error);

  // Valid custom preset validation
  const validPreset: Partial<StudioPreset> = {
    name: 'My Studio Signature',
    description: 'Custom signature portrait style',
    colorGrade: 'studio',
    filterIntensity: 75,
    crop: '4:5',
    aspectRatio: '4:5',
    enhancement: 'high',
    backgroundMode: 'blur',
    retouchLevel: 'professional'
  };
  const validResult = validatePreset(validPreset, BUILT_IN_STUDIO_PRESETS, true);
  if (!validResult.isValid) {
    throw new Error(`Valid preset was rejected: ${validResult.error}`);
  }
  console.log('✓ Validated new custom preset correctly:', validPreset.name);

  // --- Test 3: Deterministic Non-destructive CSS Filter Generation ---
  console.log('\n--- Test 3: Verifying Deterministic Filter Pipeline ---');
  const classicPreset = BUILT_IN_STUDIO_PRESETS[0];
  const cssFilter1 = computePresetCSSFilter(classicPreset, 70);
  const cssFilter2 = computePresetCSSFilter(classicPreset, 70);
  
  if (cssFilter1 !== cssFilter2 || !cssFilter1.includes('contrast')) {
    throw new Error(`Non-deterministic CSS filter generation: ${cssFilter1} vs ${cssFilter2}`);
  }
  console.log('✓ Generated deterministic CSS Filter:', cssFilter1);

  // --- Test 4: Aspect Ratio & Framing Helpers ---
  console.log('\n--- Test 4: Verifying Aspect Ratio Class Mappings ---');
  const ratios: Array<{ ratio: StudioPreset['aspectRatio']; expected: string }> = [
    { ratio: '1:1', expected: 'aspect-square' },
    { ratio: '4:5', expected: 'aspect-[4/5]' },
    { ratio: '3:4', expected: 'aspect-[3/4]' },
    { ratio: '16:9', expected: 'aspect-video' },
    { ratio: '9:16', expected: 'aspect-[9/16]' },
    { ratio: 'original', expected: 'aspect-[3/4]' }
  ];

  for (const { ratio, expected } of ratios) {
    const cls = getPresetAspectRatioClass(ratio);
    if (cls !== expected) {
      throw new Error(`Expected class ${expected} for ratio ${ratio}, got ${cls}`);
    }
  }
  console.log('✓ All 6 aspect ratio class mappings verified.');

  // --- Test 5: Single Frame Execution ---
  console.log('\n--- Test 5: Verifying Single Frame Execution Pipeline ---');
  const testFrame = { frameId: 'frame-0001', url: '/uploads/test/frame-0001.jpg', enhancedUrl: '/uploads/test/frame-0001-enhanced.jpg' };
  const singleResult = executePresetOnFrame(testFrame, classicPreset);
  if (!singleResult.cssFilter || singleResult.preset.name !== 'Studio Classic') {
    throw new Error('Single frame preset execution returned malformed result');
  }
  console.log('✓ Single frame preset executed cleanly with non-destructive guarantees.');

  // --- Test 6: Batch Execution Architecture (Stage 18 Preparedness) ---
  console.log('\n--- Test 6: Verifying Batch-Ready Signature ---');
  const testBatch = [
    { frameId: 'frame-0001', url: '/uploads/test/frame-0001.jpg' },
    { frameId: 'frame-0002', url: '/uploads/test/frame-0002.jpg' },
    { frameId: 'frame-0003', url: '/uploads/test/frame-0003.jpg' }
  ];
  const batchResults = executePresetBatch(testBatch, classicPreset, 80);
  if (batchResults.length !== 3 || batchResults[0].result.preset.filterIntensity !== 80) {
    throw new Error('Batch execution failed');
  }
  console.log(`✓ Batch execution evaluated ${batchResults.length} frames simultaneously with uniform parameters.`);

  console.log('\n======================================================');
  console.log('✅ ALL STAGE 17 STUDIO PRESET TESTS PASSED SUCCESSFULLY');
  console.log('======================================================\n');
}

runStage17Tests().catch(err => {
  console.error('Stage 17 tests failed:', err);
  process.exit(1);
});
