import React from 'react';
import { 
  BatchShoot, 
  StudioPreset 
} from '../../types';
import { 
  Play, 
  XOctagon, 
  RefreshCw, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Layers,
  ArrowDown
} from 'lucide-react';

interface BatchDashboardHeaderProps {
  shoot: BatchShoot;
  onStartProcessing: () => void;
  onCancelProcessing: () => void;
  onRetryFailed: () => void;
  onStartNewShoot: () => void;
  onScrollToResults?: () => void;
}

export default function BatchDashboardHeader({
  shoot,
  onStartProcessing,
  onCancelProcessing,
  onRetryFailed,
  onStartNewShoot,
  onScrollToResults
}: BatchDashboardHeaderProps) {
  const isProcessing = shoot.status === 'processing';
  const isCompleted = shoot.status === 'completed';
  const videoCount = shoot.items.filter(i => i.type === 'video').length;
  const photoCount = shoot.items.filter(i => i.type === 'photo').length;
  const totalResultsCount = shoot.items.reduce((acc, it) => acc + (it.results?.length || 0), 0);

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#181824] to-[#13131D] border border-[#2B2B38] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Row: Shoot Title & Live Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {shoot.name}
            </h2>
            {isCompleted && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Shoot Complete</span>
              </span>
            )}
            {isProcessing && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-950/60 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-sm animate-pulse">
                <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                <span>Processing Shoot</span>
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#8A8A98] flex items-center gap-2 flex-wrap">
            <span>{shoot.totalFiles} files queued</span>
            <span className="text-[#3B3B4C]">•</span>
            <span>{videoCount} video{videoCount === 1 ? '' : 's'}</span>
            <span className="text-[#3B3B4C]">•</span>
            <span>{photoCount} photo{photoCount === 1 ? '' : 's'}</span>
            <span className="text-[#3B3B4C]">•</span>
            <span className="text-purple-300 font-medium">Preset: {shoot.selectedPreset.name}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Process Shoot button */}
          {!isProcessing && !isCompleted && shoot.totalFiles > 0 && (
            <button
              type="button"
              onClick={onStartProcessing}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Process Shoot ({shoot.totalFiles} Files)</span>
            </button>
          )}

          {/* Cancel Shoot button */}
          {isProcessing && (
            <button
              type="button"
              onClick={onCancelProcessing}
              className="px-4 py-2.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/50 text-rose-200 border border-rose-500/40 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all active:scale-95"
            >
              <XOctagon className="w-4 h-4 text-rose-400" />
              <span>Cancel Shoot</span>
            </button>
          )}

          {/* Retry Failed button */}
          {shoot.failedFiles > 0 && !isProcessing && (
            <button
              type="button"
              onClick={onRetryFailed}
              className="px-4 py-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 text-amber-200 border border-amber-500/40 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Retry Failed ({shoot.failedFiles})</span>
            </button>
          )}

          {/* View Results button */}
          {totalResultsCount > 0 && onScrollToResults && (
            <button
              type="button"
              onClick={onScrollToResults}
              className="px-4 py-2.5 rounded-xl bg-[#232330] hover:bg-[#2C2C3C] text-white border border-[#3B3B4C] text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <ArrowDown className="w-4 h-4 text-purple-400" />
              <span>View Best Photos ({totalResultsCount})</span>
            </button>
          )}

          {/* Start New Shoot */}
          {(isCompleted || shoot.status === 'cancelled') && (
            <button
              type="button"
              onClick={onStartNewShoot}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Shoot</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Metric Dashboard Bar */}
      <div className="space-y-3 pt-2 relative z-10">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-semibold text-white">
            <span>Overall Progress</span>
            <span className="text-purple-400 font-bold">
              {shoot.completedFiles} / {shoot.totalFiles} completed
            </span>
          </div>
          <span className="font-bold text-white tracking-wide">
            {shoot.overallProgress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full bg-[#1F1F2C] rounded-full overflow-hidden p-0.5 border border-[#2B2B3A]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 shadow-sm shadow-purple-500/50'
            }`}
            style={{ width: `${Math.max(shoot.totalFiles > 0 ? 3 : 0, shoot.overallProgress)}%` }}
          />
        </div>

        {/* Status Counters Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Completed */}
          <div className="p-3 rounded-xl bg-[#14141E] border border-[#252533] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-[#8A8A98]">Completed</div>
              <div className="text-base font-bold text-emerald-300">
                {shoot.completedFiles}
              </div>
            </div>
          </div>

          {/* Processing */}
          <div className="p-3 rounded-xl bg-[#14141E] border border-[#252533] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Loader2 className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="text-xs text-[#8A8A98]">Processing</div>
              <div className="text-base font-bold text-purple-300">
                {shoot.processingFiles}
              </div>
            </div>
          </div>

          {/* Queued */}
          <div className="p-3 rounded-xl bg-[#14141E] border border-[#252533] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#222230] border border-[#333345] flex items-center justify-center text-[#9A9AA8]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6A6A7C]" />
            </div>
            <div>
              <div className="text-xs text-[#8A8A98]">Queued</div>
              <div className="text-base font-bold text-[#A0A0B2]">
                {shoot.queuedFiles}
              </div>
            </div>
          </div>

          {/* Failed */}
          <div className="p-3 rounded-xl bg-[#14141E] border border-[#252533] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-[#8A8A98]">Failed</div>
              <div className={`text-base font-bold ${shoot.failedFiles > 0 ? 'text-rose-400' : 'text-[#8A8A98]'}`}>
                {shoot.failedFiles}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
