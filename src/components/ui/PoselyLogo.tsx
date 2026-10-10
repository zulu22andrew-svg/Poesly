import React from 'react';

interface PoselyLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
  variant?: 'horizontal' | 'full' | 'mark';
  href?: string;
}

export const PoselyLogo: React.FC<PoselyLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitle = 'AI Pose Studio',
  className = '',
  variant = 'horizontal',
}) => {
  // Size metrics
  const markDimensions = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size];

  const fullDimensions = {
    xs: 'h-10 w-auto',
    sm: 'h-14 w-auto',
    md: 'h-20 w-auto',
    lg: 'h-28 w-auto',
    xl: 'h-36 w-auto',
  }[size];

  const titleSize = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  }[size];

  const subSize = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  // If full emblem logo is requested
  if (variant === 'full') {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <img
          src="/posely-logo.png"
          alt="Posely Logo"
          className={`${fullDimensions} object-contain rounded-2xl shadow-2xl shadow-purple-950/40 transition-transform duration-300 hover:scale-[1.02]`}
          referrerPolicy="no-referrer"
        />
        {showSubtitle && subtitle && (
          <span className={`text-stone-400 font-medium tracking-wider pt-2 ${subSize}`}>
            {subtitle}
          </span>
        )}
      </div>
    );
  }

  // If only the mark is requested
  if (variant === 'mark') {
    return (
      <div className={`relative inline-block select-none ${className}`}>
        <img
          src="/posely-mark.png"
          alt="Posely"
          className={`${markDimensions} object-contain rounded-xl shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/20`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Default horizontal lockup: Official Mark + Posely Typography
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official Posely Icon Mark */}
      <div className="relative shrink-0 group">
        <img
          src="/posely-mark.png"
          alt="Posely Mark"
          className={`${markDimensions} object-contain rounded-xl shadow-lg shadow-purple-950/50 ring-1 ring-purple-500/30 group-hover:ring-purple-400/50 transition-all duration-300`}
          referrerPolicy="no-referrer"
        />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-60 pointer-events-none" />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-display font-extrabold tracking-tight text-white ${titleSize}`}>
            Posely
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
            AI
          </span>
        </div>
        {showSubtitle && subtitle && (
          <span className={`text-stone-400 font-medium tracking-wide pt-1 leading-none ${subSize}`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export const PoselyMark: React.FC<{ size?: number | string; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  const dimensionStyle = typeof size === 'number' ? { width: size, height: size } : {};
  const dimensionClass = typeof size === 'string' ? size : '';

  return (
    <div
      style={dimensionStyle}
      className={`relative inline-flex items-center justify-center shrink-0 ${dimensionClass} ${className}`}
    >
      <img
        src="/posely-mark.png"
        alt="Posely Logo Mark"
        className="w-full h-full object-contain rounded-xl shadow-md shadow-purple-950/40 ring-1 ring-purple-500/30"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default PoselyLogo;
