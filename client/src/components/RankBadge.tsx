import React from 'react';
import { Award, Crown, Flame, Gem, Medal, Shield, Sparkles, Star } from 'lucide-react';
import type { PlayerRankInfo } from '@shared/types/game.types';

interface RankBadgeProps {
  rank?: PlayerRankInfo | null;
  isBot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function getRankLucideIcon(nameEn?: string, isOwner?: boolean) {
  if (isOwner) return Crown;
  switch (nameEn) {
    case 'Recruit':
      return Medal;
    case 'S.H.I.E.L.D. Agent':
      return Award;
    case 'Super Soldier':
      return Shield;
    case 'Avenger':
      return Star;
    case 'Guardian':
      return Gem;
    case 'Sorcerer Supreme':
      return Sparkles;
    case 'Infinity Wielder':
      return Flame;
    default:
      return Shield;
  }
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  isBot,
  size = 'sm',
  className = '',
}) => {
  if (isBot || !rank) return null;

  const isOwner = Boolean(
    rank.isOwner ||
    rank.nameEn === 'The One Above All' ||
    rank.name.includes('THE ONE ABOVE ALL')
  );

  const cleanName = rank.name.replace(/^[\p{Emoji}\s]+/u, '').trim() || rank.name;
  const Icon = getRankLucideIcon(rank.nameEn, isOwner);

  const sizeClasses =
    size === 'lg'
      ? 'text-xs px-2.5 py-1 gap-1.5'
      : size === 'md'
      ? 'text-[11px] px-2 py-0.5 gap-1.5'
      : 'text-[11px] px-2 py-0.5 gap-1';

  return (
    <span
      className={`rank-badge font-medium inline-flex items-center rounded-md border select-none transition-colors ${sizeClasses} ${className}`}
      style={{
        backgroundColor: isOwner ? '#1b160b' : '#11141c',
        borderColor: isOwner ? 'rgba(245, 158, 11, 0.35)' : 'rgba(238, 240, 245, 0.1)',
        color: isOwner ? '#fbbf24' : '#a3a9b8',
      }}
      title={isOwner ? cleanName : `ยศ: ${cleanName}`}
    >
      <Icon
        className="w-3 h-3 shrink-0"
        strokeWidth={1.5}
        style={{ color: isOwner ? '#fbbf24' : rank.color }}
      />
      <span>{cleanName}</span>
    </span>
  );
};
