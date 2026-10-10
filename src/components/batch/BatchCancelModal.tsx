import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface BatchCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
  completedCount: number;
}

export default function BatchCancelModal({
  isOpen,
  onClose,
  onConfirmCancel,
  completedCount
}: BatchCancelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl bg-[#181824] border border-[#2B2B38] p-6 sm:p-7 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#8A8A98] hover:text-white hover:bg-[#252533] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Cancel this shoot?
          </h3>
          <p className="text-sm text-[#9A9AA8] leading-relaxed">
            Files already completed <span className="text-white font-medium">({completedCount} completed)</span> will remain available in your results. Any remaining files in the queue will stop processing.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#232330] hover:bg-[#2B2B3C] text-white text-sm font-semibold border border-[#3A3A4C] transition-all"
          >
            Keep Processing
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirmCancel();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-md shadow-rose-600/20 transition-all active:scale-95"
          >
            Yes, Cancel Shoot
          </button>
        </div>
      </div>
    </div>
  );
}
