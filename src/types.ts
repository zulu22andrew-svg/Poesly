export interface PoseLandmark {
  name: string;
  x: number;
  y: number;
  visibility: number;
}

export interface PoseData {
  detected: boolean;
  confidence: number;
  landmarks?: PoseLandmark[];
  bbox?: { x: number; y: number; width: number; height: number };
  keyAngles?: {
    shoulders: number;
    torsoTilt: number;
    posture: 'upright' | 'slouched' | 'dynamic' | 'leaning';
  };
  reason?: string;
}

export interface FaceData {
  detected: boolean;
  confidence: number;
  bbox?: { x: number; y: number; width: number; height: number };
  eyes: {
    leftOpen: boolean;
    rightOpen: boolean;
    leftScore: number;
    rightScore: number;
    state: 'both_open' | 'one_closed' | 'both_closed';
  };
  expression: {
    type: 'smiling' | 'neutral' | 'open_mouth' | 'frowning';
    smileScore: number;
    isSmiling: boolean;
    confidence: number;
  };
  angle: {
    yaw: number;
    pitch: number;
    roll: number;
    orientation: 'facing_camera' | 'turned_left' | 'turned_right' | 'tilted_up' | 'tilted_down';
  };
  landmarksCount?: number;
  reason?: string;
}

export interface SharpnessData {
  score: number; // 0-100 normalized score
  variance: number; // raw Laplacian variance
  target: 'face' | 'full_frame';
  level: 'sharp' | 'soft' | 'blurry';
  bbox?: { x: number; y: number; width: number; height: number };
}

export interface QualityScoreBreakdown {
  sharpnessScore: number; // 0-100 (weight 40%)
  faceScore: number; // 0-100 (weight 35%)
  poseScore: number; // 0-100 (weight 25%)
  weights: {
    sharpness: number;
    face: number;
    pose: number;
  };
  penalties: string[];
  rawComposite: number;
}

export interface QualityScoreData {
  score: number; // 0-100 final composite quality score
  rank?: number; // 1-indexed rank among all frames
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  breakdown: QualityScoreBreakdown;
}

export interface FrameItem {
  id: string;
  url: string;
  timestamp?: number;
  pose?: PoseData;
  face?: FaceData;
  sharpness?: SharpnessData;
  quality?: QualityScoreData;
}

export interface EnhancedFrameData {
  success: boolean;
  referenceId: string;
  frameId: string;
  originalUrl: string;
  enhancedUrl: string;
  originalDimensions: { width: number; height: number };
  enhancedDimensions: { width: number; height: number };
  scaleFactor: number;
  modelUsed: string;
  processingTimeMs: number;
  faceEnhanced: boolean;
  enhancedAt: string;
}

export interface BatchEnhanceResult {
  success: boolean;
  referenceId: string;
  total: number;
  enhancedCount: number;
  failedCount: number;
  results: EnhancedFrameData[];
  failed: Array<{ frameId: string; error: string; originalUrl: string }>;
}

export interface SegmentationResult {
  success: boolean;
  referenceId: string;
  frameId: string;
  sourceType: 'enhanced' | 'original';
  sourceUrl: string;
  maskUrl: string;
  cutoutUrl: string;
  overlayUrl: string;
  dimensions: { width: number; height: number };
  subjectCoveragePct: number;
  averageConfidencePct: number;
  edgeGradientScore: number;
  confidenceStatus: 'high' | 'moderate' | 'low_confidence' | 'no_subject_detected';
  warningMessage?: string;
  processingTimeMs: number;
  segmentedAt: string;
}

export interface BatchSegmentResult {
  success: boolean;
  referenceId: string;
  total: number;
  segmentedCount: number;
  failedCount: number;
  results: SegmentationResult[];
  failed: Array<{ frameId: string; error: string; originalUrl: string }>;
}

export type BackgroundMode = 'original' | 'blur' | 'remove' | 'white' | 'black';

export interface BackgroundResult {
  success: boolean;
  referenceId: string;
  frameId: string;
  mode: BackgroundMode;
  imageUrl: string;
  mimeType: string;
  cached: boolean;
  dimensions?: { width: number; height: number };
  processingTimeMs: number;
  appliedAt: string;
}

export interface StoredBackgroundVariations {
  [frameId: string]: {
    [mode in BackgroundMode]?: {
      imageUrl: string;
      appliedAt: string;
    };
  };
}

