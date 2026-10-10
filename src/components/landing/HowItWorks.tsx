import { UploadCloud, Sparkles, Wand2, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      stepNo: '01',
      icon: UploadCloud,
      title: 'Upload Takes or Open Camera',
      description: 'Ingest moving video takes, drag-and-drop photos, or mount your webcam/mirrorless viewfinder directly into Posely.',
      badge: 'Step 1: Ingest',
      gradient: 'from-purple-600 to-indigo-600'
    },
    {
      stepNo: '02',
      icon: Sparkles,
      title: 'Live Vision AI Scoring',
      description: 'Posely evaluates 32 skeletal joints, shoulder slope, facial angle, and catchlights in under 80ms, delivering instant directing feedback.',
      badge: 'Step 2: Score',
      gradient: 'from-indigo-600 to-blue-600'
    },
    {
      stepNo: '03',
      icon: Wand2,
      title: 'Studio Presets & 4K Export',
      description: 'Grade your top-rated exposures with curated editorial LUTs, isolate backgrounds with clean AI segmentation, and export publication-ready files.',
      badge: 'Step 3: Deliver',
      gradient: 'from-blue-600 to-cyan-600'
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#0D0D14] text-white border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Seamless Workflow</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            From raw take to publication-ready in seconds.
          </h2>
          <p className="text-stone-400 text-sm md:text-base">
            No complex setup required. Built for rapid tethered photoshoots and studio post-processing.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-[#14141E] border border-[#262635] p-8 space-y-6 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-950/20 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${step.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-display font-black text-3xl text-stone-700 group-hover:text-purple-400/40 transition-colors">
                      {step.stepNo}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-purple-400 block mb-1">
                      {step.badge}
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-stone-400 mt-2 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                  <span>Learn workflow</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
