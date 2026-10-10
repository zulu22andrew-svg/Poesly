import React, { useState } from 'react';
import { Download, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { ExportOptions, ExportProgressState, ExportResult } from '../types';
import { exportAndDownloadPhoto } from '../services/exportService';

interface ExportButtonProps {
  options: ExportOptions;
  variant?: 'primary' | 'compact' | 'inspector' | 'subtle';
  className?: string;
  onExportSuccess?: (result: ExportResult) => void;
  onExportError?: (error: string) => void;
  label?: string;
  showDetails?: boolean;
}

export default function ExportButton({
  options,
  variant = 'primary',
  className = '',
  onExportSuccess,
  onExportError,
  label = 'Download Photo',
  showDetails = false
}: ExportButtonProps) {
  const [progressState, setProgressState] = useState<ExportProgressState>({
    status: 'idle',
    progressPercent: 0,
    message: ''
  });
  const [lastResult, setLastResult] = useState<ExportResult | null>(null);

  const isExporting = progressState.status === 'preparing' || progressState.status === 'processing';
  const isComplete = progressState.status === 'ready';
  const isError = progressState.status === 'error';

  const handleExport = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isExporting) return;

    try {
      const result = await exportAndDownloadPhoto(options, (state) => {
        setProgressState(state);
      });

      setLastResult(result);
      onExportSuccess?.(result);

      // Reset complete state after 4 seconds
      setTimeout(() => {
        setProgressState(prev => prev.status === 'ready' ? { status: 'idle', progressPercent: 0, message: '' } : prev);
      }, 4000);
    } catch (err: any) {
      const msg = err.message || 'Export failed';
      onExportError?.(msg);
      setTimeout(() => {
        setProgressState({ status: 'idle', progressPercent: 0, message: '' });
      }, 4000);
    }
  };

  // Inspector Variant
  if (variant === 'inspector') {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 ${
            isComplete
              ? 'bg-emerald-600 text-white shadow-emerald-900/30'
              : isError
              ? 'bg-rose-600 text-white'
              : isExporting
              ? 'bg-purple-700/80 text-purple-100 cursor-wait'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-950/40'
          } ${className}`}
          title={isExporting ? progressState.message : 'Download full-resolution photo with active enhancements, background & filter'}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{progressState.message || 'Processing full resolution...'}</span>
            </>
          ) : isComplete ? (
            <>
              <Check className="w-4 h-4 text-emerald-200" />
              <span>Downloaded! ({lastResult?.formattedSize || 'Full Res'})</span>
            </>
          ) : isError ? (
            <>
              <AlertCircle className="w-4 h-4 text-rose-200" />
              <span>{progressState.error || 'Retry Export'}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Full Res ({options.backgroundMode === 'remove' ? 'PNG' : 'JPEG'})</span>
            </>
          )}
        </button>

        {isExporting && (
          <div className="w-full bg-black/40 rounded-full h-1 overflow-hidden border border-white/10">
            <div
              className="bg-emerald-400 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressState.progressPercent}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // Compact Variant (e.g. inside photo card headers)
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
          isComplete
            ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/50'
            : isExporting
            ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40 cursor-wait'
            : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white border border-white/10'
        } ${className}`}
        title={isExporting ? progressState.message : 'Download full resolution photo'}
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
        ) : isComplete ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
      </button>
    );
  }

  // Primary / Standard Variant
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] ${
          isComplete
            ? 'bg-emerald-600 text-white shadow-emerald-900/30'
            : isError
            ? 'bg-rose-600 text-white shadow-rose-900/30'
            : isExporting
            ? 'bg-purple-700 text-purple-100 cursor-wait'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-950/20'
        }`}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
            <span>{progressState.message || 'Processing full resolution...'}</span>
          </>
        ) : isComplete ? (
          <>
            <Check className="w-4 h-4 text-emerald-100" />
            <span>Downloaded ({lastResult?.formattedSize || 'Full Res'})</span>
          </>
        ) : isError ? (
          <>
            <AlertCircle className="w-4 h-4 text-rose-200" />
            <span>{progressState.error || 'Export Failed - Retry'}</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>{label}</span>
          </>
        )}
      </button>

      {/* Progress Bar while processing */}
      {isExporting && (
        <div className="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden border border-white/5">
          <div
            className="bg-emerald-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressState.progressPercent}%` }}
          />
        </div>
      )}

      {/* Details snippet when requested */}
      {showDetails && lastResult && !isExporting && (
        <div className="flex items-center justify-between text-[10px] text-stone-400 px-1">
          <span>{lastResult.dimensions.width}×{lastResult.dimensions.height} ({lastResult.format.toUpperCase()})</span>
          <span className="font-mono text-emerald-400">{lastResult.formattedSize}</span>
        </div>
      )}
    </div>
  );
}