// ==========================================
// STAGE 14: PROFESSIONAL STYLE FILTER SYSTEM (LUTs)
// ==========================================

export type FilterPresetId = 'none' | 'natural' | 'studio' | 'editorial';

export interface FilterParameters {
  exposure: number;       // EV offset, e.g. -1.0 to +1.0 (default 0)
  contrast: number;       // Multiplier, e.g. 0.5 to 2.0 (default 1.0)
  brightness: number;     // Multiplier, e.g. 0.5 to 2.0 (default 1.0)
  saturation: number;     // Multiplier, e.g. 0.0 to 2.0 (default 1.0)
  temperature: number;    // Warmth/Cool offset (-100 to +100, default 0)
  tint: number;           // Green/Magenta offset (-100 to +100, default 0)
  highlights: number;     // Highlight roll-off / compression (-1.0 to +1.0, default 0)
  shadows: number;        // Shadow lift / depth (-1.0 to +1.0, default 0)
  clarity: number;        // Midtone micro-contrast (0.5 to 2.0, default 1.0)
  vignette?: number;      // Subtle corner falloff (0.0 to 1.0, default 0)
  channelGains?: {
    r: number;
    g: number;
    b: number;
  };
  toneCurve?: {
    shadowsLift: number;
    midtonesBoost: number;
    highlightsRolloff: number;
  };
}

export interface FilterPreset {
  id: FilterPresetId;
  name: string;
  tagline: string;
  description: string;
  defaultIntensity: number; // e.g. 70
  accentColor: string;
  characteristics: string[];
  parameters: FilterParameters;
}

export interface ImageFilterState {
  selectedFilter: FilterPresetId;
  intensity: number; // 0 to 100
}

export interface FilterResult {
  success: boolean;
  referenceId: string;
  frameId: string;
  filterId: FilterPresetId;
  intensity: number;
  imageUrl: string;
  cached: boolean;
  processingTimeMs: number;
  appliedAt: string;
}

// ==========================================
// STAGE 15: FULL-RESOLUTION DOWNLOAD & EXPORT
// ==========================================

export type ExportFormat = 'jpeg' | 'png';

export interface ExportOptions {
  referenceId: string;
  frameId: string;
  backgroundMode?: BackgroundMode;
  filterId?: FilterPresetId;
  filterIntensity?: number;
  format?: 'auto' | 'jpeg' | 'png';
  sessionName?: string;
  customFilename?: string;
}

export interface ExportResult {
  success: boolean;
  referenceId: string;
  frameId: string;
  downloadUrl: string;
  filename: string;
  format: ExportFormat;
  dimensions: {
    width: number;
    height: number;
  };
  fileSizeBytes: number;
  formattedSize: string;
  processingTimeMs: number;
  cached: boolean;
  appliedPipeline: {
    enhanced: boolean;
    background: BackgroundMode;
    filter: FilterPresetId;
    intensity: number;
  };
  exportedAt: string;
}

export type ExportStatus = 'idle' | 'preparing' | 'processing' | 'ready' | 'error';

export interface ExportProgressState {
  status: ExportStatus;
  progressPercent: number;
  message: string;
  filename?: string;
  downloadUrl?: string;
  error?: string;
}

// ==========================================
// STAGE 17: STUDIO PRESET SAVE & APPLY SYSTEM
// ==========================================

export type EnhancementLevelOption = 'off' | 'standard' | 'high';
export type StudioRetouchLevel = 'natural' | 'professional';

export interface WatermarkConfig {
  enabled: boolean;
  text?: string;
  opacity?: number; // 0 to 100
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
}

export interface LogoConfig {
  enabled: boolean;
  url?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  scale?: number; // e.g. 10 to 50 %
}

export interface PresetExportSettings {
  format: 'auto' | 'jpeg' | 'png';
  quality: 'standard' | 'high' | 'maximum';
}

export interface StudioPreset {
  id: string;
  name: string;
  description?: string;
  isBuiltIn?: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Visual Pipeline Parameters
  colorGrade: FilterPresetId; // 'none' | 'natural' | 'studio' | 'editorial'
  filterIntensity: number; // 0 - 100 (default 70)
  crop: AspectRatioOption;
  aspectRatio: AspectRatioOption;
  enhancement: EnhancementLevelOption;
  backgroundMode: BackgroundMode;
  retouchLevel: StudioRetouchLevel;

