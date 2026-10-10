import { 
  BatchShoot, 
  BatchItem, 
  BatchResultPhoto, 
  StudioPreset, 
  BatchPipelineStep,
  FrameItem
} from '../types';
import { BUILT_IN_STUDIO_PRESETS } from '../presets/defaultPresets';

export const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB

export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
export const SUPPORTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const SUPPORTED_EXTENSIONS = ['.mp4', '.mov', '.webm', '.jpg', '.jpeg', '.png', '.webp'];

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export interface ValidationResult {
  validFiles: Array<{ file: File; type: 'video' | 'photo' }>;
  errors: string[];
}

/**
 * Validates files for batch shoot upload
 */
export function validateBatchFiles(files: FileList | File[]): ValidationResult {
  const validFiles: Array<{ file: File; type: 'video' | 'photo' }> = [];
  const errors: string[] = [];

  const fileArray = Array.from(files);

  if (fileArray.length === 0) {
    errors.push('No files were selected.');
    return { validFiles, errors };
  }

  for (const file of fileArray) {
    const filename = file.name;
    const ext = '.' + (filename.split('.').pop() || '').toLowerCase();
    const mime = file.type.toLowerCase();

    // Check empty files
    if (file.size === 0) {
      errors.push(`"${filename}" is empty (0 bytes) and cannot be processed.`);
      continue;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push(`"${filename}" exceeds the 200MB limit (${formatBytes(file.size)}).`);
      continue;
    }

    // Check media type
    const isVideo = SUPPORTED_VIDEO_TYPES.includes(mime) || ['.mp4', '.mov', '.webm'].includes(ext);
    const isPhoto = SUPPORTED_PHOTO_TYPES.includes(mime) || ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);

    if (isVideo) {
      validFiles.push({ file, type: 'video' });
    } else if (isPhoto) {
      validFiles.push({ file, type: 'photo' });
    } else {
      errors.push(`"${filename}" has an unsupported format. Supported: MP4, MOV, WEBM (video) & JPG, PNG, WEBP (photo).`);
    }
  }

  return { validFiles, errors };
}

export function createDefaultPipelineSteps(type: 'video' | 'photo'): BatchPipelineStep[] {
  if (type === 'video') {
    return [
      { id: 'upload', label: 'Upload Video', status: 'pending' },
      { id: 'extraction', label: 'Frame Extraction (2 FPS)', status: 'pending' },
      { id: 'vision_analysis', label: 'Pose & Face Analysis', status: 'pending' },
      { id: 'quality_ranking', label: 'Sharpness & Quality Score', status: 'pending' },
      { id: 'top_picks', label: 'Top Picks Selection', status: 'pending' },
      { id: 'enhancement', label: 'Neural Super-Resolution', status: 'pending' },
      { id: 'preset_style', label: 'Studio Preset & Color Grade', status: 'pending' },
      { id: 'export', label: 'Full-Resolution Master Export', status: 'pending' }
    ];
  } else {
    return [
      { id: 'upload', label: 'Upload Photo', status: 'pending' },
      { id: 'ingestion', label: 'Photo Ingestion & Quality Analysis', status: 'pending' },
      { id: 'vision_analysis', label: 'Pose, Face & Sharpness Score', status: 'pending' },
      { id: 'enhancement', label: 'Neural Enhancement', status: 'pending' },
      { id: 'preset_style', label: 'Studio Preset & Color Grade', status: 'pending' },
      { id: 'export', label: 'Full-Resolution Master Export', status: 'pending' }
    ];
  }
}

/**
 * Initializes a new BatchShoot object from validated files and chosen preset
 */
