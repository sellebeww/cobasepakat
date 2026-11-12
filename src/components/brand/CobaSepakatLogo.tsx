/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';

interface CobaSepakatLogoProps {
  variant?: 'full' | 'horizontal' | 'icon' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

// SVG representation matching the official brand identity for vector fallback
const VectorEmbraceCheck = ({ className: svgClass = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 120 120"
    className={svgClass}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Logo CobaSepakat"
  >
    {/* Blue Figure (Left/Top Embrace) */}
    <circle cx="48" cy="28" r="10" fill="#2272E8" />
    <path
      d="M48 42C32 42 22 54 22 70C22 86 36 98 52 98C58 98 64 96 69 92C62 89 56 82 54 75C46 75 36 68 36 58C36 50 42 44 48 44C54 44 60 48 64 54C68 50 74 46 80 44C73 43 65 42 56 42H48Z"
      fill="#2272E8"
    />
    {/* Green Figure (Right/Bottom Embrace) */}
    <circle cx="82" cy="38" r="9" fill="#2FA882" />
    <path
      d="M80 46C86 52 92 62 92 72C92 88 78 100 62 100C48 100 38 93 32 86C38 88 46 89 54 87C68 83 76 72 76 60C76 54 74 49 70 45C74 45 77 45.5 80 46Z"
      fill="#2FA882"
    />
    {/* Dark Navy Checkmark in the center */}
    <path
      d="M42 68L54 80L80 50"
      stroke="#153A73"
      strokeWidth="11"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


export const CobaSepakatLogo: React.FC<CobaSepakatLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showTagline = false,
}) => {
  // Dimension settings: larger, zoomed-in presence
  const sizeConfig = {
    sm: { icon: 34, text: 'text-lg', subtext: 'text-xs' },
    md: { icon: 46, text: 'text-2xl', subtext: 'text-xs' },
    lg: { icon: 64, text: 'text-3xl', subtext: 'text-sm' },
    xl: { icon: 88, text: 'text-4xl', subtext: 'text-base' },
  }[size];

  // Icon variant: tightly cropped emblem (No-BG) zoomed to fill
  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/brand/cobasepakat-emblem-nobg.png"
          alt="CobaSepakat"
          style={{ width: sizeConfig.icon, height: sizeConfig.icon }}
          className="object-contain drop-shadow-sm select-none"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-svg');
            if (fallback) (fallback as HTMLElement).style.display = 'block';
          }}
        />
        <div className="fallback-svg hidden" style={{ width: sizeConfig.icon, height: sizeConfig.icon }}>
          <VectorEmbraceCheck className="w-full h-full" />
        </div>
      </div>
    );
  }

  // Full variant: stacked emblem + wordmark cropped and zoomed
  if (variant === 'full') {
    return (
      <div className={`inline-flex flex-col items-center justify-center gap-3 text-center ${className}`}>
        <div className="relative shrink-0 flex items-center justify-center">
          <img
            src="/brand/cobasepakat-emblem-nobg.png"
            alt="Emblem CobaSepakat"
            style={{ width: sizeConfig.icon * 1.3, height: sizeConfig.icon * 1.3 }}
            className="object-contain drop-shadow-md select-none"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-svg');
              if (fallback) (fallback as HTMLElement).style.display = 'block';
            }}
          />
          <div className="fallback-svg hidden" style={{ width: sizeConfig.icon * 1.3, height: sizeConfig.icon * 1.3 }}>
            <VectorEmbraceCheck className="w-full h-full" />
          </div>
        </div>

        <div className="flex flex-col items-center leading-tight select-none">
          <span className={`font-extrabold tracking-tight ${sizeConfig.text}`}>
            <span className="text-brand-navy">Coba</span>
            <span className="text-brand-green">Sepakat</span>
          </span>
          {showTagline && (
            <span className={`font-medium ${sizeConfig.subtext} text-brand-slate mt-1`}>
              Uji Dugaannya, Sepakati Buktinya
            </span>
          )}
        </div>
      </div>
    );
  }

  // White variant for dark backgrounds
  if (variant === 'white') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <div className="relative shrink-0 flex items-center justify-center">
          <img
            src="/brand/cobasepakat-emblem-white-nobg.png"
            alt="CobaSepakat"
            style={{ width: sizeConfig.icon, height: sizeConfig.icon }}
            className="object-contain select-none"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-svg');
              if (fallback) (fallback as HTMLElement).style.display = 'block';
            }}
          />
          <div className="fallback-svg hidden" style={{ width: sizeConfig.icon, height: sizeConfig.icon }}>
            <VectorEmbraceCheck className="w-full h-full" />
          </div>
        </div>

        <div className="flex flex-col leading-tight select-none">
          <span className={`font-extrabold tracking-tight ${sizeConfig.text} text-white`}>
            <span>Coba</span>
            <span className="text-[#5ce2b8]">Sepakat</span>
          </span>
          {showTagline && (
            <span className={`font-medium ${sizeConfig.subtext} text-slate-300`}>
              Uji Dugaannya, Sepakati Buktinya
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal lockup with zoomed cropped emblem (No-BG)
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src="/brand/cobasepakat-emblem-nobg.png"
          alt="Emblem CobaSepakat"
          style={{ width: sizeConfig.icon, height: sizeConfig.icon }}
          className="object-contain drop-shadow-sm select-none"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-svg');
            if (fallback) (fallback as HTMLElement).style.display = 'block';
          }}
        />
        <div className="fallback-svg hidden" style={{ width: sizeConfig.icon, height: sizeConfig.icon }}>
          <VectorEmbraceCheck className="w-full h-full" />
        </div>
      </div>

      <div className="flex flex-col leading-tight select-none">
        <span className={`font-extrabold tracking-tight ${sizeConfig.text}`}>
          <span className="text-brand-navy">Coba</span>
          <span className="text-brand-green">Sepakat</span>
        </span>
        {showTagline && (
          <span className={`font-medium ${sizeConfig.subtext} text-brand-slate`}>
            Uji Dugaannya, Sepakati Buktinya
          </span>
        )}
      </div>
    </div>
  );
};
