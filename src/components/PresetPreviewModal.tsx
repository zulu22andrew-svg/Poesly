import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Eye, 
  Sliders, 
  Crop, 
  Layers, 
  ShieldCheck,
  Shield,
  ArrowRight,
  SplitSquareVertical
} from 'lucide-react';
import { StudioPreset, BackgroundMode } from '../types';
import { computePresetCSSFilter, getPresetAspectRatioClass } from '../presets/presetEngine';

interface PresetPreviewModalProps {
  isOpen: boolean;
  preset: StudioPreset | null;
  photoUrl: string;
  frameId?: string;
  onClose: () => void;
  onApply: (preset: StudioPreset, customIntensity: number) => void;
}

export default function PresetPreviewModal({
  isOpen,
  preset,
  photoUrl,
  frameId,
  onClose,
  onApply
}: PresetPreviewModalProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage for split view (0 to 100)
  const [intensity, setIntensity] = useState<number>(70);
  const [isComparingToggle, setIsComparingToggle] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    if (preset) {
      setIntensity(typeof preset.filterIntensity === 'number' ? preset.filterIntensity : 70);
      setSliderPosition(50);
      setIsComparingToggle(false);
    }
  }, [preset, isOpen]);

  // Keyboard shortcut: Space to peek, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        setIsComparingToggle(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !preset) return null;

  const cssFilter = computePresetCSSFilter(preset, intensity);
  const aspectClass = getPresetAspectRatioClass(preset.aspectRatio);

  const handlePointerDown = () => {
    isDraggingRef.current = true;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = (x / rect.width) * 100;
    setSliderPosition(Math.max(5, Math.min(95, pct)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-[#15151F] border border-[#2B2B38] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#252532] flex items-center justify-between bg-[#191924]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-300">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Preview Preset: {preset.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-700/60">
                  {preset.colorGrade.toUpperCase()} · {intensity}%
                </span>
              </div>
              <p className="text-xs text-[#8A8A98]">
                Interactive Split Comparison · Original photo remains 100% untouched
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsComparingToggle(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isComparingToggle 
                  ? 'bg-amber-950/70 border-amber-600 text-amber-300' 
                  : 'bg-[#252532] border-[#353545] text-stone-300 hover:text-white'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>{isComparingToggle ? 'Showing Original' : 'Toggle Original'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#252532] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Canvas: Interactive Split Comparison */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6 bg-[#0E0E14] flex flex-col items-center justify-center min-h-[380px] max-h-[60vh] select-none">
          <div 
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerUp}
            className={`relative max-w-full max-h-full rounded-xl overflow-hidden border border-[#2B2B38] shadow-2xl cursor-ew-resize ${aspectClass}`}
            style={{ width: '480px' }}
          >
            {/* Background Representation */}
            {preset.backgroundMode === 'blur' && (
              <div 
                className="absolute inset-0 bg-cover bg-center filter blur-lg scale-110 opacity-70"
                style={{ backgroundImage: `url(${photoUrl})` }}
              />
            )}
            {preset.backgroundMode === 'white' && <div className="absolute inset-0 bg-white" />}
            {preset.backgroundMode === 'black' && <div className="absolute inset-0 bg-black" />}
            {preset.backgroundMode === 'remove' && (
              <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:12px_12px] bg-stone-900" />
            )}

            {/* BASE / ORIGINAL IMAGE (FULL WIDTH) */}
            <img
              src={photoUrl}
              alt="Original"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />

            {/* PRESET EDITED LAYER (CLIPPED BY SLIDER) */}
            {!isComparingToggle && (
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={photoUrl}
                  alt="Preset Edited"
                  className="w-full h-full object-cover max-w-none"
                  style={{ 
                    filter: cssFilter,
                    width: containerRef.current ? `${containerRef.current.clientWidth}px` : '480px',
                    height: containerRef.current ? `${containerRef.current.clientHeight}px` : '100%'
                  }}
                  crossOrigin="anonymous"
                />

                {/* Watermark simulation if enabled */}
                {preset.watermark?.enabled && (
                  <div className="absolute bottom-2 right-3 text-[9px] font-mono tracking-widest text-white uppercase opacity-50 drop-shadow select-none">
                    {preset.watermark.text || 'STUDIO PRESET'}
                  </div>
                )}
              </div>
            )}

            {/* DIVIDER HANDLE */}
            {!isComparingToggle && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] flex items-center justify-center pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-7 h-7 rounded-full bg-white text-stone-900 shadow-xl flex items-center justify-center text-[10px] font-black border border-stone-300">
                  ↔
                </div>
              </div>
            )}

            {/* FLOATING BADGES */}
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 text-white text-[10px] font-bold border border-white/20 backdrop-blur-sm pointer-events-none">
              {isComparingToggle ? 'ORIGINAL' : 'PRESET (AFTER)'}
            </div>

            {!isComparingToggle && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/70 text-white text-[10px] font-bold border border-white/20 backdrop-blur-sm pointer-events-none">
                ORIGINAL (BEFORE)
              </div>
            )}
          </div>
        </div>

        {/* Controls Bar & Intensity Adjustment */}
        <div className="p-4 sm:p-5 border-t border-[#252532] bg-[#191924] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Intensity Slider (5 cols) */}
            <div className="md:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  Preset Intensity: <strong className="text-purple-300">{intensity}%</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIntensity(preset.filterIntensity)}
                  className="text-[10px] text-purple-400 hover:underline"
                >
                  Reset to Default ({preset.filterIntensity}%)
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-purple-500 h-2 bg-stone-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Pipeline Attributes Chips (4 cols) */}
            <div className="md:col-span-4 flex items-center gap-2 flex-wrap text-[11px] text-stone-300">
              <span className="px-2 py-1 rounded-lg bg-[#20202C] border border-[#2B2B38] flex items-center gap-1">
                <Crop className="w-3 h-3 text-purple-400" />
                <span className="capitalize">{preset.aspectRatio}</span>
              </span>
              <span className="px-2 py-1 rounded-lg bg-[#20202C] border border-[#2B2B38] flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                <span className="capitalize">{preset.backgroundMode}</span>
              </span>
              <span className="px-2 py-1 rounded-lg bg-[#20202C] border border-[#2B2B38] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="capitalize">{preset.enhancement}</span>
              </span>
            </div>

            {/* Action Buttons (3 cols) */}
            <div className="md:col-span-3 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#20202C] hover:bg-[#2A2A38] text-stone-300 text-xs font-semibold border border-[#303040] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  onApply(preset, intensity);
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-400 pt-1 border-t border-[#252535]">
            <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Non-Destructive Guarantee:</strong> Applying this preset updates rendering parameters. The master source file remains untouched.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
