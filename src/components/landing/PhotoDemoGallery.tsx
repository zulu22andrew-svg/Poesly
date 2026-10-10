import { useState } from 'react';
import { Star, Camera, Sparkles, SlidersHorizontal, ArrowRight, CheckCircle2 } from 'lucide-react';

interface GalleryFrame {
  id: string;
  frameNo: string;
  category: string;
  title: string;
  matchScore: number;
  image: string;
  lighting: string;
  lens: string;
  directive: string;
}

const FRAMES: GalleryFrame[] = [
  {
    id: 'f-01',
    frameNo: 'SHOT 01',
    category: 'Editorial Portrait',
    title: 'Poised Asymmetric Shoulder',
    matchScore: 96,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
    lighting: 'Single Octa 45° Diffused',
    lens: '85mm f/1.8',
    directive: 'Drop camera-side shoulder 12mm. Align chin with collarbone notch.',
  },
  {
    id: 'f-02',
    frameNo: 'SHOT 02',
    category: 'Couple & Duo',
    title: 'Dynamic Contrapposto Stride',
    matchScore: 94,
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=85',
    lighting: 'Late Daylight Rim',
    lens: '50mm f/1.4',
    directive: 'Step into lead foot; keep gaze 10° off-axis for candid feel.',
  },
  {
    id: 'f-03',
    frameNo: 'SHOT 03',
    category: 'Headshot & Studio',
    title: 'Formal Seated Profile',
    matchScore: 97,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=85',
    lighting: 'North Sky Diffused Window',
    lens: '70mm f/2.8',
    directive: 'Rest hands weightlessly. Angle torso 30° toward fill board.',
  },
  {
    id: 'f-04',
    frameNo: 'SHOT 04',
    category: 'Haute Couture',
    title: 'High-Fashion Silhouette',
    matchScore: 91,
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=85',
    lighting: 'High-Key Silver Parabolic',
    lens: '105mm f/2.5',
    directive: 'Elevate coat lapel. Create sharp jawline silhouette against sweep.',
  },
  {
    id: 'f-05',
    frameNo: 'SHOT 05',
    category: 'Street Fashion',
    title: 'Fluid Motion Turn',
    matchScore: 93,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=85',
    lighting: 'Golden Hour Edge Backlight',
    lens: '50mm f/1.2',
    directive: 'Spin into frame on balls of feet; hold smile as head reaches lens.',
  },
  {
    id: 'f-06',
    frameNo: 'SHOT 06',
    category: 'Artistic Noir',
    title: 'Low-Key Monochromatic Contour',
    matchScore: 95,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=85',
    lighting: 'Narrow Grid Snoot Strip',
    lens: '85mm f/1.4',
    directive: 'Tilt forehead toward key kicker; allow shadows to pool on jaw.',
  },
];

export default function PhotoDemoGallery() {
  const [selectedFrame, setSelectedFrame] = useState<GalleryFrame>(FRAMES[0]);

  return (
    <section id="features" className="py-20 md:py-28 bg-[#0B0B0F] text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold">
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              <span>Pose Reference Library</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
              Curated master poses for every genre.
            </h2>
            <p className="text-stone-400 text-sm md:text-base max-w-xl">
              Trained on thousands of award-winning fashion editorial, portraiture, and commercial shoots with verified lighting setups and lens formulas.
            </p>
          </div>
        </div>

        {/* Gallery Grid + Detail Inspection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Grid (8 cols) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {FRAMES.map((f) => {
                const isSelected = selectedFrame?.id === f.id;

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFrame(f)}
                    className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 bg-[#14141E] border ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/40 shadow-xl shadow-purple-950/30 scale-[1.02]'
                        : 'border-[#262635] hover:border-[#3A3A4E]'
                    }`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
                      <img
                        src={f.image}
                        alt={f.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300 flex items-center gap-1 border border-white/10">
                        <Star className="w-3 h-3 fill-amber-300" />
                        <span>{f.matchScore}%</span>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-white border border-white/10">
                        {f.frameNo}
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="text-[10px] uppercase font-bold text-purple-400">
                        {f.category}
                      </div>
                      <h4 className="text-xs font-bold text-white truncate mt-0.5">
                        {f.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Inspection Card (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl bg-[#14141E] border border-[#262635] p-6 space-y-6 shadow-2xl">
            <div className="border-b border-[#252535] pb-4">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Pose Specs & Technical Breakdown
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {selectedFrame.title}
              </h3>
              <div className="text-xs text-stone-400 mt-0.5">
                {selectedFrame.category} · Score {selectedFrame.matchScore}/100
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-video bg-black/60 relative">
              <img
                src={selectedFrame.image}
                alt={selectedFrame.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase text-stone-400">Lighting Recipe</span>
                <p className="font-semibold text-white">{selectedFrame.lighting}</p>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase text-stone-400">Optics Formula</span>
                <p className="font-semibold text-white font-mono">{selectedFrame.lens}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Directing Directive
                </span>
                <p className="text-white font-medium leading-relaxed">
                  "{selectedFrame.directive}"
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
