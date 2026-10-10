import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Check, X, ChevronLeft, ChevronRight, Maximize2, Eye, 
  Smile, Compass, Activity, EyeOff, CheckCircle2, 
  AlertCircle, Sparkles, Layers, Sliders, Zap, ArrowDownUp,
  Focus, Trophy, Award, ShieldAlert, BarChart3
} from 'lucide-react';
import { FrameItem } from '../types';

interface FrameGalleryProps {
  referenceId: string;
  initialFrames?: FrameItem[];
}

type SortOption = 'quality_desc' | 'quality_asc' | 'sharpness_desc' | 'default';
type FilterOption = 'all' | 'top_picks' | 'good' | 'low_quality' | 'sharp_only';

export default function FrameGallery({ referenceId, initialFrames }: FrameGalleryProps) {
  const [frames, setFrames] = useState<FrameItem[]>(initialFrames || []);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(!initialFrames || initialFrames.length === 0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [showDebugOverlay, setShowDebugOverlay] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('quality_desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  useEffect(() => {
    if (!initialFrames || initialFrames.length === 0) {
      fetch(`/api/frames/${referenceId}`)
        .then((res) => res.json())
        .then((data) => {
          setFrames(data.frames || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [referenceId, initialFrames]);

  // Sorted and filtered frames for verification
  const processedFrames = useMemo(() => {
    let result = [...frames];

    if (filterBy === 'top_picks') {
      result = result.filter(f => (f.quality?.score ?? 0) >= 75);
    } else if (filterBy === 'good') {
      result = result.filter(f => (f.quality?.score ?? 0) >= 50);
    } else if (filterBy === 'low_quality') {
      result = result.filter(f => (f.quality?.score ?? 0) < 50);
    } else if (filterBy === 'sharp_only') {
      result = result.filter(f => (f.sharpness?.score ?? 0) >= 65);
    }

    if (sortBy === 'quality_desc') {
      result.sort((a, b) => (b.quality?.score ?? 0) - (a.quality?.score ?? 0));
    } else if (sortBy === 'quality_asc') {
      result.sort((a, b) => (a.quality?.score ?? 0) - (b.quality?.score ?? 0));
    } else if (sortBy === 'sharpness_desc') {
      result.sort((a, b) => (b.sharpness?.score ?? 0) - (a.sharpness?.score ?? 0));
    }

    return result;
  }, [frames, sortBy, filterBy]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (previewIndex === null) return;
    if (e.key === 'Escape') setPreviewIndex(null);
    if (e.key === 'ArrowRight') setPreviewIndex((prev) => (prev !== null && prev < processedFrames.length - 1 ? prev + 1 : prev));
    if (e.key === 'ArrowLeft') setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, [previewIndex, processedFrames.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const selectAll = () => {
    if (selected.size === processedFrames.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(processedFrames.map((f) => f.id)));
    }
  };

  const formatTimestamp = (frame: FrameItem, fallbackIndex: number) => {
    const totalSeconds = frame.timestamp ?? (fallbackIndex * 0.5);
    const m = Math.floor(totalSeconds / 60);
    const s = (totalSeconds % 60).toFixed(1);
    return `${m.toString().padStart(2, '0')}:${s.padStart(4, '0')}`;
  };

  const getQualityBadge = (frame: FrameItem) => {
    if (!frame.quality) return null;
    const score = frame.quality.score;
    const rank = frame.quality.rank;
    const rating = frame.quality.rating;

    if (rating === 'excellent') {
      return {
        label: rank ? `#${rank} Top Pick • ${score}%` : `${score}% Excellent`,
        bg: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
        color: 'text-emerald-400',
        icon: Trophy
      };
    }
    if (rating === 'good') {
      return {
        label: rank ? `#${rank} • ${score}%` : `${score}% Good`,
        bg: 'bg-purple-500/25 text-purple-200 border-purple-500/40',
        color: 'text-purple-400',
        icon: Award
      };
    }
    if (rating === 'fair') {
      return {
        label: rank ? `#${rank} • ${score}%` : `${score}% Fair`,
        bg: 'bg-amber-500/25 text-amber-200 border-amber-500/40',
        color: 'text-amber-400',
        icon: BarChart3
      };
    }
    return {
      label: rank ? `#${rank} • ${score}%` : `${score}% Low`,
      bg: 'bg-rose-500/25 text-rose-300 border-rose-500/40',
      color: 'text-rose-400',
      icon: ShieldAlert
    };
  };

  const getEyeBadge = (frame: FrameItem) => {
    if (!frame.face || !frame.face.detected) return null;
    const state = frame.face.eyes.state;
    if (state === 'both_open') {
      return { label: 'Eyes Open', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Eye };
    }
    if (state === 'one_closed') {
      return { label: '1 Eye Closed', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Eye };
    }
    return { label: 'Eyes Closed', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: EyeOff };
  };

  const getExpressionBadge = (frame: FrameItem) => {
    if (!frame.face || !frame.face.detected) return null;
    const exp = frame.face.expression;
    if (exp.isSmiling) {
      return { label: `Smile (${Math.round(exp.smileScore * 100)}%)`, bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    }
    if (exp.type === 'open_mouth') {
      return { label: 'Open Mouth', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
    }
    return { label: 'Neutral', bg: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40' };
  };

  const getAngleBadge = (frame: FrameItem) => {
    if (!frame.face || !frame.face.detected) return null;
    const angle = frame.face.angle;
    const label = angle.orientation.replace('_', ' ');
    return { label, bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
  };

  const getSharpnessBadge = (frame: FrameItem) => {
    if (!frame.sharpness) return null;
    const score = frame.sharpness.score;
    const level = frame.sharpness.level;
    const target = frame.sharpness.target === 'face' ? 'Face' : 'Full';

    if (level === 'sharp') {
      return {
        label: `${score}% Sharp [${target}]`,
        bg: 'bg-cyan-500/25 text-cyan-200 border-cyan-500/40',
        scoreColor: 'text-cyan-400'
      };
    }
    if (level === 'soft') {
      return {
        label: `${score}% Soft [${target}]`,
        bg: 'bg-amber-500/25 text-amber-200 border-amber-500/40',
        scoreColor: 'text-amber-400'
      };
    }
    return {
      label: `${score}% Blur [${target}]`,
      bg: 'bg-rose-500/25 text-rose-200 border-rose-500/40',
      scoreColor: 'text-rose-400'
    };
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <div className="text-[#8A8A98] font-medium animate-pulse">Loading gallery & composite rankings...</div>
      </div>
    );
  }

  if (frames.length === 0) {
    return (
      <div className="w-full bg-[#1C1C24] border border-[#2B2B36] rounded-2xl p-12 text-center shadow-sm">
        <p className="text-[#8A8A98]">No frames found for this session.</p>
      </div>
    );
  }

  const activeFrame = previewIndex !== null ? processedFrames[previewIndex] : null;

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 bg-[#1C1C24] border border-[#2B2B36] p-4 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-bold text-lg">Composite Quality Ranking (Stage 8)</h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Ranked Best → Worst
              </span>
            </div>
            <p className="text-[#8A8A98] text-sm mt-0.5">
              {frames.length} frames evaluated: Sharpness (40%) + Face & Eyes (35%) + Body Pose (25%)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Dropdown */}
            <div className="flex items-center bg-[#15151C] border border-[#2B2B36] rounded-lg px-2.5 py-1.5 text-xs text-white">
              <ArrowDownUp className="w-3.5 h-3.5 text-[#8A8A98] mr-1.5" />
              <span className="text-[#8A8A98] mr-1.5">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
              >
                <option value="quality_desc" className="bg-[#15151C] text-white">Composite Quality (Best → Worst)</option>
                <option value="quality_asc" className="bg-[#15151C] text-white">Composite Quality (Worst → Best)</option>
                <option value="sharpness_desc" className="bg-[#15151C] text-white">Sharpness (High → Low)</option>
                <option value="default" className="bg-[#15151C] text-white">Timeline Order</option>
              </select>
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center bg-[#15151C] border border-[#2B2B36] rounded-lg px-2.5 py-1.5 text-xs text-white">
              <Trophy className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
              <span className="text-[#8A8A98] mr-1.5">Filter:</span>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
              >
                <option value="all" className="bg-[#15151C] text-white">All ({frames.length})</option>
                <option value="top_picks" className="bg-[#15151C] text-white">Top Picks (≥75%)</option>
                <option value="good" className="bg-[#15151C] text-white">Good (≥50%)</option>
                <option value="low_quality" className="bg-[#15151C] text-white">Low Quality (&lt;50%)</option>
                <option value="sharp_only" className="bg-[#15151C] text-white">Sharp Only (≥65%)</option>
              </select>
            </div>

            <button
              onClick={() => setShowDebugOverlay(!showDebugOverlay)}
              className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors font-medium ${
                showDebugOverlay
                  ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-purple-200'
                  : 'bg-[#15151C] border-[#2B2B36] text-[#8A8A98] hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              {showDebugOverlay ? 'Badges On' : 'Badges Off'}
            </button>

            <button
              onClick={selectAll}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#2B2B36] text-white hover:bg-[#20202A] font-medium transition-colors"
            >
              {selected.size === processedFrames.length ? 'Deselect' : 'Select All'}
            </button>
          </div>
        </div>
      </div>

      {/* Frame Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {processedFrames.map((frame, index) => {
          const isSelected = selected.has(frame.id);
          const qualityBadge = getQualityBadge(frame);
          const eyeBadge = getEyeBadge(frame);
          const expBadge = getExpressionBadge(frame);
          const sharpnessBadge = getSharpnessBadge(frame);

          return (
            <div
              key={frame.id}
              className={`group relative aspect-[3/4] bg-[#15151C] rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                  : frame.quality?.rating === 'excellent'
                  ? 'border-emerald-500/40 hover:border-emerald-400'
                  : frame.quality?.rating === 'good'
                  ? 'border-purple-500/30 hover:border-purple-400'
                  : 'border-transparent hover:border-white/20'
              }`}
            >
              {/* Image Thumbnail */}
              <img
                src={frame.url}
                alt={`Frame ${index + 1}`}
                onClick={() => setPreviewIndex(index)}
                className={`w-full h-full object-cover absolute inset-0 transition-transform duration-500 ${
                  isSelected ? 'scale-105 opacity-100' : 'group-hover:scale-105 opacity-85 group-hover:opacity-100'
                }`}
              />

              {/* Expand Icon Overlay (Hover) */}
              <div 
                onClick={() => setPreviewIndex(index)}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none"
              >
                 <div className="bg-black/60 backdrop-blur-sm p-3 rounded-full text-white/90 shadow-lg">
                   <Maximize2 className="w-5 h-5" />
                 </div>
              </div>

              {/* Top Row: Checkbox + Timestamp + Composite Quality Pill */}
              <div className="relative z-10 p-2 flex items-center justify-between pointer-events-none">
                <div
                  onClick={(e) => { e.stopPropagation(); toggleSelection(frame.id); }}
                  className={`w-6 h-6 rounded border backdrop-blur-md flex items-center justify-center transition-all pointer-events-auto ${
                    isSelected
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                      : 'bg-black/40 border-white/30 text-transparent hover:border-white/60'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                </div>

                <div className="flex items-center gap-1.5">
                  {qualityBadge && (
                    <div className={`backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold border shadow-sm flex items-center gap-1 ${qualityBadge.bg}`}>
                      <qualityBadge.icon className="w-2.5 h-2.5" />
                      {qualityBadge.label}
                    </div>
                  )}
                  <div className="bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white/90 border border-white/10 shadow-sm">
                    {formatTimestamp(frame, index)}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Vision Pipeline Badges */}
              {showDebugOverlay && (
                <div className="relative z-10 p-2 space-y-1 pointer-events-none bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                  {/* Sharpness detail tag */}
                  {sharpnessBadge && (
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${sharpnessBadge.bg}`}>
                        <Focus className="w-2.5 h-2.5" />
                        {sharpnessBadge.label}
                      </span>
                    </div>
                  )}

                  {frame.face && frame.face.detected ? (
                    <div className="flex flex-col gap-1">
                      {eyeBadge && (
                        <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded border ${eyeBadge.bg}`}>
                          <eyeBadge.icon className="w-2.5 h-2.5" />
                          {eyeBadge.label}
                        </span>
                      )}
                      <div className="flex items-center gap-1 flex-wrap">
                        {expBadge && (
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border capitalize ${expBadge.bg}`}>
                            {expBadge.label}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="inline-block text-[9px] font-mono bg-zinc-800/80 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
                      No Face Detected
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fullscreen Inspector Modal */}
      {previewIndex !== null && activeFrame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/90 to-transparent">
             <div className="flex items-center gap-4 flex-wrap">
               <span className="text-white font-mono text-sm bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 shadow-sm flex items-center gap-2">
                 <Trophy className="w-4 h-4 text-emerald-400" />
                 Rank #{activeFrame.quality?.rank ?? (previewIndex + 1)} of {processedFrames.length} • Quality: {activeFrame.quality?.score ?? 'N/A'}/100 • {formatTimestamp(activeFrame, previewIndex)}
               </span>
               <button
                  onClick={(e) => { e.stopPropagation(); toggleSelection(activeFrame.id); }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border transition-all text-sm font-medium ${
                    selected.has(activeFrame.id)
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                      : 'bg-black/40 border-white/30 text-white hover:bg-white/10'
                  }`}
                >
                  <Check className={`w-4 h-4 ${selected.has(activeFrame.id) ? 'opacity-100' : 'opacity-30'}`} strokeWidth={3} />
                  {selected.has(activeFrame.id) ? 'Selected' : 'Select Frame'}
                </button>
                <button
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    showSkeleton 
                      ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-purple-200' 
                      : 'bg-black/40 border-white/20 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {showSkeleton ? 'Hide Landmark Skeleton' : 'Show Landmark Skeleton'}
                </button>
             </div>
             
             <button 
               onClick={() => setPreviewIndex(null)}
               className="p-2 rounded-full bg-black/50 hover:bg-white/10 text-white transition-colors border border-white/10"
             >
               <X className="w-6 h-6" />
             </button>
          </div>

          {/* Navigation Arrows */}
          {previewIndex > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex - 1); }}
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-white/10 text-white transition-colors border border-white/10 z-50 group"
            >
              <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
            </button>
          )}

          {previewIndex < processedFrames.length - 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex + 1); }}
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-white/10 text-white transition-colors border border-white/10 z-50 group"
            >
              <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {/* Modal Content: Image Stage + Vision Metadata Panel */}
          <div className="w-full h-full pt-20 pb-8 px-4 sm:px-12 flex flex-col lg:flex-row items-center justify-center gap-6 max-w-7xl mx-auto overflow-y-auto">
            {/* Main Image with Landmark Overlays */}
            <div className="relative flex-1 flex items-center justify-center max-h-[70vh] lg:max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
              <div className="relative inline-block max-h-full max-w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <img 
                  src={activeFrame.url} 
                  alt={`Frame ${previewIndex + 1}`}
                  className="max-w-full max-h-[65vh] lg:max-h-[80vh] object-contain block"
                />

                {/* SVG Landmark Overlay */}
                {showSkeleton && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Render Face Crop Bounding Box Analyzed for Sharpness */}
                    {activeFrame.face?.bbox && (
                      <rect
                        x={activeFrame.face.bbox.x * 100}
                        y={activeFrame.face.bbox.y * 100}
                        width={activeFrame.face.bbox.width * 100}
                        height={activeFrame.face.bbox.height * 100}
                        fill="rgba(6, 182, 212, 0.12)"
                        stroke="#06B6D4"
                        strokeWidth="0.8"
                        strokeDasharray="2,2"
                      />
                    )}

                    {/* Render Pose Skeleton Landmarks */}
                    {activeFrame.pose?.landmarks?.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x * 100}
                        cy={pt.y * 100}
                        r="1.2"
                        fill="#10B981"
                        stroke="#ffffff"
                        strokeWidth="0.4"
                      />
                    ))}
                  </svg>
                )}
              </div>
            </div>

            {/* Vision Telemetry Sidebar */}
            <div className="w-full lg:w-96 bg-[#181822]/95 border border-[#2B2B36] rounded-2xl p-5 text-white flex flex-col gap-4 max-h-[75vh] overflow-y-auto shadow-2xl backdrop-blur-md shrink-0">
              <div className="flex items-center justify-between border-b border-[#2B2B36] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <h4 className="font-bold text-sm">Vision Pipeline Telemetry</h4>
                </div>
                <span className="text-[11px] font-mono text-[#8A8A98]">Frame #{previewIndex + 1}</span>
              </div>

              {/* 1. Stage 8 Composite Quality Score Breakdown */}
              {activeFrame.quality && (
                <div className="space-y-2.5 bg-gradient-to-b from-[#1c1c28] to-[#121218] border border-emerald-500/30 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-xs uppercase tracking-wider text-white">Composite Quality Score</span>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Rank #{activeFrame.quality.rank}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-black font-mono text-white">
                      {activeFrame.quality.score} <span className="text-xs text-[#8A8A98] font-normal">/ 100</span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      {activeFrame.quality.rating}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-[#8A8A98] mb-1">
                        <span>Sharpness Weight (40%)</span>
                        <span className="text-cyan-300 font-mono">{activeFrame.quality.breakdown.sharpnessScore}/100</span>
                      </div>
                      <div className="w-full bg-[#1A1A24] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full" style={{ width: `${activeFrame.quality.breakdown.sharpnessScore}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-[#8A8A98] mb-1">
                        <span>Face & Expression Weight (35%)</span>
                        <span className="text-purple-300 font-mono">{activeFrame.quality.breakdown.faceScore}/100</span>
                      </div>
                      <div className="w-full bg-[#1A1A24] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-400 h-full" style={{ width: `${activeFrame.quality.breakdown.faceScore}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-[#8A8A98] mb-1">
                        <span>Body Pose Weight (25%)</span>
                        <span className="text-emerald-300 font-mono">{activeFrame.quality.breakdown.poseScore}/100</span>
                      </div>
                      <div className="w-full bg-[#1A1A24] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full" style={{ width: `${activeFrame.quality.breakdown.poseScore}%` }} />
                      </div>
                    </div>
                  </div>

                  {activeFrame.quality.breakdown.penalties.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/80">
                      <span className="text-[10px] text-amber-400 font-bold block mb-1 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Gating Flags & Penalties:
                      </span>
                      <ul className="text-[10px] text-zinc-300 space-y-0.5 list-disc pl-3 font-mono">
                        {activeFrame.quality.breakdown.penalties.map((p, pi) => (
                          <li key={pi}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Sharpness & Focus Module (Stage 7 Feature) */}
              <div className="space-y-2.5">
                <h5 className="text-xs uppercase tracking-wider text-cyan-400 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Focus className="w-3.5 h-3.5 text-cyan-400" />
                    Sharpness & Focus Signal
                  </span>
                  {activeFrame.sharpness && (
                    <span className="text-[10px] font-mono capitalize px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {activeFrame.sharpness.target === 'face' ? 'Face Crop ROI' : 'Full Frame'}
                    </span>
                  )}
                </h5>

                {activeFrame.sharpness ? (
                  <div className="bg-[#121218] border border-cyan-500/20 rounded-xl p-3.5 space-y-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[#8A8A98]">Sharpness Score</span>
                        <span className={`font-mono font-bold text-sm ${
                          activeFrame.sharpness.level === 'sharp' ? 'text-cyan-400' :
                          activeFrame.sharpness.level === 'soft' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {activeFrame.sharpness.score} / 100
                        </span>
                      </div>
                      <div className="w-full bg-[#1A1A24] h-2 rounded-full overflow-hidden border border-[#2B2B36]">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            activeFrame.sharpness.level === 'sharp' ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' :
                            activeFrame.sharpness.level === 'soft' ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${activeFrame.sharpness.score}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#1a1a24] p-2 rounded-lg font-mono">
                      <div>Focus State: <span className="capitalize font-bold text-white">{activeFrame.sharpness.level}</span></div>
                      <div>Laplacian Var: <span className="text-cyan-300">{activeFrame.sharpness.variance}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#121218] border border-[#2B2B36] rounded-xl p-3.5 text-xs text-[#8A8A98] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-zinc-500" />
                    <span>No sharpness score calculated for this frame.</span>
                  </div>
                )}
              </div>

              {/* 3. Facial Analysis Module */}
              <div className="space-y-2.5">
                <h5 className="text-xs uppercase tracking-wider text-[#8A8A98] font-bold flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-purple-400" />
                  Facial Landmarks & Expression
                </h5>

                {activeFrame.face && activeFrame.face.detected ? (
                  <div className="bg-[#121218] border border-[#2B2B36] rounded-xl p-3.5 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8A8A98] flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        Eyes Status
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono font-medium border ${
                        activeFrame.face.eyes.state === 'both_open'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : activeFrame.face.eyes.state === 'one_closed'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {activeFrame.face.eyes.state.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#1a1a24] p-2 rounded-lg font-mono">
                      <div>L-Eye: <span className="text-emerald-400">{activeFrame.face.eyes.leftOpen ? 'OPEN' : 'CLOSED'}</span> ({Math.round(activeFrame.face.eyes.leftScore * 100)}%)</div>
                      <div>R-Eye: <span className="text-emerald-400">{activeFrame.face.eyes.rightOpen ? 'OPEN' : 'CLOSED'}</span> ({Math.round(activeFrame.face.eyes.rightScore * 100)}%)</div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                      <span className="text-[#8A8A98]">Expression</span>
                      <div className="text-right">
                        <span className="capitalize font-bold text-white block">
                          {activeFrame.face.expression.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-[#8A8A98] font-mono">
                          Smile Score: {Math.round(activeFrame.face.expression.smileScore * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                      <span className="text-[#8A8A98] flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-indigo-400" />
                        Orientation
                      </span>
                      <span className="capitalize font-mono text-indigo-300">
                        {activeFrame.face.angle.orientation.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#121218] border border-[#2B2B36] rounded-xl p-3.5 text-xs text-[#8A8A98] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-zinc-500" />
                    <span>No facial landmarks detected in this frame.</span>
                  </div>
                )}
              </div>

              {/* 4. Pose Landmark Module */}
              <div className="space-y-2.5">
                <h5 className="text-xs uppercase tracking-wider text-[#8A8A98] font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Body Pose & Posture
                </h5>

                {activeFrame.pose && activeFrame.pose.detected ? (
                  <div className="bg-[#121218] border border-[#2B2B36] rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8A8A98]">Posture Type</span>
                      <span className="capitalize font-bold text-emerald-400 font-mono">
                        {activeFrame.pose.keyAngles?.posture || 'Detected'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8A8A98]">Confidence</span>
                      <span className="font-mono text-purple-300">
                        {Math.round(activeFrame.pose.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#121218] border border-[#2B2B36] rounded-xl p-3.5 text-xs text-[#8A8A98] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-zinc-500" />
                    <span>No full body pose detected in this frame.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
