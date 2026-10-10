import React from 'react';

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export const Eyebrow: React.FC<EyebrowProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`text-xs uppercase tracking-wider text-purple-400 font-semibold select-none flex items-center gap-1.5 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
      <span>{children}</span>
    </div>
  );
};

export default Eyebrow;
