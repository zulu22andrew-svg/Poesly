import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/UIElements';
import { Camera, Sparkles, Star, Zap, CheckCircle2, ArrowRight, Play } from 'lucide-react';

interface HeroSectionProps {
  onOpenDemo?: () => void;
  onExploreClick?: () => void;
}

export default function HeroSection({ onOpenDemo }: HeroSectionProps) {
  const { openAuthModal } = useAuth();

  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 bg-[#0B0B0F] text-white">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column (Headline, Value Prop, CTAs) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold shadow-sm">
              <img
                src="/posely-mark.png"
                alt="Posely"
                className="w-4 h-4 object-contain rounded-sm"
                referrerPolicy="no-referrer"
              />
              <span>Real-Time Vision AI for Photoshoots</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="font-display text-4xl sm:text-6xl lg:text-[64px] font-black tracking-tight leading-[1.08] text-white">
                Pose better. <br />
                Direct faster. <br />
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                  Shoot flawless frames.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-stone-300 max-w-xl leading-relaxed">
                Posely combines real-time vision AI, 32-point skeletal tracking, and expert editorial posing guidance to direct subjects and extract the highest-scoring moments from every shoot take.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link to="/upload">
                <Button variant="primary" size="lg" className="w-full sm:w-auto" showArrow>
                  Launch Pose Viewfinder
                </Button>
              </Link>

              {onOpenDemo && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onOpenDemo}
                  icon={<Play className="w-4 h-4 text-purple-400 fill-purple-400" />}
                  className="w-full sm:w-auto"
                >
                  Try Interactive Demo
                </Button>
              )}
            </div>

            {/* Photographer Proof Metrics */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="font-display text-2xl font-black text-white">&lt;80ms</div>
                <div className="text-xs text-stone-400 mt-0.5">Real-time latency</div>
              </div>
              <div>
                <div className="font-display text-2xl font-black text-white">32 Pts</div>
                <div className="text-xs text-stone-400 mt-0.5">Skeletal alignment</div>
              </div>
              <div>
                <div className="font-display text-2xl font-black text-white">96.4%</div>
                <div className="text-xs text-stone-400 mt-0.5">Top-pick accuracy</div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Studio Viewfinder Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden bg-[#14141E] border border-white/10 shadow-2xl shadow-purple-950/40 group">
              
              {/* Photo Subject */}
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85"
                  alt="Editorial Pose Guidance"
                  className="w-full h-full object-cover object-top filter contrast-[1.02]"
                />

                {/* Viewfinder Overlays & Crosshairs */}
                <div className="absolute inset-0 pointer-events-none p-5 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/60">
                  
                  {/* Top HUD */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>TRACKING ACTIVE</span>
                    </div>

                    <div className="px-2.5 py-1 rounded-full bg-purple-600/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      <span>96 / 100</span>
                    </div>
                  </div>

                  {/* Center Focus Box */}
                  <div className="absolute inset-0 m-auto w-48 h-48 border-2 border-purple-400/60 rounded-2xl flex items-center justify-center pointer-events-none">
                    <div className="w-3 h-3 border-t-2 border-l-2 border-purple-300 absolute -top-1 -left-1" />
                    <div className="w-3 h-3 border-t-2 border-r-2 border-purple-300 absolute -top-1 -right-1" />
                    <div className="w-3 h-3 border-b-2 border-l-2 border-purple-300 absolute -bottom-1 -left-1" />
                    <div className="w-3 h-3 border-b-2 border-r-2 border-purple-300 absolute -bottom-1 -right-1" />
                    
                    {/* Golden Ratio Center Line */}
                    <span className="text-[10px] font-mono font-bold text-purple-200 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-500/40">
                      EYE LINE 0.0°
                    </span>
                  </div>

                  {/* Bottom AI Cue Banner */}
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-purple-300 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />
                          REAL-TIME DIRECTING CUE
                        </span>
                        <span className="text-emerald-400 font-mono font-bold">OPTIMAL</span>
                      </div>
                      <p className="text-xs text-white font-medium">
                        "Tilt chin +2° toward the key light to accentuate cheekbone catchlight."
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 px-1">
                      <span>35MM PRIME · F/1.8</span>
                      <span>32 SKELETAL NODES</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
