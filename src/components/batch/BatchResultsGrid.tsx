import React, { useState } from 'react';
import { 
  BatchResultPhoto, 
  StudioPreset 
} from '../../types';
import { 
  Download, 
  Sparkles, 
  ExternalLink, 
  Trophy, 
  Smile, 
  Eye, 
  Maximize2, 
  Video, 
  Image as ImageIcon,
  CheckCircle2,
  Filter,
  SlidersHorizontal,
  Layers,
  Palette
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportAndDownloadPhoto } from '../../services/exportService';

interface BatchResultsGridProps {
  results: BatchResultPhoto[];
  preset: StudioPreset;
}

export default function BatchResultsGrid({ results, preset }: BatchResultsGridProps) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'top_rated' | 'videos' | 'photos'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (results.length === 0) {
    return null;
  }

  // Filter items
  const filteredResults = results.filter(item => {
    if (activeFilter === 'top_rated') {
      return (item.quality?.score ?? 0) >= 80;
    }
    if (activeFilter === 'videos') {
      return item.mediaType === 'video';
    }
    if (activeFilter === 'photos') {
      return item.mediaType === 'photo';
    }
    return true;
  });

  const handleDownloadSingle = async (item: BatchResultPhoto) => {
    setDownloadingId(item.id);
    try {
      if (item.downloadUrl && item.downloadUrl.startsWith('/api/download/')) {
        // Direct download URL
        const link = document.createElement('a');
        link.href = item.downloadUrl;
        link.download = item.exportedFilename || `${item.frameId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Run export pipeline
        await exportAndDownloadPhoto({
          referenceId: item.referenceId,
          frameId: item.frameId,
          backgroundMode: preset.backgroundMode,
          filterId: preset.colorGrade,
          filterIntensity: preset.filterIntensity,
          format: preset.exportSettings?.format || 'auto'
        });
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenInspector = (item: BatchResultPhoto) => {
    navigate(`/enhanced?id=${item.referenceId}&frameId=${item.frameId}`);
  };

  return (
    <div id="studio-results-section" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252533] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Best Photos Generated ({results.length})
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8A98] mt-1">
            Top scored moments enhanced and graded with "{preset.name}" preset
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#1C1C28] text-[#8A8A98] hover:text-white border border-[#2B2B38]'
            }`}
          >
            All ({results.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('top_rated')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeFilter === 'top_rated'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#1C1C28] text-[#8A8A98] hover:text-white border border-[#2B2B38]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Top Rated 80+ ({results.filter(r => (r.quality?.score ?? 0) >= 80).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('videos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeFilter === 'videos'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#1C1C28] text-[#8A8A98] hover:text-white border border-[#2B2B38]'
            }`}
          >
            <Video className="w-3 h-3" />
            <span>From Videos ({results.filter(r => r.mediaType === 'video').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('photos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeFilter === 'photos'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#1C1C28] text-[#8A8A98] hover:text-white border border-[#2B2B38]'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>Photos ({results.filter(r => r.mediaType === 'photo').length})</span>
          </button>
        </div>
      </div>

      {/* Grid of Photo Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredResults.map((item, index) => {
          const score = item.quality?.score ? Math.round(item.quality.score) : 85;
          const isExcellent = score >= 90;
          const isGood = score >= 75 && score < 90;

          return (
            <div
              key={item.id}
              className="group rounded-2xl bg-[#161622] border border-[#272736] hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Preview Box */}
              <div 
                onClick={() => handleOpenInspector(item)}
                className="relative aspect-[4/5] bg-[#101018] overflow-hidden cursor-pointer"
              >
                <img
                  src={item.previewUrl}
                  alt={item.sourceFilename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Score & Rank Overlay Top */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-md ${
                    isExcellent
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : isGood
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                      : 'bg-[#20202E]/80 text-[#A0A0B2] border border-[#3B3B4C]'
                  }`}>
                    <Trophy className="w-3 h-3" />
                    <span>{score} PTS</span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center gap-1">
                    {item.mediaType === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                    <span>{item.mediaType === 'video' ? `Pick #${item.rank || index + 1}` : 'Photo'}</span>
                  </span>
                </div>

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInspector(item);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open & Edit</span>
                  </button>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-bold text-sm text-white truncate" title={item.sourceFilename}>
                      {item.sourceFilename}
                    </h5>
                    <span className="text-[11px] text-[#7A7A8C] flex-shrink-0">
                      {item.frameId}
                    </span>
                  </div>

                  {/* Preset & Tag Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      <span>{preset.name}</span>
                    </span>

                    {preset.backgroundMode !== 'original' && (
                      <span className="px-2 py-0.5 rounded bg-[#20202E] text-[#9A9AA8] border border-[#2F2F40] capitalize flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{preset.backgroundMode}</span>
                      </span>
                    )}

                    {item.exportedDimensions && (
                      <span className="px-1.5 py-0.5 rounded bg-[#1D1D2A] text-[#7A7A8C]">
                        {item.exportedDimensions.width}×{item.exportedDimensions.height}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons Footer */}
                <div className="pt-3 border-t border-[#232330] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenInspector(item)}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  <button
                    type="button"
                    disabled={downloadingId === item.id}
                    onClick={() => handleDownloadSingle(item)}
                    className="px-3 py-1.5 rounded-lg bg-[#242434] hover:bg-purple-600 hover:text-white text-[#D0D0E2] text-xs font-semibold flex items-center gap-1.5 transition-all border border-[#353548] active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingId === item.id ? 'Exporting...' : 'Download'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
