import { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Eye, Zap, Crosshair } from 'lucide-react';

interface AnalysisPin {
  id: string;
  label: string;
  status: 'VERIFIED' | 'ADJUST';
  title: string;
  description: string;
  directive: string;
  top: string;
  left: string;
}

const ANALYSIS_PINS: AnalysisPin[] = [
  {
    id: 'head',
    label: 'Head & Catchlight Alignment',
    status: 'VERIFIED',
    top: '18%',
    left: '50%',
    title: 'Cervical Spine & Eye Catchlight Line',
    description: 'Subject head is rotated 12° toward the key light, casting precise catchlights across both pupils.',
    directive: 'Optimal pose. Maintain chin position 10mm above horizontal plane.',
  },
  {
    id: 'shoulders',
    label: 'Clavicle & Shoulder Plane',
    status: 'ADJUST',
    top: '32%',
    left: '35%',
    title: 'Clavicle Plane Discrepancy',
    description: 'Shoulders are parallel to lens plane, flattening depth across the torso silhouette.',
    directive: 'Drop camera-side shoulder 8mm and rotate upper torso 20° off-axis.',
  },
  {
    id: 'hands',
    label: 'Hand Tension & Finger Curl',
    status: 'ADJUST',
    top: '56%',
    left: '30%',
    title: 'Hand Repose & Fabric Tension',
    description: 'Fingers are locked stiffly into garment pocket, creating unnatural tension along the wrist line.',
    directive: 'Rest thumb along waistband seam with fingers relaxed over exterior fabric.',
  },
  {
    id: 'stance',
    label: 'Weight Distribution & Hip Tilt',
    status: 'VERIFIED',
    top: '78%',
    left: '48%',
    title: 'Harmonic Contrapposto Weight Shift',
    description: '70% of body weight rests on back leg, yielding natural S-curve through spine and hips.',
    directive: 'Maintain posture. Balanced center of mass creates elongating silhouette.',
  },
];

export default function AIPoseIntelligence() {
  const [activePinId, setActivePinId] = useState<string>('shoulders');
  const activePin = ANALYSIS_PINS.find((p) => p.id === activePinId) || ANALYSIS_PINS[1];

  return (
    <section className="py-20 md:py-28 bg-[#0B0B0F] text-white border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold">
              <Crosshair className="w-3.5 h-3.5 text-purple-400" />
              <span>Deep Vision Telemetry</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
              Interactive 32-node skeletal inspection.
            </h2>
            <p className="text-stone-400 text-sm md:text-base max-w-xl">
              Click any anatomical tracker pin on the model to view millimeter-level postural diagnostics and directing feedback.
            </p>
          </div>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Model with Interactive Pins (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-[#14141E] border border-[#262635] p-5 sm:p-6 relative shadow-2xl">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85"
                alt="Model with interactive AI tracking pins"
                className="w-full h-full object-cover"
              />

              {/* Interactive Pulsing Pins */}
              {ANALYSIS_PINS.map((pin) => {
                const isActive = activePin.id === pin.id;
                return (
                  <button
                    key={pin.id}
                    onClick={() => setActivePinId(pin.id)}
                    style={{ top: pin.top, left: pin.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
                    title={pin.label}
                  >
                    <div className="relative flex items-center justify-center">
                      <span
                        className={`absolute w-8 h-8 rounded-full animate-ping opacity-60 ${
                          pin.status === 'VERIFIED' ? 'bg-emerald-400' : 'bg-purple-400'
                        }`}
                      />
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg transition-transform ${
                          isActive
                            ? 'scale-125 ring-4 ring-white/40 bg-purple-600'
                            : pin.status === 'VERIFIED'
                            ? 'bg-emerald-600 hover:scale-110'
                            : 'bg-purple-600 hover:scale-110'
                        }`}
                      >
                        {pin.status === 'VERIFIED' ? '✓' : '!'}
                      </div>
                    </div>
                  </button>
                );
              })}

              <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-white border border-white/10">
                CLICK NODES TO INSPECT
              </div>
            </div>
          </div>

          {/* Right: Active Node Detail Card (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-[#14141E] border border-[#262635] p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#252535] pb-4">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Active Node Inspection
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  activePin.status === 'VERIFIED'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                }`}
              >
                {activePin.status === 'VERIFIED' ? 'Anatomically Optimal' : 'Adjustment Needed'}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white">
                {activePin.title}
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                {activePin.description}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/60 space-y-1.5">
              <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Directorial Cue
              </div>
              <p className="text-sm text-white font-medium">
                "{activePin.directive}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                <div className="text-[10px] text-stone-400 uppercase font-bold">Latency</div>
                <div className="text-lg font-mono font-bold text-white">&lt;65ms</div>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                <div className="text-[10px] text-stone-400 uppercase font-bold">Confidence</div>
                <div className="text-lg font-mono font-bold text-emerald-400">99.2%</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
