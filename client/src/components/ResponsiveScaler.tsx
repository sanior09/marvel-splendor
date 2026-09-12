// ============================================================
//  ResponsiveScaler.tsx — Viewport Scaler for iPad & Mobile Landscape
// ============================================================

import React, { useState, useLayoutEffect } from 'react';

interface ResponsiveScalerProps {
  baseWidth?: number;
  baseHeight?: number;
  children: React.ReactNode;
}

export const ResponsiveScaler: React.FC<ResponsiveScalerProps> = ({
  baseWidth = 1320,
  baseHeight = 760,
  children,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [isScaled, setIsScaled] = useState<boolean>(false);

  useLayoutEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // If screen is smaller than the base design in either width or height (iPad, Tablet, Phone Landscape)
      if (w < baseWidth || h < baseHeight) {
        const scaleX = w / baseWidth;
        const scaleY = h / baseHeight;
        const computedScale = Math.min(scaleX, scaleY);
        setScale(computedScale);
        setIsScaled(true);
      } else {
        setScale(1);
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

  // If on large desktop, render children directly in normal fluid mode
  if (!isScaled) {
    return <div className="w-screen h-screen overflow-hidden select-none">{children}</div>;
  }

  // If on iPad, Tablet, or Mobile Landscape: Scale-to-Fit container
  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-[#07080f] select-none">
      <div
        style={{
          width: baseWidth,
          height: baseHeight,
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
