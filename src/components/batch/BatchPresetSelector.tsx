import React from 'react';
import { StudioPreset } from '../../types';
import { getStudioPresets } from '../../presets/presetStorage';
import { 
  SlidersHorizontal, 
  Sparkles, 
  Crop, 
  Layers, 
  Palette,
  CheckCircle2
} from 'lucide-react';

interface BatchPresetSelectorProps {
  selectedPreset: StudioPreset;
  onSelectPreset: (preset: StudioPreset) => void;
  disabled?: boolean;
}

export default function BatchPresetSelector({
  selectedPreset,
  onSelectPreset,
  disabled = false
}: BatchPresetSelectorProps) {
  const presets = getStudioPresets();

  return (
    <div className="rounded-2xl bg-[#181822] border border-[#2B2B36] p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              Apply Studio Preset
            </h4>
            <p className="text-xs text-[#8A8A98]">
              Uniformly applied across every selected photo in this shoot
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-purple-400 bg-purple-950/40 border border-purple-500/30 px-2.5 py-1 rounded-full">
          Consistent Look
        </span>
      </div>

      {/* Preset Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {presets.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPreset(preset)}
              className={`text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-purple-500 bg-gradient-to-br from-purple-950/40 to-[#1F1F2C] shadow-md shadow-purple-500/10 ring-1 ring-purple-500/40'
                  : 'border-[#2B2B36] bg-[#14141D] hover:bg-[#1C1C28] hover:border-[#3B3B4C]'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 text-purple-400">
                  <CheckCircle2 className="w-4 h-4 fill-purple-500 text-[#14141D]" />
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {preset.name}
                  </span>
                  {preset.isBuiltIn && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-[#252533] text-[#A0A0B2] px-1.5 py-0.5 rounded">
                      Studio
                    </span>
                  )}
                </div>
                {preset.description && (
                  <p className="text-xs text-[#8A8A98] line-clamp-2">
                    {preset.description}
                  </p>
                )}
              </div>

              {/* Badges / Settings Summary */}
              <div className="mt-3 pt-3 border-t border-[#252533] flex items-center gap-2 flex-wrap text-[11px] text-[#9A9AB0]">
                <span className="inline-flex items-center gap-1 bg-[#20202C] px-2 py-0.5 rounded border border-[#2F2F40]">
                  <Palette className="w-3 h-3 text-purple-400" />
                  <span className="capitalize">{preset.colorGrade} ({preset.filterIntensity}%)</span>
                </span>

                <span className="inline-flex items-center gap-1 bg-[#20202C] px-2 py-0.5 rounded border border-[#2F2F40]">
                  <Layers className="w-3 h-3 text-indigo-400" />
                  <span className="capitalize">{preset.backgroundMode}</span>
                </span>

                {preset.enhancement !== 'off' && (
                  <span className="inline-flex items-center gap-1 bg-purple-950/30 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>2× HD</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