  // Preset Configurations for Future / Optional Pipelines
  watermark?: WatermarkConfig;
  logo?: LogoConfig;
  exportSettings?: PresetExportSettings;
}

export interface AppliedPresetState {
  presetId: string;
  presetName: string;
  appliedAt: string;
  settings: StudioPreset;
}

export interface PresetExecutionResult {
  preset: StudioPreset;
  cssFilter: string;
  backgroundMode: BackgroundMode;
  aspectRatio: AspectRatioOption;
  enhancement: EnhancementLevelOption;
  retouchLevel: StudioRetouchLevel;
}


export type TemplateCategory = 'all' | 'portrait' | 'studio' | 'professional' | 'social' | 'special';

export type AspectRatioOption = 'original' | '1:1' | '4:5' | '9:16' | '16:9' | '3:4';

export type RetouchLevel = 'subtle' | 'natural' | 'studio' | 'editorial';

export interface TemplateRecipe {
  id: string;
  name: string;
  category: 'portrait' | 'studio' | 'professional' | 'social' | 'special';
  description: string;
  previewImage?: string;
  badge?: string;
  colorGrade: FilterPresetId;
  backgroundMode: BackgroundMode;
  aspectRatio: AspectRatioOption;
  retouchLevel: RetouchLevel;
  enhancementLevel: 'original' | 'enhanced-2x';
  lightingTreatment: string;
  processingParameters: FilterParameters;
  defaultIntensity: number; // 0 to 100 (default 70)
  tags: string[];
}

export interface AppliedTemplateState {
  templateId: string | null;
  intensity: number; // 0 to 100
  appliedAt?: string;
}

export interface TemplateExecutionResult {
  recipe: TemplateRecipe;
  effectiveParameters: FilterParameters;
  backgroundMode: BackgroundMode;
  aspectRatio: AspectRatioOption;
  intensity: number;
  cssFilter: string;
}

// ==========================================
// STAGE 18: BATCH PROCESSING UI & STUDIO FULL-SHOOT
// ==========================================

export type BatchItemType = 'video' | 'photo';

export type BatchItemStatus = 
  | 'queued'
  | 'uploading'
  | 'extracting'
  | 'analyzing'
  | 'ranking'
  | 'selecting_picks'
  | 'enhancing'
  | 'applying_preset'
  | 'exporting'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type BatchShootStatus = 
  | 'idle'
  | 'ready'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface BatchPipelineStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  detail?: string;
}

export interface BatchResultPhoto {
  id: string;
  batchItemId: string;
  sourceFilename: string;
  mediaType: BatchItemType;
  referenceId: string;
  frameId: string;
  previewUrl: string;
  originalUrl: string;
  enhancedUrl?: string;
  backgroundUrl?: string;
  filteredUrl?: string;
  downloadUrl?: string;
  quality?: QualityScoreData;
  rank?: number;
  appliedPreset: StudioPreset;
  exportedFilename?: string;
  exportedDimensions?: { width: number; height: number };
  exportedSize?: string;
  exportedAt?: string;
}

export interface BatchItem {
  id: string;
  batchId: string;
  filename: string;
  type: BatchItemType;
  fileSize: number;
  formattedSize: string;
  file?: File;
  localPreviewUrl?: string;
  status: BatchItemStatus;
  progress: number;
  currentStage: string;
  stages: BatchPipelineStep[];
  referenceId?: string;
  results: BatchResultPhoto[];
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface BatchShoot {
  id: string;
  name: string;
  createdAt: string;
  status: BatchShootStatus;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  processingFiles: number;
  queuedFiles: number;
  selectedPresetId: string;
  selectedPreset: StudioPreset;
  overallProgress: number;
  items: BatchItem[];
  completedAt?: string;
}

// ==========================================
// USER AUTHENTICATION & DEMO ACCOUNTS
// ==========================================

export type UserPlan = 'starter' | 'creator_pro' | 'studio_team';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  plan: UserPlan;
  role: string;
  creditsRemaining: number;
  monthlyAllotment?: number;
  shootsCompleted: number;
  isDemoAccount?: boolean;
  joinedDate: string;
  bio?: string;
  studioName?: string;
}



