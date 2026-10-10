import React from 'react';
import { Sparkles, Eye, Check, Layers, Crop, SunMedium } from 'lucide-react';
import { TemplateRecipe } from '../types';
import { computeTemplateCSSFilter, getAspectRatioClass } from '../templates/templateEngine';

interface TemplateCardProps {
  key?: React.Key;
  template: TemplateRecipe;
  sampleImageUrl?: string;
  isSelected?: boolean;
  onPreview: (template: TemplateRecipe) => void;
  onApply: (template: TemplateRecipe) => void;
}

export default function TemplateCard({
  template,
  sampleImageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  isSelected = false,
  onPreview,
  onApply
}: TemplateCardProps) {
  // Pre-calculate sample styling for thumbnail
  const cssFilter = computeTemplateCSSFilter(template, template.defaultIntensity);
  const aspectClass = getAspectRatioClass(template.aspectRatio);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'portrait':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60';
      case 'studio':
        return 'text-purple-400 bg-purple-950/70 border-purple-800/60';
      case 'professional':
        return 'text-sky-400 bg-sky-950/70 border-sky-800/60';
      case 'social':
        return 'text-amber-400 bg-amber-950/70 border-amber-800/60';
      case 'special':
        return 'text-rose-400 bg-rose-950/70 border-rose-800/60';
      default:
        return 'text-stone-400 bg-stone-900 border-stone-800';
    }
  };

  return (
    <div
      className={`group bg-[#15151C] rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${
        isSelected
          ? 'border-purple-500 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/50'
          : 'border-[#2B2B36] hover:border-stone-600 hover:shadow-xl'
      }`}
    >
      {/* Visual Image Preview Container */}
      <div className="relative w-full h-56 bg-stone-950 overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={() => onPreview(template)}
      >
        <div className={`relative w-full h-full max-h-full transition-transform duration-500 group-hover:scale-105`}>
          <img
            src={sampleImageUrl}
            alt={template.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              template.backgroundMode === 'blur' ? 'contrast-[1.02]' : ''
            }`}
            style={{ filter: cssFilter }}
            crossOrigin="anonymous"
          />

          {/* Background simulated blur vignette if template uses blur */}
          {template.backgroundMode === 'blur' && (
            <div className="absolute inset-0 bg-radial from-transparent via-purple-950/10 to-black/40 pointer-events-none" />
          )}
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border backdrop-blur-md ${getCategoryColor(template.category)}`}>
            {template.category}
          </span>

          {template.badge && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-600/90 text-white border border-purple-400/30 backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-purple-200" />
              {template.badge}
            </span>
          )}
        </div>

        {/* Hover Quick Preview Action */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/20 shadow-lg">
            <Eye className="w-3.5 h-3.5" />
            Click to Compare Before/After
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-base text-stone-100 tracking-tight">
              {template.name}
            </h3>
            <span className="text-[11px] font-mono text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
              {template.aspectRatio}
            </span>
          </div>

          <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-3">
            {template.description}
          </p>

          {/* Recipe Elements Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-stone-300">
            <span className="inline-flex items-center gap-1 bg-stone-900/90 px-2 py-0.5 rounded-md border border-stone-800">
              <SunMedium className="w-2.5 h-2.5 text-amber-400" />
              {template.lightingTreatment}
            </span>
            <span className="inline-flex items-center gap-1 bg-stone-900/90 px-2 py-0.5 rounded-md border border-stone-800">
              <Layers className="w-2.5 h-2.5 text-purple-400" />
              {template.backgroundMode === 'blur' ? 'DSLR Bokeh' : template.backgroundMode === 'remove' ? 'Cutout' : 'Original BG'}
            </span>
          </div>
        </div>

        {/* Action Buttons: [ Preview ] [ Use Template ] */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2B2B36]/60">
          <button
            type="button"
            onClick={() => onPreview(template)}
            className="py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-stone-800 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-stone-400" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => onApply(template)}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              isSelected
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Active</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Use Template</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
