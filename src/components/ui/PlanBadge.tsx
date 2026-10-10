import React from 'react';
import { Sparkles, Crown } from 'lucide-react';
import { UserPlan } from '../../types';

interface PlanBadgeProps {
  plan: UserPlan | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ plan, className = '', size = 'md' }) => {
  const normalized = (plan || '').toLowerCase();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (normalized === 'creator_pro' || normalized === 'pro') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-purple-950/70 text-purple-300 border border-purple-600/50 shadow-sm shadow-purple-950/40 select-none ${sizeClasses} ${className}`}
      >
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span>Creator Pro</span>
      </span>
    );
  }

  if (normalized === 'studio_team' || normalized === 'studio') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-gradient-to-r from-amber-500/20 via-purple-600/30 to-indigo-600/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-900/30 select-none ${sizeClasses} ${className}`}
      >
        <Crown className="w-3 h-3 text-amber-400" />
        <span>Studio Team</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium bg-stone-800/80 text-stone-300 border border-stone-700/60 select-none ${sizeClasses} ${className}`}
    >
      <span>Starter</span>
    </span>
  );
};

export default PlanBadge;
