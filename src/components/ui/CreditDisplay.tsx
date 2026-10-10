import React from 'react';
import { Zap } from 'lucide-react';

interface CreditDisplayProps {
  remaining: number;
  allotment?: number;
  className?: string;
  condensed?: boolean;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({
  remaining,
  allotment = 1000,
  className = '',
  condensed = false,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((remaining / allotment) * 100)));

  if (condensed) {
    return (
      <div className={`flex items-center gap-2 text-xs font-medium text-stone-300 ${className}`}>
        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span className="font-bold text-white">{remaining.toLocaleString()}</span>
        <span className="text-stone-500">/ {allotment.toLocaleString()}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 p-3 rounded-xl bg-[#14141E] border border-[#262635] ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-stone-400 flex items-center gap-1.5 font-medium">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Credits Remaining</span>
        </span>
        <span className="font-bold text-white font-mono">
          {remaining.toLocaleString()} <span className="text-stone-500 font-normal">/ {allotment.toLocaleString()}</span>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default CreditDisplay;
