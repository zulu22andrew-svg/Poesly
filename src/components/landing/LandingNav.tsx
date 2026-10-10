import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown, 
  SlidersHorizontal,
  LayoutDashboard,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth, DEMO_PROFILES } from '../../context/AuthContext';
import { PoselyLogo } from '../ui/PoselyLogo';
import { PlanBadge } from '../ui/PlanBadge';

interface LandingNavProps {
  onOpenDemo?: () => void;
}

export default function LandingNav({ onOpenDemo }: LandingNavProps) {
  const { user, isAuthenticated, logout, openAuthModal, switchDemoAccount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Live Demo', href: '#demo' },
    { label: 'Workflow', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0B0F]/85 backdrop-blur-xl border-b border-white/10 select-none">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center group">
            <PoselyLogo size="md" subtitle="AI Pose Studio" />
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-stone-300 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Auth & CTA */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#181824] hover:bg-[#202030] border border-[#2B2B38] text-left transition-colors"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-purple-500/40"
                  />
                  <span className="text-xs font-semibold text-white truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#14141E] border border-[#262635] rounded-2xl shadow-2xl p-3 space-y-2 z-50">
                    <div className="p-2 border-b border-white/10">
                      <div className="text-xs font-bold text-white">{user.name}</div>
                      <div className="text-[11px] text-stone-400 truncate">{user.email}</div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <PlanBadge plan={user.plan} size="sm" />
                        <span className="font-mono text-xs text-purple-300 font-bold">
                          {user.creditsRemaining} CR
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Studio Dashboard</span>
                    </Link>

                    <button
                      onClick={() => { logout(); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 flex items-center gap-1.5 transition-all"
              >
                <span>Open Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-xs font-semibold text-stone-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Studio Free</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0E0E15] px-6 py-4 space-y-4">
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-stone-300 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
              className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-white/5 text-stone-200"
            >
              Sign In
            </button>
            <button
              onClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }}
              className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
