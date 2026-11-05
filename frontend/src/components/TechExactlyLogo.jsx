import React from 'react';

export const TechExactlyLogo = ({ size = 'md', showTag = true, showText = true, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Precision Geometric Monogram Icon */}
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-lg shadow-blue-500/20 flex-shrink-0 group-hover:scale-105 transition-transform`}
      >
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-transparent to-cyan-400/20" />
          
          {/* Custom SVG Precision Monogram */}
          <svg
            className="w-3/5 h-3/5 text-white relative z-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Precision Crosshair / Monogram T & E */}
            <path d="M4 6h16" />
            <path d="M12 6v14" />
            <path d="M12 13h7" />
            <path d="M12 20h7" />
            <circle cx="12" cy="6" r="1.5" fill="#38bdf8" stroke="none" />
          </svg>
        </div>
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-black ${textSizes[size]} tracking-tight text-slate-900`}>
              Tech<span className="text-blue-600">Exactly</span>
            </span>
            {showTag && (
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 rounded-md">
                Assignment
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-0.5">
            MERN Blog Platform
          </span>
        </div>
      )}
    </div>
  );
};

export default TechExactlyLogo;

