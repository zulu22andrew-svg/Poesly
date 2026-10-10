import React from 'react';
import { Sparkles, Eye, RotateCcw, Sliders, Check } from 'lucide-react';
import { FilterPresetId } from '../types';
import { FILTER_PRESETS, AVAILABLE_PRESETS } from '../filters/presets';

interface FilterSelectorProps {
  selectedFilter: FilterPresetId;
  intensity: number; // 0 to 100
  onSelectFilter: (filterId: FilterPresetId) => void;
  onChangeIntensity: (intensity: number) => void;
  // Optional preview thumbnail URL (e.g., photo URL to render thumbnail swatches)
  thumbnailUrl?: string;
  // Before / After peek state
  isPeekingOriginal?: boolean;
  onPeekOriginalChange?: (peeking: boolean) => void;
  size?: 'compact' | 'full';
}

export default function FilterSelector({
  selectedFilter,
  intensity,
  onSelectFilter,
  onChangeIntensity,
  thumbnailUrl,
  isPeekingOriginal = false,
  onPeekOriginalChange,
  size = 'full'
}: FilterSelectorProps) {
  const currentPreset = FILTER_PRESETS[selectedFilter];

  return (
    <div className="space-y-3">
      {/* Header with Title & Quick Reset */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-stone-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Professional Style (LUT Presets)</span>
        </div>

        <div className="flex items-center gap-2">
          {selectedFilter !== 'none' && onPeekOriginalChange && (
            <button
              type="button"
              onMouseDown={() => onPeekOriginalChange(true)}
              onMouseUp={() => onPeekOriginalChange(false)}
              onMouseLeave={() => onPeekOriginalChange(false)}
              onTouchStart={() => onPeekOriginalChange(true)}
              onTouchEnd={() => onPeekOriginalChange(false)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-all select-none border ${
                isPeekingOriginal
                  ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-sm'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white hover:bg-stone-700'
              }`}
              title="Hold to see original unfiltered photo"
            >
              <Eye className="w-3 h-3" />
              <span>{isPeekingOriginal ? 'Viewing Original' : 'Hold: Original'}</span>
            </button>
          )}

          {selectedFilter !== 'none' && (
            <button
              onClick={() => {
                onSelectFilter('none');
                onChangeIntensity(0);
              }}
              className="text-stone-500 hover:text-stone-300 text-[10px] flex items-center gap-1 transition-colors"
              title="Reset to Original"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Preset Buttons Grid */}
      <div className={`grid ${size === 'compact' ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-4'} gap-2`}>
        {/* Original / None Option */}
        <button
          type="button"
          onClick={() => {
            onSelectFilter('none');
            onChangeIntensity(0);
          }}
          className={`p-2 rounded-xl text-left transition-all border relative flex flex-col justify-between ${
            selectedFilter === 'none'
              ? 'bg-stone-800 border-purple-500 shadow-md ring-1 ring-purple-500/50'
              : 'bg-stone-900/90 border-stone-800 hover:border-stone-700 hover:bg-stone-850 text-stone-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${selectedFilter === 'none' ? 'text-white' : 'text-stone-300'}`}>
              Original
            </span>
            {selectedFilter === 'none' && (
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                <Check className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <span className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">Unfiltered</span>
        </button>

        {/* Natural, Studio, Editorial Presets */}
        {AVAILABLE_PRESETS.map(preset => {
          const isSelected = selectedFilter === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onSelectFilter(preset.id);
                if (selectedFilter === 'none' || intensity === 0) {
                  onChangeIntensity(preset.defaultIntensity);
                }
              }}
              className={`p-2 rounded-xl text-left transition-all border relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-stone-800/90 border-amber-500/80 shadow-lg ring-1 ring-amber-500/50'
                  : 'bg-stone-900/90 border-stone-800 hover:border-stone-700 hover:bg-stone-850 text-stone-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-stone-300'}`}>
                    {preset.name}
                  </span>
                </div>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-bold">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                {preset.tagline}
              </span>
            </button>
          );
        })}
      </div>

      {/* Intensity Slider (Visible when a preset is active) */}
      {selectedFilter !== 'none' && (
        <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-stone-400">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Intensity</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                {intensity}%
              </span>

              {intensity !== 70 && (
                <button
                  type="button"
                  onClick={() => onChangeIntensity(70)}
                  className="text-[10px] text-stone-500 hover:text-stone-300 transition-colors"
                  title="Reset to 70% recommended intensity"
                >
                  Default (70%)
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-stone-500">0%</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={intensity}
              onChange={(e) => onChangeIntensity(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
            />
            <span className="text-[10px] font-mono text-stone-500">100%</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-stone-500 px-0.5">
            <span>0% = Original</span>
            <span>50% = Subtle Blend</span>
            <span>100% = Full Preset</span>
          </div>
        </div>
      )}
    </div>
  );
}
