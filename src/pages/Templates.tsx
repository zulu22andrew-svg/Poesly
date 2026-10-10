import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  RotateCcw, 
  Check, 
  ArrowRight, 
  SlidersHorizontal, 
  ImageIcon, 
  FolderDown, 
  Layers, 
  Eye, 
  Wand2, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { TemplateCategory, TemplateRecipe, BackgroundMode } from '../types';
import { BUILT_IN_TEMPLATES } from '../templates/templates';
import { getTemplatesByCategory, executeTemplate, computeTemplateCSSFilter } from '../templates/templateEngine';
import TemplateCard from '../components/TemplateCard';
import TemplatePreviewModal from '../components/TemplatePreviewModal';
import ExportButton from '../components/ExportButton';

const CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'portrait', label: 'Portrait' },
  { id: 'studio', label: 'Studio' },
  { id: 'professional', label: 'Professional' },
  { id: 'social', label: 'Social' },
  { id: 'special', label: 'Special' },
];

interface SessionPhoto {
  frameId: string;
  url: string;
  enhancedUrl?: string;
  name?: string;
}

export default function Templates() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const referenceIdParam = searchParams.get('id') || searchParams.get('ref');
  const frameIdParam = searchParams.get('frame');

  const [referenceId, setReferenceId] = useState<string>(referenceIdParam || '');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');
  const [sessionPhotos, setSessionPhotos] = useState<SessionPhoto[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState<string>(frameIdParam || '');
  const [activePhotoUrl, setActivePhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80'
  );

  // Active applied template state per frame
  const [appliedTemplateMap, setAppliedTemplateMap] = useState<Record<string, { templateId: string; intensity: number }>>({});
  
  // Preview Modal state
  const [previewTemplate, setPreviewTemplate] = useState<TemplateRecipe | null>(null);
  const [previewIntensity, setPreviewIntensity] = useState<number>(70);

  // Success / Status feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Load session & frame info
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
          url: f.url || `/uploads/${refId}/${f.frameId || f.id}.jpg`,
          enhancedUrl: `/uploads/${refId}/${f.frameId || f.id}-enhanced.jpg`
        }));
        setSessionPhotos(photos);

        // Set selected frame
        const targetFrame = frameIdParam 
          ? photos.find(p => p.frameId === frameIdParam) 
          : photos[0];
        
        if (targetFrame) {
          setSelectedFrameId(targetFrame.frameId);
          setActivePhotoUrl(targetFrame.enhancedUrl || targetFrame.url);
        }
      }
    } catch (e) {
      console.warn('Could not load session frames, using sample portrait');
    }
  };

  // Change active photo
  const handleSelectPhoto = (photo: SessionPhoto) => {
    setSelectedFrameId(photo.frameId);
    setActivePhotoUrl(photo.enhancedUrl || photo.url);
    setStatusMessage(null);
  };

  // Apply template to active photo
  const handleApplyTemplate = (template: TemplateRecipe, intensity: number = 70) => {
    const key = selectedFrameId || 'current';
    setAppliedTemplateMap(prev => ({
      ...prev,
      [key]: { templateId: template.id, intensity }
    }));

    // Store in localStorage for synchronization with Enhanced page
    if (referenceId && selectedFrameId) {
      const storageKey = `posely_template_${referenceId}_${selectedFrameId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        templateId: template.id,
        intensity,
        colorGrade: template.colorGrade,
        backgroundMode: template.backgroundMode,
        aspectRatio: template.aspectRatio,
        appliedAt: new Date().toISOString()
      }));
    }

    setStatusMessage({
      type: 'success',
      text: `Applied "${template.name}" (${intensity}%) to photo.`
    });
  };

  // Reset template for active photo
  const handleResetTemplate = () => {
    const key = selectedFrameId || 'current';
    setAppliedTemplateMap(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    if (referenceId && selectedFrameId) {
      const storageKey = `posely_template_${referenceId}_${selectedFrameId}`;
      localStorage.removeItem(storageKey);
    }

    setStatusMessage({
      type: 'info',
      text: 'Template reset. Reverted back to original photo.'
    });
  };

  const filteredTemplates = getTemplatesByCategory(selectedCategory);
  const currentApplied = appliedTemplateMap[selectedFrameId || 'current'];
  const activeTemplate = currentApplied ? BUILT_IN_TEMPLATES.find(t => t.id === currentApplied.templateId) : null;
  const currentPreviewFilter = activeTemplate ? computeTemplateCSSFilter(activeTemplate, currentApplied.intensity) : 'none';

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2B2B36] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Templates
            </h1>
          </div>
          <p className="text-sm text-stone-400">
            Give your photos a professional look in one click.
          </p>
        </div>

        {/* Quick Action Links */}
        <div className="flex items-center gap-2.5">
          {referenceId && (
            <Link
              to={`/enhanced?id=${referenceId}`}
              className="py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-semibold flex items-center gap-2 border border-stone-800 transition-colors shadow-sm"
            >
              <span>Enhanced Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            </Link>
          )}

          {activeTemplate && referenceId && selectedFrameId && (
            <ExportButton
              options={{
                referenceId,
                frameId: selectedFrameId,
                backgroundMode: activeTemplate.backgroundMode,
                filterId: activeTemplate.colorGrade,
                filterIntensity: currentApplied.intensity,
                format: activeTemplate.backgroundMode === 'remove' ? 'png' : 'auto'
              }}
              variant="primary"
              label="Download High-Res"
            />
          )}
        </div>
      </div>

      {/* 2. Photo Selection Strip (If session photos available) */}
      {sessionPhotos.length > 0 && (
        <div className="bg-[#15151C] border border-[#2B2B36] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              Active Session Photos ({sessionPhotos.length})
            </span>
            <span className="text-[11px] font-mono text-stone-500">
              Selected: {selectedFrameId || 'None'}
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
            {sessionPhotos.map((photo) => {
              const isSelected = photo.frameId === selectedFrameId;
              const photoApplied = appliedTemplateMap[photo.frameId];
              const templateObj = photoApplied ? BUILT_IN_TEMPLATES.find(t => t.id === photoApplied.templateId) : null;
              const filterStyle = templateObj ? computeTemplateCSSFilter(templateObj, photoApplied.intensity) : 'none';

              return (
                <button
                  key={photo.frameId}
                  type="button"
                  onClick={() => handleSelectPhoto(photo)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all group ${
                    isSelected
                      ? 'border-purple-500 ring-2 ring-purple-500/30 scale-105'
                      : 'border-stone-800 hover:border-stone-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.frameId}
                    className="w-full h-full object-cover"
                    style={{ filter: filterStyle }}
                  />
                  {templateObj && (
                    <div className="absolute bottom-0 inset-x-0 bg-purple-950/80 text-[9px] font-bold text-purple-200 py-0.5 text-center truncate px-1">
                      {templateObj.name}
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shadow">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Active Status Banner */}
      {statusMessage && (
        <div className={`p-3.5 rounded-2xl flex items-center justify-between text-xs border animate-in fade-in duration-200 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-200'
            : 'bg-stone-900 border-stone-800 text-stone-300'
        }`}>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage.text}</span>
          </div>

          <div className="flex items-center gap-2">
            {activeTemplate && (
              <button
                type="button"
                onClick={handleResetTemplate}
                className="text-stone-400 hover:text-white flex items-center gap-1 underline text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-stone-400 hover:text-white text-xs px-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 4. Active Applied Template Banner if one is active */}
      {activeTemplate && (
        <div className="bg-gradient-to-r from-purple-950/40 via-[#15151C] to-stone-900/40 border border-purple-800/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Active Template:</span>
                <span className="text-sm font-bold text-white">{activeTemplate.name}</span>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-700/50">
                  {currentApplied.intensity}% Intensity
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {activeTemplate.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setPreviewTemplate(activeTemplate);
                setPreviewIntensity(currentApplied.intensity);
              }}
              className="flex-1 sm:flex-initial py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-stone-800"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Adjust Strength</span>
            </button>

            <button
              type="button"
              onClick={handleResetTemplate}
              className="flex-1 sm:flex-initial py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-rose-800/50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Template</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Category Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isCatActive = selectedCategory === cat.id;
          const count = getTemplatesByCategory(cat.id).length;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                isCatActive
                  ? 'bg-white text-stone-950 shadow-md scale-102'
                  : 'bg-[#15151C] text-stone-400 hover:bg-[#20202A] hover:text-white border border-[#2B2B36]'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                isCatActive ? 'bg-stone-200 text-stone-900' : 'bg-stone-900 text-stone-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 6. Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTemplates.map((template) => {
          const isSelected = activeTemplate?.id === template.id;

          return (
            <TemplateCard
              key={template.id}
              template={template}
              sampleImageUrl={activePhotoUrl}
              isSelected={isSelected}
              onPreview={(t) => {
                setPreviewTemplate(t);
                setPreviewIntensity(isSelected ? currentApplied.intensity : t.defaultIntensity);
              }}
              onApply={(t) => handleApplyTemplate(t, t.defaultIntensity)}
            />
          );
        })}
      </div>

      {/* 7. Interactive Before/After Split Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          imageUrl={activePhotoUrl}
          isOpen={true}
          initialIntensity={previewIntensity}
          isCurrentlyApplied={activeTemplate?.id === previewTemplate.id}
          onClose={() => setPreviewTemplate(null)}
          onApply={(t, intensity) => handleApplyTemplate(t, intensity)}
          onReset={activeTemplate?.id === previewTemplate.id ? handleResetTemplate : undefined}
          onSelectTemplate={(t) => {
            setPreviewTemplate(t);
            setPreviewIntensity(t.defaultIntensity);
          }}
        />
      )}
    </div>
  );
}
