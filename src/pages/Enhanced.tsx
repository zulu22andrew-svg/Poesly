import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Sparkles, Download, ArrowLeft, RefreshCw, CheckCircle2, 
  AlertTriangle, Eye, Sliders, ZoomIn, ZoomOut, 
  Wand2, ChevronRight, ChevronLeft, X, Check, 
  FolderDown, ArrowRight, Cpu, Scissors, Droplets,
  Image as ImageIcon, Square, Palette, Layers, SlidersHorizontal, RotateCcw,
  LayoutTemplate
} from 'lucide-react';
import { 
  EnhancedFrameData, FrameItem, BackgroundMode, BackgroundResult, 
  StoredBackgroundVariations, FilterPresetId, FilterPreset 
} from '../types';
import { FILTER_PRESETS, AVAILABLE_PRESETS } from '../filters/presets';
import { interpolateParameters, computeCSSFilterString } from '../filters/filterEngine';
import FilterSelector from '../components/FilterSelector';
import ExportButton from '../components/ExportButton';
import { exportAndDownloadPhoto } from '../services/exportService';

interface EnhancedItemState {
  frameId: string;
  originalUrl: string;
  enhancedUrl?: string;
  originalDimensions?: { width: number; height: number };
  enhancedDimensions?: { width: number; height: number };
  scaleFactor?: number;
  modelUsed?: string;
  processingTimeMs?: number;
  faceEnhanced?: boolean;
  error?: string;
  status: 'pending' | 'enhancing' | 'completed' | 'failed';
  // Background manipulation state
  activeBgMode: BackgroundMode;
  bgVariations: Partial<Record<BackgroundMode, string>>;
  isBgApplying: boolean;
  bgError?: string;
  // Stage 14 Style Filter state
  activeFilterId: FilterPresetId;
  filterIntensity: number; // 0 - 100
  isPeekingOriginal?: boolean;
}

