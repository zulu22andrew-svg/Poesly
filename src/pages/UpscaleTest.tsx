import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Sparkles, RefreshCw, AlertCircle, CheckCircle2, Sliders, 
  ArrowRight, Download, Eye, Layers, ZoomIn, Wand2, Star, 
  ChevronRight, ArrowLeftRight, SplitSquareVertical, Activity, 
  Info, ShieldCheck, Check, Clock, Maximize2
} from 'lucide-react';
import { FrameItem, EnhancedFrameData } from '../types';

interface SessionItem {
  referenceId: string;
  createdAt: string;
  frameCount: number;
  topScore: number;
  previewUrl: string;
}

export default function UpscaleTest() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRefId = searchParams.get('id') || searchParams.get('ref') || '';
  const initialFrameId = searchParams.get('frame') || '';

  // Sessions and Frames state
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialRefId);
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState<string>(initialFrameId);

  // Enhancement state
  const [scaleFactor, setScaleFactor] = useState<number>(2);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhancingTimer, setEnhancingTimer] = useState<number>(0);
  const [enhancedResult, setEnhancedResult] = useState<EnhancedFrameData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Comparison view mode: 'side-by-side' | 'slider' | 'face-zoom'
  const [comparisonMode, setComparisonMode] = useState<'slider' | 'side-by-side' | 'face-zoom'>('slider');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100
  const isDraggingSlider = useRef(false);

  // Existing enhancements cache for session
  const [existingEnhancements, setExistingEnhancements] = useState<Record<string, EnhancedFrameData>>({});

  // Fetch available sessions on mount
  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        const list: SessionItem[] = data.sessions || [];
        setSessions(list);
        if (!selectedSessionId && list.length > 0) {
          setSelectedSessionId(list[0].referenceId);
        }
      })
      .catch(err => console.error('Failed to load sessions:', err));
  }, []);

  // When selectedSessionId changes, load frames and enhancement records
  useEffect(() => {
    if (!selectedSessionId) return;

    // Fetch frames
    fetch(`/api/frames/${selectedSessionId}`)
      .then(res => {
        if (!res.ok) throw new Error('Session frames not found');
        return res.json();
      })
      .then(data => {
        const loadedFrames: FrameItem[] = data.frames || [];
        setFrames(loadedFrames);
        if (loadedFrames.length > 0) {
          // Select initial or first frame
          const target = initialFrameId && loadedFrames.find(f => f.id === initialFrameId) 
            ? initialFrameId 
            : loadedFrames[0].id;
          setSelectedFrameId(target);
        }
      })
      .catch(err => {
        console.error('Failed to load session frames:', err);
        setFrames([]);
      });

    // Fetch existing enhancement records
    fetch(`/api/enhanced-frames/${selectedSessionId}`)
      .then(res => res.json())
      .then(data => {
        const records = data.enhancements || {};
        setExistingEnhancements(records);
        if (selectedFrameId && records[selectedFrameId]) {
          setEnhancedResult(records[selectedFrameId]);
        } else {
          setEnhancedResult(null);
        }
      })
      .catch(() => setExistingEnhancements({}));
  }, [selectedSessionId]);

  // When selectedFrameId changes, check if it already has an enhancement
  useEffect(() => {
    if (selectedFrameId && existingEnhancements[selectedFrameId]) {
      setEnhancedResult(existingEnhancements[selectedFrameId]);
    } else {
      setEnhancedResult(null);
    }
    setError(null);
  }, [selectedFrameId, existingEnhancements]);

  // Timer for enhancement loading state
  useEffect(() => {
    let interval: any;
    if (isEnhancing) {
      setEnhancingTimer(0);
      interval = setInterval(() => {
        setEnhancingTimer(prev => Number((prev + 0.1).toFixed(1)));
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isEnhancing]);

  // Trigger frame enhancement
  const handleEnhance = async () => {
    if (!selectedSessionId || !selectedFrameId) return;
    setIsEnhancing(true);
    setError(null);

    try {
      const res = await fetch('/api/enhance-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceId: selectedSessionId,
          frameId: selectedFrameId,
          scale: scaleFactor
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Enhancement failed with HTTP ${res.status}`);
      }

      const data: EnhancedFrameData = await res.json();
      setEnhancedResult(data);
      setExistingEnhancements(prev => ({
        ...prev,
        [selectedFrameId]: data
      }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to enhance frame with GFPGAN');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Draggable slider event listeners
  const handleSliderMove = (clientX: number, containerRect: DOMRect) => {
    const offsetX = clientX - containerRect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / containerRect.width) * 100));
    setSliderPosition(percentage);
  };

  const activeFrame = frames.find(f => f.id === selectedFrameId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-28">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2B2B36] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            Stage 10: Single-Frame Super-Resolution Verification
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Upscaling & Face Restoration Lab
          </h1>
          <p className="text-[#8A8A98] text-sm mt-1">
            Test and verify GFPGAN v1.4 neural face restoration & 2x/4x super-resolution on any extracted video frame.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/results"
            className="px-4 py-2 rounded-xl bg-[#1C1C24] hover:bg-[#20202A] text-white border border-[#2B2B36] text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#8A8A98]" />
            Back to Results
          </Link>
          <Link
            to="/upload"
            className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Upload Video
          </Link>
        </div>
      </header>

      {/* Control Panel: Session & Frame Selector */}
      <div className="bg-[#1C1C24] border border-[#2B2B36] rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Session Picker */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#8A8A98] uppercase tracking-wider">Video Session:</span>
            {sessions.length > 0 ? (
              <select
                value={selectedSessionId}
                onChange={(e) => {
                  setSelectedSessionId(e.target.value);
                  setSearchParams({ id: e.target.value });
                }}
                className="bg-[#15151C] text-white border border-[#2B2B36] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#7C3AED] cursor-pointer"
              >
                {sessions.map((s, idx) => (
                  <option key={s.referenceId} value={s.referenceId}>
                    Session #{idx + 1} ({s.referenceId.slice(0, 8)}...) • {s.frameCount} frames • Top {Math.round(s.topScore)}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-[#8A8A98] italic">No sessions found</span>
            )}
          </div>

          {/* Upscale Factor & Action */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#15151C] border border-[#2B2B36] p-1 rounded-xl">
              <button
                onClick={() => setScaleFactor(2)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  scaleFactor === 2 ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-[#8A8A98] hover:text-white'
                }`}
              >
                2x Super-Res
              </button>
              <button
                onClick={() => setScaleFactor(4)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  scaleFactor === 4 ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-[#8A8A98] hover:text-white'
                }`}
              >
                4x Ultra-Res
              </button>
            </div>

            <button
              onClick={handleEnhance}
              disabled={isEnhancing || !selectedFrameId}
              className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#6D28D9] hover:to-[#4F46E5] disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {isEnhancing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                  <span>Enhancing ({enhancingTimer}s)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Enhance {selectedFrameId || 'Frame'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Frames Thumbnail Strip */}
        <div className="space-y-2 pt-2 border-t border-[#2B2B36]">
          <div className="flex items-center justify-between text-xs text-[#8A8A98]">
            <span>Select a frame from this session to enhance:</span>
            <span>{frames.length} frames available</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {frames.map((frame, index) => {
              const isSelected = frame.id === selectedFrameId;
              const hasEnhanced = !!existingEnhancements[frame.id];
              const score = Math.round(frame.quality?.score ?? 0);

              return (
                <button
                  key={frame.id}
                  onClick={() => setSelectedFrameId(frame.id)}
                  className={`relative aspect-[4/5] w-20 sm:w-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 text-left group ${
                    isSelected
                      ? 'border-[#7C3AED] ring-4 ring-[#7C3AED]/30 scale-105 shadow-md'
                      : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={frame.url}
                    alt={frame.id}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                  {/* Top Badge: Score or Rank */}
                  <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 text-[#F59E0B] fill-[#F59E0B]" />
                    <span>{score}</span>
                  </div>

                  {/* Has Enhanced indicator */}
                  {hasEnhanced && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Bottom Label: ID */}
                  <div className="absolute bottom-1 inset-x-1 text-center">
                    <span className="text-[10px] font-mono text-white/90 truncate block">
                      #{index + 1}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Message if enhancement failed */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-4 flex items-start gap-3 text-rose-200 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-white mb-0.5">Enhancement Failed</h4>
            <p className="text-rose-200/90">{error}</p>
            <p className="text-[#8A8A98] mt-1 text-[11px]">
              The original frame is preserved and remains intact. You can retry with a different scale or select another frame.
            </p>
          </div>
        </div>
      )}

      {/* Loading Stage Indicator */}
      {isEnhancing && (
        <div className="bg-[#1C1C24] border border-[#7C3AED]/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-[#7C3AED]/20 border border-[#7C3AED]/40 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
            <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Enhancing your photo...</h3>
          <p className="text-[#8A8A98] text-xs max-w-md mb-5 leading-relaxed">
            Running GFPGAN v1.4 neural face restoration, high-precision bicubic super-resolution, and unsharp detail synthesis on <code className="text-purple-300 font-mono">{selectedFrameId}</code>.
          </p>

          <div className="flex items-center gap-3 text-xs text-[#8A8A98] bg-[#15151C] border border-[#2B2B36] px-4 py-2 rounded-xl">
            <Clock className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Elapsed: <strong className="text-white font-mono">{enhancingTimer}s</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">GFPGAN ONNX Active</span>
          </div>
        </div>
      )}

      {/* Before / After Comparison Showcase */}
      {enhancedResult && !isEnhancing && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* View Mode Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#181822] border border-[#2B2B36] p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8A8A98] uppercase tracking-wider ml-2 mr-1">Comparison:</span>
              <button
                onClick={() => setComparisonMode('slider')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  comparisonMode === 'slider' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-[#8A8A98] hover:text-white'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Swipe Split-Slider
              </button>
              <button
                onClick={() => setComparisonMode('side-by-side')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  comparisonMode === 'side-by-side' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-[#8A8A98] hover:text-white'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                Side by Side
              </button>
              <button
                onClick={() => setComparisonMode('face-zoom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  comparisonMode === 'face-zoom' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-[#8A8A98] hover:text-white'
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5" />
                Facial Detail 3x Zoom
              </button>
            </div>

            {/* Download Button */}
            <a
              href={enhancedResult.enhancedUrl}
              download={`${enhancedResult.frameId}-enhanced.jpg`}
              className="bg-[#1C1C24] hover:bg-[#252532] text-white border border-[#2B2B36] hover:border-purple-500/50 px-4 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              Download Enhanced ({enhancedResult.enhancedDimensions.width}×{enhancedResult.enhancedDimensions.height})
            </a>
          </div>

          {/* Interactive Split-Slider View */}
          {comparisonMode === 'slider' && (
            <div className="bg-[#15151C] border border-[#2B2B36] rounded-3xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3 text-xs text-[#8A8A98]">
                <span>Drag slider left/right to compare original video frame vs. neural enhanced portrait</span>
                <span className="font-mono text-purple-300">Split: {Math.round(sliderPosition)}%</span>
              </div>

              <div
                className="relative aspect-[4/3] sm:aspect-[16/10] max-h-[650px] w-full rounded-2xl overflow-hidden select-none cursor-ew-resize bg-black shadow-2xl border border-white/10"
                onMouseDown={() => (isDraggingSlider.current = true)}
                onMouseUp={() => (isDraggingSlider.current = false)}
                onMouseLeave={() => (isDraggingSlider.current = false)}
                onTouchStart={() => (isDraggingSlider.current = true)}
                onTouchEnd={() => (isDraggingSlider.current = false)}
                onMouseMove={(e) => {
                  if (isDraggingSlider.current) {
                    handleSliderMove(e.clientX, e.currentTarget.getBoundingClientRect());
                  }
                }}
                onTouchMove={(e) => {
                  if (isDraggingSlider.current && e.touches[0]) {
                    handleSliderMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
                  }
                }}
                onClick={(e) => {
                  handleSliderMove(e.clientX, e.currentTarget.getBoundingClientRect());
                }}
              >
                {/* Enhanced Image (Background) */}
                <img
                  src={enhancedResult.enhancedUrl}
                  alt="Enhanced"
                  className="w-full h-full object-contain absolute inset-0 pointer-events-none"
                />

                {/* Original Image (Clipped Overlay on Left) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={enhancedResult.originalUrl}
                    alt="Original"
                    className="w-full h-full object-contain absolute inset-0 max-w-none"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                  {/* Original Label Tag */}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/20 shadow-md">
                    Original Frame ({enhancedResult.originalDimensions.width}×{enhancedResult.originalDimensions.height})
                  </div>
                </div>

                {/* Enhanced Label Tag (Right) */}
                <div className="absolute top-4 right-4 bg-purple-950/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-purple-200 border border-purple-500/40 shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  GFPGAN Enhanced ({enhancedResult.enhancedDimensions.width}×{enhancedResult.enhancedDimensions.height})
                </div>

                {/* Divider Line & Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none z-30"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white text-black rounded-full flex items-center justify-center shadow-2xl border-2 border-[#7C3AED]">
                    <ArrowLeftRight className="w-4 h-4 text-[#7C3AED]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Side by Side Mode */}
          {comparisonMode === 'side-by-side' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Frame Card */}
              <div className="bg-[#1C1C24] border border-[#2B2B36] rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8A8A98]" />
                    <h3 className="font-bold text-white text-sm">Original Frame</h3>
                  </div>
                  <span className="font-mono text-xs text-[#8A8A98] bg-[#15151C] px-2 py-0.5 rounded border border-[#2B2B36]">
                    {enhancedResult.originalDimensions.width} × {enhancedResult.originalDimensions.height}
                  </span>
                </div>

                <div className="relative aspect-[4/5] bg-[#121218] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                  <img
                    src={enhancedResult.originalUrl}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-white/90">
                    Pre-enhancement
                  </div>
                </div>
              </div>

              {/* Enhanced Frame Card */}
              <div className="bg-[#1C1C24] border border-[#7C3AED]/40 rounded-3xl p-5 space-y-3 shadow-lg shadow-purple-900/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>GFPGAN Enhanced</span>
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                    {enhancedResult.enhancedDimensions.width} × {enhancedResult.enhancedDimensions.height} ({enhancedResult.scaleFactor}×)
                  </span>
                </div>

                <div className="relative aspect-[4/5] bg-[#121218] rounded-2xl overflow-hidden border border-[#7C3AED]/30 flex items-center justify-center">
                  <img
                    src={enhancedResult.enhancedUrl}
                    alt="Enhanced"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-3 left-3 bg-purple-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-purple-200 border border-purple-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Neural Restored
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Facial Detail 3x Zoom Mode */}
          {comparisonMode === 'face-zoom' && (
            <div className="bg-[#1C1C24] border border-[#2B2B36] rounded-3xl p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <ZoomIn className="w-4 h-4 text-[#7C3AED]" />
                  Facial Detail Inspection
                </h3>
                <p className="text-xs text-[#8A8A98]">
                  Comparing eye clarity, iris sharpness, smile texture, and skin detail directly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#8A8A98] uppercase">Original (Soft / Pixelated)</span>
                  <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black">
                    <img
                      src={enhancedResult.originalUrl}
                      alt="Original Zoom"
                      className="w-full h-full object-cover scale-[2.2] origin-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-purple-300 uppercase flex items-center gap-1.5">
                    <span>GFPGAN Restored (Crisp & High-Res)</span>
                    <Sparkles className="w-3 h-3 text-purple-400" />
                  </span>
                  <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#7C3AED]/40 bg-black shadow-lg">
                    <img
                      src={enhancedResult.enhancedUrl}
                      alt="Enhanced Zoom"
                      className="w-full h-full object-cover scale-[2.2] origin-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Model Telemetry & Benchmark Card */}
          <div className="bg-[#181822] border border-[#2B2B36] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2B2B36]">
              <Activity className="w-4 h-4 text-[#7C3AED]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A8A98]">
                Neural Model Benchmark & Telemetry
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-[#121218] p-3 rounded-xl border border-[#2B2B36]">
                <span className="text-[#8A8A98] block mb-1">Architecture</span>
                <span className="font-bold text-white text-xs">{enhancedResult.modelUsed}</span>
              </div>

              <div className="bg-[#121218] p-3 rounded-xl border border-[#2B2B36]">
                <span className="text-[#8A8A98] block mb-1">Processing Time</span>
                <span className="font-bold font-mono text-emerald-400 text-sm">
                  {(enhancedResult.processingTimeMs / 1000).toFixed(2)}s
                </span>
              </div>

              <div className="bg-[#121218] p-3 rounded-xl border border-[#2B2B36]">
                <span className="text-[#8A8A98] block mb-1">Resolution Shift</span>
                <span className="font-bold font-mono text-purple-300 text-xs">
                  {enhancedResult.originalDimensions.width}×{enhancedResult.originalDimensions.height} → {enhancedResult.enhancedDimensions.width}×{enhancedResult.enhancedDimensions.height}
                </span>
              </div>

              <div className="bg-[#121218] p-3 rounded-xl border border-[#2B2B36]">
                <span className="text-[#8A8A98] block mb-1">Face Restoration</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {enhancedResult.faceEnhanced ? 'Active & Blended' : 'Fallback'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State when no frame is enhanced yet */}
      {!enhancedResult && !isEnhancing && activeFrame && (
        <div className="bg-[#1C1C24] border border-[#2B2B36] rounded-3xl p-10 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center text-[#A78BFA] shadow-[0_0_20px_rgba(124,58,237,0.2)]">
            <Sparkles className="w-8 h-8 text-[#7C3AED]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Ready to Test Super-Resolution</h3>
            <p className="text-xs text-[#8A8A98] leading-relaxed">
              Selected frame <code className="text-purple-300 font-mono font-bold">{selectedFrameId}</code> is loaded. Click the button below to run GFPGAN v1.4 neural face restoration and 2x super-resolution.
            </p>
          </div>

          <div className="aspect-[4/5] w-36 rounded-xl overflow-hidden border border-white/20 shadow-md">
            <img src={activeFrame.url} alt="Selected" className="w-full h-full object-cover" />
          </div>

          <button
            onClick={handleEnhance}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Run GFPGAN Enhancement</span>
          </button>
        </div>
      )}
    </div>
  );
}
