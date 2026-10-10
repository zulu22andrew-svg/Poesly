import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { X, RefreshCw, UploadCloud, Video, Image as ImageIcon, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FrameItem } from '../types';
import { Button } from '../components/ui/UIElements';

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [frames, setFrames] = useState<FrameItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (selectedFile: File) => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage('Invalid file format. Please upload MP4, MOV, WEBM, or high-res JPEG/PNG.');
      setUploadStatus('error');
      return false;
    }
    if (selectedFile.size > 200 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 200MB limit.');
      setUploadStatus('error');
      return false;
    }
    return true;
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setUploadStatus('idle');
        setErrorMessage('');
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setUploadStatus('idle');
        setErrorMessage('');
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadStatus('idle');
    setProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = () => {
    if (!file) return;

    setUploadStatus('uploading');
    setProgress(0);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentCompleted = Math.round((e.loaded * 100) / e.total);
        setProgress(percentCompleted);
        if (percentCompleted === 100) {
          setUploadStatus('processing');
        }
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          setUploadStatus('success');
          setFrames(response.frames || []);
          
          if (response.referenceId) {
            try {
              localStorage.setItem('posely_latest_session', response.referenceId);
            } catch {}
            setTimeout(() => {
              navigate(`/results?id=${response.referenceId}`);
            }, 1200);
          } else {
            setTimeout(() => {
              navigate('/results');
            }, 1200);
          }
        } catch {
          setErrorMessage('Failed to parse server response.');
          setUploadStatus('error');
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          setErrorMessage(errorResponse.error || 'Upload failed. Please try again.');
        } catch {
          setErrorMessage(`Server error: ${xhr.status} ${xhr.statusText}`);
        }
        setUploadStatus('error');
      }
    });

    xhr.addEventListener('error', () => {
      setErrorMessage('Network error during upload.');
      setUploadStatus('error');
    });

    xhr.open('POST', '/api/upload', true);
    xhr.send(formData);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="space-y-2 border-b border-[#252535] pb-6">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60 uppercase tracking-wider">
            Vision Ingestion
          </span>
        </div>
        <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">
          Upload Shoot Take or Photos
        </h1>
        <p className="text-sm text-stone-400 max-w-xl">
          Upload a 5–30 second moving pose video or photo sequence. Posely extracts key frames, scores anatomical symmetry, and organizes your best exposures.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="rounded-3xl bg-[#12121A] border border-[#262635] p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {uploadStatus === 'processing' ? (
          <div className="py-12 px-6 rounded-2xl bg-black/30 border border-purple-500/30 space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                Extracting & Scoring Pose Coordinates
              </h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Running 32-node skeletal tracking, evaluating head tilt, shoulder posture, catchlights, and sharpness variance...
              </p>
            </div>
          </div>
        ) : uploadStatus === 'success' ? (
          <div className="py-12 px-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                {frames.length > 0 ? `${frames.length} Frames Evaluated & Ranked!` : 'Shoot Take Ingested!'}
              </h3>
              <p className="text-xs text-stone-400">
                Directing you to the scored contact gallery...
              </p>
            </div>
          </div>
        ) : !file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-purple-500 bg-purple-600/10'
                : 'border-[#2B2B3C] hover:border-purple-500/50 bg-[#161622]/60 hover:bg-[#1A1A28]/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/mp4,video/quicktime,video/webm,image/jpeg,image/png"
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-600/20">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-base font-bold text-white block">
                  Drop video take or photo roll here
                </span>
                <p className="text-xs text-stone-400">
                  Supports MP4, MOV, WEBM, JPEG, PNG (up to 200MB)
                </p>
              </div>
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-colors">
                  Browse Files
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#161624] border border-[#2B2B3C] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                  {file.type.startsWith('video/') ? <Video className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-stone-400 font-mono mt-0.5">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <button
                onClick={handleRemoveFile}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadStatus === 'uploading' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-stone-400 font-medium">
                  <span>Uploading Media...</span>
                  <span className="font-mono text-purple-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-[#1F1F2C] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={handleRemoveFile}
                disabled={uploadStatus === 'uploading'}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={uploadStatus === 'uploading'}
                showArrow
              >
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Process & Score Poses'}
              </Button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