export function createInitialBatchShoot(
  name: string,
  filesWithTypes: Array<{ file: File; type: 'video' | 'photo' }>,
  preset: StudioPreset = BUILT_IN_STUDIO_PRESETS[0]
): BatchShoot {
  const shootId = 'shoot_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const shootName = name.trim() || `Studio Shoot - ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

  const items: BatchItem[] = filesWithTypes.map(({ file, type }, idx) => {
    let localPreviewUrl: string | undefined = undefined;
    if (type === 'photo') {
      try {
        localPreviewUrl = URL.createObjectURL(file);
      } catch (e) {
        // Fallback
      }
    }

    return {
      id: `${shootId}_item_${idx + 1}`,
      batchId: shootId,
      filename: file.name,
      type,
      fileSize: file.size,
      formattedSize: formatBytes(file.size),
      file,
      localPreviewUrl,
      status: 'queued',
      progress: 0,
      currentStage: 'Queued in Shoot',
      stages: createDefaultPipelineSteps(type),
      results: [],
      createdAt: new Date().toISOString()
    };
  });

  return {
    id: shootId,
    name: shootName,
    createdAt: new Date().toISOString(),
    status: 'ready',
    totalFiles: items.length,
    completedFiles: 0,
    failedFiles: 0,
    processingFiles: 0,
    queuedFiles: items.length,
    selectedPresetId: preset.id,
    selectedPreset: preset,
    overallProgress: 0,
    items
  };
}

function updateStepStatus(
  stages: BatchPipelineStep[], 
  stepId: string, 
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  detail?: string
): BatchPipelineStep[] {
  return stages.map(s => {
    if (s.id === stepId) {
      return { ...s, status, detail: detail || s.detail };
    }
    return s;
  });
}

/**
 * Executes full pipeline processing on a single batch item using existing API endpoints
 */
