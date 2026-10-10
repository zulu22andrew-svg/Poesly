import React from 'react';
import { StudioPreset } from '../types';
import { 
  Sliders, 
  Sparkles, 
  Layers, 
  Crop, 
  Edit3, 
  Trash2, 
  Eye, 
  Lock, 
  Check, 
  Droplets,
  ShieldCheck,
  Type
} from 'lucide-react';
import { computePresetCSSFilter, getPresetAspectRatioClass } from '../presets/presetEngine';

interface PresetCardProps {
  key?: React.Key;
  preset: StudioPreset;
  sampleImageUrl?: string;
  isApplied?: boolean;
  onPreviewAndApply: (preset: StudioPreset) => void;
  onEdit: (preset: StudioPreset) => void;
  onDelete: (preset: StudioPreset) => void;
}

export default function PresetCard({
  preset,
  sampleImageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  isApplied = false,
  onPreviewAndApply,
  onEdit,
  onDelete
}: PresetCardProps) {
  const cssFilter = computePresetCSSFilter(preset);
  const aspectClass = getPresetAspectRatioClass(preset.aspectRatio);

  const getColorGradeBadge = () => {
    switch (preset.colorGrade) {
      case 'studio':
        return { label: 'Studio LUT', bg: 'bg-purple-950/60 text-purple-300 border-purple-800/60' };
      case 'editorial':
        return { label: 'Editorial LUT', bg: 'bg-rose-950/60 text-rose-300 border-rose-800/60' };
      case 'natural':
        return { label: 'Natural LUT', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' };
      case 'none':
      default:
        return { label: 'Neutral', bg: 'bg-stone-800 text-stone-300 border-stone-700' };
    }
  };

  const badge = getColorGradeBadge();

  return (
    <div className={`group relative rounded-2xl bg-[#1A1A24] border transition-all duration-300 flex flex-col overflow-hidden hover:shadow-xl hover:shadow-purple-950/20 ${
      isApplied 
        ? 'border-purple-500/80 ring-1 ring-purple-500/50' 
        : 'border-[#2B2B36] hover:border-purple-500/40'
    }`}>
      {/* Top Preview Swatch Container */}
      <div className="relative w-full h-48 bg-stone-950 overflow-hidden flex items-center justify-center border-b border-[#2B2B36]">
        {/* Background visual variation representation */}
        {preset.backgroundMode === 'blur' && (
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-md scale-110 opacity-70"
            style={{ backgroundImage: `url(${sampleImageUrl})` }}
          />
        )}
        {preset.backgroundMode === 'white' && <div className="absolute inset-0 bg-white" />}
        {preset.backgroundMode === 'black' && <div className="absolute inset-0 bg-black" />}
        {preset.backgroundMode === 'remove' && (
          <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:12px_12px] bg-stone-900" />
        )}

        {/* Filtered Sample Image */}
        <div className={`relative max-h-40 max-w-[85%] overflow-hidden rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105 ${aspectClass}`}>
          <img
            src={sampleImageUrl}
            alt={preset.name}
            className="w-full h-full object-cover"
            style={{ filter: cssFilter }}
            crossOrigin="anonymous"
          />

          {/* Watermark preview simulation if enabled */}
          {preset.watermark?.enabled && (
            <div className="absolute bottom-1 right-2 text-[8px] font-mono tracking-widest text-white/70 uppercase select-none pointer-events-none drop-shadow">
              {preset.watermark.text || 'POSELY'}
            </div>
          )}
        </div>

        {/* Built-in vs Custom Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {preset.isBuiltIn ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-900/90 text-stone-300 border border-stone-700 shadow-sm backdrop-blur-sm">
              <Lock className="w-2.5 h-2.5 text-stone-400" />
              Built-in Preset
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-950/90 text-purple-300 border border-purple-700/60 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-2.5 h-2.5 text-purple-400" />
              Studio Signature
            </span>
          )}

          {isApplied && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-700/70 shadow-sm backdrop-blur-sm">
              <Check className="w-2.5 h-2.5" />
              Active on Photo
            </span>
          )}
        </div>

        {/* Color Grade Intensity Overlay Pill */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm backdrop-blur-sm ${badge.bg}`}>
            {badge.label} · {preset.filterIntensity}%
          </span>
        </div>
      </div>

      {/* Preset Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-white text-base tracking-tight group-hover:text-purple-300 transition-colors">
              {preset.name}
            </h3>
          </div>

          <p className="text-xs text-[#8A8A98] line-clamp-2 leading-relaxed">
            {preset.description || 'Configured studio preset with calibrated color grading and enhancement pipeline.'}
          </p>
        </div>

        {/* Configuration Specs Chips */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-stone-300 pt-1 border-t border-[#252530]">
          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#20202C] border border-[#2B2B38]">
            <Crop className="w-3 h-3 text-purple-400 flex-shrink-0" />
            <span className="text-[#8A8A98]">Ratio:</span>
            <span className="font-semibold text-stone-200 capitalize truncate">{preset.aspectRatio}</span>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#20202C] border border-[#2B2B38]">
            <Layers className="w-3 h-3 text-indigo-400 flex-shrink-0" />
            <span className="text-[#8A8A98]">Bg:</span>
            <span className="font-semibold text-stone-200 capitalize truncate">{preset.backgroundMode}</span>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#20202C] border border-[#2B2B38]">
            <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
            <span className="text-[#8A8A98]">Enhance:</span>
            <span className="font-semibold text-stone-200 capitalize truncate">{preset.enhancement}</span>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#20202C] border border-[#2B2B38]">
            <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span className="text-[#8A8A98]">Retouch:</span>
            <span className="font-semibold text-stone-200 capitalize truncate">{preset.retouchLevel}</span>
          </div>
        </div>

        {/* Action Buttons: Apply / Edit / Delete */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#252530]">
          <button
            onClick={() => onPreviewAndApply(preset)}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/40 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview & Apply</span>
          </button>

          <button
            onClick={() => onEdit(preset)}
            className="p-2 rounded-xl bg-[#252532] hover:bg-[#303040] text-stone-300 hover:text-white border border-[#353545] transition-colors cursor-pointer"
            title="Edit Preset"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {!preset.isBuiltIn && (
            <button
              onClick={() => onDelete(preset)}
              className="p-2 rounded-xl bg-[#252532] hover:bg-rose-950/60 hover:text-rose-300 text-stone-400 border border-[#353545] hover:border-rose-800/60 transition-colors cursor-pointer"
              title="Delete Preset"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
