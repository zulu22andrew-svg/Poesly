import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlanBadge } from '../components/ui/PlanBadge';
import { CreditDisplay } from '../components/ui/CreditDisplay';
import { Button } from '../components/ui/UIElements';
import { 
  Camera, 
  FolderKanban, 
  SlidersHorizontal, 
  LayoutTemplate, 
  ArrowRight, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Clock, 
  ImageIcon 
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  const sessions = [
    { 
      id: 'SES-904', 
      title: 'Editorial Beach Fashion', 
      date: 'Today, 10:30 AM', 
      frames: 24, 
      status: 'Curated', 
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
      client: 'Vance Studio', 
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80' 
    },
    { 
      id: 'SES-903', 
      title: 'High-Key Studio Runway', 
      date: 'Yesterday, 4:20 PM', 
      frames: 18, 
      status: 'Processed', 
      badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
      client: 'FashionLab UK', 
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80' 
    },
    { 
      id: 'SES-902', 
      title: 'Classic Portraiture 85mm', 
      date: 'May 20, 2024', 
      frames: 32, 
      status: 'Ready', 
      badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
      client: 'Vogue Editorial', 
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80' 
    },
    { 
      id: 'SES-901', 
      title: 'Architectural Street Stride', 
      date: 'May 18, 2024', 
      frames: 16, 
      status: 'Archived', 
      badgeColor: 'bg-stone-800 text-stone-300 border-stone-700',
      client: 'Urban Fashion Co', 
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' 
    },
  ];

  const quickTools = [
    {
      title: 'Pose Viewfinder',
      description: 'Mount real-time camera viewfinder or ingest video takes to detect and score poses in live 80ms vision AI.',
      href: '/upload',
      icon: Camera,
      badge: 'Live Vision AI',
      buttonText: 'Open Viewfinder',
      gradient: 'from-purple-600/20 to-indigo-600/20',
      border: 'hover:border-purple-500/50',
    },
    {
      title: 'Studio Batch Pipeline',
      description: 'Upload full shoot takes and video files for automated highlight scoring, multi-preset styling, and zip export.',
      href: '/studio',
      icon: FolderKanban,
      badge: 'Batch Multi-Take',
      buttonText: 'Launch Batch Pipeline',
      gradient: 'from-blue-600/20 to-cyan-600/20',
      border: 'hover:border-cyan-500/50',
    },
    {
      title: 'Presets & Color Grading',
      description: 'Apply professional studio LUTs, editorial monochrome, natural sunlight grades, and lighting balance.',
      href: '/presets',
      icon: SlidersHorizontal,
      badge: '12 Studio Presets',
      buttonText: 'Browse Presets',
      gradient: 'from-fuchsia-600/20 to-pink-600/20',
      border: 'hover:border-fuchsia-500/50',
    },
    {
      title: 'Look Templates',
      description: 'One-click full studio templates combining color grades, background blur/removal, and aspect ratio crops.',
      href: '/templates',
      icon: LayoutTemplate,
      badge: 'One-Click Looks',
      buttonText: 'Explore Templates',
      gradient: 'from-amber-600/20 to-orange-600/20',
      border: 'hover:border-amber-500/50',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#161624] via-[#12121D] to-[#151522] border border-[#262635] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src="/posely-logo.png"
              alt="Posely Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain shadow-2xl shadow-purple-950/60 ring-1 ring-purple-500/30 shrink-0 bg-black/40"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60 uppercase tracking-wider">
                  Studio Workspace
                </span>
                <PlanBadge plan={user?.plan || 'creator_pro'} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
                Welcome back, {user?.name || 'Photographer'}.
              </h1>
              <p className="text-sm text-stone-400 max-w-xl">
                {user?.studioName || 'Posely AI Studio'} · Ready to direct and score subject poses with vision AI guidance.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-72">
            <CreditDisplay
              remaining={user?.creditsRemaining || 850}
              allotment={user?.monthlyAllotment || 1000}
            />
          </div>
        </div>
      </div>

      {/* 4 Studio Action Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Studio Workflows</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickTools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-[#12121A] border border-[#262635] ${tool.border} transition-all duration-300 flex flex-col justify-between space-y-5 hover:shadow-xl hover:shadow-purple-950/20 group`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-stone-400 border border-white/10">
                      {tool.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <Link to={tool.href}>
                  <Button variant="secondary" size="sm" className="w-full justify-between">
                    <span>{tool.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Recent Photoshoot Sessions</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Access your evaluated frame sequences, pose scores, and darkroom proof edits.
            </p>
          </div>
          <Link to="/upload">
            <Button variant="primary" size="sm" showArrow>
              New Shoot
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="rounded-2xl bg-[#12121A] border border-[#262635] overflow-hidden hover:border-[#38384E] transition-all group flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                <img
                  src={sess.image}
                  alt={sess.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${sess.badgeColor}`}>
                    {sess.status}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white">
                  {sess.frames} frames
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                    {sess.title}
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5">{sess.date}</p>
                </div>

                <div className="pt-2 border-t border-[#262635] flex items-center justify-between text-xs">
                  <span className="text-stone-400">{sess.client}</span>
                  <Link
                    to={`/results?ref=${sess.id}`}
                    className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 group-hover:underline"
                  >
                    <span>View Frames</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
