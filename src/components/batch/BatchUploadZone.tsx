import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { 
  UploadCloud, 
  Video, 
  Image as ImageIcon, 
  AlertCircle, 
  FileCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { validateBatchFiles, ValidationResult } from '../../batch/batchOrchestrator';

interface BatchUploadZoneProps {
  onFilesSelected: (filesWithTypes: Array<{ file: File; type: 'video' | 'photo' }>) => void;
  disabled?: boolean;
}

export default function BatchUploadZone({ onFilesSelected, disabled = false }: BatchUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const allMediaInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFileList = (files: FileList | File[]) => {
    if (disabled) return;
    const result: ValidationResult = validateBatchFiles(files);
    
    setValidationErrors(result.errors);

    if (result.validFiles.length > 0) {
      onFilesSelected(result.validFiles);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(e.target.files);
      // Reset input value so same files can be re-selected if needed
      e.target.value = '';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Hidden inputs */}
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleInputChange}
        accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
        multiple
        className="hidden"
        id="batch-video-input"
      />
      <input
        type="file"
        ref={photoInputRef}
        onChange={handleInputChange}
        accept="image/jpeg,image/png,image/webp,image/jpg,.jpg,.jpeg,.png,.webp"
        multiple
        className="hidden"
        id="batch-photo-input"
      />
      <input
        type="file"
        ref={allMediaInputRef}
        onChange={handleInputChange}
        accept="video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp,image/jpg,.mp4,.mov,.webm,.jpg,.jpeg,.png,.webp"
        multiple
        className="hidden"
        id="batch-all-input"
      />

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && allMediaInputRef.current?.click()}
        className={`relative group rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
          isDragging
            ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10 scale-[1.005]'
            : disabled
            ? 'border-[#2B2B36] bg-[#15151C]/50 opacity-60 cursor-not-allowed'
            : 'border-[#2B2B36] hover:border-purple-500/60 bg-gradient-to-b from-[#181822] to-[#12121A] hover:bg-[#1A1A26]'
        }`}
      >
        <div className="flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
          {/* Animated Icon Circle */}
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:border-purple-500/60 transition-all duration-300">
              <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 group-hover:text-purple-300 transition-colors" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Heading and Description */}
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Start a New Studio Shoot
            </h3>
            <p className="text-sm text-[#8A8A98]">
              Drag and drop multiple videos or photos here, or browse files from your device.
            </p>
          </div>

          {/* Action Buttons */}
          <div 
            className="flex items-center gap-3 pt-2 flex-wrap justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => videoInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>Upload Videos</span>
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => photoInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-[#252532] hover:bg-[#2E2E3E] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold border border-[#3B3B4C] flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <span>Upload Photos</span>
            </button>
          </div>

          {/* Supported Formats Info */}
          <div className="pt-3 border-t border-[#252532] w-full flex items-center justify-center gap-4 sm:gap-6 text-[11px] sm:text-xs text-[#7A7A88]">
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-purple-400/80" />
              <span>MP4, MOV, WEBM (up to 200MB)</span>
            </span>
            <span className="text-[#3B3B4C]">•</span>
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400/80" />
              <span>JPG, PNG, WEBP</span>
            </span>
          </div>
        </div>
      </div>

      {/* Validation Error Notices */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs sm:text-sm space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Some files could not be added:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-rose-200/90 pl-1">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
