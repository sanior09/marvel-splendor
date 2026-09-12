// ============================================================
//  ResponsiveScaler.tsx — Viewport Scaler for Mobile Landscape & Tablets
// ============================================================

import React, { useState, useLayoutEffect } from 'react';

interface ResponsiveScalerProps {
  baseWidth?: number;
  baseHeight?: number;
  children: React.ReactNode;
}

export const ResponsiveScaler: React.FC<ResponsiveScalerProps> = ({
  baseWidth = 1120,
  baseHeight = 580,
  children,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [contentWidth, setContentWidth] = useState<number>(baseWidth);
  const [isScaled, setIsScaled] = useState<boolean>(false);

  useLayoutEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // When screen is smaller than base size OR on landscape mobile/tablets
      if (w < baseWidth || h < baseHeight || h <= 680) {
        // 1. Scale primarily based on viewport height to guarantee zero vertical overflow
        // and maximize card/text size (up to 35-45% larger than fixed 750px scale!)
        let newScale = h / baseHeight;

        // 2. Compute dynamic virtual width so (contentWidth * newScale) matches full viewport width w
        // This completely eliminates pillarboxing (black bars on the left and right!)
        let dynamicWidth = Math.max(baseWidth, Math.round(w / newScale));

        // 3. Fallback: if viewport is narrower than baseWidth * newScale, scale to fit width instead
        if (baseWidth * newScale > w) {
          newScale = w / baseWidth;
          dynamicWidth = baseWidth;
        }

        setScale(newScale);
        setContentWidth(dynamicWidth);
        setIsScaled(true);
      } else {
        // Large desktop displays: fluid full-bleed layout
        setScale(1);
        setContentWidth(w);
        setIsScaled(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [baseWidth, baseHeight]);

  // Desktop fluid mode
  if (!isScaled) {
    return <div className="w-screen h-screen overflow-hidden select-none">{children}</div>;
  }

  // Mobile Landscape & Tablet Edge-to-Edge scaled container
  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-[#07080f] select-none">
      <div
        style={{
          width: `${contentWidth}px`,
          height: `${baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        }}
        className="relative overflow-hidden shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
};

