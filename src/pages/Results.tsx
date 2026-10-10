import { useState, useEffect, useCallback, useMemo, MouseEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, Sparkles, Check, CheckCircle2, ChevronRight, ChevronLeft, 
  X, Eye, Maximize2, RefreshCw, Upload, AlertCircle, Trophy, 
  Award, Sliders, Layers, ArrowRight, ShieldAlert, ArrowDownUp,
  Download, Wand2, Info, EyeOff, Smile, Focus, Activity,
  CheckCheck
} from 'lucide-react';
import { FrameItem } from '../types';

type QualityTier = 'Best' | 'Great' | 'Good' | 'Fair' | 'Low';

interface TierInfo {
  label: QualityTier;
  badgeClass: string;
  dotClass: string;
}

function getQualityTier(score: number): TierInfo {
  if (score >= 90) {
    return {
      label: 'Best',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 shadow-emerald-950/40',
      dotClass: 'bg-emerald-400'
    };
  }
  if (score >= 75) {
    return {
      label: 'Great',
      badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-700/80 shadow-purple-950/40',
      dotClass: 'bg-purple-400'
    };
  }
  if (score >= 50) {
    return {
      label: 'Good',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-700/80 shadow-amber-950/40',
      dotClass: 'bg-amber-400'
    };
  }
  if (score >= 30) {
    return {
      label: 'Fair',
      badgeClass: 'bg-stone-900 text-stone-300 border-stone-700',
      dotClass: 'bg-stone-400'
    };
  }
  return {
    label: 'Low',
    badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-700/80 shadow-rose-950/40',
    dotClass: 'bg-rose-400'
  };
}

