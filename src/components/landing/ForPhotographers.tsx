import { Link } from 'react-router-dom';
import { Camera, Sparkles, CheckCircle2, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/UIElements';

export default function ForPhotographers() {
  return (
    <section id="for-photographers" className="py-20 md:py-28 bg-[#0D0D14] text-white border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Built for Working Photographers</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
              End awkward shoot pauses forever.
            </h2>
            <p className="text-stone-400 text-sm md:text-base max-w-xl">
              Clients relax when direction is crisp and authoritative. Give models clear anatomical cues that flatter every body type and facial profile.
            </p>
          </div>

          <Link to="/upload">
            <Button variant="primary" showArrow>
              Try on Your Next Shoot
            </Button>
          </Link>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Visual on set image */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden bg-[#14141E] border border-[#262635] shadow-2xl relative group">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85"
                alt="Photographer directing client on set"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ON-SET TETHERED SESSION</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs text-purple-300 font-bold">
                  <span>MODEL DIRECTING COOLDOWN</span>
                  <span className="text-emerald-400 font-mono">0 SECONDS</span>
                </div>
                <p className="text-xs text-stone-300">
                  Instantly cycles through 40+ dynamic poses matching your client's outfit, height, and lighting style.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Key Benefits */}
          <div className="lg:col-span-5 space-y-5">
            {[
              {
                title: 'Confidence in Front of the Camera',
                desc: 'Give non-professional clients concrete, natural-feeling micro-adjustments instead of generic "look natural" commands.',
              },
              {
                title: 'Save Hours of Post-Shoot Culling',
                desc: 'Automated pose scoring eliminates unusable blinkers, awkward hand contortions, and soft focus shots instantly.',
              },
              {
                title: 'Curated Inspiration for Every Genre',
                desc: 'Seamlessly transition between editorial fashion, family portraits, corporate headshots, and wedding lookbooks.',
              },
            ].map((b, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#14141E] border border-[#262635] hover:border-purple-500/40 transition-colors space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-white">{b.title}</h4>
                </div>
                <p className="text-xs text-stone-400 pl-8 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
