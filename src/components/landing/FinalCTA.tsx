import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/UIElements';
import { Camera, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface FinalCTAProps {
  onOpenDemo?: () => void;
}

export default function FinalCTA({ onOpenDemo }: FinalCTAProps) {
  const { openAuthModal } = useAuth();

  return (
    <section className="py-20 md:py-28 bg-[#0B0B0F] text-white border-t border-white/5 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#161528] via-[#12121E] to-[#0E0E18] border border-purple-500/30 p-8 sm:p-14 lg:p-16 shadow-2xl space-y-8">
          
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Ready for Your Next Photoshoot?</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
                Direct with absolute confidence on every shoot.
              </h2>
              <p className="text-stone-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                No awkward hesitations. No repetitive posing. Give your models crystal-clear, harmonic direction powered by vision AI.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3.5">
              <Link to="/upload" className="w-full">
                <Button variant="primary" className="w-full justify-center" size="lg" showArrow>
                  Launch Live Studio
                </Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => openAuthModal('login')}
                className="w-full justify-center"
                size="lg"
              >
                Try Demo Photographer
              </Button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Browser-based & iPad tether compatible</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Instant evaluation with pre-loaded credits</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-400" />
              <span>Works with webcam, video clips, or mirrorless HDMI</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
