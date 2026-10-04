import React from 'react';

interface EzoutiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'symbol' | 'badge';
  withLightText?: boolean;
}

export const EzoutiLogo: React.FC<EzoutiLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  withLightText = true,
}) => {
  const sizeMap = {
    sm: { symbol: 'w-8 h-8', full: 'h-9', badge: 'h-10' },
    md: { symbol: 'w-11 h-11', full: 'h-12', badge: 'h-14' },
    lg: { symbol: 'w-16 h-16', full: 'h-16', badge: 'h-20' },
    xl: { symbol: 'w-24 h-24', full: 'h-24', badge: 'h-28' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Standalone vector symbol
  const SymbolSVG = (
    <svg viewBox="0 0 500 450" className="w-full h-full drop-shadow-md select-none">
      <defs>
        <linearGradient id="ezBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="25%" stopColor="#0284c7" />
          <stop offset="60%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0f2b5c" />
        </linearGradient>
        <linearGradient id="ezOrangeOrbit" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="45%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>

      {/* Back orbit arc */}
      <path
        d="M 120 180 C 95 125, 330 65, 420 115"
        fill="none"
        stroke="url(#ezOrangeOrbit)"
        strokeWidth="18"
        strokeLinecap="round"
        opacity="0.95"
      />

      {/* Stylized Modern 3D "E" */}
      <path
        d="M 230 45 C 315 45, 370 85, 370 145 C 370 175, 350 195, 310 205 C 355 215, 380 245, 380 280 C 380 340, 315 375, 230 375 C 175 375, 140 350, 135 320 C 132 305, 142 295, 158 295 C 170 295, 178 303, 185 312 C 195 325, 210 335, 235 335 C 290 335, 325 310, 325 275 C 325 240, 290 218, 230 218 L 205 218 C 195 218, 190 210, 190 200 C 190 190, 195 182, 205 182 L 230 182 C 285 182, 315 160, 315 130 C 315 100, 285 85, 235 85 C 205 85, 185 98, 172 118 C 165 128, 155 132, 145 132 C 132 132, 122 120, 126 105 C 135 70, 175 45, 230 45 Z"
        fill="url(#ezBlueGrad)"
      />

      {/* Front orbit arc */}
      <path
        d="M 105 205 C 110 240, 170 270, 280 255 C 350 245, 410 210, 420 170 C 423 155, 415 145, 400 148 C 385 152, 340 190, 270 208 C 190 228, 125 218, 105 205 Z"
        fill="url(#ezOrangeOrbit)"
      />

      {/* Tech Pixel Squares (Top-Right) */}
      <rect x="365" y="55" width="18" height="18" rx="3" fill="#0284c7" />
      <rect x="390" y="55" width="18" height="18" rx="3" fill="#0284c7" />
      <rect x="365" y="80" width="18" height="18" rx="3" fill="#f97316" />
      <rect x="390" y="80" width="18" height="18" rx="3" fill="#ea580c" />
      <rect x="415" y="80" width="18" height="18" rx="3" fill="#0284c7" />
      <rect x="390" y="105" width="18" height="18" rx="3" fill="#f97316" />
    </svg>
  );

  if (variant === 'symbol') {
    return (
      <div className={`relative shrink-0 flex items-center justify-center ${currentSize.symbol} ${className}`}>
        {SymbolSVG}
      </div>
    );
  }

  // Clear badge card variant (matching the official image with white card container)
  if (variant === 'badge') {
    return (
      <div
        className={`bg-white rounded-2xl p-2 shadow-lg border border-slate-200/40 flex items-center gap-3 select-none ${className}`}
      >
        <div className={currentSize.symbol}>{SymbolSVG}</div>
        <div className="flex flex-col text-right leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-[#0f2b5c] text-xl tracking-tight">عزوتي</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">
              IT
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-2 h-[1px] bg-orange-500 rounded-full" />
            <span className="text-[9px] font-bold text-[#0f2b5c]">للبرمجيات وتكنولوجيا المعلومات</span>
            <span className="w-2 h-[1px] bg-orange-500 rounded-full" />
          </div>
          <div className="font-mono text-[9px] font-black tracking-wider mt-0.5 text-[#0f2b5c]">
            EZWATY <span className="text-orange-600">IT</span>
          </div>
        </div>
      </div>
    );
  }

  // Default Full Brand
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Symbol in white/clear circular pod for max visual clarity */}
      <div className={`relative shrink-0 rounded-xl bg-white/95 p-1.5 shadow-md shadow-blue-900/20 border border-slate-200/50 flex items-center justify-center ${currentSize.symbol}`}>
        {SymbolSVG}
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center leading-none text-right">
        {/* Arabic Brand Name */}
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-tight ${
              withLightText ? 'text-white' : 'text-[#0f2b5c]'
            } ${
              size === 'sm'
                ? 'text-lg'
                : size === 'lg'
                ? 'text-2xl'
                : size === 'xl'
                ? 'text-3xl'
                : 'text-xl'
            }`}
          >
            عزوتي
          </span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/30">
            EZWATY IT
          </span>
        </div>

        {/* Subtitle */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-3 h-[2px] bg-orange-500 rounded-full" />
          <span
            className={`text-[10px] font-bold tracking-wide ${
              withLightText ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            للبرمجيات وتكنولوجيا المعلومات
          </span>
          <span className="w-3 h-[2px] bg-orange-500 rounded-full" />
        </div>
      </div>
    </div>
  );
};
