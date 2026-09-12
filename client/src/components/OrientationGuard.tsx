// ============================================================
//  OrientationGuard.tsx — Marvel Landscape Enforcer & Rotation Guide
// ============================================================

import React, { useState, useEffect } from 'react';

interface OrientationGuardProps {
  children: React.ReactNode;
}

export const OrientationGuard: React.FC<OrientationGuardProps> = ({ children }) => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [bypassed, setBypassed] = useState<boolean>(false);

  useEffect(() => {
    const handleCheck = () => {
      // Considered portrait if height > width AND width is mobile/tablet range (<= 1100px)
      const isPortraitScreen =
        window.innerHeight > window.innerWidth && window.innerWidth <= 1100;
      setIsPortrait(isPortraitScreen);
    };

    handleCheck();
    window.addEventListener('resize', handleCheck);
    window.addEventListener('orientationchange', handleCheck);

    return () => {
      window.removeEventListener('resize', handleCheck);
      window.removeEventListener('orientationchange', handleCheck);
    };
  }, []);

  if (isPortrait && !bypassed) {
    return (
      <div className="fixed inset-0 z-[10000] bg-[#07080f] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
        {/* Ambient cosmic glows */}
        <div className="absolute w-72 h-72 rounded-full bg-red-600/15 blur-3xl -top-10 -left-10 pointer-events-none" />
        <div className="absolute w-72 h-72 rounded-full bg-amber-500/15 blur-3xl -bottom-10 -right-10 pointer-events-none" />

        <div className="relative z-10 max-w-sm w-full space-y-6 flex flex-col items-center">
          {/* Marvel Badge */}
          <div className="flex items-center gap-2">
            <span className="marvel-badge px-3 py-1 rounded text-sm font-black tracking-wider">
              MARVEL
            </span>
            <span className="font-display font-black text-xl text-white tracking-widest">
              SPLENDOR
            </span>
          </div>

          {/* Animated Rotating Device Icon */}
          <div className="relative w-28 h-28 flex items-center justify-center my-4">
            <div className="absolute inset-0 rounded-full border border-yellow-400/20 animate-ping opacity-25" />
            <div className="absolute inset-0 rounded-full border border-red-500/30 animate-pulse" />

            {/* Rotating Phone SVG */}
            <div className="animate-bounce">
              <svg
                className="w-16 h-16 text-yellow-400 transform -rotate-90 transition-transform duration-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect
                  x="5"
                  y="2"
                  width="14"
                  height="20"
                  rx="3"
                  strokeWidth="2"
                  className="stroke-current"
                />
                <circle cx="12" cy="18" r="1" fill="currentColor" />
                <path d="M10 5h4" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Rotation arrow badge */}
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-sm shadow-lg border border-yellow-300 animate-spin">
              🔄
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-yellow-300 font-display uppercase tracking-wide">
              กรุณาหมุนอุปกรณ์เป็นแนวนอน
            </h2>
            <p className="text-xs text-white/60 font-semibold tracking-wider uppercase font-sans">
              PLEASE ROTATE DEVICE TO LANDSCAPE
            </p>
          </div>

          {/* Instructions */}
          <p className="text-xs text-white/70 leading-relaxed bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
            เกม <strong>Marvel Splendor</strong>{' '}
            ได้รับการออกแบบให้เล่นในแนวนอนเพื่อแสดงผลการ์ดฮีโร่ คลังมณีอินฟินิตี้
            และกระดานคะแนนได้อย่างเต็มตาและสวยงามที่สุด
          </p>

          {/* 6 Infinity Stones glowing row */}
          <div className="flex items-center gap-3 pt-2 opacity-80">
            {['ruby', 'sapphire', 'emerald', 'obsidian', 'topaz', 'amethyst'].map((stone) => (
              <img
                key={stone}
                src={`/images/tokens/${stone}.png`}
                alt={stone}
                className="w-5 h-5 object-contain filter drop-shadow animate-pulse"
              />
            ))}
          </div>

          {/* Bypass button for test environments */}
          <button
            type="button"
            onClick={() => setBypassed(true)}
            className="text-[11px] text-white/30 hover:text-white/60 underline pt-4 cursor-pointer"
          >
            ดำเนินการต่อในแนวตั้ง (Continue in portrait anyway)
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
