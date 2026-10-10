import { Star, Quote, Sparkles } from 'lucide-react';

export default function SocialProof() {
  const testimonials = [
    {
      quote: "Clients never ask what to do with their hands anymore. Directing on set has become calm, authoritative, and incredibly fast.",
      author: "Elena Rostova",
      role: "Studio Director · FashionLab London",
      location: "London, UK",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      sessionCount: "128 Shoots",
    },
    {
      quote: "The automatic pose scoring and highlight ranking cut our post-shoot proofing and culling time by 75%.",
      author: "David Vance",
      role: "Editorial Portraitist · Vance Visuals",
      location: "New York, USA",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      sessionCount: "48 Shoots",
    },
    {
      quote: "Posely gives non-professional models instant visual reassurance. It turned our awkward wedding sessions into effortless shoots.",
      author: "Alex Rivera",
      role: "Commercial & Wedding Photographer",
      location: "San Francisco, USA",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      sessionCount: "62 Shoots",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#0D0D14] text-white border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Photographer Testimonials</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            Loved by leading studio directors.
          </h2>
          <p className="text-stone-400 text-sm md:text-base">
            See how professional portraitists and commercial fashion crews elevate their shoots with Posely.
          </p>
        </div>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-[#14141E] border border-[#262635] p-8 space-y-6 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-950/20 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-base text-stone-200 leading-relaxed font-medium">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/30"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{t.author}</h4>
                  <p className="text-xs text-stone-400">{t.role}</p>
                  <p className="text-[11px] text-purple-400 mt-0.5">{t.sessionCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
