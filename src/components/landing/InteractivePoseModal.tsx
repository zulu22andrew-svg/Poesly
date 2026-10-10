import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/UIElements';
import { PoselyLogo } from '../ui/PoselyLogo';
import { Camera, Sparkles, X, CheckCircle2, Sliders, RefreshCw } from 'lucide-react';

interface InteractivePoseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InteractivePoseModal({ isOpen, onClose }: InteractivePoseModalProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setCameraActive(true);
          }
        })
        .catch(() => {
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-[#12121A] border border-[#2B2B38] rounded-3xl shadow-2xl shadow-purple-950/40 max-w-3xl w-full overflow-hidden relative flex flex-col max-h-[90vh] text-white"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between select-none bg-[#161622]">
          <div className="flex items-center gap-3">
            <PoselyLogo size="sm" />
            <span className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2.5 py-0.5 rounded-full">
              LIVE OPTICAL VIEWFINDER
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body 2-col Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
          {/* Viewfinder Video (7 cols) */}
          <div className="md:col-span-7 rounded-2xl bg-black border border-white/10 relative aspect-[4/3] overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />

            {!cameraActive && (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white space-y-3 bg-gradient-to-b from-[#14141E] to-black">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-sm text-white">VIEWFINDER STANDBY</span>
                  <p className="text-xs text-stone-400 max-w-xs">
                    Camera stream inactive or awaiting permission. Running simulated studio directing calibration.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/40">
                  SIMULATION ACTIVE: 94% MATCH
                </div>
              </div>
            )}

            {/* Viewfinder Overlay Telemetry */}
            <div className="absolute inset-0 pointer-events-none p-3.5 flex flex-col justify-between">
              <div className="flex justify-between text-[11px] font-mono text-white">
                <span className="bg-black/70 backdrop-blur px-2 py-0.5 rounded border border-white/10">F/2.0 · 1/250S</span>
                <span className="bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/60">POSE MATCH: 94%</span>
              </div>

              {/* Optical Center Crosshair */}
              <div className="flex justify-center items-center">
                <div className="w-10 h-10 border border-purple-400/50 rounded-full flex items-center justify-center relative">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" />
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                </div>
              </div>

              <div className="text-[11px] font-mono text-center">
                <span className="bg-black/70 backdrop-blur text-purple-300 px-2.5 py-0.5 rounded border border-purple-500/30">
                  HARMONIC ALIGNMENT LOCKED
                </span>
              </div>
            </div>
          </div>

          {/* Directing Docket (5 cols) */}
          <div className="md:col-span-5 space-y-4 text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="space-y-1 border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Directorial Cues</span>
                </div>
                <h3 className="text-lg font-bold text-white font-display">
                  Editorial 3/4 Shoulder Turn
                </h3>
              </div>

              <div className="space-y-2 text-stone-300">
                <div className="p-3 rounded-xl bg-[#181826] border border-purple-500/30 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Chin Elevation</span>
                    <span className="text-stone-300">Tilt chin up 3mm toward key light for optimal catchlight.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#181826] border border-white/10 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Shoulder Drop</span>
                    <span className="text-stone-300">Lower camera-side shoulder 10mm for relaxed elegance.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#181826] border border-white/10 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Hand Placement</span>
                    <span className="text-stone-300">Rest fingers gently against waistline seam.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/upload" onClick={onClose}>
                <Button variant="primary" className="w-full justify-center" showArrow>
                  Open Full Studio Viewfinder
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
