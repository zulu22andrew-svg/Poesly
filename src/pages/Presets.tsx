import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  SlidersHorizontal, 
  Plus, 
  Sparkles, 
  Search, 
  Check, 
  AlertCircle, 
  Eye, 
  RotateCcw, 
  ArrowRight, 
  FolderDown, 
  ImageIcon, 
  Layers, 
  Lock,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { StudioPreset, AppliedPresetState } from '../types';
import { 
  getStudioPresets, 
  saveStudioPreset, 
  updateStudioPreset, 
  deleteStudioPreset,
  getAppliedPresetForFrame,
  setAppliedPresetForFrame,
  clearAppliedPresetForFrame
} from '../presets/presetStorage';
import { executePresetOnFrame } from '../presets/presetEngine';
import PresetCard from '../components/PresetCard';
import PresetEditorModal from '../components/PresetEditorModal';
import PresetPreviewModal from '../components/PresetPreviewModal';
import DeletePresetModal from '../components/DeletePresetModal';

interface SessionPhoto {
  frameId: string;
  url: string;
  name?: string;
}

export default function Presets() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const referenceIdParam = searchParams.get('id') || searchParams.get('ref');
  const frameIdParam = searchParams.get('frame');

  const [referenceId, setReferenceId] = useState<string>(referenceIdParam || '');
  const [sessionPhotos, setSessionPhotos] = useState<SessionPhoto[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState<string>(frameIdParam || '');
  const [activePhotoUrl, setActivePhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80'
  );

  // Presets list state
  const [presets, setPresets] = useState<StudioPreset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'builtin' | 'custom'>('all');

  // Active applied preset for current selected photo
  const [currentAppliedPreset, setCurrentAppliedPreset] = useState<AppliedPresetState | null>(null);

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<StudioPreset | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewingPreset, setPreviewingPreset] = useState<StudioPreset | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingPreset, setDeletingPreset] = useState<StudioPreset | null>(null);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load presets on mount
  const refreshPresets = () => {
    const list = getStudioPresets();
    setPresets(list);
  };

  useEffect(() => {
    refreshPresets();
  }, []);

  // Load session frames if available
  useEffect(() => {
    let activeId = referenceIdParam;
    if (!activeId) {
      const savedId = localStorage.getItem('posely_latest_session');
      if (savedId) activeId = savedId;
    }

    if (!activeId) {
      fetch('/api/latest-session')
        .then(res => res.json())
        .then(data => {
          if (data.referenceId) {
            setReferenceId(data.referenceId);
            loadSessionFrames(data.referenceId);
          }
        })
        .catch(() => {});
    } else {
      setReferenceId(activeId);
      loadSessionFrames(activeId);
    }
  }, [referenceIdParam]);

  const loadSessionFrames = async (refId: string) => {
    try {
      const res = await fetch(`/api/results/${refId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.frames && data.frames.length > 0) {
        const photos: SessionPhoto[] = data.frames.map((f: any) => ({
          frameId: f.frameId || f.id,
          url: f.url || `/uploads/${refId}/${f.frameId || f.id}.jpg`
        }));
        setSessionPhotos(photos);

        const initialFrame = frameIdParam && photos.find(p => p.frameId === frameIdParam) 
          ? frameIdParam 
          : photos[0].frameId;

        setSelectedFrameId(initialFrame);
        const match = photos.find(p => p.frameId === initialFrame);
        if (match) {
          setActivePhotoUrl(match.url);
        }

        // Check if a preset is applied to this frame
        const applied = getAppliedPresetForFrame(refId, initialFrame);
        setCurrentAppliedPreset(applied);
      }
    } catch {
      // ignore
    }
  };

  const handleSelectPhoto = (photo: SessionPhoto) => {
    setSelectedFrameId(photo.frameId);
    setActivePhotoUrl(photo.url);
    if (referenceId) {
      const applied = getAppliedPresetForFrame(referenceId, photo.frameId);
      setCurrentAppliedPreset(applied);
    }
  };

  // Handlers for Preset CRUD
  const handleOpenCreate = () => {
    setEditingPreset(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (preset: StudioPreset) => {
    setEditingPreset(preset);
    setIsEditorOpen(true);
  };

  const handleOpenDelete = (preset: StudioPreset) => {
    setDeletingPreset(preset);
    setIsDeleteOpen(true);
  };

  const handleSavePreset = (data: Partial<StudioPreset>): { success: boolean; error?: string } => {
    if (editingPreset) {
      const res = updateStudioPreset(editingPreset.id, data);
      if (res.success) {
        refreshPresets();
        showToast(`Preset "${res.preset?.name}" updated successfully.`);
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const res = saveStudioPreset(data as any);
      if (res.success) {
        refreshPresets();
        showToast(`Studio preset "${res.preset?.name}" created successfully!`);
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };

  const handleConfirmDelete = (preset: StudioPreset) => {
    const res = deleteStudioPreset(preset.id);
    if (res.success) {
      refreshPresets();
      showToast(`Preset "${preset.name}" deleted.`, 'info');
    } else {
      showToast(res.error || 'Failed to delete preset.', 'error');
    }
  };

  // Preset Application
  const handleOpenPreviewAndApply = (preset: StudioPreset) => {
    setPreviewingPreset(preset);
    setIsPreviewOpen(true);
  };

  const handleApplyPresetToPhoto = (preset: StudioPreset, customIntensity: number) => {
    const appliedState: AppliedPresetState = {
      presetId: preset.id,
      presetName: preset.name,
      appliedAt: new Date().toISOString(),
      settings: {
        ...preset,
        filterIntensity: customIntensity
      }
    };

    if (referenceId && selectedFrameId) {
      setAppliedPresetForFrame(referenceId, selectedFrameId, appliedState);
      
      // Also save compatibility state for template/filter engines
      try {
        localStorage.setItem(`posely_template_${referenceId}_${selectedFrameId}`, JSON.stringify({
          colorGrade: preset.colorGrade,
          intensity: customIntensity,
          backgroundMode: preset.backgroundMode,
          aspectRatio: preset.aspectRatio
        }));
      } catch {}
    }

    setCurrentAppliedPreset(appliedState);
    showToast(`Applied "${preset.name}" (${customIntensity}%) to active photo.`);
  };

  const handleResetPreset = () => {
    if (referenceId && selectedFrameId) {
      clearAppliedPresetForFrame(referenceId, selectedFrameId);
      try {
        localStorage.removeItem(`posely_template_${referenceId}_${selectedFrameId}`);
      } catch {}
    }
    setCurrentAppliedPreset(null);
    showToast('Reset photo to original unedited state.', 'info');
  };

  // Filtered preset list
  const filteredPresets = presets.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (filterType === 'builtin') return p.isBuiltIn;
    if (filterType === 'custom') return !p.isBuiltIn;
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 transition-all text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-300 ${
          toastMessage.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/80 shadow-emerald-950/50' :
          toastMessage.type === 'error' ? 'bg-rose-950/90 text-rose-200 border-rose-700/80 shadow-rose-950/50' :
          'bg-purple-950/90 text-purple-200 border-purple-700/80 shadow-purple-950/50'
        }`}>
          {toastMessage.type === 'success' && <Check className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-purple-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#171722] border border-[#2B2B38] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-purple-950/80 text-purple-300 border border-purple-800/60 uppercase">
              Studio Signature Styles
            </span>
            <span className="text-xs text-stone-500 font-mono">Stage 17</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <SlidersHorizontal className="w-7 h-7 text-purple-400" />
            Studio Presets
          </h1>
          <p className="text-sm text-[#8A8A98] max-w-2xl">
            Configure your professional photo style once, save it as a reusable preset, and apply it consistently across your photoshoot.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/studio"
            className="px-4 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 hover:text-white text-xs sm:text-sm font-semibold border border-purple-500/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <FolderDown className="w-4 h-4 text-purple-400" />
            <span>Process Full Shoot</span>
          </Link>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-950/50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Preset</span>
          </button>

          {referenceId && (
            <Link
              to={`/enhanced?id=${referenceId}`}
              className="px-4 py-2.5 rounded-xl bg-[#22222E] hover:bg-[#2C2C3C] text-stone-300 hover:text-white text-xs sm:text-sm font-semibold border border-[#353545] flex items-center gap-1.5 transition-colors"
            >
              <span>Back to Editor</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Active Photo Testing Bar */}
      {sessionPhotos.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#14141C] border border-[#262633] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              Active Preview Subject (Click a photo to test presets)
            </span>

            {currentAppliedPreset && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Active: <strong>{currentAppliedPreset.presetName}</strong>
                </span>
                <button
                  onClick={handleResetPreset}
                  className="px-2 py-0.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[11px] font-semibold hover:bg-rose-900/80 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            {sessionPhotos.map((photo) => {
              const isSelected = photo.frameId === selectedFrameId;
              const hasApplied = referenceId ? Boolean(getAppliedPresetForFrame(referenceId, photo.frameId)) : false;

              return (
                <button
                  key={photo.frameId}
                  onClick={() => handleSelectPhoto(photo)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-purple-500 scale-105 shadow-md shadow-purple-950/60 ring-2 ring-purple-500/30' 
                      : 'border-[#2B2B38] opacity-70 hover:opacity-100 hover:border-stone-500'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.frameId}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                  {hasApplied && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search studio presets..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2B2B38] focus:border-purple-500 focus:outline-none text-white text-xs placeholder:text-stone-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex rounded-xl bg-[#15151F] p-1 border border-[#262633] self-stretch sm:self-auto">
          {[
            { id: 'all', label: `All Presets (${presets.length})` },
            { id: 'builtin', label: 'Built-in (3)' },
            { id: 'custom', label: `Custom Studio (${presets.filter(p => !p.isBuiltIn).length})` }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === item.id 
                  ? 'bg-purple-950/80 text-purple-200 border border-purple-700/50 shadow-sm' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Presets Cards Grid */}
      {filteredPresets.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#15151F] border border-[#2B2B38] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/50 border border-purple-800/50 text-purple-400 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No presets found</h3>
            <p className="text-xs text-[#8A8A98]">
              {searchQuery ? `No presets matching "${searchQuery}".` : 'Create your first studio preset to establish your signature look.'}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Preset</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              sampleImageUrl={activePhotoUrl}
              isApplied={currentAppliedPreset?.presetId === preset.id}
              onPreviewAndApply={handleOpenPreviewAndApply}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <PresetEditorModal
        isOpen={isEditorOpen}
        preset={editingPreset}
        sampleImageUrl={activePhotoUrl}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSavePreset}
      />

      <PresetPreviewModal
        isOpen={isPreviewOpen}
        preset={previewingPreset}
        photoUrl={activePhotoUrl}
        frameId={selectedFrameId}
        onClose={() => setIsPreviewOpen(false)}
        onApply={handleApplyPresetToPhoto}
      />

      <DeletePresetModal
        isOpen={isDeleteOpen}
        preset={deletingPreset}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
