import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { PoselyLogo } from '../components/ui/PoselyLogo';
import { Button, Input } from '../components/ui/UIElements';
import { PlanBadge } from '../components/ui/PlanBadge';
import { UserPlan } from '../types';
import { Camera, Sparkles, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function AuthPage({ initialMode = 'login' }: { initialMode?: 'login' | 'signup' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignupInit = initialMode === 'signup' || location.pathname.includes('signup') || location.pathname.includes('register');
  
  const [isSignup, setIsSignup] = useState(isSignupInit);
  const { login, signup, loginWithDemo } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [studio, setStudio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>('creator_pro');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignup) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      setLoading(true);
      try {
        const res = await signup({ 
          name, 
          email, 
          password, 
          studioName: studio || `${name} Photography`, 
          plan: selectedPlan 
        });
        if (res.success) {
          navigate('/dashboard');
        } else {
          setError(res.error || 'Failed to create studio account.');
        }
      } catch {
        setError('An error occurred during account creation.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      setLoading(true);
      try {
        const res = await login(email, password);
        if (res.success) {
          navigate('/dashboard');
        } else {
          setError(res.error || 'Invalid email or password.');
        }
      } catch {
        setError('An error occurred during sign in.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDemoLogin = (profileKey: string) => {
    loginWithDemo(profileKey);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/">
          <PoselyLogo size="md" />
        </Link>
        <Link
          to="/"
          className="text-xs font-semibold text-stone-400 hover:text-white transition-colors"
        >
          ← Back to Overview
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full max-w-5xl items-center">
          
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-6 space-y-8 hidden lg:block pr-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src="/posely-logo.png"
                  alt="Posely Logo"
                  className="w-16 h-16 rounded-2xl object-contain bg-black/40 ring-1 ring-purple-500/30 shadow-2xl shadow-purple-950/60"
                  referrerPolicy="no-referrer"
                />
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Next-Gen Vision AI for Photographers</span>
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
                Direct flawless poses with precision AI guidance.
              </h1>
              <p className="text-base text-stone-400 leading-relaxed">
                Connect your camera viewfinder or upload shoot takes. Posely segments frames, scores anatomical symmetry, and generates real-time cues so every exposure is publication-ready.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3.5">
              {[
                { title: 'Real-time Angle & Posture Feedback', desc: 'Skeletal detection in under 80ms with 32 joint tracking coordinates.' },
                { title: 'Curated Studio Presets & LUTs', desc: 'Editorial, high-contrast, natural sunlight, and magazine color grades.' },
                { title: 'Batch Shoot Processing', desc: 'Process 50+ video takes and photos with automated highlight extraction.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#14141E] border border-[#262635]">
                  <div className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-6">
            <div className="bg-[#12121A] border border-[#2B2B38] p-8 rounded-3xl shadow-2xl space-y-6">
              
              {/* Card Header & Tabs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold font-display text-white">
                      {isSignup ? 'Create Studio Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-xs text-stone-400 mt-1">
                      {isSignup ? 'Start directing shoots with AI assistance' : 'Sign in to access your studio sessions'}
                    </p>
                  </div>
                </div>

                <div className="flex rounded-xl bg-black/40 p-1 border border-white/5">
                  <button
                    type="button"
                    onClick={() => { setIsSignup(false); setError(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      !isSignup
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsSignup(true); setError(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      isSignup
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <>
                    <Input
                      label="Full Name"
                      placeholder="e.g. David Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      label="Studio Name (Optional)"
                      placeholder="e.g. Vance Visuals"
                      value={studio}
                      onChange={(e) => setStudio(e.target.value)}
                    />
                  </>
                )}

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="photographer@studio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {isSignup && (
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-semibold text-stone-300">
                      Choose Plan
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['starter', 'creator_pro', 'studio_team'] as UserPlan[]).map((p) => {
                        const isSel = selectedPlan === p;
                        const planMeta = {
                          starter: { name: 'Starter', cr: '50 Cr' },
                          creator_pro: { name: 'Creator Pro', cr: '850 Cr' },
                          studio_team: { name: 'Studio Team', cr: '3,420 Cr' }
                        }[p];

                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setSelectedPlan(p)}
                            className={`p-2.5 rounded-xl text-left border transition-all ${
                              isSel
                                ? 'bg-purple-950/70 border-purple-500 ring-1 ring-purple-500/50'
                                : 'bg-[#181824] border-[#2A2A3A] hover:border-stone-600'
                            }`}
                          >
                            <div className="text-xs font-bold text-white truncate">{planMeta.name}</div>
                            <div className="text-[10px] text-purple-300 font-mono mt-0.5">{planMeta.cr}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
                  {loading ? 'Processing...' : isSignup ? 'Create Studio Account' : 'Sign In to Dashboard'}
                </Button>
              </form>

              {/* 1-Click Demo Accounts */}
              <div className="pt-4 border-t border-[#252535] space-y-3">
                <div className="text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Instant Access With Demo Profiles
                  </span>
                </div>

                <div className="space-y-2">
                  {Object.entries(DEMO_PROFILES).map(([key, profile]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleDemoLogin(key)}
                      className="w-full p-2.5 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#2B2B38] hover:border-purple-500/40 text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={profile.avatarUrl}
                          alt={profile.name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10 group-hover:ring-purple-500/40"
                        />
                        <div className="truncate">
                          <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                            {profile.name}
                          </div>
                          <div className="text-[11px] text-stone-400">{profile.studioName || profile.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <PlanBadge plan={profile.plan} size="sm" />
                        <span className="font-mono text-xs text-stone-300 font-semibold">
                          {profile.creditsRemaining} CR
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-stone-500 border-t border-[#1C1C28]">
        © {new Date().getFullYear()} Posely AI Inc. Professional photography pose intelligence.
      </footer>
    </div>
  );
}
