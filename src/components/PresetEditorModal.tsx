import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Sliders, 
  Crop, 
  Layers, 
  ShieldCheck, 
  Type, 
  Image as ImageIcon,
  Download,
  Info
} from 'lucide-react';
import { 
  StudioPreset, 
  FilterPresetId, 
  BackgroundMode, 
  AspectRatioOption, 
  EnhancementLevelOption, 
  StudioRetouchLevel 
} from '../types';
import { computePresetCSSFilter, getPresetAspectRatioClass } from '../presets/presetEngine';

interface PresetEditorModalProps {
  isOpen: boolean;
  preset: StudioPreset | null; // null when creating new
  sampleImageUrl?: string;
  onClose: () => void;
  onSave: (presetData: Partial<StudioPreset>) => { success: boolean; error?: string };
}

export default function PresetEditorModal({
  isOpen,
  preset,
  sampleImageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  onClose,
  onSave
}: PresetEditorModalProps) {
  const isEditing = Boolean(preset);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorGrade, setColorGrade] = useState<FilterPresetId>('studio');
  const [filterIntensity, setFilterIntensity] = useState<number>(70);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('original');
  const [enhancement, setEnhancement] = useState<EnhancementLevelOption>('standard');
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('original');
  const [retouchLevel, setRetouchLevel] = useState<StudioRetouchLevel>('professional');
  
  // Advanced Watermark / Logo / Export settings
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>('STUDIO SIGNATURE');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(40);
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'>('bottom-right');

  const [logoEnabled, setLogoEnabled] = useState<boolean>(false);
  const [logoPosition, setLogoPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [logoScale, setLogoScale] = useState<number>(20);

  const [exportFormat, setExportFormat] = useState<'auto' | 'jpeg' | 'png'>('jpeg');
  const [exportQuality, setExportQuality] = useState<'standard' | 'high' | 'maximum'>('maximum');

  // Active tab
  const [activeTab, setActiveTab] = useState<'style' | 'pipeline' | 'branding'>('style');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize when opening
  useEffect(() => {
    if (preset) {
      setName(preset.name || '');
      setDescription(preset.description || '');
      setColorGrade(preset.colorGrade || 'studio');
      setFilterIntensity(typeof preset.filterIntensity === 'number' ? preset.filterIntensity : 70);
      setAspectRatio(preset.aspectRatio || 'original');
      setEnhancement(preset.enhancement || 'standard');
      setBackgroundMode(preset.backgroundMode || 'original');
      setRetouchLevel(preset.retouchLevel || 'professional');

      setWatermarkEnabled(Boolean(preset.watermark?.enabled));
      setWatermarkText(preset.watermark?.text || 'STUDIO SIGNATURE');
      setWatermarkOpacity(preset.watermark?.opacity || 40);
      setWatermarkPosition(preset.watermark?.position || 'bottom-right');

      setLogoEnabled(Boolean(preset.logo?.enabled));
      setLogoPosition(preset.logo?.position || 'bottom-right');
      setLogoScale(preset.logo?.scale || 20);

      setExportFormat(preset.exportSettings?.format || 'jpeg');
      setExportQuality(preset.exportSettings?.quality || 'maximum');
    } else {
      // Defaults for brand new preset
      setName('');
      setDescription('');
      setColorGrade('studio');
      setFilterIntensity(70);
      setAspectRatio('original');
      setEnhancement('standard');
      setBackgroundMode('original');
      setRetouchLevel('professional');
      setWatermarkEnabled(false);
      setWatermarkText('MY STUDIO');
      setWatermarkOpacity(40);
      setWatermarkPosition('bottom-right');
      setLogoEnabled(false);
      setExportFormat('jpeg');
      setExportQuality('maximum');
    }
    setErrorMessage(null);
    setActiveTab('style');
  }, [preset, isOpen]);

  if (!isOpen) return null;

  // Live mock object for CSS generation
  const mockPreset: StudioPreset = {
    id: preset?.id || 'temp-preview',
    name: name || 'Preset Preview',
    colorGrade,
    filterIntensity,
    aspectRatio,
    crop: aspectRatio,
    enhancement,
    backgroundMode,
    retouchLevel,
    watermark: {
      enabled: watermarkEnabled,
      text: watermarkText,
      opacity: watermarkOpacity,
      position: watermarkPosition
    },
    logo: {
      enabled: logoEnabled,
      position: logoPosition,
      scale: logoScale
    },
    exportSettings: {
      format: exportFormat,
      quality: exportQuality
    }
  };

  const previewCssFilter = computePresetCSSFilter(mockPreset);
  const aspectClass = getPresetAspectRatioClass(aspectRatio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter a name for the studio preset.');
      return;
    }

    const result = onSave({
      name: name.trim(),
      description: description.trim(),
      colorGrade,
      filterIntensity,
      crop: aspectRatio,
      aspectRatio,
      enhancement,
      backgroundMode,
      retouchLevel,
      watermark: {
        enabled: watermarkEnabled,
        text: watermarkText.trim(),
        opacity: watermarkOpacity,
        position: watermarkPosition
      },
      logo: {
        enabled: logoEnabled,
        position: logoPosition,
        scale: logoScale
      },
      exportSettings: {
        format: exportFormat,
        quality: exportQuality
      }
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to save preset.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#161620] border border-[#2B2B38] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#252532] flex items-center justify-between bg-[#191924]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isEditing ? `Edit Preset: ${preset?.name}` : 'Create Studio Preset'}
              </h2>
              <p className="text-xs text-[#8A8A98]">
                Configure once, save as signature style, and apply consistently.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#252532] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split view (Form controls left, Live preview right) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-[#252532]">
            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Basic Info: Name & Description */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                  Preset Name <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Studio Signature, Luxury Black & White"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#20202C] border border-[#303040] focus:border-purple-500 focus:outline-none text-white text-sm placeholder:text-stone-500"
                  maxLength={50}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                  Description <span className="text-stone-500 text-[10px] normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Standard commercial portrait look with warm highlights"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#20202C] border border-[#303040] focus:border-purple-500 focus:outline-none text-white text-xs placeholder:text-stone-500"
                  maxLength={120}
                />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex rounded-xl bg-[#121218] p-1 border border-[#252532]">
              <button
                type="button"
                onClick={() => setActiveTab('style')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'style' 
                    ? 'bg-purple-950/80 text-purple-200 border border-purple-700/50 shadow-sm' 
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Color & Crop
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pipeline')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'pipeline' 
                    ? 'bg-purple-950/80 text-purple-200 border border-purple-700/50 shadow-sm' 
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Enhancement & Bg
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('branding')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'branding' 
                    ? 'bg-purple-950/80 text-purple-200 border border-purple-700/50 shadow-sm' 
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Watermark & Export
              </button>
            </div>

            {/* TAB 1: COLOR GRADE & CROP */}
            {activeTab === 'style' && (
              <div className="space-y-5">
                {/* Color Grade */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                    Color Grade (Stage 14 Filter System)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'studio' as FilterPresetId, label: 'Studio', desc: 'Punchy strobe', color: 'border-purple-600 bg-purple-950/40 text-purple-200' },
                      { id: 'editorial' as FilterPresetId, label: 'Editorial', desc: 'Fashion contrast', color: 'border-rose-600 bg-rose-950/40 text-rose-200' },
                      { id: 'natural' as FilterPresetId, label: 'Natural', desc: 'Organic skin', color: 'border-emerald-600 bg-emerald-950/40 text-emerald-200' },
                      { id: 'none' as FilterPresetId, label: 'None', desc: 'Original color', color: 'border-stone-600 bg-stone-900 text-stone-200' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setColorGrade(item.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          colorGrade === item.id 
                            ? `${item.color} ring-1 ring-white/20 shadow-md` 
                            : 'border-[#2D2D3B] bg-[#1E1E2A] text-stone-400 hover:border-stone-600'
                        }`}
                      >
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Intensity Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                      Filter Intensity: <span className="text-purple-300 font-bold">{filterIntensity}%</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFilterIntensity(70)}
                      className="text-[10px] text-purple-400 hover:underline"
                    >
                      Reset to 70% (Pro Default)
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filterIntensity}
                    onChange={(e) => setFilterIntensity(Number(e.target.value))}
                    className="w-full accent-purple-500 h-2 bg-stone-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 mt-1">
                    <span>0% (Neutral)</span>
                    <span>50% (Subtle)</span>
                    <span>70% (Signature)</span>
                    <span>100% (Full Grade)</span>
                  </div>
                </div>

                {/* Aspect Ratio / Crop */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                    Aspect Ratio / Framing
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { id: 'original' as AspectRatioOption, label: 'Original' },
                      { id: '1:1' as AspectRatioOption, label: '1:1' },
                      { id: '4:5' as AspectRatioOption, label: '4:5' },
                      { id: '3:4' as AspectRatioOption, label: '3:4' },
                      { id: '16:9' as AspectRatioOption, label: '16:9' },
                      { id: '9:16' as AspectRatioOption, label: '9:16' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAspectRatio(item.id)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                          aspectRatio === item.id 
                            ? 'bg-purple-950/80 border-purple-600 text-purple-200' 
                            : 'bg-[#1E1E2A] border-[#2D2D3B] text-stone-400 hover:border-stone-600'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ENHANCEMENT & BACKGROUND */}
            {activeTab === 'pipeline' && (
              <div className="space-y-5">
                {/* Neural Enhancement */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                    Enhancement Level (GFPGAN / Super-Resolution)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'off' as EnhancementLevelOption, label: 'Off', desc: '1x Source resolution' },
                      { id: 'standard' as EnhancementLevelOption, label: 'Standard', desc: '2x Neural upscale' },
                      { id: 'high' as EnhancementLevelOption, label: 'High', desc: '2x + Deep Face Recovery' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setEnhancement(item.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          enhancement === item.id 
                            ? 'bg-indigo-950/70 border-indigo-600 text-indigo-200' 
                            : 'bg-[#1E1E2A] border-[#2D2D3B] text-stone-400 hover:border-stone-600'
                        }`}
                      >
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Treatment */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                    Background Treatment (Neural Matting)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'original' as BackgroundMode, label: 'Original', desc: 'Preserve natural set' },
                      { id: 'blur' as BackgroundMode, label: 'Studio Bokeh', desc: 'Soft depth blur' },
                      { id: 'remove' as BackgroundMode, label: 'Cutout', desc: 'Transparent PNG' },
                      { id: 'white' as BackgroundMode, label: 'Clean White', desc: 'E-commerce backdrop' },
                      { id: 'black' as BackgroundMode, label: 'Studio Black', desc: 'Dramatic backdrop' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBackgroundMode(item.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          backgroundMode === item.id 
                            ? 'bg-purple-950/70 border-purple-600 text-purple-200' 
                            : 'bg-[#1E1E2A] border-[#2D2D3B] text-stone-400 hover:border-stone-600'
                        }`}
                      >
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Retouching Level */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                    Retouching Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'natural' as StudioRetouchLevel, label: 'Natural Retouch', desc: 'Micro-blemish smoothing while preserving authentic pore texture' },
                      { id: 'professional' as StudioRetouchLevel, label: 'Professional Studio', desc: 'High-end frequency separation and sculpted commercial skin tones' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRetouchLevel(item.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          retouchLevel === item.id 
                            ? 'bg-emerald-950/70 border-emerald-600 text-emerald-200' 
                            : 'bg-[#1E1E2A] border-[#2D2D3B] text-stone-400 hover:border-stone-600'
                        }`}
                      >
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className="text-[10px] text-stone-400 mt-1">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WATERMARK, LOGO & EXPORT */}
            {activeTab === 'branding' && (
              <div className="space-y-5">
                {/* Watermark Configuration */}
                <div className="p-4 rounded-xl bg-[#1B1B26] border border-[#2D2D3C] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">Studio Watermark</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={watermarkEnabled} 
                        onChange={(e) => setWatermarkEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {watermarkEnabled && (
                    <div className="space-y-3 pt-2 border-t border-[#252535]">
                      <div>
                        <label className="block text-[11px] text-stone-400 mb-1">Watermark Text</label>
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="e.g. DAVID STUDIOS"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#242432] border border-[#353545] text-xs text-white"
                          maxLength={30}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">Opacity: {watermarkOpacity}%</label>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={watermarkOpacity}
                            onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                            className="w-full accent-purple-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">Position</label>
                          <select
                            value={watermarkPosition}
                            onChange={(e: any) => setWatermarkPosition(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#242432] border border-[#353545] text-xs text-white"
                          >
                            <option value="bottom-right">Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="top-left">Top Left</option>
                            <option value="center">Center</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Export Preferences */}
                <div className="p-4 rounded-xl bg-[#1B1B26] border border-[#2D2D3C] space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Export Output Settings</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Default Format</label>
                      <select
                        value={exportFormat}
                        onChange={(e: any) => setExportFormat(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#242432] border border-[#353545] text-xs text-white"
                      >
                        <option value="jpeg">JPEG (Universal)</option>
                        <option value="png">PNG (Lossless)</option>
                        <option value="auto">Auto (Match Input)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Quality Profile</label>
                      <select
                        value={exportQuality}
                        onChange={(e: any) => setExportQuality(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#242432] border border-[#353545] text-xs text-white"
                      >
                        <option value="maximum">Maximum (Master Studio)</option>
                        <option value="high">High (Web / Client Proof)</option>
                        <option value="standard">Standard (Compressed)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Real-time Live Preview Swatch (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-[#13131A] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Live Preset Preview
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {aspectRatio.toUpperCase()} · {filterIntensity}% INTENSITY
                </span>
              </div>

              {/* Preview Container */}
              <div className="relative w-full h-72 bg-stone-950 rounded-2xl overflow-hidden border border-[#2B2B38] flex items-center justify-center p-4">
                {/* Background Representation */}
                {backgroundMode === 'blur' && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center filter blur-lg scale-110 opacity-70"
                    style={{ backgroundImage: `url(${sampleImageUrl})` }}
                  />
                )}
                {backgroundMode === 'white' && <div className="absolute inset-0 bg-white" />}
                {backgroundMode === 'black' && <div className="absolute inset-0 bg-black" />}
                {backgroundMode === 'remove' && (
                  <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:12px_12px] bg-stone-900" />
                )}

                {/* Scaled Preview Image */}
                <div className={`relative max-h-60 max-w-full overflow-hidden rounded-xl shadow-2xl transition-all duration-300 ${aspectClass}`}>
                  <img
                    src={sampleImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={{ filter: previewCssFilter }}
                    crossOrigin="anonymous"
                  />

                  {/* Watermark overlay preview */}
                  {watermarkEnabled && (
                    <div className={`absolute text-[9px] font-mono tracking-widest text-white uppercase select-none pointer-events-none drop-shadow-md px-2 py-1 ${
                      watermarkPosition === 'bottom-right' ? 'bottom-2 right-2' :
                      watermarkPosition === 'bottom-left' ? 'bottom-2 left-2' :
                      watermarkPosition === 'top-right' ? 'top-2 right-2' :
                      watermarkPosition === 'top-left' ? 'top-2 left-2' : 'inset-0 flex items-center justify-center text-center'
                    }`} style={{ opacity: watermarkOpacity / 100 }}>
                      {watermarkText || 'MY STUDIO'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary breakdown */}
            <div className="p-3.5 rounded-xl bg-[#1A1A24] border border-[#2B2B38] space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Color Grade:</span>
                <span className="font-semibold text-purple-300 capitalize">{colorGrade} ({filterIntensity}%)</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Framing:</span>
                <span className="font-semibold text-stone-200 capitalize">{aspectRatio}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Background:</span>
                <span className="font-semibold text-stone-200 capitalize">{backgroundMode}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Enhancement:</span>
                <span className="font-semibold text-stone-200 capitalize">{enhancement}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#20202A] hover:bg-[#2A2A38] text-stone-300 text-xs font-semibold border border-[#303040] transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Save Preset'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
