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
    rank.nameEn === 'The One Above All' ||
    rank.name.includes('THE ONE ABOVE ALL')
  );

  // Strip any leading emoji from rank name to prevent duplicate icons (e.g. "👑 THE ONE ABOVE ALL" -> "THE ONE ABOVE ALL")
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
          background: 'linear-gradient(135deg, rgba(20, 14, 4, 0.96) 0%, rgba(38, 25, 6, 0.96) 100%)',
          borderColor: '#ffd700',
          boxShadow: '0 0 10px rgba(255, 215, 0, 0.45), inset 0 0 5px rgba(255, 215, 0, 0.15)',
        }}
        title={`ยศสูงสุดแห่งจักรวาล: ${cleanName}`}
      >
        <span className="text-[12px] leading-none drop-shadow">👑</span>
        <span
          className="tracking-wider uppercase font-black text-amber-300 drop-shadow-sm"
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
