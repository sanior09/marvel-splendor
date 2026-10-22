import React from 'react';
import type { PlayerRankInfo } from '@shared/types/game.types';

interface RankBadgeProps {
  rank?: PlayerRankInfo | null;
  isBot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  isBot,
  size = 'sm',
  className = '',
}) => {
  // Bots do NOT have ranks as requested
  if (isBot || !rank) return null;

  const isOwner = Boolean(
    rank.isOwner ||
    rank.nameEn === 'Chief Architect // Game Owner' ||
    rank.name.includes('CHIEF ARCHITECT') ||
    rank.name.includes('GAME OWNER')
  );

  // Strip any leading emoji from rank name to prevent duplicate icons (e.g. "👑 CHIEF ARCHITECT // GAME OWNER" -> "CHIEF ARCHITECT // GAME OWNER")
  const cleanName = rank.name.replace(/^[\p{Emoji}\s]+/u, '').trim() || rank.name;

  if (isOwner) {
    const sizeClasses =
      size === 'lg'
        ? 'text-xs sm:text-sm px-2.5 py-1 gap-1.5'
        : size === 'md'
        ? 'text-[11px] px-2 py-0.5 gap-1.5'
        : 'text-[10px] sm:text-[11px] px-2 py-0.5 gap-1.5';

    return (
      <span
        className={`rank-badge font-black inline-flex items-center rounded-md border select-none transition-all duration-200 ${sizeClasses} ${className}`}
        style={{
          background: 'linear-gradient(135deg, rgba(6, 18, 36, 0.96) 0%, rgba(10, 26, 48, 0.96) 55%, rgba(28, 20, 6, 0.96) 100%)',
          borderColor: '#38bdf8',
          boxShadow: '0 0 12px rgba(56, 189, 248, 0.5), 0 0 4px rgba(255, 215, 0, 0.35), inset 0 0 6px rgba(56, 189, 248, 0.25)',
        }}
        title={`ยศสถาปนิกและเจ้าของเกม: ${cleanName}`}
      >
        <span className="text-[12px] leading-none drop-shadow">👑</span>
        <span
          className="tracking-wider uppercase font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-amber-300"
          style={{
            filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 6px rgba(56, 189, 248, 0.45))',
          }}
        >
          {cleanName}
        </span>
      </span>
    );
  }

  const sizeClasses =
    size === 'lg'
      ? 'text-xs sm:text-sm px-2.5 py-1 gap-1.5'
      : size === 'md'
      ? 'text-[11px] px-2 py-0.5 gap-1'
      : 'text-[10px] px-1.5 py-0.5 gap-1';

  return (
    <span
      className={`rank-badge font-extrabold inline-flex items-center rounded-md border select-none transition-all duration-200 ${sizeClasses} ${className}`}
      style={{
        background: 'rgba(12, 16, 26, 0.92)',
        borderColor: `${rank.color}99`,
        color: rank.color,
        boxShadow: `0 0 8px ${rank.color}33`,
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.9)',
      }}
      title={`ยศ: ${cleanName}`}
    >
      <span className="text-[11px] leading-none">{rank.icon}</span>
      <span className="tracking-wide">{cleanName}</span>
    </span>
  );
};
