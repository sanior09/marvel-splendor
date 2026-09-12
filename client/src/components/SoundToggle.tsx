// ============================================================
//  SoundToggle.tsx — Marvel Splendor Audio SFX Mute/Unmute Toggle
// ============================================================

import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/soundManager';

interface SoundToggleProps {
  className?: string;
  compact?: boolean;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({
  className = '',
  compact = false,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.isMuted());

  useEffect(() => {
    const unsubscribe = soundManager.subscribe((muted) => {
      setIsMuted(muted);
    });
    return unsubscribe;
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.toggleMute();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative inline-flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer select-none rounded-lg border ${
        isMuted
          ? 'bg-red-950/40 hover:bg-red-900/60 border-red-500/40 text-red-300'
          : 'bg-white/10 hover:bg-white/20 border-white/20 text-yellow-300 hover:text-yellow-200 shadow-md'
      } ${compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1 text-xs'} ${className}`}
      title={isMuted ? 'เปิดเสียงเอฟเฟกต์ (Unmute SFX)' : 'ปิดเสียงเอฟเฟกต์ (Mute SFX)'}
      aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
    >
      <span className="text-sm leading-none">{isMuted ? '🔇' : '🔊'}</span>
      {!compact && (
        <span className="font-bold text-[10px] hidden sm:inline">
          {isMuted ? 'SFX: ปิด' : 'SFX: เปิด'}
        </span>
      )}
    </button>
  );
};
