import { useAuth } from '../../context/AuthContext';
import { PlanBadge } from '../ui/PlanBadge';
import { Button } from '../ui/UIElements';
import { UserPlan } from '../../types';
import { Sparkles, CheckCircle2, Zap } from 'lucide-react';

export default function PricingSection() {
  const { openAuthModal } = useAuth();

  const tiers: Array<{
    id: UserPlan;
    name: string;
    monthlyPrice: string;
    credits: string;
    description: string;
    features: string[];
    cta: string;
    isPro: boolean;
  }> = [
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: '$19',
      credits: '50',
      description: 'Single-camera photographers and emerging portrait creators.',
      features: [
        '50 AI pose analyses per month',
        'Standard portrait & headshot reference catalog',
        'Live optical viewfinder overlay (webcam/tethered)',
        '32-joint skeletal tracking & angle detection',
        'Export to 1:1, 4:5, and 16:9 contact frames',
      ],
      cta: 'Start with Starter',
      isPro: false,
    },
    {
      id: 'creator_pro',
      name: 'Creator Pro',
      monthlyPrice: '$49',
      credits: '850',
      description: 'Independent portraitists, fashion photographers, and busy studios.',
      features: [
        '850 studio credits per monthly billing cycle',
        'Complete 1,500+ curated master pose catalog',
        'Millimeter facial yaw, pitch & catchlight guidance',
        '2× AI face restoration & detail enhancement',
        'Editorial studio LUT grading presets',
        'Batch photoshoot contact sheet analysis',
      ],
      cta: 'Get Creator Pro',
      isPro: true,
    },
    {
      id: 'studio_team',
      name: 'Studio Team',
      monthlyPrice: '$149',
      credits: '3,420',
      description: 'High-volume commercial agencies, runway crews, and multi-shooter teams.',
      features: [
        '3,420 studio credits per monthly billing cycle',
        'Multi-device tethering & client display station sync',
        'Automated bulk contact sheet pose ranking',
        'Subject background isolation & alpha matte export',
        'Custom studio branding & watermark stamping',
        'Priority cloud processing & dedicated studio storage',
      ],
      cta: 'Get Studio Team',
      isPro: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 bg-[#0D0D14] text-white border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            Invest in faster shoots and better client photos.
          </h2>
          <p className="text-stone-400 text-sm md:text-base">
            All plans include live viewfinder tracking and pose recommendations. Refills automatically every 30 days with no overages.
          </p>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((t) => (
            <div
              key={t.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                t.isPro
                  ? 'bg-gradient-to-b from-[#1A182E] to-[#12121E] border-2 border-purple-500/70 shadow-2xl shadow-purple-950/50 scale-105 z-10'
                  : 'bg-[#14141E] border border-[#262635] hover:border-purple-500/40'
              }`}
            >
              {t.isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Most Popular
                </div>
              )}

              {/* Card Header */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold font-display text-white">
                    {t.name}
                  </h3>
                  <PlanBadge plan={t.id} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl md:text-5xl font-extrabold font-display text-white">
                      {t.monthlyPrice}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">/ month</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-semibold text-purple-300">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span>{t.credits} credits / month</span>
                  </div>

                  <p className="text-xs text-stone-400 leading-relaxed pt-2">
                    {t.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-6 border-t border-white/10">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Included Capabilities
                  </div>
                  <div className="space-y-2.5">
                    {t.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-stone-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 mt-6 border-t border-white/10">
                <Button
                  variant={t.isPro ? 'primary' : 'secondary'}
                  className="w-full"
                  showArrow={t.isPro}
                  onClick={() => openAuthModal('signup', t.id)}
                >
                  {t.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Fast-Track Row */}
        <div className="rounded-3xl bg-[#14141E] border border-[#262635] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Evaluation Access Available
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white font-display">
              Test any tier immediately with 1-click pre-loaded demo accounts.
            </h4>
            <p className="text-xs text-stone-400">
              Try David Vance (Creator Pro, 850 credits), Elena Rostova (Studio Team, 3,420 credits), or Alex Rivera (Starter, 50 credits).
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => openAuthModal('login')}
            className="shrink-0"
          >
            Launch Demo Photographer
          </Button>
        </div>

      </div>
    </section>
  );
}
