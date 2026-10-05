import React from 'react';

interface EzoutiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'symbol' | 'horizontal' | 'badge';
  withLightText?: boolean;
}

export const EzoutiLogo: React.FC<EzoutiLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  withLightText = true,
}) => {
  // Sizing map calibrated to make the emblem icon significantly larger and prominent
  const sizeMap = {
    sm: { symbol: 'w-10 h-10', badge: 'h-11' },
    md: { symbol: 'w-14 h-14', badge: 'h-14' },
    lg: { symbol: 'w-20 h-20', badge: 'h-20' },
    xl: { symbol: 'w-28 h-28', badge: 'h-28' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Ultra-detailed, authentic vector reconstruction of the uploaded official Ezwaty IT Logo
  const SymbolSVG = (
    <svg viewBox="0 0 500 450" className="w-full h-full drop-shadow-xl select-none">
      <defs>
        {/* Layer 1: Electric Blue Gradient for Main E Body */}
        <linearGradient id="ezMainBlue" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="25%" stopColor="#0284c7" />
          <stop offset="60%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#0f2b5c" />
        </linearGradient>

        {/* Layer 2: Deep 3D Shadow Fold for Inner E Spine */}
        <linearGradient id="ezInnerFold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="40%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#091b3e" />
        </linearGradient>

        {/* Orbit Arc Gradient: Vibrant Sunburst Orange & Amber */}
        <linearGradient id="ezOrbitGrad" x1="0%" y1="10%" x2="100%" y2="90%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="80%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>

        {/* Soft Drop Shadow Filter for 3D Layering */}
        <filter id="ezDropGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0f2b5c" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* 1. Back Orbit Swoosh (behind the E stem) */}
      <path
        d="M 125 185 C 105 130, 280 65, 395 105 C 415 112, 425 125, 410 135 C 385 145, 340 120, 260 125"
        fill="none"
        stroke="url(#ezOrbitGrad)"
        strokeWidth="20"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* 2. Top-Right Tech Digital Pixel Cubes */}
      <g filter="url(#ezDropGlow)">
        <rect x="365" y="50" width="20" height="20" rx="4" fill="#0284c7" />
        <rect x="390" y="50" width="20" height="20" rx="4" fill="#0284c7" />
        <rect x="365" y="75" width="20" height="20" rx="4" fill="#f97316" />
        <rect x="390" y="75" width="20" height="20" rx="4" fill="#ea580c" />
        <rect x="415" y="75" width="20" height="20" rx="4" fill="#0284c7" />
        <rect x="390" y="100" width="20" height="20" rx="4" fill="#f97316" />
      </g>

      {/* 3. The Stylized 3D Blue Letter 'E' Body with Dimensional Folds */}
      <g filter="url(#ezDropGlow)">
        {/* Outer Back Layer */}
        <path
          d="M 235 40 C 325 40, 380 85, 380 148 C 380 180, 360 200, 320 210 C 365 220, 390 252, 390 292 C 390 355, 325 390, 235 390 C 170 390, 130 362, 125 326 C 122 308, 135 298, 152 298 C 165 298, 175 306, 182 318 C 194 336, 212 346, 240 346 C 298 346, 335 318, 335 282 C 335 244, 298 222, 235 222 L 202 222 C 190 222, 185 212, 185 202 C 185 192, 190 182, 202 182 L 235 182 C 292 182, 325 158, 325 125 C 325 94, 292 78, 240 78 C 205 78, 182 92, 168 116 C 160 128, 148 132, 136 132 C 122 132, 110 118, 115 102 C 126 62, 172 40, 235 40 Z"
          fill="url(#ezMainBlue)"
        />

        {/* 3D Fold / Emboss Shadow Detail on Main Spine */}
        <path
          d="M 205 78 C 195 90, 185 110, 185 140 L 185 300 C 185 325, 205 346, 235 346 C 255 346, 280 340, 295 325 C 275 332, 245 328, 235 310 C 228 298, 228 280, 228 250 L 228 170 C 228 140, 235 110, 260 95 C 240 82, 220 78, 205 78 Z"
          fill="url(#ezInnerFold)"
          opacity="0.85"
        />

        {/* Center Horizontal Arm of the E */}
        <path
          d="M 205 186 L 295 186 C 305 186, 312 192, 312 202 C 312 212, 305 218, 295 218 L 205 218 Z"
          fill="#38bdf8"
          opacity="0.95"
        />
      </g>

      {/* 4. Front Orbit Swoosh (sweeping gracefully across the front of the E) */}
      <path
        d="M 95 210 C 105 255, 175 285, 290 270 C 365 260, 425 220, 435 178 C 438 162, 428 152, 412 156 C 395 160, 345 200, 270 218 C 185 238, 118 226, 95 210 Z"
        fill="url(#ezOrbitGrad)"
        filter="url(#ezDropGlow)"
      />
    </svg>
  );

  // Standalone enlarged symbol variant
  if (variant === 'symbol') {
    return (
      <div className={`relative shrink-0 flex items-center justify-center ${currentSize.symbol} ${className}`}>
        {SymbolSVG}
      </div>
    );
  }

  // Full Layout strictly following user instruction:
  // "اظهره بوضوح وبمساحة جيدة وافرد كلمة للبرمجيات وتكنولوجيا المعلومات فى سطر واحد اسفل اللوجو بجوار كلمة عزوتى ولكن صغر حجم كلمة عزوتى بما يسمح بتكبير اللوجو"
  return (
    <div className={`flex flex-col items-center justify-center select-none text-center ${className}`}>
      {/* 1. Enlarged Logo Emblem with generous, clear space */}
      <div
        className={`relative shrink-0 rounded-2xl bg-white p-2 shadow-xl shadow-blue-950/40 border border-slate-200/80 flex items-center justify-center transition-transform hover:scale-105 ${currentSize.symbol}`}
        title="شعار شركة عزوتي للبرمجيات وتكنولوجيا المعلومات"
      >
        {SymbolSVG}
      </div>

      {/* 2. Single Unfolded Line below the Logo: "عزوتي" (بخط مصغر وأنيق) بجوار "للبرمجيات وتكنولوجيا المعلومات" */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 max-w-full">
        {/* كلمة عزوتي مصغرة لتركيز المساحة والتكبير على اللوجو */}
        <span
          className={`font-black tracking-tight ${
            withLightText ? 'text-white' : 'text-[#0f2b5c]'
          } ${
            size === 'sm'
              ? 'text-xs'
              : size === 'lg'
              ? 'text-base'
              : size === 'xl'
              ? 'text-lg'
              : 'text-sm'
          }`}
        >
          عزوتي
        </span>

        {/* فاصل برتقالي أنيق */}
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />

        {/* جملة للبرمجيات وتكنولوجيا المعلومات مفرودة في نفس السطر */}
        <span
          className={`font-bold whitespace-nowrap tracking-normal ${
            withLightText ? 'text-slate-200' : 'text-slate-700'
          } ${
            size === 'sm'
              ? 'text-[10px]'
              : size === 'lg'
              ? 'text-xs'
              : size === 'xl'
              ? 'text-sm'
              : 'text-[11px]'
          }`}
        >
          للبرمجيات وتكنولوجيا المعلومات
        </span>

        {/* بادج الإنجليزية المقتبس من اللوجو المرفوع */}
        <span className="font-mono text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 whitespace-nowrap">
          EZWATY <span className="text-orange-500">IT</span>
        </span>
      </div>
    </div>
  );
};
