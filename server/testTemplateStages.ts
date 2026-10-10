import { BUILT_IN_TEMPLATES, TEMPLATE_MAP } from '../src/templates/templates';
import { 
  getAllTemplates, 
  getTemplatesByCategory, 
  getTemplateById, 
  interpolateTemplateParameters, 
  computeTemplateCSSFilter, 
  executeTemplate 
} from '../src/templates/templateEngine';
import { TemplateCategory } from '../src/types';

async function runStage21Tests() {
  console.log('\n======================================================');
  console.log('STAGE 21: BUILT-IN PROFESSIONAL TEMPLATES TEST SUITE');
  console.log('======================================================\n');

  // --- Test 1: Verify Initial Built-in Templates ---
  console.log('--- Test 1: Verifying Initial Built-in Templates ---');
  const all = getAllTemplates();
  console.log(`Total Templates Loaded: ${all.length}`);
  
  if (all.length !== 12) {
    throw new Error(`Expected 12 templates, got ${all.length}`);
  }

  const expectedTemplateIds = [
    'natural-portrait', 'luxury-portrait', 'editorial', 'cinematic',
    'studio-classic', 'soft-studio',
    'corporate', 'profile',
    'social-clean', 'social-portrait',
    'graduation', 'wedding'
  ];

  for (const id of expectedTemplateIds) {
    const template = getTemplateById(id);
    if (!template) {
      throw new Error(`Missing expected template: ${id}`);
    }
    console.log(`✓ Template [${template.name}] (${template.category}) - ${template.description}`);
  }

  // --- Test 2: Verify Categories ---
  console.log('\n--- Test 2: Verifying Categories ---');
  const categories: TemplateCategory[] = ['all', 'portrait', 'studio', 'professional', 'social', 'special'];

  for (const cat of categories) {
    const list = getTemplatesByCategory(cat);
    console.log(`Category "${cat}": ${list.length} templates`);
    if (cat !== 'all' && list.length === 0) {
      throw new Error(`Category ${cat} is empty!`);
    }
  }

  // --- Test 3: Verify Template Recipe Structure ---
  console.log('\n--- Test 3: Verifying Recipe Parameters ---');
  const luxury = getTemplateById('luxury-portrait')!;
  if (!luxury.processingParameters || typeof luxury.processingParameters.contrast !== 'number') {
    throw new Error('Luxury portrait template missing valid processing parameters');
  }
  console.log('Luxury Portrait Recipe:', {
    category: luxury.category,
    colorGrade: luxury.colorGrade,
    backgroundMode: luxury.backgroundMode,
    aspectRatio: luxury.aspectRatio,
    lighting: luxury.lightingTreatment,
    defaultIntensity: luxury.defaultIntensity
  });

  // --- Test 4: Verify Intensity Interpolation (0% vs 50% vs 70% vs 100%) ---
  console.log('\n--- Test 4: Verifying Intensity Interpolation ---');
  const p0 = interpolateTemplateParameters(luxury, 0);
  const p50 = interpolateTemplateParameters(luxury, 50);
  const p70 = interpolateTemplateParameters(luxury, 70);
  const p100 = interpolateTemplateParameters(luxury, 100);

  console.log('Intensity 0% (Neutral):', { contrast: p0.contrast, brightness: p0.brightness, saturation: p0.saturation });
  console.log('Intensity 50% (Subtle):', { contrast: p50.contrast, brightness: p50.brightness, saturation: p50.saturation });
  console.log('Intensity 70% (Pro Default):', { contrast: p70.contrast, brightness: p70.brightness, saturation: p70.saturation });
  console.log('Intensity 100% (Full Recipe):', { contrast: p100.contrast, brightness: p100.brightness, saturation: p100.saturation });

  if (p0.contrast !== 1.0 || p0.brightness !== 1.0) {
    throw new Error('0% intensity should produce neutral parameters');
  }
  if (p100.contrast <= p50.contrast) {
    throw new Error('100% intensity should have stronger contrast than 50%');
  }

  // --- Test 5: Verify CSS Filter Generation for 0ms Previews ---
  console.log('\n--- Test 5: Verifying Real-time CSS Filter Generation ---');
  const cssFilter70 = computeTemplateCSSFilter(luxury, 70);
  console.log(`CSS Filter (70%): "${cssFilter70}"`);
  if (!cssFilter70 || cssFilter70 === 'none') {
    throw new Error('CSS filter string should not be empty for 70% intensity');
  }

  // --- Test 6: Verify Execute Template Output ---
  console.log('\n--- Test 6: Verifying Full Template Execution ---');
  const execResult = executeTemplate(luxury, 70);
  console.log('Executed Template State:', {
    id: execResult.recipe.id,
    backgroundMode: execResult.backgroundMode,
    aspectRatio: execResult.aspectRatio,
    intensity: execResult.intensity,
    filter: execResult.cssFilter
  });
  if (execResult.backgroundMode !== 'blur' || execResult.intensity !== 70) {
    throw new Error('Execution result mismatch');
  }

  console.log('\n======================================================');
  console.log('ALL STAGE 21 TEMPLATE TESTS COMPLETED WITH 100% SUCCESS!');
  console.log('======================================================\n');
}

runStage21Tests().catch(err => {
  console.error('Stage 21 test failure:', err);
  process.exit(1);
});
