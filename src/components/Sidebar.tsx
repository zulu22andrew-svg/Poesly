import { useState, useRef, useEffect, FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Video, 
  Wand2, 
  Sparkles, 
  Scissors, 
  Folder, 
  LayoutTemplate, 
  SlidersHorizontal, 
  FolderKanban, 
  ExternalLink, 
  LogOut, 
  User, 
  ChevronUp, 
  ChevronDown,
  LucideIcon,
  Zap,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PoselyLogo } from './ui/PoselyLogo';
import { PlanBadge } from './ui/PlanBadge';
import { CreditDisplay } from './ui/CreditDisplay';

interface NavItemProps {
  path: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  badge?: string;
}

const NavItem: FC<NavItemProps> = ({ path, label, icon: Icon, isActive, badge }) => {
  return (
    <Link
      to={path}
      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-purple-600/15 text-purple-300 shadow-sm border border-purple-500/30'
          : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-purple-400' : 'text-stone-400 group-hover:text-stone-200'}`} />
        <span>{label}</span>
      </div>
      {badge && (
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800/60">
          {badge}
        </span>
      )}
    </Link>
  );
};

export default function Sidebar() {
  const location = useLocation();
  const { user, isAuthenticated, isDemo, logout, openAuthModal, switchDemoAccount } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainLinks = [
    { path: '/dashboard', label: 'Studio Dashboard', icon: Home },
    { path: '/upload', label: 'Pose Viewfinder', icon: Video, badge: 'Live AI' },
    { path: '/results', label: 'Scored Frames', icon: Folder },
    { path: '/enhanced', label: 'Enhanced Studio', icon: Sparkles },
    { path: '/segmentation-test', label: 'Segmentation Mask', icon: Scissors },
    { path: '/upscale-test', label: 'AI Super Resolution', icon: Wand2 },
  ];

  const studioLinks = [
    { path: '/studio', label: 'Batch Processing', icon: FolderKanban, badge: 'Multi' },
    { path: '/presets', label: 'Studio Presets', icon: SlidersHorizontal },
    { path: '/templates', label: 'Look Templates', icon: LayoutTemplate },
  ];

  return (
    <aside className="w-[280px] h-screen bg-[#0E0E15] border-r border-[#1F1F2B] flex flex-col flex-shrink-0 relative z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1F1F2B] flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <PoselyLogo size="md" subtitle="Photography Studio" />
        </Link>
      </div>

      {/* User Status Card */}
      {user && (
        <div className="p-4 border-b border-[#1F1F2B] space-y-3 bg-[#13131C]/60">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-purple-500/30 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-white leading-tight truncate">
                {user.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <PlanBadge plan={user.plan} size="sm" />
                <span className="text-[11px] text-stone-400 truncate">
                  {user.studioName || 'Studio'}
                </span>
              </div>
            </div>
          </div>

          {/* Credits Meter */}
          <CreditDisplay
            remaining={user.creditsRemaining}
            allotment={user.monthlyAllotment || 1000}
            condensed
          />
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Studio Tools
          </div>
          <nav className="space-y-1">
            {mainLinks.map((link) => (
              <NavItem 
                key={link.path} 
                path={link.path} 
                label={link.label} 
                icon={link.icon} 
                isActive={location.pathname === link.path}
                badge={link.badge}
              />
            ))}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Workflows & Presets
          </div>
          <nav className="space-y-1">
            {studioLinks.map((link) => (
              <NavItem 
                key={link.path} 
                path={link.path} 
                label={link.label} 
                icon={link.icon} 
                isActive={location.pathname === link.path}
                badge={link.badge}
              />
            ))}
          </nav>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-colors group"
          >
            <span>Explore Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-purple-400 transition-colors" />
          </Link>
        </div>
      </div>

      {/* User Profile Footer & Demo Switcher */}
      <div className="p-3 border-t border-[#1F1F2B] mt-auto relative" ref={menuRef}>
        {profileMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#161622] border border-[#2B2B3C] p-3.5 rounded-2xl shadow-2xl z-50 space-y-3">
            <div className="border-b border-white/10 pb-2.5">
              <div className="text-xs font-bold text-white">{user?.name}</div>
              <div className="text-[11px] text-stone-400 truncate">{user?.email}</div>
            </div>

            {/* Quick Demo Role Switcher */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Switch Demo Account
              </div>

              {/* David Vance */}
              <button
                onClick={() => { switchDemoAccount('creator_pro'); setProfileMenuOpen(false); }}
                className={`w-full p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between border ${
                  user?.id === 'demo-david-vance'
                    ? 'border-purple-500/60 bg-purple-950/40 text-purple-200'
                    : 'border-white/5 hover:border-white/10 hover:bg-white/5 text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                    className="w-6 h-6 rounded-lg object-cover"
                    alt=""
                  />
                  <div className="truncate">
                    <div className="font-semibold text-white truncate">David Vance</div>
                    <div className="text-[10px] text-stone-400">Creator Pro</div>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-purple-300">850 CR</span>
              </button>

              {/* Elena Rostova */}
              <button
                onClick={() => { switchDemoAccount('studio_team'); setProfileMenuOpen(false); }}
                className={`w-full p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between border ${
                  user?.id === 'demo-elena-rostova'
                    ? 'border-purple-500/60 bg-purple-950/40 text-purple-200'
                    : 'border-white/5 hover:border-white/10 hover:bg-white/5 text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                    className="w-6 h-6 rounded-lg object-cover"
                    alt=""
                  />
                  <div className="truncate">
                    <div className="font-semibold text-white truncate">Elena Rostova</div>
                    <div className="text-[10px] text-stone-400">Studio Team</div>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-amber-300">3,420 CR</span>
              </button>

              {/* Alex Rivera */}
              <button
                onClick={() => { switchDemoAccount('starter'); setProfileMenuOpen(false); }}
                className={`w-full p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between border ${
                  user?.id === 'demo-alex-rivera'
                    ? 'border-purple-500/60 bg-purple-950/40 text-purple-200'
                    : 'border-white/5 hover:border-white/10 hover:bg-white/5 text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=80&q=80"
                    className="w-6 h-6 rounded-lg object-cover"
                    alt=""
                  />
                  <div className="truncate">
                    <div className="font-semibold text-white truncate">Alex Rivera</div>
                    <div className="text-[10px] text-stone-400">Starter</div>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-stone-400">50 CR</span>
              </button>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => { logout(); setProfileMenuOpen(false); }}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
              <button
                onClick={() => { openAuthModal('login'); setProfileMenuOpen(false); }}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                Switch Account
              </button>
            </div>
          </div>
        )}

        {/* Footer trigger button */}
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors border border-white/5 text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {user ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-purple-500/30 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center text-stone-400">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">
                {user ? user.name : 'Sign In'}
              </div>
              <div className="text-[10px] text-stone-400">
                {user ? `${user.creditsRemaining} credits` : 'Demo available'}
              </div>
            </div>
          </div>
          <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
        </button>
      </div>
    </aside>
  );
}
