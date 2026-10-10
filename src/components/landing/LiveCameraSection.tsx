import { useState } from 'react';
import { Camera, Sparkles, Grid, ZoomIn, RefreshCw, Zap, Sliders, CheckCircle2 } from 'lucide-react';

export default function LiveCameraSection() {
  const [zoom, setZoom] = useState<'0.5x' | '1x' | '2x' | '3x'>('1x');
  const [gridActive, setGridActive] = useState(true);
  const [shutterExposed, setShutterExposed] = useState(false);

  const triggerShutter = () => {
    setShutterExposed(true);
    setTimeout(() => setShutterExposed(false), 200);
  };

  return (
    <section className="py-20 md:py-28 bg-[#0B0B0F] text-white relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold">
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              <span>Real-Time Optical Viewfinder</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
              Direct subjects directly through the lens.
            </h2>
            <p className="text-stone-400 text-sm md:text-base max-w-xl">
              Tether your camera or use any mobile/tablet screen as an interactive pose director on set. Real-time overlays guide models into harmonic posture before you press shutter.
            </p>
          </div>

          <div className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800/50 px-3 py-1.5 rounded-full shrink-0">
            60 FPS SYNC · &lt;80MS LATENCY
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Viewfinder Frame (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-[#14141E] border border-[#262635] p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE VIEW STREAM
              </span>
              <span>1/250S · F/1.8 · ISO 400</span>
            </div>

            {/* Screen Area */}
            <div className="relative aspect-[4/3] rounded-2xl bg-black overflow-hidden border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85"
                alt="Live Camera Subject"
                className="w-full h-full object-cover"
              />

              {/* Shutter flash simulation */}
              {shutterExposed && (
                <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-150" />
              )}

              {/* Rule of Thirds Grid */}
              {gridActive && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-purple-500/20">
                  <div className="border-r border-b border-purple-500/20" />
                  <div className="border-r border-b border-purple-500/20" />
                  <div className="border-b border-purple-500/20" />
                  <div className="border-r border-b border-purple-500/20" />
                  <div className="border-r border-b border-purple-500/20" />
                  <div className="border-b border-purple-500/20" />
                  <div className="border-r border-purple-500/20" />
                  <div className="border-r border-purple-500/20" />
                  <div />
                </div>
              )}

              {/* Viewfinder Center Target */}
              <div className="absolute inset-0 m-auto w-36 h-36 border border-purple-400/50 rounded-full pointer-events-none flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              </div>

              {/* Overlay telemetry badges */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                PITCH: +1.2° · ROLL: 0.0°
              </div>

              <div className="absolute bottom-4 left-4 bg-purple-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-white border border-purple-500/40">
                <span className="text-purple-300 font-bold">DIRECTING:</span> "Drop right elbow 5cm"
              </div>
            </div>

            {/* Viewfinder Controls Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {(['0.5x', '1x', '2x', '3x'] as const).map((z) => (
                  <button
                    key={z}
                    onClick={() => setZoom(z)}
                    className={`px-3 py-1 text-xs font-bold font-mono rounded-lg border transition-all ${
                      zoom === z
                        ? 'border-purple-500 bg-purple-600/30 text-white'
                        : 'border-[#262635] text-stone-400 hover:text-white bg-black/20'
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGridActive(!gridActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    gridActive
                      ? 'border-purple-500 bg-purple-600/20 text-purple-300'
                      : 'border-white/10 text-stone-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>

                <button
                  onClick={triggerShutter}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
                >
                  Trigger Shutter
                </button>
              </div>
            </div>
          </div>

          {/* Right Specs & Features (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {[
              {
                title: 'Instant Model Visual Feedback',
                desc: 'Turn a secondary monitor or iPad into a client/model mirror with golden ratio positioning and visual guide marks.',
              },
              {
                title: 'Audio Directing Assistant',
                desc: 'Text-to-speech directing prompts announce gentle posture adjustments through studio speakers without interrupting your shooting flow.',
              },
              {
                title: 'Tethered Burst Capture',
                desc: 'Direct tethering integration triggers camera shutters automatically when subject matches predefined editorial poses.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#14141E] border border-[#262635] hover:border-purple-500/40 transition-colors space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-white">{f.title}</h4>
                </div>
                <p className="text-xs text-stone-400 pl-8 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