export default function Enhanced() {
  const [searchParams] = useSearchParams();

  const referenceIdParam = searchParams.get('id') || searchParams.get('ref');
  const framesParam = searchParams.get('frames'); // e.g. "frame-0001,frame-0004"

  const [referenceId, setReferenceId] = useState<string>(referenceIdParam || '');
  const [items, setItems] = useState<EnhancedItemState[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [activeScale] = useState<number>(2);

  // Fullscreen Inspector
  const [inspectIndex, setInspectIndex] = useState<number | null>(null);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [comparisonMode, setComparisonMode] = useState<'split' | 'side-by-side'>('split');

  // Batch download state
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Timer for processing feedback
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isProcessingBatch) {
      const start = Date.now();
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - start) / 1000));
      }, 500);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [isProcessingBatch]);

  // Initial load: parse frames, check existing enhancements & background variations
  useEffect(() => {
    let activeId = referenceIdParam;
    if (!activeId) {
      const savedId = localStorage.getItem('posely_latest_session');
      if (savedId) activeId = savedId;
    }

    if (!activeId) {
      // Fallback: load latest session
      fetch('/api/latest-session')
        .then(res => res.json())
        .then(data => {
          if (data.referenceId) {
            setReferenceId(data.referenceId);
            initEnhancements(data.referenceId, framesParam);
          }
        })
        .catch(() => {});
    } else {
      setReferenceId(activeId);
      initEnhancements(activeId, framesParam);
    }
  }, [referenceIdParam, framesParam]);

  const initEnhancements = async (refId: string, framesQuery: string | null) => {
    try {
      // 1. Fetch existing enhancements already generated
      const enhRes = await fetch(`/api/enhanced-frames/${refId}`);
      const enhData = enhRes.ok ? await enhRes.json() : { enhancements: {} };
      const existingEnhancements: Record<string, EnhancedFrameData> = enhData.enhancements || {};

      // 2. Fetch existing background variations
      const bgRes = await fetch(`/api/backgrounds/${refId}`);
      const bgData = bgRes.ok ? await bgRes.json() : { backgrounds: {} };
      const existingBgs: StoredBackgroundVariations = bgData.backgrounds || {};

      // 3. Fetch session frame list if frames not explicitly passed
      let targetFrameIds: string[] = [];
      if (framesQuery) {
        targetFrameIds = framesQuery.split(',').map(f => f.trim()).filter(Boolean);
      } else {
        const framesRes = await fetch(`/api/frames/${refId}`);
        if (framesRes.ok) {
          const fData = await framesRes.json();
          const allFrames: FrameItem[] = fData.frames || [];
          targetFrameIds = allFrames.slice(0, Math.min(3, allFrames.length)).map(f => f.id);
        }
      }

      if (targetFrameIds.length === 0) {
        const keys = Object.keys(existingEnhancements);
        if (keys.length > 0) {
          targetFrameIds = keys;
        } else {
          targetFrameIds = ['frame-0001'];
        }
      }

      // Build initial item states
      const initialItems: EnhancedItemState[] = targetFrameIds.map(frameId => {
        const cleanId = frameId.replace(/\.[^/.]+$/, '');
        const existing = existingEnhancements[cleanId];
        const itemBgRecords = existingBgs[cleanId] || {};

        const variations: Partial<Record<BackgroundMode, string>> = {};
        if (existing?.enhancedUrl) variations['original'] = existing.enhancedUrl;
        if (itemBgRecords['blur']?.imageUrl) variations['blur'] = itemBgRecords['blur'].imageUrl;
        if (itemBgRecords['remove']?.imageUrl) variations['remove'] = itemBgRecords['remove'].imageUrl;
        if (itemBgRecords['white']?.imageUrl) variations['white'] = itemBgRecords['white'].imageUrl;
        if (itemBgRecords['black']?.imageUrl) variations['black'] = itemBgRecords['black'].imageUrl;

        // Check if a template was previously applied to this frame
        let initialFilterId: FilterPresetId = 'none';
        let initialFilterIntensity = 70;
        let initialBgMode: BackgroundMode = 'original';

        try {
          const savedTemplate = localStorage.getItem(`posely_template_${refId}_${cleanId}`);
          if (savedTemplate) {
            const parsed = JSON.parse(savedTemplate);
            if (parsed.colorGrade) initialFilterId = parsed.colorGrade;
            if (typeof parsed.intensity === 'number') initialFilterIntensity = parsed.intensity;
            if (parsed.backgroundMode) initialBgMode = parsed.backgroundMode;
          }
        } catch (e) {
          // ignore
        }

        if (existing && existing.success) {
          return {
            frameId: cleanId,
            originalUrl: existing.originalUrl,
            enhancedUrl: existing.enhancedUrl,
            originalDimensions: existing.originalDimensions,
            enhancedDimensions: existing.enhancedDimensions,
            scaleFactor: existing.scaleFactor,
            modelUsed: existing.modelUsed,
            processingTimeMs: existing.processingTimeMs,
            faceEnhanced: existing.faceEnhanced,
            status: 'completed',
            activeBgMode: initialBgMode,
            bgVariations: variations,
            isBgApplying: false,
            activeFilterId: initialFilterId,
            filterIntensity: initialFilterIntensity,
            isPeekingOriginal: false
          };
        } else {
          return {
            frameId: cleanId,
            originalUrl: `/uploads/${refId}/${cleanId}.jpg`,
            status: 'pending',
            activeBgMode: initialBgMode,
            bgVariations: variations,
            isBgApplying: false,
            activeFilterId: initialFilterId,
            filterIntensity: initialFilterIntensity,
            isPeekingOriginal: false
          };
        }
      });

      setItems(initialItems);

      // Check if any frames need initial neural enhancement
      const pendingFrames = initialItems.filter(item => item.status === 'pending');
      if (pendingFrames.length > 0) {
        runBatchEnhancement(refId, pendingFrames.map(p => p.frameId), initialItems);
      }
    } catch (err) {
      console.error('Failed to init enhancements:', err);
    }
  };

  const runBatchEnhancement = async (refId: string, frameIds: string[], currentItems: EnhancedItemState[]) => {
    setIsProcessingBatch(true);
    setCurrentProcessingIndex(0);

    for (let i = 0; i < frameIds.length; i++) {
      const fid = frameIds[i];
      setCurrentProcessingIndex(i + 1);

      setItems(prev => prev.map(item => item.frameId === fid ? { ...item, status: 'enhancing' } : item));

      try {
        const res = await fetch('/api/enhance-frame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceId: refId,
            frameId: fid,
            scale: activeScale
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server returned ${res.status}`);
        }

        const data: EnhancedFrameData = await res.json();

        setItems(prev => prev.map(item => {
          if (item.frameId === fid) {
            const nextVariations = { ...item.bgVariations, original: data.enhancedUrl };
            return {
              ...item,
              enhancedUrl: data.enhancedUrl,
              originalDimensions: data.originalDimensions,
              enhancedDimensions: data.enhancedDimensions,
              scaleFactor: data.scaleFactor,
              modelUsed: data.modelUsed,
              processingTimeMs: data.processingTimeMs,
              faceEnhanced: data.faceEnhanced,
              status: 'completed',
              bgVariations: nextVariations
            };
          }
          return item;
        }));
      } catch (err: any) {
        console.error(`Error enhancing ${fid}:`, err);
        setItems(prev => prev.map(item => {
          if (item.frameId === fid) {
            return {
              ...item,
              error: err.message || 'Face enhancement failed',
              status: 'failed'
            };
          }
          return item;
        }));
      }
    }

    setIsProcessingBatch(false);
  };

  const retrySingle = async (frameId: string) => {
    setItems(prev => prev.map(i => i.frameId === frameId ? { ...i, status: 'enhancing', error: undefined } : i));
    try {
      const res = await fetch('/api/enhance-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceId,
          frameId,
          scale: activeScale
        })
      });
      if (!res.ok) throw new Error('Enhancement failed');
      const data: EnhancedFrameData = await res.json();
      setItems(prev => prev.map(item => {
        if (item.frameId === frameId) {
          return {
            ...item,
            enhancedUrl: data.enhancedUrl,
            originalDimensions: data.originalDimensions,
            enhancedDimensions: data.enhancedDimensions,
            scaleFactor: data.scaleFactor,
            modelUsed: data.modelUsed,
            processingTimeMs: data.processingTimeMs,
            faceEnhanced: data.faceEnhanced,
            status: 'completed',
            error: undefined
          };
        }
        return item;
      }));
    } catch (err: any) {
      setItems(prev => prev.map(i => i.frameId === frameId ? { ...i, status: 'failed', error: err.message } : i));
    }
  };

  // Stage 13: Apply background manipulation (Original / Blur / Remove / Solid)
  const handleApplyBackground = async (frameId: string, targetMode: BackgroundMode) => {
    const item = items.find(i => i.frameId === frameId);
    if (!item) return;

    // If already in target mode, no-op
    if (item.activeBgMode === targetMode && item.bgVariations[targetMode]) {
      return;
    }

    // If cached in local state, switch immediately for instant zero-latency feedback
    if (item.bgVariations[targetMode]) {
      setItems(prev => prev.map(i => i.frameId === frameId ? { ...i, activeBgMode: targetMode, bgError: undefined } : i));
      return;
    }

    // If target is 'original' and enhancedUrl is available
    if (targetMode === 'original' && item.enhancedUrl) {
      setItems(prev => prev.map(i => i.frameId === frameId ? {
        ...i,
        activeBgMode: 'original',
        bgVariations: { ...i.bgVariations, original: item.enhancedUrl }
      } : i));
      return;
    }

    // Set loading indicator on this photo card
    setItems(prev => prev.map(i => i.frameId === frameId ? { ...i, isBgApplying: true, bgError: undefined } : i));

    try {
      const res = await fetch('/api/apply-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceId,
          frameId,
          mode: targetMode,
          blurSigma: 20
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to apply ${targetMode} background`);
      }

      const data: BackgroundResult = await res.json();

      setItems(prev => prev.map(i => {
        if (i.frameId === frameId) {
          const nextVariations = { ...i.bgVariations, [targetMode]: data.imageUrl };
          return {
            ...i,
            activeBgMode: targetMode,
            bgVariations: nextVariations,
            isBgApplying: false,
            bgError: undefined
          };
        }
        return i;
      }));
    } catch (err: any) {
      console.error(`Failed to apply background for ${frameId}:`, err);
      setItems(prev => prev.map(i => i.frameId === frameId ? {
        ...i,
        isBgApplying: false,
        bgError: err.message || 'Background modification failed'
      } : i));
    }
  };

  // Helper to determine the current image URL based on active background mode
  const getActiveImageUrl = (item: EnhancedItemState): string => {
    if (item.activeBgMode !== 'original' && item.bgVariations[item.activeBgMode]) {
      return item.bgVariations[item.activeBgMode]!;
    }
    if (item.status === 'completed' && item.enhancedUrl) {
      return item.enhancedUrl;
    }
    return item.originalUrl;
  };

  // Stage 14: Filter Selection & Intensity Handlers
  const handleSelectFilter = (frameId: string, filterId: FilterPresetId) => {
    setItems(prev => prev.map(item => {
      if (item.frameId === frameId) {
        const defaultInt = FILTER_PRESETS[filterId]?.defaultIntensity ?? 70;
        return {
          ...item,
          activeFilterId: filterId,
          filterIntensity: filterId === 'none' ? 0 : (item.filterIntensity > 0 ? item.filterIntensity : defaultInt)
        };
      }
      return item;
    }));
  };

  const handleResetTemplateForFrame = (frameId: string) => {
    localStorage.removeItem(`posely_template_${referenceId}_${frameId}`);
    setItems(prev => prev.map(item => item.frameId === frameId ? {
      ...item,
      activeFilterId: 'none',
      filterIntensity: 70
    } : item));
  };

  const handleChangeFilterIntensity = (frameId: string, intensity: number) => {
    setItems(prev => prev.map(item => item.frameId === frameId ? {
      ...item,
      filterIntensity: intensity
    } : item));
  };

  const handlePeekOriginal = (frameId: string, peeking: boolean) => {
    setItems(prev => prev.map(item => item.frameId === frameId ? {
      ...item,
      isPeekingOriginal: peeking
    } : item));
  };

  // Stage 14: Non-destructive deterministic CSS filter style calculation
  const getItemFilterStyle = (item: EnhancedItemState, overridePeeking?: boolean): React.CSSProperties => {
    const isPeeking = overridePeeking !== undefined ? overridePeeking : item.isPeekingOriginal;
    if (isPeeking || item.activeFilterId === 'none' || item.filterIntensity === 0) {
      return {};
    }
    const params = interpolateParameters(item.activeFilterId, item.filterIntensity);
    const filterString = computeCSSFilterString(params);
    return filterString !== 'none' ? {
      filter: filterString,
      transition: 'filter 0.15s ease-out'
    } : {};
  };

  // Helper to determine download URL and filename based on active background mode and active filter
  const getItemDownloadInfo = (item: EnhancedItemState) => {
    const activeUrl = getActiveImageUrl(item);
    const shortRef = referenceId ? referenceId.slice(0, 8) : 'posely';
    const filterSuffix = item.activeFilterId !== 'none' && item.filterIntensity > 0
      ? `-${item.activeFilterId}-i${item.filterIntensity}`
      : '';

    let filename = `posely-${shortRef}-${item.frameId}-enhanced${filterSuffix}.jpg`;

    switch (item.activeBgMode) {
      case 'blur':
        filename = `posely-${shortRef}-${item.frameId}-bokeh-blur${filterSuffix}.jpg`;
        break;
      case 'remove':
        filename = `posely-${shortRef}-${item.frameId}-cutout${filterSuffix}.png`;
        break;
      case 'white':
        filename = `posely-${shortRef}-${item.frameId}-studio-white${filterSuffix}.jpg`;
        break;
      case 'black':
        filename = `posely-${shortRef}-${item.frameId}-studio-black${filterSuffix}.jpg`;
        break;
      default:
        filename = `posely-${shortRef}-${item.frameId}-enhanced${filterSuffix}.jpg`;
    }

    return { url: activeUrl, filename };
  };

  const handleDownloadSingle = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadItem = (item: EnhancedItemState) => {
    const { url, filename } = getItemDownloadInfo(item);
    handleDownloadSingle(url, filename);
  };

  const handleDownloadAll = async () => {
    const completedItems = items.filter(i => i.status === 'completed');
    if (completedItems.length === 0) return;

    setIsDownloadingAll(true);
    setDownloadNotice(`Exporting ${completedItems.length} photos at full master resolution...`);

    for (let i = 0; i < completedItems.length; i++) {
      const item = completedItems[i];
      try {
        await exportAndDownloadPhoto({
          referenceId: referenceId || '',
          frameId: item.frameId,
          backgroundMode: item.activeBgMode,
          filterId: item.activeFilterId,
          filterIntensity: item.filterIntensity,
          format: item.activeBgMode === 'remove' ? 'png' : 'auto'
        });
        await new Promise(r => setTimeout(r, 600));
      } catch (e) {
        console.error('Failed export in batch:', e);
      }
    }

    setTimeout(() => {
      setIsDownloadingAll(false);
      setDownloadNotice(`Successfully exported ${completedItems.length} photos at full resolution!`);
      setTimeout(() => setDownloadNotice(null), 4000);
    }, 1000);
  };

  const completedCount = items.filter(i => i.status === 'completed').length;
  const failedCount = items.filter(i => i.status === 'failed').length;
  const activeInspectItem = inspectIndex !== null ? items[inspectIndex] : null;

  // Drag handlers for fullscreen split slider
  const handleSliderMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSlider) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleSliderMove(e.clientX, rect);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX, rect);
    }
  };

  // Keyboard navigation for fullscreen inspector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inspectIndex === null) return;
      if (e.key === 'Escape') setInspectIndex(null);
      if (e.key === 'ArrowLeft' && inspectIndex > 0) setInspectIndex(inspectIndex - 1);
      if (e.key === 'ArrowRight' && inspectIndex < items.length - 1) setInspectIndex(inspectIndex + 1);
      if (e.key === ' ') {
        e.preventDefault();
        setSliderPosition(prev => prev > 50 ? 10 : 90);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectIndex, items.length]);

  const renderInspector = () => {
    if (inspectIndex === null || !activeInspectItem) return null;

    const activeImageUrl = getActiveImageUrl(activeInspectItem);
    const isTransparentCutout = activeInspectItem.activeBgMode === 'remove';
    const { filename } = getItemDownloadInfo(activeInspectItem);
    const filterStyle = getItemFilterStyle(activeInspectItem);

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200 select-none">
        {/* Top Controls Bar */}
        <div className="absolute top-0 inset-x-0 p-3 sm:p-5 flex flex-wrap justify-between items-center gap-3 z-50 bg-gradient-to-b from-black/95 via-black/85 to-transparent">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-white font-mono text-xs bg-black/60 px-2.5 py-1.5 rounded-xl border border-white/10 shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Photo #{inspectIndex + 1} of {items.length} ({activeInspectItem.frameId})
            </span>

            {/* Quick Background Switcher in Inspector */}
            <div className="bg-stone-900/90 border border-white/10 rounded-xl p-0.5 flex items-center gap-1 shadow-lg">
              <button
                onClick={() => handleApplyBackground(activeInspectItem.frameId, 'original')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeInspectItem.activeBgMode === 'original'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>Original</span>
              </button>

              <button
                onClick={() => handleApplyBackground(activeInspectItem.frameId, 'blur')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeInspectItem.activeBgMode === 'blur'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Droplets className="w-3 h-3" />
                <span>Blur</span>
              </button>

              <button
                onClick={() => handleApplyBackground(activeInspectItem.frameId, 'remove')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeInspectItem.activeBgMode === 'remove'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Scissors className="w-3 h-3" />
                <span>Cutout</span>
              </button>
            </div>

            {/* Quick Style Filter Switcher in Inspector */}
            <div className="bg-stone-900/90 border border-amber-500/30 rounded-xl p-0.5 flex items-center gap-1 shadow-lg">
              <button
                onClick={() => handleSelectFilter(activeInspectItem.frameId, 'none')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeInspectItem.activeFilterId === 'none'
                    ? 'bg-stone-700 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                No Filter
              </button>

              {AVAILABLE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectFilter(activeInspectItem.frameId, preset.id)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    activeInspectItem.activeFilterId === preset.id
                      ? 'bg-amber-500 text-black font-bold shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>

            {/* Filter Intensity Slider (when filter active) */}
            {activeInspectItem.activeFilterId !== 'none' && (
              <div className="bg-stone-900/90 border border-stone-800 rounded-xl px-2.5 py-1 flex items-center gap-2 text-xs">
                <span className="text-[11px] text-amber-300 font-semibold">{activeInspectItem.filterIntensity}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeInspectItem.filterIntensity}
                  onChange={(e) => handleChangeFilterIntensity(activeInspectItem.frameId, Number(e.target.value))}
                  className="w-16 h-1 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            )}

            {/* Hold to Peek Before/After */}
            {activeInspectItem.activeFilterId !== 'none' && (
              <button
                type="button"
                onMouseDown={() => handlePeekOriginal(activeInspectItem.frameId, true)}
                onMouseUp={() => handlePeekOriginal(activeInspectItem.frameId, false)}
                onMouseLeave={() => handlePeekOriginal(activeInspectItem.frameId, false)}
                onTouchStart={() => handlePeekOriginal(activeInspectItem.frameId, true)}
                onTouchEnd={() => handlePeekOriginal(activeInspectItem.frameId, false)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all select-none ${
                  activeInspectItem.isPeekingOriginal
                    ? 'bg-amber-500 text-black border-amber-400 font-bold'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white'
                }`}
                title="Hold to temporarily peek unfiltered photo"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{activeInspectItem.isPeekingOriginal ? 'Original' : 'Hold Peek'}</span>
              </button>
            )}

            {/* Compare Mode Switcher */}
            <div className="bg-black/50 border border-white/10 rounded-xl p-0.5 flex items-center">
              <button
                onClick={() => setComparisonMode('split')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  comparisonMode === 'split' ? 'bg-purple-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setComparisonMode('side-by-side')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  comparisonMode === 'side-by-side' ? 'bg-purple-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                Side-by-Side
              </button>
            </div>

            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isZoomed
                  ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                  : 'bg-black/40 border-white/20 text-stone-400 hover:text-white'
              }`}
            >
              {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
              <span>{isZoomed ? '100%' : '3×'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/templates?id=${referenceId}&frame=${activeInspectItem.frameId}`}
              className="px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-700/60 hover:bg-purple-900/80 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open Template Studio for this photo"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-purple-400" />
              <span>Templates</span>
            </Link>

            <button
              onClick={() => handleResetTemplateForFrame(activeInspectItem.frameId)}
              className="px-3 py-1.5 rounded-xl bg-rose-950/70 border border-rose-700/60 hover:bg-rose-900/80 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Reset to original photo (removes active template)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset</span>
            </button>

            <ExportButton
              options={{
                referenceId: referenceId || '',
                frameId: activeInspectItem.frameId,
                backgroundMode: activeInspectItem.activeBgMode,
                filterId: activeInspectItem.activeFilterId,
                filterIntensity: activeInspectItem.filterIntensity,
                format: activeInspectItem.activeBgMode === 'remove' ? 'png' : 'auto'
              }}
              variant="inspector"
              label="Download Photo"
            />

            <button
              onClick={() => setInspectIndex(null)}
              className="p-1.5 rounded-full bg-black/50 hover:bg-white/10 text-white transition-colors border border-white/10"
              title="Close Inspector (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        {inspectIndex > 0 && (
          <button
            onClick={() => setInspectIndex(inspectIndex - 1)}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-white/10 text-white transition-colors border border-white/10 z-50 group"
            title="Previous Photo (Left Arrow)"
          >
            <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
          </button>
        )}

        {inspectIndex < items.length - 1 && (
          <button
            onClick={() => setInspectIndex(inspectIndex + 1)}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-white/10 text-white transition-colors border border-white/10 z-50 group"
            title="Next Photo (Right Arrow)"
          >
            <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {/* Main Comparison Canvas */}
        <div className="w-full h-full pt-20 pb-16 px-4 sm:px-16 flex items-center justify-center max-w-7xl mx-auto overflow-hidden">
          {comparisonMode === 'split' ? (
            /* Interactive Split Swipe View */
            <div 
              className={`relative w-full max-w-3xl max-h-[78vh] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-white/20 cursor-ew-resize select-none ${
                isZoomed ? 'scale-150 transition-transform duration-300' : ''
              } ${isTransparentCutout ? 'bg-[#181824]' : 'bg-black'}`}
              onMouseDown={() => setIsDraggingSlider(true)}
              onMouseUp={() => setIsDraggingSlider(false)}
              onMouseLeave={() => setIsDraggingSlider(false)}
              onMouseMove={onMouseMove}
              onTouchMove={onTouchMove}
              style={isTransparentCutout ? {
                backgroundImage: 'linear-gradient(45deg, #242430 25%, transparent 25%), linear-gradient(-45deg, #242430 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #242430 75%), linear-gradient(-45deg, transparent 75%, #242430 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              } : undefined}
            >
              {/* Background Layer: Current Modified / Enhanced Image with Filter Style */}
              <img
                src={activeImageUrl}
                alt="Active View"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={filterStyle}
              />

              {/* Foreground Layer (Clipped): Original Raw Image */}
              <div 
                className="absolute inset-0 overflow-hidden pointer-events-none bg-black"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={activeInspectItem.originalUrl}
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none max-w-none"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              {/* Slider Divider Line & Thumb */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] pointer-events-none z-30"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black shadow-2xl flex items-center justify-center border-2 border-purple-600">
                  <Sliders className="w-4 h-4 text-purple-600" />
                </div>
              </div>

              {/* On-Canvas Labels */}
              <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs font-bold text-amber-200">
                📷 Original Raw Frame
              </div>
              <div className="absolute bottom-4 right-4 z-20 pointer-events-none bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-purple-400/40 text-xs font-bold text-purple-200 flex items-center gap-1.5">
                <span>✨</span>
                <span>
                  {activeInspectItem.activeBgMode === 'blur' ? 'DSLR Bokeh' :
                   activeInspectItem.activeBgMode === 'remove' ? 'Cutout' :
                   activeInspectItem.activeBgMode === 'white' ? 'Studio White' :
                   activeInspectItem.activeBgMode === 'black' ? 'Studio Black' :
                   'GFPGAN 2×'}
                </span>
                {activeInspectItem.activeFilterId !== 'none' && (
                  <span className="text-amber-300 font-bold ml-1 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">
                    + {FILTER_PRESETS[activeInspectItem.activeFilterId]?.name} ({activeInspectItem.filterIntensity}%)
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Side-by-Side Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl max-h-[78vh] overflow-y-auto">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-stone-400">
                  <span className="font-bold text-amber-200">Original Extracted Frame</span>
                  <span>{activeInspectItem.originalDimensions ? `${activeInspectItem.originalDimensions.width}×${activeInspectItem.originalDimensions.height}` : 'Raw'}</span>
                </div>
                <div className="aspect-[4/5] bg-black rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                  <img 
                    src={activeInspectItem.originalUrl} 
                    alt="Original" 
                    className={`w-full h-full object-contain ${isZoomed ? 'scale-150' : ''}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-stone-400">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <span>
                      {activeInspectItem.activeBgMode === 'blur' ? 'GFPGAN + Blur' :
                       activeInspectItem.activeBgMode === 'remove' ? 'GFPGAN + Cutout' :
                       activeInspectItem.activeBgMode === 'white' ? 'GFPGAN + White' :
                       activeInspectItem.activeBgMode === 'black' ? 'GFPGAN + Black' :
                       'GFPGAN Enhanced'}
                    </span>
                    {activeInspectItem.activeFilterId !== 'none' && (
                      <span className="text-amber-300 font-bold">
                        • {FILTER_PRESETS[activeInspectItem.activeFilterId]?.name} ({activeInspectItem.filterIntensity}%)
                      </span>
                    )}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {activeInspectItem.enhancedDimensions ? `${activeInspectItem.enhancedDimensions.width}×${activeInspectItem.enhancedDimensions.height}` : '2× Super-Res'}
                  </span>
                </div>
                <div 
                  className={`aspect-[4/5] rounded-2xl overflow-hidden border border-purple-500/50 shadow-xl shadow-purple-500/10 ${
                    isTransparentCutout ? 'bg-[#181824]' : 'bg-black'
                  }`}
                  style={isTransparentCutout ? {
                    backgroundImage: 'linear-gradient(45deg, #242430 25%, transparent 25%), linear-gradient(-45deg, #242430 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #242430 75%), linear-gradient(-45deg, transparent 75%, #242430 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  } : undefined}
                >
                  <img 
                    src={activeImageUrl} 
                    alt="Modified Output" 
                    className={`w-full h-full object-contain ${isZoomed ? 'scale-150' : ''}`}
                    style={filterStyle}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Hint */}
        <div className="absolute bottom-4 inset-x-0 text-center text-xs text-stone-400 pointer-events-none">
          Drag divider or press <span className="font-mono text-zinc-300 bg-white/10 px-1.5 py-0.5 rounded">Space</span> to toggle • Use <span className="font-mono text-zinc-300 bg-white/10 px-1.5 py-0.5 rounded">←</span> <span className="font-mono text-zinc-300 bg-white/10 px-1.5 py-0.5 rounded">→</span> to navigate
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0F0F13] text-stone-100 p-4 sm:p-8 pb-32">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Link
                to={`/results?id=${referenceId}`}
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-white transition-colors"
                title="Back to Ranked Results"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    AI Enhanced Photos
                  </h1>
                  <span className="bg-purple-950/80 text-purple-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-purple-800/60 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Stage 11 + Stage 13 Bokeh & Matting
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-400 flex items-center gap-2 mt-1">
                  <span>Session: <span className="font-mono text-stone-300">{referenceId ? referenceId.slice(0, 8) : 'Active'}</span></span>
                  <span>•</span>
                  <span>{items.length} {items.length === 1 ? 'photo selected' : 'photos in batch'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to={`/presets?id=${referenceId}`}
              className="px-4 py-2.5 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 hover:from-purple-900/60 hover:to-indigo-900/60 text-xs sm:text-sm font-bold text-purple-200 flex items-center gap-2 transition-all shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-purple-400" />
              <span>Studio Presets</span>
            </Link>

            <Link
              to={`/templates?id=${referenceId}`}
              className="px-4 py-2.5 rounded-xl border border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/40 text-xs sm:text-sm font-semibold text-purple-200 flex items-center gap-2 transition-colors shadow-sm"
            >
              <LayoutTemplate className="w-4 h-4 text-purple-400" />
              <span>Browse Templates</span>
            </Link>

            <Link
              to={`/segmentation-test?id=${referenceId}`}
              className="px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/30 text-xs sm:text-sm font-semibold text-indigo-300 flex items-center gap-1.5 transition-colors"
            >
              <Scissors className="w-4 h-4 text-indigo-400" />
              <span>Inspect Mask</span>
            </Link>

            <Link
              to={`/results?id=${referenceId}`}
              className="px-4 py-2.5 rounded-xl border border-stone-800 bg-stone-900 hover:bg-stone-800 text-xs sm:text-sm font-semibold text-stone-300 hover:text-white transition-colors"
            >
              Select More Photos
            </Link>

            <button
              onClick={handleDownloadAll}
              disabled={completedCount === 0 || isDownloadingAll || isProcessingBatch}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm ${
                completedCount > 0 && !isProcessingBatch
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 active:scale-95'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <FolderDown className="w-4 h-4" />
              <span>{isDownloadingAll ? 'Downloading...' : `Download All (${completedCount})`}</span>
            </button>
          </div>
        </div>

        {/* Download Toast Notice */}
        {downloadNotice && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{downloadNotice}</span>
          </div>
        )}

        {/* Processing Feedback Banner */}
        {isProcessingBatch && (
          <div className="bg-stone-900 border border-purple-900/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-800/50 flex items-center justify-center text-purple-300 shadow-sm animate-pulse">
                  <Wand2 className="w-6 h-6 animate-spin text-purple-400" style={{ animationDuration: '3s' }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Enhancing your photos with GFPGAN...</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Processing photo {currentProcessingIndex} of {items.length} • Applying neural face restoration & 2× super-resolution
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-purple-300 bg-purple-950/60 border border-purple-800/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Elapsed: {elapsedTime}s</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-400">
                <span>Neural Upscaling Progress</span>
                <span className="font-mono text-white font-bold">
                  {Math.round((currentProcessingIndex / items.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-stone-950 h-3 rounded-full overflow-hidden border border-stone-800 p-0.5">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, (currentProcessingIndex / items.length) * 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-400 pt-2 border-t border-stone-800">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>GFPGAN v1.4 Neural Facial Prior</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>MODNet Neural Human Segmentation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Instant Bokeh Blur & Transparent Cutout</span>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-white">Enhanced Gallery</h2>
              <span className="text-xs bg-stone-900 text-stone-300 px-2.5 py-1 rounded-lg border border-stone-800 font-mono">
                {completedCount} of {items.length} Ready
              </span>
              {failedCount > 0 && (
                <span className="text-xs bg-rose-950/60 text-rose-300 px-2 py-0.5 rounded-md border border-rose-800/50">
                  {failedCount} Failed
                </span>
              )}
            </div>

            <div className="text-xs text-stone-400 hidden sm:block">
              Choose background per photo (Original / Blur / Remove) • Click to open interactive comparison
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => {
              const isCompleted = item.status === 'completed';
              const isEnhancing = item.status === 'enhancing';
              const isFailed = item.status === 'failed';
              const currentDisplayUrl = getActiveImageUrl(item);
              const isTransparent = item.activeBgMode === 'remove';

              return (
                <div 
                  key={item.frameId}
                  className={`bg-stone-900/90 border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 group shadow-lg ${
                    isEnhancing 
                      ? 'border-purple-500/60 shadow-purple-500/10'
                      : isFailed
                      ? 'border-rose-800/60'
                      : 'border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {/* Photo Container */}
                  <div 
                    className={`relative aspect-[4/5] overflow-hidden flex items-center justify-center ${
                      isTransparent ? 'bg-[#181824]' : 'bg-black'
                    }`}
                    style={isTransparent ? {
                      backgroundImage: 'linear-gradient(45deg, #242430 25%, transparent 25%), linear-gradient(-45deg, #242430 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #242430 75%), linear-gradient(-45deg, transparent 75%, #242430 75%)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    } : undefined}
                  >
                    {/* Status Overlays */}
                    {isEnhancing && (
                      <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-center p-4">
                        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <div>
                          <p className="text-sm font-bold text-white">Enhancing with GFPGAN...</p>
                          <p className="text-xs text-stone-400 mt-1">Super-resolution & face reconstruction</p>
                        </div>
                      </div>
                    )}

                    {item.isBgApplying && (
                      <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 text-center p-4 animate-in fade-in duration-150">
                        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-semibold text-purple-200">
                          Applying {item.activeBgMode === 'blur' ? 'Background Blur' : item.activeBgMode === 'remove' ? 'Cutout Mask' : 'Studio Fill'}...
                        </p>
                      </div>
                    )}

                    {isFailed && (
                      <div className="absolute inset-0 z-20 bg-rose-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4 text-center">
                        <AlertTriangle className="w-8 h-8 text-rose-400" />
                        <p className="text-sm font-bold text-rose-200">Enhancement Failed</p>
                        <p className="text-xs text-rose-300/80 max-w-[200px]">{item.error || 'Inference error'}</p>
                        <button
                          onClick={() => retrySingle(item.frameId)}
                          className="mt-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </button>
                      </div>
                    )}

                    {/* Image View with Real-time Filter Style */}
                    <img
                      src={currentDisplayUrl}
                      alt={`Photo ${item.frameId}`}
                      className="w-full h-full object-contain cursor-pointer transition-transform duration-500 group-hover:scale-[1.02]"
                      style={getItemFilterStyle(item)}
                      onClick={() => setInspectIndex(index)}
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
                      <span className="bg-black/75 backdrop-blur-md text-stone-200 font-mono text-[11px] px-2.5 py-1 rounded-lg border border-white/10 font-medium">
                        #{index + 1} • {item.frameId}
                      </span>

                      {isCompleted && (
                        <div className="flex items-center gap-1">
                          <span className="bg-purple-900/80 backdrop-blur-md text-purple-200 font-semibold text-[10px] px-2 py-0.5 rounded-md border border-purple-700/50 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-300" />
                            {item.activeBgMode === 'blur' ? 'Bokeh' :
                             item.activeBgMode === 'remove' ? 'Cutout' :
                             item.activeBgMode === 'white' ? 'White' :
                             item.activeBgMode === 'black' ? 'Black' :
                             'Enhanced 2×'}
                          </span>
                          {item.activeFilterId !== 'none' && (
                            <span className="bg-amber-950/80 backdrop-blur-md text-amber-200 font-bold text-[10px] px-2 py-0.5 rounded-md border border-amber-500/50">
                              {FILTER_PRESETS[item.activeFilterId]?.name} ({item.filterIntensity}%)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Hover Inspect CTA Overlay */}
                    {isCompleted && !item.isBgApplying && (
                      <div 
                        onClick={() => setInspectIndex(index)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-auto"
                      >
                        <span className="bg-white/20 backdrop-blur-md text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 border border-white/30 shadow-2xl">
                          <Sliders className="w-4 h-4" />
                          <span>Compare Split View</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stage 13 Background Modification Control Bar */}
                  <div className="p-3 bg-stone-950/70 border-t border-stone-800/80 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span className="font-semibold text-stone-300 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-purple-400" />
                        Background
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {item.activeBgMode === 'remove' ? 'Cutout' : item.activeBgMode === 'blur' ? 'Bokeh Blur' : 'Original'}
                      </span>
                    </div>

                    {/* Background Control Options Row */}
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-900 rounded-xl border border-stone-800">
                      <button
                        onClick={() => handleApplyBackground(item.frameId, 'original')}
                        disabled={item.isBgApplying}
                        className={`py-1 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                          item.activeBgMode === 'original'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                        }`}
                        title="Keep original background"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Original</span>
                      </button>

                      <button
                        onClick={() => handleApplyBackground(item.frameId, 'blur')}
                        disabled={item.isBgApplying}
                        className={`py-1 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                          item.activeBgMode === 'blur'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                        }`}
                        title="DSLR bokeh background blur"
                      >
                        <Droplets className="w-3 h-3 text-sky-400" />
                        <span>Blur</span>
                      </button>

                      <button
                        onClick={() => handleApplyBackground(item.frameId, 'remove')}
                        disabled={item.isBgApplying}
                        className={`py-1 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                          item.activeBgMode === 'remove'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                        }`}
                        title="Transparent cutout"
                      >
                        <Scissors className="w-3 h-3 text-emerald-400" />
                        <span>Cutout</span>
                      </button>
                    </div>

                    {/* Secondary Studio Color Options (White / Black) */}
                    <div className="flex items-center justify-between text-[11px] px-0.5">
                      <span className="text-stone-500 text-[10px]">Studio Fills:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleApplyBackground(item.frameId, 'white')}
                          disabled={item.isBgApplying}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors border ${
                            item.activeBgMode === 'white'
                              ? 'bg-white text-black border-white font-bold'
                              : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                          }`}
                        >
                          ⚪ White
                        </button>
                        <button
                          onClick={() => handleApplyBackground(item.frameId, 'black')}
                          disabled={item.isBgApplying}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors border ${
                            item.activeBgMode === 'black'
                              ? 'bg-black text-white border-purple-500 font-bold'
                              : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                          }`}
                        >
                          ⚫ Black
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stage 14 Style Filter Control Bar */}
                  <div className="p-3 bg-stone-950 border-t border-stone-800/80">
                    <FilterSelector
                      selectedFilter={item.activeFilterId}
                      intensity={item.filterIntensity}
                      onSelectFilter={(fId) => handleSelectFilter(item.frameId, fId)}
                      onChangeIntensity={(val) => handleChangeFilterIntensity(item.frameId, val)}
                      isPeekingOriginal={item.isPeekingOriginal}
                      onPeekOriginalChange={(peeking) => handlePeekOriginal(item.frameId, peeking)}
                      thumbnailUrl={currentDisplayUrl}
                      size="compact"
                    />
                  </div>

                  {/* Card Info & Download Footer */}
                  <div className="p-4 flex flex-col justify-between flex-1 gap-3.5 bg-stone-900">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-400">Resolution</span>
                        <div className="font-mono text-xs flex items-center gap-1.5">
                          {item.originalDimensions && (
                            <span className="text-stone-400">
                              {item.originalDimensions.width}×{item.originalDimensions.height}
                            </span>
                          )}
                          {item.enhancedDimensions && (
                            <>
                              <ArrowRight className="w-3 h-3 text-purple-400" />
                              <span className="text-emerald-400 font-bold">
                                {item.enhancedDimensions.width}×{item.enhancedDimensions.height} ({item.scaleFactor || 2}×)
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {item.modelUsed && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-400">Model</span>
                          <span className="text-purple-300 text-[11px] font-medium">
                            {item.faceEnhanced ? 'GFPGAN v1.4 + MODNet' : 'Lanczos3 SR'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Download & Compare Buttons */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-stone-800">
                      <button
                        onClick={() => setInspectIndex(index)}
                        className="py-2 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-semibold text-stone-200 flex items-center justify-center gap-1 transition-colors"
                        title="Compare Before & After"
                      >
                        <Eye className="w-3.5 h-3.5 text-purple-300" />
                        <span>Compare</span>
                      </button>

                      <Link
                        to={`/templates?id=${referenceId}&frame=${item.frameId}`}
                        className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-semibold text-purple-300 hover:text-purple-200 flex items-center justify-center transition-colors"
                        title="Apply Professional Templates"
                      >
                        <LayoutTemplate className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        to={`/segmentation-test?id=${referenceId}&frame=${item.frameId}`}
                        className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-semibold text-indigo-300 hover:text-indigo-200 flex items-center justify-center transition-colors"
                        title="Inspect Alpha Matte & Edge Gradients"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                      </Link>

                      {isCompleted && (
                        <ExportButton
                          options={{
                            referenceId: referenceId || '',
                            frameId: item.frameId,
                            backgroundMode: item.activeBgMode,
                            filterId: item.activeFilterId,
                            filterIntensity: item.filterIntensity,
                            format: item.activeBgMode === 'remove' ? 'png' : 'auto'
                          }}
                          variant="primary"
                          label={item.activeBgMode === 'remove' ? 'Download Cutout (PNG)' : 'Download Photo'}
                          className="flex-1"
                        />
                      )}

                      {!isCompleted && (
                        <button
                          onClick={() => handleDownloadSingle(
                            item.originalUrl, 
                            `posely-${referenceId ? referenceId.slice(0, 8) : 'posely'}-${item.frameId}-original.jpg`
                          )}
                          className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-semibold text-stone-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Raw</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {renderInspector()}
    </div>
  );
}
