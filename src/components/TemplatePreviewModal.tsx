import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  RotateCcw, 
  SunMedium, 
  Layers, 
  Crop, 
  Sliders, 
  Eye, 
  Wand2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TemplateRecipe } from '../types';
import { computeTemplateCSSFilter, getAspectRatioClass, interpolateTemplateParameters } from '../templates/templateEngine';
import { BUILT_IN_TEMPLATES } from '../templates/templates';

interface TemplatePreviewModalProps {
  template: TemplateRecipe;
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onApply: (template: TemplateRecipe, intensity: number) => void;
  onReset?: () => void;
  onSelectTemplate?: (template: TemplateRecipe) => void;
  isCurrentlyApplied?: boolean;
  initialIntensity?: number;
}

export default function TemplatePreviewModal({
  template,
  imageUrl,
  isOpen,
  onClose,
  onApply,
  onReset,
  onSelectTemplate,
  isCurrentlyApplied = false,
  initialIntensity = 70
}: TemplatePreviewModalProps) {
  const [intensity, setIntensity] = useState<number>(initialIntensity);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Sync initial intensity on template change
  useEffect(() => {
    setIntensity(initialIntensity || template.defaultIntensity || 70);
  }, [template, initialIntensity]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' && !e.repeat) {
        setIsHoldingOriginal(true);
      } else if (e.key === 'ArrowRight') {
        // Next template
        const idx = BUILT_IN_TEMPLATES.findIndex(t => t.id === template.id);
        if (idx !== -1 && idx < BUILT_IN_TEMPLATES.length - 1 && onSelectTemplate) {
          onSelectTemplate(BUILT_IN_TEMPLATES[idx + 1]);
        }
      } else if (e.key === 'ArrowLeft') {
        // Prev template
        const idx = BUILT_IN_TEMPLATES.findIndex(t => t.id === template.id);
        if (idx > 0 && onSelectTemplate) {
          onSelectTemplate(BUILT_IN_TEMPLATES[idx - 1]);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsHoldingOriginal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, template, onClose, onSelectTemplate]);

  if (!isOpen) return null;

  // Split-slider drag handling
  const handleSplitMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPos(percentage);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSplitMove(e.touches[0].clientX);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleSplitMove(e.clientX);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    handleSplitMove(e.clientX);
  };

  const onMouseUp = () => {
    isDraggingRef.current = false;
  };

  const cssFilter = isHoldingOriginal
    ? 'none'
    : computeTemplateCSSFilter(template, intensity);
  const aspectClass = getAspectRatioClass(template.aspectRatio);

  const currentIndex = BUILT_IN_TEMPLATES.findIndex(t => t.id === template.id);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#15151C] border border-[#2B2B36] rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#2B2B36] flex items-center justify-between bg-[#191922]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {template.name}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/50">
                  {template.category}
                </span>
                {template.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    {template.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">
                {template.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Template Switcher Carousel Arrows */}
            {onSelectTemplate && (
              <div className="hidden sm:flex items-center gap-1 mr-2 bg-stone-900/80 p-1 rounded-xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => currentIndex > 0 && onSelectTemplate(BUILT_IN_TEMPLATES[currentIndex - 1])}
                  disabled={currentIndex <= 0}
                  className="p-1 text-stone-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-stone-800"
                  title="Previous template (←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-stone-400 px-1.5">
                  {currentIndex + 1}/{BUILT_IN_TEMPLATES.length}
                </span>
                <button
                  type="button"
                  onClick={() => currentIndex < BUILT_IN_TEMPLATES.length - 1 && onSelectTemplate(BUILT_IN_TEMPLATES[currentIndex + 1])}
                  disabled={currentIndex >= BUILT_IN_TEMPLATES.length - 1}
                  className="p-1 text-stone-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-stone-800"
                  title="Next template (→)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Split Before/After Stage */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto">
          {/* Left Canvas: Interactive Split-Slider Viewport */}
          <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col items-center justify-center bg-stone-950/80 select-none">
            <div
              ref={containerRef}
              className="relative max-w-full max-h-[50vh] sm:max-h-[56vh] aspect-auto rounded-2xl overflow-hidden shadow-2xl border border-stone-800 cursor-ew-resize group"
              onMouseDown={onMouseDown}
              onTouchMove={onTouchMove}
            >
              {/* After: Template Result (Base) */}
              <img
                src={imageUrl}
                alt="Template Applied"
                className="w-full h-full max-h-[50vh] sm:max-h-[56vh] object-contain block pointer-events-none"
                style={{ filter: cssFilter }}
              />

              {/* Before: Original (Clipped Top Layer) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
              >
                <img
                  src={imageUrl}
                  alt="Original Photo"
                  className="w-full h-full max-h-[50vh] sm:max-h-[56vh] object-contain block"
                />
              </div>

              {/* Interactive Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-xl border-2 border-purple-500 font-bold text-xs">
                  ⇔
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-stone-300 border border-white/10 pointer-events-none">
                BEFORE (Original)
              </div>
              <div className="absolute top-3 right-3 bg-purple-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-purple-200 border border-purple-500/40 pointer-events-none">
                AFTER ({template.name} • {intensity}%)
              </div>

              {/* Spacebar Hold Hint */}
              <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                <span className="bg-black/70 backdrop-blur-md text-stone-300 text-[10px] font-medium px-3 py-1 rounded-full border border-white/10">
                  Drag divider or hold <span className="text-white font-bold bg-white/20 px-1.5 py-0.5 rounded">Space</span> to view original
                </span>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Template Recipe Controls & Details */}
          <div className="lg:col-span-4 p-5 sm:p-6 border-t lg:border-t-0 lg:border-l border-[#2B2B36] flex flex-col justify-between bg-[#15151C] gap-6">
            <div className="space-y-5">
              {/* Intensity Control */}
              <div className="space-y-2.5 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    Template Strength
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                    {intensity}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />

                <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                  <span>0% (Original)</span>
                  <span className="text-purple-400 font-semibold">70% (Recommended)</span>
                  <span>100% (Full Recipe)</span>
                </div>
              </div>

              {/* Hold to Compare Button */}
              <button
                type="button"
                onMouseDown={() => setIsHoldingOriginal(true)}
                onMouseUp={() => setIsHoldingOriginal(false)}
                onTouchStart={() => setIsHoldingOriginal(true)}
                onTouchEnd={() => setIsHoldingOriginal(false)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  isHoldingOriginal
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                    : 'bg-stone-900 text-stone-300 hover:text-white border-stone-800 hover:bg-stone-850'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isHoldingOriginal ? 'Viewing Original Photo' : 'Hold to Peek Original'}</span>
              </button>

              {/* Template Recipe Breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Editing Recipe Breakdown
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-stone-900/90 p-2.5 rounded-xl border border-stone-800/80">
                    <div className="text-[10px] text-stone-500 flex items-center gap-1 mb-1">
                      <SunMedium className="w-3 h-3 text-amber-400" />
                      Lighting
                    </div>
                    <div className="font-semibold text-stone-200 text-xs truncate">
                      {template.lightingTreatment}
                    </div>
                  </div>

                  <div className="bg-stone-900/90 p-2.5 rounded-xl border border-stone-800/80">
                    <div className="text-[10px] text-stone-500 flex items-center gap-1 mb-1">
                      <Layers className="w-3 h-3 text-purple-400" />
                      Background
                    </div>
                    <div className="font-semibold text-stone-200 text-xs">
                      {template.backgroundMode === 'blur' ? 'DSLR Bokeh Blur' : template.backgroundMode === 'remove' ? 'Cutout' : 'Original'}
                    </div>
                  </div>

                  <div className="bg-stone-900/90 p-2.5 rounded-xl border border-stone-800/80">
                    <div className="text-[10px] text-stone-500 flex items-center gap-1 mb-1">
                      <Crop className="w-3 h-3 text-sky-400" />
                      Aspect Ratio
                    </div>
                    <div className="font-semibold text-stone-200 text-xs font-mono">
                      {template.aspectRatio}
                    </div>
                  </div>

                  <div className="bg-stone-900/90 p-2.5 rounded-xl border border-stone-800/80">
                    <div className="text-[10px] text-stone-500 flex items-center gap-1 mb-1">
                      <Wand2 className="w-3 h-3 text-emerald-400" />
                      Retouching
                    </div>
                    <div className="font-semibold text-stone-200 text-xs capitalize">
                      {template.retouchLevel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-stone-900 text-stone-400 px-2 py-0.5 rounded-md border border-stone-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Footer: [ Reset Template ] [ Apply Template ] */}
            <div className="space-y-2 pt-4 border-t border-[#2B2B36]">
              <button
                type="button"
                onClick={() => {
                  onApply(template, intensity);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Apply Template to Photo</span>
              </button>

              {onReset && (
                <button
                  type="button"
                  onClick={() => {
                    onReset();
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-stone-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Original</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
