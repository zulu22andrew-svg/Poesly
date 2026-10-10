import React, { useState, useEffect, useRef } from 'react';
import { 
  BatchShoot, 
  BatchItem, 
  StudioPreset, 
  BatchResultPhoto 
} from '../types';
import { getStudioPresets } from '../presets/presetStorage';
import { BUILT_IN_STUDIO_PRESETS } from '../presets/defaultPresets';
import { 
  createInitialBatchShoot, 
  processBatchShoot, 
  processBatchItem 
} from '../batch/batchOrchestrator';
import BatchUploadZone from '../components/batch/BatchUploadZone';
import BatchPresetSelector from '../components/batch/BatchPresetSelector';
import BatchDashboardHeader from '../components/batch/BatchDashboardHeader';
import BatchQueueItem from '../components/batch/BatchQueueItem';
import BatchResultsGrid from '../components/batch/BatchResultsGrid';
import BatchCancelModal from '../components/batch/BatchCancelModal';
import { 
  Layers, 
  Sparkles, 
  UploadCloud, 
  Video, 
  Image as ImageIcon, 
  SlidersHorizontal,
  FolderKanban,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOCAL_STORAGE_BATCH_KEY = 'posely_latest_studio_shoot_v1';

export default function StudioBatch() {
  const navigate = useNavigate();
  const presets = getStudioPresets();
  const [selectedPreset, setSelectedPreset] = useState<StudioPreset>(presets[0] || BUILT_IN_STUDIO_PRESETS[0]);
  const [shoot, setShoot] = useState<BatchShoot | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Restore previous shoot from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BATCH_KEY);
      if (saved) {
        const parsed: BatchShoot = JSON.parse(saved);
        if (parsed && parsed.items && parsed.items.length > 0) {
          setShoot(parsed);
          if (parsed.selectedPreset) {
            setSelectedPreset(parsed.selectedPreset);
          }
        }
      }
    } catch (e) {
      console.warn('[StudioBatch] Could not restore saved shoot:', e);
    }
  }, []);

  // Persist shoot changes to localStorage
  const updateShootState = (newShoot: BatchShoot | null) => {
    setShoot(newShoot);
    if (newShoot) {
      try {
        // Strip out non-serializable File objects before saving to localStorage
        const sanitizedShoot = {
          ...newShoot,
          items: newShoot.items.map(it => ({
            ...it,
            file: undefined
          }))
        };
        localStorage.setItem(LOCAL_STORAGE_BATCH_KEY, JSON.stringify(sanitizedShoot));
      } catch (e) {
        console.warn('[StudioBatch] Failed to persist shoot to localStorage:', e);
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_BATCH_KEY);
    }
  };

  // Handle files added from Upload Zone
  const handleFilesSelected = (filesWithTypes: Array<{ file: File; type: 'video' | 'photo' }>) => {
    if (!shoot || shoot.status === 'completed' || shoot.status === 'cancelled') {
      // Create brand new shoot
      const newShoot = createInitialBatchShoot('', filesWithTypes, selectedPreset);
      updateShootState(newShoot);
    } else {
      // Append files to existing shoot
      const newItems: BatchItem[] = filesWithTypes.map(({ file, type }, idx) => {
        let localPreviewUrl: string | undefined = undefined;
        if (type === 'photo') {
          try {
            localPreviewUrl = URL.createObjectURL(file);
          } catch (e) {
            // fallback
          }
        }

        return {
          id: `${shoot.id}_item_${shoot.items.length + idx + 1}`,
          batchId: shoot.id,
          filename: file.name,
          type,
          fileSize: file.size,
          formattedSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          file,
          localPreviewUrl,
          status: 'queued',
          progress: 0,
          currentStage: 'Queued in Shoot',
          stages: shoot.items[0]?.stages.map(s => ({ ...s, status: 'pending' as const })) || [],
          results: [],
          createdAt: new Date().toISOString()
        };
      });

      const updatedItems = [...shoot.items, ...newItems];
      const updatedShoot: BatchShoot = {
        ...shoot,
        items: updatedItems,
        totalFiles: updatedItems.length,
        queuedFiles: updatedItems.filter(i => i.status === 'queued').length,
        status: 'ready'
      };

      updateShootState(updatedShoot);
    }
  };

  // Handle Preset change
  const handlePresetChange = (preset: StudioPreset) => {
    setSelectedPreset(preset);
    if (shoot && shoot.status !== 'processing') {
      updateShootState({
        ...shoot,
        selectedPresetId: preset.id,
        selectedPreset: preset
      });
    }
  };

  // Start Batch Processing
  const handleStartProcessing = async () => {
    if (!shoot || shoot.items.length === 0 || shoot.status === 'processing') return;

    abortControllerRef.current = new AbortController();

    try {
      await processBatchShoot(shoot, {
        concurrency: 2,
        abortController: abortControllerRef.current,
        onProgress: (updatedShoot) => {
          updateShootState(updatedShoot);
        }
      });
    } catch (err) {
      console.error('[StudioBatch] Batch process error:', err);
    } finally {
      abortControllerRef.current = null;
    }
  };

  // Cancel Batch Processing
  const handleCancelProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (shoot) {
      const updatedShoot: BatchShoot = {
        ...shoot,
        status: 'cancelled'
      };
      updateShootState(updatedShoot);
    }
  };

  // Retry Failed Items in Batch
  const handleRetryFailed = async () => {
    if (!shoot || shoot.status === 'processing') return;

    // Reset failed items to queued
    const updatedItems = shoot.items.map(it => {
      if (it.status === 'failed') {
        return {
          ...it,
          status: 'queued' as const,
          progress: 0,
          currentStage: 'Queued for retry',
          error: undefined,
          stages: it.stages.map(s => ({ ...s, status: 'pending' as const }))
        };
      }
      return it;
    });

    const refreshedShoot: BatchShoot = {
      ...shoot,
      items: updatedItems,
      failedFiles: 0,
      queuedFiles: updatedItems.filter(i => i.status === 'queued').length,
      status: 'ready'
    };

    updateShootState(refreshedShoot);

    // Automatically trigger processing on the refreshed shoot
    abortControllerRef.current = new AbortController();
    try {
      await processBatchShoot(refreshedShoot, {
        concurrency: 2,
        abortController: abortControllerRef.current,
        onProgress: (updated) => {
          updateShootState(updated);
        }
      });
    } catch (err) {
      console.error('[StudioBatch] Retry error:', err);
    } finally {
      abortControllerRef.current = null;
    }
  };

  // Retry Single Failed Item
  const handleRetrySingleItem = async (itemId: string) => {
    if (!shoot || shoot.status === 'processing') return;

    const itemToRetry = shoot.items.find(i => i.id === itemId);
    if (!itemToRetry) return;

    const updatedItems = shoot.items.map(it => {
      if (it.id === itemId) {
        return {
          ...it,
          status: 'queued' as const,
          progress: 0,
          currentStage: 'Queued for retry',
          error: undefined,
          stages: it.stages.map(s => ({ ...s, status: 'pending' as const }))
        };
      }
      return it;
    });

    const updatedShoot = {
      ...shoot,
      items: updatedItems
    };
    updateShootState(updatedShoot);

    // Process just this single item
    try {
      await processBatchItem(
        { ...itemToRetry, status: 'queued', error: undefined, stages: itemToRetry.stages.map(s => ({ ...s, status: 'pending' as const })) },
        shoot.selectedPreset,
        (updatedItem) => {
          const reItems = shoot.items.map(i => i.id === updatedItem.id ? updatedItem : i);
          const completedFiles = reItems.filter(i => i.status === 'completed').length;
          const failedFiles = reItems.filter(i => i.status === 'failed').length;
          updateShootState({
            ...shoot,
            items: reItems,
            completedFiles,
            failedFiles
          });
        }
      );
    } catch (err) {
      console.error('[StudioBatch] Single item retry error:', err);
    }
  };

  // Remove queued item before processing starts
  const handleRemoveItem = (itemId: string) => {
    if (!shoot || shoot.status === 'processing') return;

    const updatedItems = shoot.items.filter(i => i.id !== itemId);
    if (updatedItems.length === 0) {
      updateShootState(null);
    } else {
      updateShootState({
        ...shoot,
        items: updatedItems,
        totalFiles: updatedItems.length,
        queuedFiles: updatedItems.filter(i => i.status === 'queued').length
      });
    }
  };

  // Reset and start new shoot
  const handleStartNewShoot = () => {
    if (shoot?.status === 'processing') {
      setIsCancelModalOpen(true);
      return;
    }
    updateShootState(null);
  };

  // Collect all generated results across items
  const allResults: BatchResultPhoto[] = shoot
    ? shoot.items.flatMap(it => it.results || [])
    : [];

  const scrollToResults = () => {
    const el = document.getElementById('studio-results-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isProcessing = shoot?.status === 'processing';

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#252533] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Studio Batch Processing
              </h1>
              <p className="text-xs sm:text-sm text-[#8A8A98]">
                Process full studio shoots with multiple videos and photos through the complete vision AI & enhancement pipeline.
              </p>
            </div>
          </div>
        </div>

        {/* Global Preset Indicator */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#181824] border border-[#2B2B38] flex items-center gap-2.5 text-xs">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-[#7A7A8C] block text-[10px]">Active Preset</span>
              <span className="font-bold text-white">{selectedPreset.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Upload Zone */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#7A7A8C] flex items-center gap-2">
            <span>1. Media Ingestion</span>
          </h3>
          {shoot && shoot.totalFiles > 0 && (
            <span className="text-xs text-purple-400 font-medium">
              {shoot.totalFiles} files in shoot
            </span>
          )}
        </div>
        <BatchUploadZone
          onFilesSelected={handleFilesSelected}
          disabled={isProcessing}
        />
      </section>

      {/* 2. Preset Selector */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#7A7A8C]">
          2. Signature Studio Look
        </h3>
        <BatchPresetSelector
          selectedPreset={selectedPreset}
          onSelectPreset={handlePresetChange}
          disabled={isProcessing}
        />
      </section>

      {/* 3. Batch Queue & Progress Dashboard */}
      {shoot && shoot.items.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#7A7A8C]">
              3. Processing Queue & Pipeline Status
            </h3>
          </div>

          {/* Dashboard Header Bar */}
          <BatchDashboardHeader
            shoot={shoot}
            onStartProcessing={handleStartProcessing}
            onCancelProcessing={() => setIsCancelModalOpen(true)}
            onRetryFailed={handleRetryFailed}
            onStartNewShoot={handleStartNewShoot}
            onScrollToResults={allResults.length > 0 ? scrollToResults : undefined}
          />

          {/* Queue Items List */}
          <div className="space-y-3">
            {shoot.items.map((item) => (
              <BatchQueueItem
                key={item.id}
                item={item}
                preset={shoot.selectedPreset}
                onRetry={handleRetrySingleItem}
                onRemove={handleRemoveItem}
                onOpenResult={(refId, frameId) => navigate(`/enhanced?id=${refId}&frameId=${frameId}`)}
                isProcessingBatch={isProcessing}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Best Photos Results Grid */}
      {allResults.length > 0 && (
        <section className="space-y-4">
          <BatchResultsGrid
            results={allResults}
            preset={shoot?.selectedPreset || selectedPreset}
          />
        </section>
      )}

      {/* Cancel Shoot Confirmation Modal */}
      <BatchCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirmCancel={handleCancelProcessing}
        completedCount={shoot?.completedFiles || 0}
      />
    </div>
  );
}