export async function processBatchItem(
  item: BatchItem,
  preset: StudioPreset,
  onUpdate: (updatedItem: BatchItem) => void,
  abortSignal?: AbortSignal
): Promise<BatchItem> {
  let currentItem: BatchItem = {
    ...item,
    status: 'uploading',
    progress: 5,
    currentStage: 'Uploading file...'
  };

  const updateItem = (props: Partial<BatchItem>) => {
    currentItem = { ...currentItem, ...props };
    onUpdate(currentItem);
  };

  try {
    if (abortSignal?.aborted) {
      throw new Error('Processing cancelled by user');
    }

    if (!currentItem.file) {
      throw new Error('Missing file reference for item');
    }

    // ==========================================
    // 1. Upload file via /api/upload
    // ==========================================
    updateItem({
      stages: updateStepStatus(currentItem.stages, 'upload', 'in_progress', 'Uploading to studio storage...'),
      currentStage: 'Uploading to studio...',
      progress: 10
    });

    const formData = new FormData();
    formData.append('file', currentItem.file);

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal: abortSignal
    });

    if (!uploadRes.ok) {
      const errJson = await uploadRes.json().catch(() => ({}));
      throw new Error(errJson.error || `Upload failed with status ${uploadRes.status}`);
    }

    const uploadData = await uploadRes.json();
    const referenceId = uploadData.referenceId;
    const serverFilename = uploadData.filename;

    updateItem({
      referenceId,
      stages: updateStepStatus(currentItem.stages, 'upload', 'completed', 'Uploaded successfully'),
      progress: 25
    });

    if (abortSignal?.aborted) throw new Error('Processing cancelled by user');

    // ==========================================
    // 2. Ingest & Analyze media
    // ==========================================
    let candidateFrames: FrameItem[] = [];

    if (currentItem.type === 'video') {
      updateItem({
        status: 'extracting',
        currentStage: 'Extracting frames & analyzing pose/faces...',
        stages: updateStepStatus(
          updateStepStatus(currentItem.stages, 'extraction', 'in_progress', 'FFmpeg extracting at 2 FPS...'),
          'vision_analysis', 'in_progress'
        ),
        progress: 35
      });

      const processRes = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceId, filename: serverFilename }),
        signal: abortSignal
      });

      if (!processRes.ok) {
        const errJson = await processRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Video frame extraction & analysis failed');
      }

      const processData = await processRes.json();
      candidateFrames = processData.frames || [];

      if (candidateFrames.length === 0) {
        throw new Error('No valid frames could be extracted from video');
      }

      updateItem({
        stages: updateStepStatus(
          updateStepStatus(currentItem.stages, 'extraction', 'completed', `Extracted ${candidateFrames.length} frames`),
          'vision_analysis', 'completed', 'Detected pose, face expressions & orientation'
        ),
        progress: 50
      });
    } else {
      // Photo pipeline
      updateItem({
        status: 'analyzing',
        currentStage: 'Ingesting photo & evaluating quality...',
        stages: updateStepStatus(
          updateStepStatus(currentItem.stages, 'ingestion', 'in_progress', 'Normalizing image data...'),
          'vision_analysis', 'in_progress'
        ),
        progress: 35
      });

      const photoRes = await fetch('/api/process-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceId, filename: serverFilename }),
        signal: abortSignal
      });

      if (!photoRes.ok) {
        const errJson = await photoRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Photo analysis failed');
      }

      const photoData = await photoRes.json();
      candidateFrames = photoData.frames || [];

      if (candidateFrames.length === 0) {
        throw new Error('Photo analysis did not produce candidate frame');
      }

      updateItem({
        stages: updateStepStatus(
          updateStepStatus(currentItem.stages, 'ingestion', 'completed', 'Photo ingested'),
          'vision_analysis', 'completed', 'Pose, facial biometrics & sharpness scored'
        ),
        progress: 50
      });
    }

    if (abortSignal?.aborted) throw new Error('Processing cancelled by user');

    // ==========================================
    // 3. Top Picks Selection
    // ==========================================
    let selectedPicks: FrameItem[] = [];

    if (currentItem.type === 'video') {
      updateItem({
        status: 'selecting_picks',
        currentStage: 'Selecting best ranked frames...',
        stages: updateStepStatus(
          updateStepStatus(currentItem.stages, 'quality_ranking', 'completed', 'Composite scores ranked'),
          'top_picks', 'in_progress', 'Filtering top moments'
        ),
        progress: 60
      });

      // Select top frames (excellent/good ratings or top 3 frames)
      const sortedByRank = [...candidateFrames].sort((a, b) => (a.quality?.rank ?? 999) - (b.quality?.rank ?? 999));
      const topApproved = sortedByRank.filter(f => f.quality?.rating === 'excellent' || f.quality?.rating === 'good');
      
      // If approved list has candidates, take top up to 4, else fallback to top 2 highest scoring frames
      selectedPicks = topApproved.length > 0 ? topApproved.slice(0, 4) : sortedByRank.slice(0, 2);

      updateItem({
        stages: updateStepStatus(currentItem.stages, 'top_picks', 'completed', `Selected ${selectedPicks.length} best photos`),
        progress: 65
      });
    } else {
      selectedPicks = candidateFrames.slice(0, 1);
    }

    if (abortSignal?.aborted) throw new Error('Processing cancelled by user');

    // ==========================================
    // 4. Enhance, Apply Preset & Export for each top pick
    // ==========================================
    updateItem({
      status: 'enhancing',
      currentStage: `Enhancing ${selectedPicks.length} photo${selectedPicks.length > 1 ? 's' : ''}...`,
      stages: updateStepStatus(currentItem.stages, 'enhancement', 'in_progress', 'Neural super-resolution (GFPGAN)...'),
      progress: 70
    });

    const results: BatchResultPhoto[] = [];

    for (let i = 0; i < selectedPicks.length; i++) {
      if (abortSignal?.aborted) throw new Error('Processing cancelled by user');

      const pick = selectedPicks[i];
      let previewUrl = pick.url;
      let enhancedUrl: string | undefined = undefined;
      let backgroundUrl: string | undefined = undefined;
      let filteredUrl: string | undefined = undefined;
      let downloadUrl: string | undefined = undefined;
      let exportedFilename: string | undefined = undefined;
      let exportedDimensions: { width: number; height: number } | undefined = undefined;
      let exportedSize: string | undefined = undefined;

      // 4a. Super Resolution if preset specifies enhancement
      if (preset.enhancement && preset.enhancement !== 'off') {
        const scale = preset.enhancement === 'high' ? 2 : 2;
        try {
          const enhanceRes = await fetch('/api/enhance-frame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referenceId, frameId: pick.id, scale }),
            signal: abortSignal
          });
          if (enhanceRes.ok) {
            const enhanceData = await enhanceRes.json();
            enhancedUrl = enhanceData.enhancedUrl;
            previewUrl = enhancedUrl || previewUrl;
          }
        } catch (enhErr) {
          console.warn('[BatchItem] Enhancement warning, proceeding with original:', enhErr);
        }
      }

      // 4b. Background treatment if preset specifies
      if (preset.backgroundMode && preset.backgroundMode !== 'original') {
        try {
          const bgRes = await fetch('/api/apply-background', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referenceId,
              frameId: pick.id,
              mode: preset.backgroundMode,
              blurSigma: 20
            }),
            signal: abortSignal
          });
          if (bgRes.ok) {
            const bgData = await bgRes.json();
            backgroundUrl = bgData.imageUrl;
            previewUrl = backgroundUrl || previewUrl;
          }
        } catch (bgErr) {
          console.warn('[BatchItem] Background treatment warning:', bgErr);
        }
      }

      // 4c. Color grading filter if preset specifies
      if (preset.colorGrade && preset.colorGrade !== 'none') {
        try {
          const filterRes = await fetch('/api/apply-filter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referenceId,
              frameId: pick.id,
              filterId: preset.colorGrade,
              intensity: preset.filterIntensity || 70,
              backgroundMode: preset.backgroundMode || 'original'
            }),
            signal: abortSignal
          });
          if (filterRes.ok) {
            const filterData = await filterRes.json();
            filteredUrl = filterData.imageUrl;
            previewUrl = filteredUrl || previewUrl;
          }
        } catch (filtErr) {
          console.warn('[BatchItem] Filter grade warning:', filtErr);
        }
      }

      // 4d. Full-Resolution Master Export
      try {
        const exportRes = await fetch('/api/export-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceId,
            frameId: pick.id,
            backgroundMode: preset.backgroundMode || 'original',
            filterId: preset.colorGrade || 'none',
            filterIntensity: preset.filterIntensity || 70,
            format: preset.exportSettings?.format || 'auto',
            sessionName: 'studio-shoot'
          }),
          signal: abortSignal
        });

        if (exportRes.ok) {
          const exportData = await exportRes.json();
          downloadUrl = exportData.downloadUrl;
          exportedFilename = exportData.filename;
          exportedDimensions = exportData.dimensions;
          exportedSize = exportData.formattedSize;
          if (exportData.downloadUrl) {
            previewUrl = exportData.downloadUrl;
          }
        }
      } catch (expErr) {
        console.warn('[BatchItem] Export warning:', expErr);
      }

      results.push({
        id: `${referenceId}_${pick.id}`,
        batchItemId: currentItem.id,
        sourceFilename: currentItem.filename,
        mediaType: currentItem.type,
        referenceId,
        frameId: pick.id,
        previewUrl,
        originalUrl: pick.url,
        enhancedUrl,
        backgroundUrl,
        filteredUrl,
        downloadUrl: downloadUrl || previewUrl,
        quality: pick.quality,
        rank: pick.quality?.rank,
        appliedPreset: preset,
        exportedFilename,
        exportedDimensions,
        exportedSize,
        exportedAt: new Date().toISOString()
      });
    }

    // ==========================================
    // 5. Finalize item completion
    // ==========================================
    updateItem({
      status: 'completed',
      currentStage: `Completed (${results.length} photo${results.length > 1 ? 's' : ''} generated)`,
      stages: updateStepStatus(
        updateStepStatus(
          updateStepStatus(currentItem.stages, 'enhancement', 'completed', 'Enhanced high-res details'),
          'preset_style', 'completed', `Applied preset "${preset.name}"`
        ),
        'export', 'completed', 'Master exports generated'
      ),
      results,
      progress: 100,
      completedAt: new Date().toISOString()
    });

    return currentItem;
  } catch (err: any) {
    console.error(`[BatchItem] Error processing ${item.filename}:`, err);
    
    const isCancelled = abortSignal?.aborted || err.message?.includes('cancelled');
    const status = isCancelled ? 'cancelled' : 'failed';
    const errorMsg = err.message || 'Processing failed';

    // Mark current in-progress stage as failed
    const updatedStages = currentItem.stages.map(s => {
      if (s.status === 'in_progress') {
        return { ...s, status: 'failed' as const, detail: errorMsg };
      }
      return s;
    });

    updateItem({
      status,
      currentStage: isCancelled ? 'Processing cancelled' : `Failed: ${errorMsg}`,
      stages: updatedStages,
      error: errorMsg,
      completedAt: new Date().toISOString()
    });

    return currentItem;
  }
}