export default function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referenceIdParam = searchParams.get('id') || searchParams.get('ref');

  const [referenceId, setReferenceId] = useState<string>(referenceIdParam || '');
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // View mode: 'top' (top 5-10 curated) vs 'all' (all extracted frames)
  const [viewMode, setViewMode] = useState<'top' | 'all'>('top');
  const [topLimit, setTopLimit] = useState<number>(8); // Top 8 by default (within 5-10 range)

  // Inspection modal
  const [inspectIndex, setInspectIndex] = useState<number | null>(null);
  const [showTelemetry, setShowTelemetry] = useState(false);

  const handleProceedToEnhancement = () => {
    const selectedList = Array.from(selectedIds);
    if (selectedList.length === 0) return;
    navigate(`/enhanced?id=${referenceId}&frames=${selectedList.join(',')}`);
  };

  // Fetch session data
  useEffect(() => {
    let activeId = referenceIdParam;

    if (!activeId) {
      // Try from localStorage
      const savedId = localStorage.getItem('posely_latest_session');
      if (savedId) {
        activeId = savedId;
      }
    }

    if (activeId) {
      setReferenceId(activeId);
      fetchSessionFrames(activeId);
    } else {
      // Try fetching latest session from backend
      fetch('/api/latest-session')
        .then(res => {
          if (!res.ok) throw new Error('No previous sessions found');
          return res.json();
        })
        .then(data => {
          if (data.referenceId && data.frames) {
            setReferenceId(data.referenceId);
            localStorage.setItem('posely_latest_session', data.referenceId);
            setFrames(data.frames);
            setLoading(false);
          } else {
            setLoading(false);
          }
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [referenceIdParam]);

  const fetchSessionFrames = async (refId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/frames/${refId}`);
      if (!res.ok) {
        throw new Error('Failed to load session frames');
      }
      const data = await res.json();
      const loadedFrames: FrameItem[] = data.frames || [];
      setFrames(loadedFrames);
      
      // Auto-select the top 3 best photos for convenience
      if (loadedFrames.length > 0) {
        const top3Ids = loadedFrames.slice(0, Math.min(3, loadedFrames.length)).map(f => f.id);
        setSelectedIds(new Set(top3Ids));
      }
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not load frames');
      setLoading(false);
    }
  };

  // Curated list: top 5-10 ranked frames by composite score
  const curatedTopFrames = useMemo(() => {
    return frames.slice(0, topLimit);
  }, [frames, topLimit]);

  const displayedFrames = viewMode === 'top' ? curatedTopFrames : frames;

  // Selected frame objects
  const selectedFramesList = useMemo(() => {
    return frames.filter(f => selectedIds.has(f.id));
  }, [frames, selectedIds]);

  // Check if session has predominantly low scores
  const isOverallLowQuality = useMemo(() => {
    if (frames.length === 0) return false;
    const avgScore = frames.reduce((acc, f) => acc + (f.quality?.score ?? 0), 0) / frames.length;
    return avgScore < 45 && (frames[0]?.quality?.score ?? 0) < 50;
  }, [frames]);

  // Selection handlers
  const toggleSelect = (id: string, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectTopN = (n: number) => {
    const topN = frames.slice(0, Math.min(n, frames.length)).map(f => f.id);
    setSelectedIds(new Set(topN));
  };

  const selectAllDisplayed = () => {
    if (selectedIds.size === displayedFrames.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedFrames.map(f => f.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Keyboard navigation in modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (inspectIndex === null) return;
    if (e.key === 'Escape') setInspectIndex(null);
    if (e.key === 'ArrowRight') {
      setInspectIndex(prev => (prev !== null && prev < displayedFrames.length - 1 ? prev + 1 : prev));
    }
    if (e.key === 'ArrowLeft') {
      setInspectIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
    }
  }, [inspectIndex, displayedFrames.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const activeInspectFrame = inspectIndex !== null ? displayedFrames[inspectIndex] : null;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-[#7C3AED]/20 border border-[#7C3AED]/40 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(124,58,237,0.25)]">
          <RefreshCw className="w-8 h-8 text-[#7C3AED] animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Curating Your Best Moments...</h2>
        <p className="text-[#8A8A98] max-w-md text-sm">
          Analyzing biometric landmarks, eye contact, smile confidence, and pixel sharpness across every frame.
        </p>
      </div>
    );
  }

  // Error / Empty Session State
  if (error || frames.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300 pb-16">
        <header>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Results</h1>
          <p className="text-[#8A8A98]">Your ranked photo results will appear here.</p>
        </header>

        <div className="bg-[#1C1C24] border border-[#2B2B36] rounded-2xl p-12 flex flex-col items-center justify-center text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-[#20202A] rounded-2xl flex items-center justify-center mb-5 text-[#8A8A98]">
            <AlertCircle className="w-8 h-8 text-[#7C3AED]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Processed Frames Found</h2>
          <p className="text-[#8A8A98] text-sm max-w-md mb-6 leading-relaxed">
            {error || "We couldn't find any analyzed video sessions yet. Upload a short video to extract and rank your best portrait moments automatically."}
          </p>
          <Link
            to="/upload"
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 text-sm transition-all shadow-md hover:shadow-lg"
          >
            <Upload className="w-4 h-4" />
            Upload a Video Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-28">
      {/* Header Section */}
      <header className="border-b border-[#252535] pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60 uppercase tracking-wider">
              Scored Poses
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-white tracking-tight">
            Scored Frames & Portrait Rankings
          </h1>
          <p className="text-[#8A8A98] text-sm md:text-base">
            <span className="text-white font-semibold">{frames.length} total frames</span> analyzed from your take • Showing top-ranked shots scored by pose, expression, and sharpness.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/upload"
            className="px-4 py-2 rounded-xl bg-[#181824] hover:bg-[#202030] text-stone-200 hover:text-white border border-[#2B2B38] text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Upload New Take</span>
          </Link>

          {/* Toggle between Top Picks and All Frames */}
          <div className="bg-[#181824] border border-[#2B2B38] p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('top')}
              className={`text-xs font-bold px-3 py-1.5 transition-all rounded-lg flex items-center gap-1.5 ${
                viewMode === 'top'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Top Ranked ({curatedTopFrames.length})
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`text-xs font-bold px-3 py-1.5 transition-all rounded-lg flex items-center gap-1.5 ${
                viewMode === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              All Frames ({frames.length})
            </button>
          </div>
        </div>
      </header>

      {/* Warning Alert if whole video was low clarity */}
      {isOverallLowQuality && (
        <div className="bg-[#2E1A1A] border border-rose-500/40 rounded-2xl p-4 sm:p-5 flex items-start gap-4 text-rose-200">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <h4 className="font-bold text-white mb-0.5">Low clarity detected across frames</h4>
            <p className="text-rose-200/90 text-xs sm:text-sm leading-relaxed mb-3">
              Most frames experienced motion blur, soft lighting, or indirect angles. You can still select and enhance these shots, or try uploading a steadier video with good front lighting.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Try Another Video
            </Link>
          </div>
        </div>
      )}

      {/* Filter / Quick Selection Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1C1C24] border border-[#2B2B36] p-4 rounded-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#8A8A98] uppercase tracking-wider mr-1">Quick Select:</span>
          <button
            onClick={() => selectTopN(3)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#15151C] hover:bg-[#20202A] text-white border border-[#2B2B36] transition-colors flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5 text-[#F59E0B]" />
            Top 3
          </button>
          <button
            onClick={() => selectTopN(5)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#15151C] hover:bg-[#20202A] text-white border border-[#2B2B36] transition-colors flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            Top 5
          </button>
          <button
            onClick={selectAllDisplayed}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#15151C] hover:bg-[#20202A] text-white border border-[#2B2B36] transition-colors"
          >
            {selectedIds.size === displayedFrames.length ? 'Deselect All' : 'Select All'}
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={clearSelection}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg text-[#8A8A98] hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#8A8A98]">
          {viewMode === 'top' && (
            <div className="flex items-center gap-2">
              <span>Show top:</span>
              <select
                value={topLimit}
                onChange={(e) => setTopLimit(Number(e.target.value))}
                className="bg-[#15151C] text-white border border-[#2B2B36] rounded-lg px-2 py-1 focus:outline-none focus:border-[#7C3AED] font-semibold text-xs cursor-pointer"
              >
                <option value={5}>Top 5</option>
                <option value={6}>Top 6</option>
                <option value={8}>Top 8</option>
                <option value={10}>Top 10</option>
              </select>
            </div>
          )}
          <span className="font-mono text-purple-300 font-bold bg-[#7C3AED]/20 border border-[#7C3AED]/30 px-2.5 py-1 rounded-lg">
            {selectedIds.size} Selected
          </span>
        </div>
      </div>

      {/* Photos Grid - Matching Home Dashboard Photo Grid Style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        {displayedFrames.map((frame, index) => {
          const isSelected = selectedIds.has(frame.id);
          const score = Math.round(frame.quality?.score ?? 0);
          const rank = frame.quality?.rank ?? (index + 1);
          const tier = getQualityTier(score);

          return (
            <div
              key={frame.id}
              onClick={() => toggleSelect(frame.id)}
              className={`group relative aspect-[4/5] bg-[#15151C] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 flex flex-col justify-between shadow-md ${
                isSelected
                  ? 'border-[#7C3AED] ring-4 ring-[#7C3AED]/30 shadow-[0_10px_25px_rgba(124,58,237,0.35)] scale-[1.01]'
                  : 'border-white/5 hover:border-white/20 hover:shadow-xl'
              }`}
            >
              {/* Photo Image */}
              <img
                src={frame.url}
                alt={`Shot ${rank}`}
                className={`w-full h-full object-cover absolute inset-0 transition-transform duration-700 ease-out ${
                  isSelected ? 'scale-105 brightness-105' : 'group-hover:scale-105 opacity-90 group-hover:opacity-100'
                }`}
              />

              {/* Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none transition-opacity duration-300 group-hover:opacity-90" />

              {/* Top Row: Quality Tier Pill + Composite Score Badge */}
              <div className="relative z-10 p-3 flex items-start justify-between">
                {/* Tier Badge */}
                <div className={`backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 shadow-sm ${tier.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${tier.dotClass}`} />
                  <span>#{rank} {tier.label}</span>
                </div>

                {/* Score Badge - Matching Home Dashboard Style */}
                <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-white border border-white/10 shadow-lg">
                  <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                  <span>{score}</span>
                </div>
              </div>

              {/* Inspect Button Center (on hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInspectIndex(index);
                }}
                className="absolute inset-0 m-auto w-11 h-11 bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 hover:scale-110 shadow-xl"
                title="Inspect Photo"
              >
                <Maximize2 className="w-5 h-5 text-white" />
              </button>

              {/* Bottom Row: Selection Checkbox & Key Quality Sub-tags */}
              <div className="relative z-10 p-3 flex items-end justify-between">
                <div className="space-y-1">
                  {frame.face?.expression && (
                    <span className="inline-block text-[11px] font-medium text-white/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 capitalize shadow-sm">
                      {frame.face.expression.isSmiling ? 'Smiling 😊' : frame.face.expression.type.replace('_', ' ')}
                    </span>
                  )}
                  {frame.sharpness && (
                    <p className="text-[10px] text-white/70 font-mono drop-shadow">
                      {frame.sharpness.score}% sharpness
                    </p>
                  )}
                </div>

                {/* Custom Selection Checkbox */}
                <div
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all duration-200 shadow-md ${
                    isSelected
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white scale-110'
                      : 'bg-black/50 border-white/30 text-transparent hover:border-white/70'
                  }`}
                >
                  <Check className={`w-4 h-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Persistent Floating Bottom Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 inset-x-4 max-w-4xl mx-auto z-40">
          <div className="bg-[#161622]/95 backdrop-blur-xl border border-[#2B2B38] p-4 sm:p-5 shadow-2xl shadow-purple-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl text-white">
            {/* Selected Avatars & Count */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="flex -space-x-2.5 overflow-hidden">
                {selectedFramesList.slice(0, 4).map((f) => (
                  <img
                    key={f.id}
                    src={f.url}
                    alt="Selected"
                    className="inline-block w-11 h-11 rounded-xl object-cover ring-2 ring-purple-500 shadow-md"
                  />
                ))}
                {selectedIds.size > 4 && (
                  <div className="w-11 h-11 rounded-xl bg-[#2A2A38] text-purple-300 ring-2 ring-purple-500 flex items-center justify-center font-bold text-xs shadow-md">
                    +{selectedIds.size - 4}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                  <span>{selectedIds.size} {selectedIds.size === 1 ? 'photo' : 'photos'} selected</span>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-semibold border border-emerald-500/30">
                    Ready
                  </span>
                </h4>
                <p className="text-stone-400 text-xs">
                  Proceed to AI enhancement & studio presets
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={clearSelection}
                className="px-4 py-2.5 rounded-xl border border-[#2B2B36] text-xs font-semibold text-stone-400 hover:text-white hover:bg-[#20202A] transition-colors"
              >
                Deselect
              </button>

              <button
                onClick={handleProceedToEnhancement}
                className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-6 py-2.5 flex items-center justify-center gap-2 text-xs rounded-xl shadow-lg shadow-purple-950/40 transition-all active:scale-95"
              >
                <span>Proceed to Studio Enhancer [{selectedIds.size}]</span>
                <span className="font-mono">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Inspector Modal */}
      {inspectIndex !== null && activeInspectFrame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/90 to-transparent">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-white font-mono text-sm bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 shadow-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                Rank #{activeInspectFrame.quality?.rank ?? (inspectIndex + 1)} • Score: {Math.round(activeInspectFrame.quality?.score ?? 0)}/100
              </span>

              <button
                onClick={() => toggleSelect(activeInspectFrame.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border transition-all text-sm font-medium ${
                  selectedIds.has(activeInspectFrame.id)
                    ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-md'
                    : 'bg-black/40 border-white/30 text-white hover:bg-white/10'
                }`}
              >
                <Check className={`w-4 h-4 ${selectedIds.has(activeInspectFrame.id) ? 'opacity-100' : 'opacity-30'}`} strokeWidth={3} />
                {selectedIds.has(activeInspectFrame.id) ? 'Selected' : 'Select Photo'}
              </button>

              <button
                onClick={() => {
                  navigate(`/enhanced?id=${referenceId}&frames=${activeInspectFrame.id}`);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-md transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enhance This Photo</span>
              </button>

              <button
                onClick={() => setShowTelemetry(!showTelemetry)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  showTelemetry
                    ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-purple-200'
                    : 'bg-black/40 border-white/20 text-zinc-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                {showTelemetry ? 'Hide Details' : 'View AI Breakdown'}
              </button>
            </div>

            <button
              onClick={() => setInspectIndex(null)}
              className="p-2 rounded-full bg-black/50 hover:bg-white/10 text-white transition-colors border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Arrows */}
          {inspectIndex > 0 && (
            <button
              onClick={() => setInspectIndex(inspectIndex - 1)}
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-white/10 text-white transition-colors border border-white/10 z-50 group"
            >
              <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
            </button>
          )}

          {inspectIndex < displayedFrames.length - 1 && (
            <button
              onClick={() => setInspectIndex(inspectIndex + 1)}
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-white/10 text-white transition-colors border border-white/10 z-50 group"
            >
              <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {/* Stage Content */}
          <div className="w-full h-full pt-20 pb-8 px-4 sm:px-12 flex flex-col lg:flex-row items-center justify-center gap-6 max-w-7xl mx-auto overflow-y-auto">
            {/* Big High-Res Image */}
            <div className="relative flex-1 flex items-center justify-center max-h-[70vh] lg:max-h-[85vh] w-full">
              <img
                src={activeInspectFrame.url}
                alt={`Photo ${inspectIndex + 1}`}
                className="max-w-full max-h-[65vh] lg:max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
            </div>

            {/* Optional Telemetry Details Panel */}
            {showTelemetry && (
              <div className="w-full lg:w-96 bg-[#181822]/95 border border-[#2B2B36] rounded-2xl p-5 text-white flex flex-col gap-4 max-h-[75vh] overflow-y-auto shadow-2xl backdrop-blur-md shrink-0 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between border-b border-[#2B2B36] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                    <h4 className="font-bold text-sm">Biometric & Vision Metrics</h4>
                  </div>
                  <span className="text-[11px] font-mono text-[#8A8A98]">Frame #{inspectIndex + 1}</span>
                </div>

                {/* Score Breakdown */}
                {activeInspectFrame.quality && (
                  <div className="space-y-3 bg-[#121218] border border-emerald-500/30 rounded-xl p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Composite Quality</span>
                      <span className="font-mono text-emerald-400 font-bold text-sm">
                        {Math.round(activeInspectFrame.quality.score)} / 100
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] text-[#8A8A98] mb-1">
                          <span>Sharpness (40%)</span>
                          <span className="text-cyan-300 font-mono">{activeInspectFrame.quality.breakdown.sharpnessScore}%</span>
                        </div>
                        <div className="w-full bg-[#1A1A24] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-cyan-400 h-full" style={{ width: `${activeInspectFrame.quality.breakdown.sharpnessScore}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-[#8A8A98] mb-1">
                          <span>Expression & Eyes (35%)</span>
                          <span className="text-purple-300 font-mono">{activeInspectFrame.quality.breakdown.faceScore}%</span>
                        </div>
                        <div className="w-full bg-[#1A1A24] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-400 h-full" style={{ width: `${activeInspectFrame.quality.breakdown.faceScore}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-[#8A8A98] mb-1">
                          <span>Pose & Stance (25%)</span>
                          <span className="text-emerald-300 font-mono">{activeInspectFrame.quality.breakdown.poseScore}%</span>
                        </div>
                        <div className="w-full bg-[#1A1A24] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full" style={{ width: `${activeInspectFrame.quality.breakdown.poseScore}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Face & Eyes */}
                {activeInspectFrame.face?.detected && (
                  <div className="bg-[#121218] border border-[#2B2B36] rounded-xl p-3.5 text-xs space-y-2">
                    <div className="flex justify-between text-white font-medium">
                      <span className="text-[#8A8A98]">Eyes:</span>
                      <span className="text-emerald-400 capitalize">{activeInspectFrame.face.eyes.state.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-white font-medium">
                      <span className="text-[#8A8A98]">Expression:</span>
                      <span className="capitalize">{activeInspectFrame.face.expression.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
