import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_PROFILES } from '../../context/AuthContext';
import { Button, Input } from '../ui/UIElements';
import { PlanBadge } from '../ui/PlanBadge';
import { PoselyLogo } from '../ui/PoselyLogo';
import { UserPlan } from '../../types';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    targetPlanForSignup,
    login, 
    signup, 
    loginWithDemo 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form State
  const [signupName, setSignupName] = useState('');
  const [signupStudio, setSignupStudio] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>('creator_pro');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalTab === 'signup' ? 'signup' : 'login');
      if (targetPlanForSignup) {
        setSelectedPlan(targetPlanForSignup);
      }
      setError(null);
    }
  }, [isAuthModalOpen, authModalTab, targetPlanForSignup]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setError('Please provide your email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setError(res.error || 'Failed to authenticate user.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim()) {
      setError('Please enter your full name and email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await signup({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        plan: selectedPlan,
        studioName: signupStudio || undefined
      });
      if (!res.success) {
        setError(res.error || 'Failed to create studio account.');
      }
    } catch {
      setError('An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-[480px] bg-[#12121A] border border-[#2B2B38] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#252535] flex items-center justify-between">
          <PoselyLogo size="sm" subtitle="AI Studio Account" />
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-black/40 p-1 border border-white/5">
            <button
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Forms */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="photographer@studio.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In to Studio'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. David Vance"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
              />
              <Input
                label="Studio Name (Optional)"
                placeholder="e.g. Vance Visuals"
                value={signupStudio}
                onChange={(e) => setSignupStudio(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="photographer@studio.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />

              {/* Plan Selection */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-stone-300">
                  Select Membership Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['starter', 'creator_pro', 'studio_team'] as UserPlan[]).map((p) => {
                    const isSel = selectedPlan === p;
                    const labels = {
                      starter: { title: 'Starter', credits: '50 Cr' },
                      creator_pro: { title: 'Creator Pro', credits: '850 Cr' },
                      studio_team: { title: 'Studio Team', credits: '3,420 Cr' }
                    }[p];

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedPlan(p)}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          isSel
                            ? 'bg-purple-950/60 border-purple-500 ring-1 ring-purple-500/50'
                            : 'bg-[#181824] border-[#2A2A3A] hover:border-stone-600'
                        }`}
                      >
                        <div className="text-xs font-bold text-white truncate">{labels.title}</div>
                        <div className="text-[10px] text-purple-300 font-mono mt-0.5">{labels.credits}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Studio Account'}
              </Button>
            </form>
          )}

          {/* 1-Click Demo Accounts */}
          <div className="pt-2 border-t border-[#252535] space-y-2.5">
            <div className="text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Or Continue As Demo Account
              </span>
            </div>

            <div className="space-y-2">
              {Object.entries(DEMO_PROFILES).map(([key, profile]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => loginWithDemo(key)}
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
  );
}