/**
 * Orchestrates full batch processing with concurrency control and live updates
 */
export async function processBatchShoot(
  shoot: BatchShoot,
  callbacks: {
    onProgress: (updatedShoot: BatchShoot) => void;
    abortController?: AbortController;
    concurrency?: number;
  }
): Promise<BatchShoot> {
  const { onProgress, abortController, concurrency = 2 } = callbacks;
  let currentShoot: BatchShoot = {
    ...shoot,
    status: 'processing'
  };

  const notifyShoot = (props: Partial<BatchShoot>) => {
    currentShoot = { ...currentShoot, ...props };

    // Recompute counts
    const completedFiles = currentShoot.items.filter(i => i.status === 'completed').length;
    const failedFiles = currentShoot.items.filter(i => i.status === 'failed').length;
    const processingFiles = currentShoot.items.filter(i => 
      !['completed', 'failed', 'cancelled', 'queued'].includes(i.status)
    ).length;
    const queuedFiles = currentShoot.items.filter(i => i.status === 'queued').length;
    
    const total = currentShoot.items.length;
    const overallProgress = total > 0 
      ? Math.round(currentShoot.items.reduce((acc, it) => acc + (it.progress || 0), 0) / total)
      : 0;

    currentShoot.completedFiles = completedFiles;
    currentShoot.failedFiles = failedFiles;
    currentShoot.processingFiles = processingFiles;
    currentShoot.queuedFiles = queuedFiles;
    currentShoot.overallProgress = overallProgress;

    onProgress({ ...currentShoot });
  };

  notifyShoot({ status: 'processing' });

  // Get items needing processing (queued or retrying)
  const itemsToProcess = currentShoot.items.filter(i => i.status === 'queued' || i.status === 'failed');

  if (itemsToProcess.length === 0) {
    notifyShoot({ status: 'completed' });
    return currentShoot;
  }

  // Process items with concurrency pool
  let activeIndex = 0;

  const worker = async () => {
    while (activeIndex < itemsToProcess.length) {
      if (abortController?.signal.aborted) {
        break;
      }

      const item = itemsToProcess[activeIndex++];
      await processBatchItem(
        item,
        currentShoot.selectedPreset,
        (updatedItem) => {
          const updatedItems = currentShoot.items.map(i => i.id === updatedItem.id ? updatedItem : i);
          notifyShoot({ items: updatedItems });
        },
        abortController?.signal
      );
    }
  };

  const pool = [];
  const workerCount = Math.min(concurrency, itemsToProcess.length);
  for (let i = 0; i < workerCount; i++) {
    pool.push(worker());
  }

  await Promise.all(pool);

  const isAborted = abortController?.signal.aborted;
  const finalStatus = isAborted 
    ? 'cancelled' 
    : (currentShoot.items.some(i => i.status === 'failed') && currentShoot.items.every(i => i.status === 'failed') ? 'failed' : 'completed');

  notifyShoot({
    status: finalStatus,
    completedAt: new Date().toISOString()
  });

  return currentShoot;
}
