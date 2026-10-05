import React from 'react';

interface FixTrackLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const FixTrackLogo: React.FC<FixTrackLogoProps> = ({ 
  className = '', 
  size = 'md',
  showTagline = true 
}) => {
  const iconSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon */}
      <div className={`${iconSizes[size]} bg-[#203136] flex items-center justify-center shrink-0 shadow-sm border border-slate-700/30`}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-5 h-5 text-[#E6A84C]" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z" />
          <path d="M9 21V12h6v9" />
        </svg>
      </div>

      {/* Brand Name & Tagline */}
      <div className="flex flex-col">
        <div className={`font-bold tracking-tight leading-none ${textSizes[size]} text-[#203136]`}>
          Fix<span className="text-[#C28E40]">Track</span>
        </div>
        {showTagline && (
          <span className="text-[9px] font-semibold text-[#8B9AA0] tracking-wider uppercase mt-1">
            REPORT. TRACK. RESOLVE.
          </span>
        )}
      </div>
    </div>
  );
};
