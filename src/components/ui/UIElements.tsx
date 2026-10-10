import React, { FC, ReactNode, useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Sparkles, RefreshCw, Camera } from 'lucide-react';

/* ==========================================================================
   1. BUTTONS (Modern studio: rounded-xl, gradient accents, smooth transitions)
   ========================================================================== */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  showArrow?: boolean;
  children: ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  showArrow = false,
  children,
  className = '',
  ...props
}) => {
  const sizeClass = 
    size === 'sm' ? 'h-9 px-3.5 text-xs rounded-lg gap-1.5' :
    size === 'lg' ? 'h-13 px-7 text-base rounded-2xl gap-2.5 font-bold' :
    'h-11 px-5 text-sm rounded-xl gap-2 font-semibold';

  if (variant === 'tertiary' || variant === 'ghost') {
    return (
      <button
        className={`inline-flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${sizeClass} ${className}`}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
        {showArrow && <ArrowRight className="w-4 h-4 ml-0.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        className={`inline-flex items-center justify-center bg-[#151520] hover:bg-[#1E1E2C] text-stone-200 hover:text-white border border-[#2B2B3C] hover:border-purple-500/40 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${sizeClass} ${className}`}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
        {showArrow && <ArrowRight className="w-4 h-4 ml-0.5 text-stone-400" />}
      </button>
    );
  }

  // Primary variant
  return (
    <button
      className={`inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${sizeClass} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {showArrow && <ArrowRight className="w-4 h-4 ml-0.5" />}
    </button>
  );
};

/* ==========================================================================
   2. INPUTS (Modern studio: rounded-xl, dark background, focus glow)
   ========================================================================== */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: FC<InputProps> = ({
  label,
  error,
  hint,
  type = 'text',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-stone-300 select-none">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={effectiveType}
          className={`w-full bg-[#12121A] border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-stone-500 transition-all duration-200 outline-none ${
            error 
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50' 
              : 'border-[#262635] hover:border-[#38384E] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50'
          } ${isPassword ? 'pr-11' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && !error && (
        <p className="text-xs text-stone-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}
    </div>
  );
};

/* ==========================================================================
   3. STATUS BADGE & METRICS
   ========================================================================== */

export interface StatusBadgeProps {
  label: string;
  score?: number | string;
  className?: string;
  variant?: 'neutral' | 'accent' | 'muted' | 'success';
}

export const StatusBadge: FC<StatusBadgeProps> = ({
  label,
  score,
  className = '',
  variant = 'neutral',
}) => {
  const variantClass = {
    neutral: 'bg-[#181824] text-stone-300 border border-[#2B2B38]',
    accent: 'bg-purple-950/80 text-purple-300 border border-purple-800/60',
    muted: 'bg-stone-900 text-stone-400 border border-stone-800',
    success: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full select-none ${variantClass} ${className}`}
    >
      <span>{label}</span>
      {score !== undefined && (
        <span className="font-mono text-[11px] font-bold opacity-90">{score}</span>
      )}
    </span>
  );
};

/* ==========================================================================
   4. METRIC & FEATURE CARDS
   ========================================================================== */

export interface MetricCardProps {
  value: string | number;
  label: string;
  detail?: string;
  trend?: string;
  className?: string;
}

export const MetricCard: FC<MetricCardProps> = ({
  value,
  label,
  detail,
  trend,
  className = '',
}) => {
  return (
    <div
      className={`p-5 bg-[#12121A] border border-[#262635] rounded-2xl space-y-2 hover:border-[#38384E] transition-colors ${className}`}
    >
      <div className="text-xs font-semibold text-stone-400 flex items-center justify-between">
        <span>{label}</span>
        {trend && <span className="text-xs text-purple-400 font-bold">{trend}</span>}
      </div>
      <div className="text-3xl font-extrabold tracking-tight text-white font-display">
        {value}
      </div>
      {detail && <div className="text-xs text-stone-400">{detail}</div>}
    </div>
  );
};

export interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  metric?: string;
  className?: string;
  onClick?: () => void;
}

export const FeatureCard: FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  metric,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-6 bg-[#12121A] border border-[#262635] rounded-2xl space-y-3 cursor-pointer hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-950/20 transition-all ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              {icon}
            </div>
          )}
          <h3 className="text-base font-bold text-white tracking-tight">
            {title}
          </h3>
        </div>
        {metric && (
          <span className="text-xs font-mono font-semibold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-800/50">
            {metric}
          </span>
        )}
      </div>
      <p className="text-sm text-stone-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

/* ==========================================================================
   5. SECTION DIVIDER
   ========================================================================== */

export const SectionDivider: FC<{ label?: string; className?: string }> = ({
  label,
  className = '',
}) => {
  return (
    <div className={`relative py-6 ${className}`}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-[#262635]" />
      </div>
      {label && (
        <div className="relative flex justify-center">
          <span className="bg-[#0B0B0F] px-4 text-xs font-semibold text-stone-400 uppercase tracking-wider">
            {label}
          </span>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   6. CAMERA CONTROLS & EMPTY STATES
   ========================================================================== */

export const CameraHUDControls: FC<{
  flashState?: 'auto' | 'on' | 'off';
  onToggleFlash?: () => void;
  onFlipCamera?: () => void;
  onToggleGrid?: () => void;
  onCapture?: () => void;
  zoomLevel?: string;
  onSelectZoom?: (zoom: string) => void;
  gridActive?: boolean;
}> = ({
  onFlipCamera,
  onCapture,
  zoomLevel = '1x',
  onSelectZoom,
}) => {
  return (
    <div className="w-full space-y-4 pt-4">
      <div className="flex items-center justify-center gap-2">
        {['0.5x', '1x', '2x', '3x'].map((z) => (
          <button
            key={z}
            onClick={() => onSelectZoom?.(z)}
            className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all ${
              zoomLevel === z
                ? 'border-purple-500 bg-purple-600/30 text-white font-bold'
                : 'border-white/10 text-stone-400 hover:text-white bg-black/40'
            }`}
          >
            {z}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-6">
        <button
          onClick={onFlipCamera}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
        >
          Flip Lens
        </button>

        <button
          onClick={onCapture}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 hover:scale-105 active:scale-95 text-white font-bold text-xs uppercase shadow-lg shadow-purple-600/40 transition-transform flex items-center justify-center ring-4 ring-white/20"
        >
          Capture
        </button>

        <div className="text-xs font-mono text-stone-400">
          ISO 400 · 1/250s
        </div>
      </div>
    </div>
  );
};

export const AILoadingState: FC<{ currentStage?: number; className?: string }> = ({
  currentStage = 1,
  className = '',
}) => {
  const stages = [
    'Analyzing subject posture and alignment',
    'Detecting camera angle, pitch, and lighting',
    'Matching against professional studio poses',
    'Generating real-time directing cues',
  ];

  return (
    <div className={`p-6 rounded-2xl bg-[#12121A] border border-[#262635] space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-[#262635] pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
          <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
          <span>VISION AI ENGINE</span>
        </div>
        <div className="font-mono text-xs text-stone-400">
          Stage {currentStage + 1} of {stages.length}
        </div>
      </div>

      <div className="space-y-2.5">
        {stages.map((stg, i) => {
          const isDone = i < currentStage;
          const isCurrent = i === currentStage;

          return (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-black/20">
              <span className={isCurrent ? 'text-white font-semibold flex items-center gap-2' : isDone ? 'text-emerald-400 flex items-center gap-2' : 'text-stone-500'}>
                {isDone ? '✓ ' : isCurrent ? '→ ' : '• '}
                {stg}
              </span>
              <span className="font-mono text-[10px] text-stone-400">
                {isDone ? 'DONE' : isCurrent ? 'PROCESSING' : 'QUEUED'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const EmptyState: FC<{
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}> = ({
  title = 'No photos yet',
  description = 'Upload a shoot sequence or launch the live camera to begin analyzing poses.',
  actionLabel = 'Upload Photos',
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`p-10 rounded-2xl bg-[#12121A] border border-[#262635] text-center space-y-4 ${className}`}
    >
      <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
        <Camera className="w-6 h-6" />
      </div>
      <h4 className="text-lg font-bold text-white">{title}</h4>
      <p className="text-sm text-stone-400 max-w-md mx-auto">{description}</p>
      {actionLabel && (
        <div className="pt-2">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
