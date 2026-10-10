import React, { useState } from 'react';
import { 
  BatchItem, 
  StudioPreset 
} from '../../types';
import { 
  Video, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface BatchQueueItemProps {
  key?: React.Key;
  item: BatchItem;
  preset: StudioPreset;
  onRetry?: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
  onOpenResult?: (referenceId: string, frameId: string) => void;
  isProcessingBatch?: boolean;
}

export default function BatchQueueItem({
  item,
  preset,
  onRetry,
  onRemove,
  onOpenResult,
  isProcessingBatch = false
}: BatchQueueItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = () => {
    switch (item.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Completed ({item.results.length} pick{item.results.length === 1 ? '' : 's'})</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/50 text-rose-300 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Failed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2A2A38] text-[#9A9AA8] border border-[#3A3A4C]">
            <span>Cancelled</span>
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#20202C] text-[#8A8A98] border border-[#2F2F40]">
            <span className="w-2 h-2 rounded-full bg-[#5A5A68]" />
            <span>Queued</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-950/50 text-purple-300 border border-purple-500/30">
            <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>{item.currentStage || 'Processing...'}</span>
          </span>
        );
    }
  };

  const isWorking = !['completed', 'failed', 'cancelled', 'queued'].includes(item.status);

  return (
    <div className={`rounded-2xl border transition-all ${
      item.status === 'failed'
        ? 'bg-[#181418] border-rose-500/30'
        : item.status === 'completed'
        ? 'bg-[#141816] border-emerald-500/20'
        : isWorking
        ? 'bg-[#181826] border-purple-500/40 shadow-sm shadow-purple-500/10'
        : 'bg-[#161620] border-[#252533]'
    }`}>
      {/* Main Item Row */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Thumbnail & Name */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Thumbnail / Icon Box */}
          <div className="w-12 h-12 rounded-xl bg-[#1D1D2B] border border-[#2F2F40] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            {item.localPreviewUrl ? (
              <img
                src={item.localPreviewUrl}
                alt={item.filename}
                className="w-full h-full object-cover"
              />
            ) : item.type === 'video' ? (
              <Video className="w-6 h-6 text-purple-400" />
            ) : (
              <ImageIcon className="w-6 h-6 text-indigo-400" />
            )}
            
            {/* Small Media Type Indicator */}
            <div className="absolute bottom-0 right-0 left-0 bg-black/60 text-[8px] font-bold text-center text-white py-0.2 uppercase tracking-tight">
              {item.type}
            </div>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h5 className="font-semibold text-sm text-white truncate" title={item.filename}>
                {item.filename}
              </h5>
              <span className="text-[11px] text-[#7A7A8C]">
                {item.formattedSize}
              </span>
            </div>

            {/* Current stage text */}
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-[#9A9AA8] truncate">
                {item.error ? (
                  <span className="text-rose-400 font-medium">{item.error}</span>
                ) : (
                  <span>{item.currentStage}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-3 flex-shrink-0 justify-between sm:justify-end">
          {/* Status Badge */}
          {getStatusBadge()}

          {/* Progress Bar (if working) */}
          {isWorking && (
            <div className="w-20 hidden md:block">
              <div className="h-1.5 w-full bg-[#20202E] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(5, item.progress)}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {item.status === 'failed' && onRetry && (
              <button
                type="button"
                onClick={() => onRetry(item.id)}
                disabled={isProcessingBatch}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                title="Retry this failed file"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}

            {item.status === 'queued' && onRemove && !isProcessingBatch && (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="p-1.5 rounded-lg hover:bg-rose-950/30 text-[#8A8A98] hover:text-rose-400 transition-colors"
                title="Remove from queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Stage details expander */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-[#252533] text-[#8A8A98] hover:text-white transition-colors"
              title={isExpanded ? 'Hide stage details' : 'Show stage details'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Item Progress Bar on Mobile */}
      {isWorking && (
        <div className="px-5 pb-3 block md:hidden">
          <div className="h-1.5 w-full bg-[#20202E] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(5, item.progress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded Pipeline Step Checklist */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-[#222230] bg-[#12121A]/60 rounded-b-2xl space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8A8A98]">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-[#6A6A7C]">
              Pipeline Execution Trace
            </span>
            <span>Applied: {preset.name}</span>
          </div>

          <div className="space-y-1.5">
            {item.stages.map((stage) => {
              const isCompleted = stage.status === 'completed';
              const isInProgress = stage.status === 'in_progress';
              const isFailed = stage.status === 'failed';

              return (
                <div
                  key={stage.id}
                  className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs transition-colors ${
                    isInProgress
                      ? 'bg-purple-950/30 text-purple-200 border border-purple-500/30'
                      : isFailed
                      ? 'bg-rose-950/20 text-rose-300 border border-rose-500/20'
                      : isCompleted
                      ? 'text-[#A0A0B2]'
                      : 'text-[#5A5A68]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : isFailed ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    ) : isInProgress ? (
                      <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[#444455] flex-shrink-0" />
                    )}

                    <span className="font-medium truncate">{stage.label}</span>
                  </div>

                  {stage.detail && (
                    <span className={`text-[11px] truncate max-w-[200px] sm:max-w-xs ${
                      isFailed ? 'text-rose-400' : isInProgress ? 'text-purple-300' : 'text-[#7A7A8C]'
                    }`}>
                      {stage.detail}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Result Preview Links if completed */}
          {item.results.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#20202E]">
              <div className="text-[11px] font-semibold text-[#8A8A98] mb-2">
                Generated Top Picks ({item.results.length}):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {item.results.map((res, i) => (
                  <div
                    key={res.id}
                    onClick={() => onOpenResult?.(res.referenceId, res.frameId)}
                    className="group/pick relative rounded-lg border border-[#2B2B38] overflow-hidden bg-[#181824] cursor-pointer hover:border-purple-500/60 transition-all aspect-[4/5]"
                  >
                    <img
                      src={res.previewUrl}
                      alt={res.frameId}
                      className="w-full h-full object-cover group-hover/pick:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5 opacity-90 group-hover/pick:opacity-100">
                      <div className="w-full flex items-center justify-between text-[10px] text-white">
                        <span className="font-bold">
                          {res.quality?.score ? `${Math.round(res.quality.score)} pts` : `#${i + 1}`}
                        </span>
                        <ExternalLink className="w-3 h-3 text-purple-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
