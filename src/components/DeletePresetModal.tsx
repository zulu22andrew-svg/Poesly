import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { StudioPreset } from '../types';

interface DeletePresetModalProps {
  isOpen: boolean;
  preset: StudioPreset | null;
  onClose: () => void;
  onConfirm: (preset: StudioPreset) => void;
}

export default function DeletePresetModal({
  isOpen,
  preset,
  onClose,
  onConfirm
}: DeletePresetModalProps) {
  if (!isOpen || !preset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#181822] border border-[#2B2B38] rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight">
              Delete "{preset.name}"?
            </h3>
            <p className="text-xs text-[#8A8A98] leading-relaxed">
              This will remove this preset from your studio library. Deleting a preset will <strong className="text-stone-300">not</strong> delete or modify any photos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#22222E] hover:bg-[#2C2C3C] text-stone-300 text-xs font-semibold border border-[#353545] transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirm(preset);
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Preset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
