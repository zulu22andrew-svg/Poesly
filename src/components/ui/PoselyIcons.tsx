import type { FC, SVGProps } from 'react';

export interface PoselyIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  variant?: 'spark-focus' | 'node-matrix' | 'crosshair-ai' | 'viewfinder-spark';
  active?: boolean;
}

/**
 * Distinctive Posely AI Icon:
 * Seamlessly blends camera focus geometry + AI neural spark + geometric tracking nodes.
 */
export const PoselyAIIcon: FC<PoselyIconProps> = ({
  size = 20,
  className = '',
  variant = 'spark-focus',
  active = false,
  ...props
}) => {
  const strokeColor = active ? '#C4B5FD' : 'currentColor';
  const accentColor = active ? '#8B5CF6' : '#A78BFA';

  if (variant === 'node-matrix') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        {...props}
      >
        {/* Diamond Outer Bounds */}
        <path
          d="M12 2L22 12L12 22L2 12L12 2Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 2"
          opacity="0.6"
        />
        {/* Center Node */}
        <circle cx="12" cy="12" r="2.5" fill={accentColor} />
        {/* 4 Cardinal Nodes */}
        <circle cx="12" cy="5" r="1.5" fill={strokeColor} />
        <circle cx="19" cy="12" r="1.5" fill={strokeColor} />
        <circle cx="12" cy="19" r="1.5" fill={strokeColor} />
        <circle cx="5" cy="12" r="1.5" fill={strokeColor} />
        {/* Core Vector Rays */}
        <line x1="12" y1="7.5" x2="12" y2="9.5" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16.5" y1="12" x2="14.5" y2="12" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="16.5" x2="12" y2="14.5" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7.5" y1="12" x2="9.5" y2="12" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === 'crosshair-ai') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        {...props}
      >
        {/* Circle Target */}
        <circle cx="12" cy="12" r="8" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
        {/* Reticle Brackets */}
        <path d="M12 2V5" stroke={accentColor} strokeWidth="1.75" strokeLinecap="round" />
        <path d="M12 19V22" stroke={accentColor} strokeWidth="1.75" strokeLinecap="round" />
        <path d="M2 12H5" stroke={accentColor} strokeWidth="1.75" strokeLinecap="round" />
        <path d="M19 12H22" stroke={accentColor} strokeWidth="1.75" strokeLinecap="round" />
        {/* Center Spark */}
        <path
          d="M12 8.5C12 10.433 13.567 12 15.5 12C13.567 12 12 13.567 12 15.5C12 13.567 10.433 12 8.5 12C10.433 12 12 10.433 12 8.5Z"
          fill={accentColor}
        />
      </svg>
    );
  }

  // Default: 'spark-focus' - 4 camera viewfinder corner brackets surrounding a refined 4-pointed AI star spark + corner tracking points
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      {...props}
    >
      {/* Viewfinder Corner 1: Top-Left */}
      <path d="M3 8V5C3 3.89543 3.89543 3 5 3H8" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      {/* Viewfinder Corner 2: Top-Right */}
      <path d="M16 3H19C20.1046 3 21 3.89543 21 5V8" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      {/* Viewfinder Corner 3: Bottom-Right */}
      <path d="M21 16V19C21 20.1046 20.1046 21 19 21H16" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      {/* Viewfinder Corner 4: Bottom-Left */}
      <path d="M8 21H5C3.89543 21 3 20.1046 3 19V16" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />

      {/* 4 Corner Sub-Nodes */}
      <circle cx="5.5" cy="5.5" r="0.75" fill={accentColor} />
      <circle cx="18.5" cy="5.5" r="0.75" fill={accentColor} />
      <circle cx="18.5" cy="18.5" r="0.75" fill={accentColor} />
      <circle cx="5.5" cy="18.5" r="0.75" fill={accentColor} />

      {/* Central AI Mathematical Star Spark */}
      <path
        d="M12 7C12 9.76142 14.2386 12 17 12C14.2386 12 12 14.2386 12 17C12 14.2386 9.76142 12 7 12C9.76142 12 12 9.76142 12 7Z"
        fill={accentColor}
        stroke={strokeColor}
        strokeWidth="0.5"
      />
    </svg>
  );
};
