// ============================================================
//  GemToken.tsx — Authentic Marvel Splendor Token Component
// ============================================================

import React, { useState } from 'react';
import type { CrystalColor } from '@shared/types/game.types';

interface GemTokenProps {
  color: CrystalColor;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  showCount?: boolean;
  className?: string;
}

export const STONE_NAMES: Record<CrystalColor, string> = {
  ruby: 'Reality Stone',
  sapphire: 'Space Stone',
  emerald: 'Time Stone',
  obsidian: 'Soul Stone',
  topaz: 'Mind Stone',
  amethyst: 'Power Stone',
  gold: 'S.H.I.E.L.D. Token',
};

const SIZE_CLASSES = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export const GemToken: React.FC<GemTokenProps> = ({
  color,
  count,
  size = 'md',
  onClick,
  selected = false,
  disabled = false,
  showCount = true,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const sizeClass = SIZE_CLASSES[size];
  const isClickable = !!onClick && !disabled;

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={onClick}
      title={`${STONE_NAMES[color]}${count !== undefined ? ` (${count})` : ''}`}
      aria-label={`${STONE_NAMES[color]}${count !== undefined ? ` (${count})` : ''}`}
      className={[
        'relative rounded-full flex items-center justify-center transition-all duration-150 select-none p-0.5',
        sizeClass,
        selected
          ? 'ring-4 ring-yellow-400 scale-110 z-20 shadow-[0_0_20px_rgba(250,204,21,0.8)]'
          : '',
        isClickable ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default',
        disabled ? 'opacity-35 grayscale-[50%]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Authentic Physical Splendor Marvel Poker Chip Token */}
      {!imgError ? (
        <img
          src={`/images/tokens/${color}.png`}
          alt={STONE_NAMES[color]}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
        />
      ) : (
        /* Fallback CSS token */
        <div
          className={`w-full h-full rounded-full crystal-${color} border-2 border-white/30 shadow-lg`}
        />
      )}

      {/* Floating Count Badge */}
      {showCount && count !== undefined && (
        <span
          className={[
            'absolute -bottom-1 -right-1 rounded-full font-black font-num shadow-[0_2px_8px_rgba(0,0,0,0.95)] flex items-center justify-center select-none leading-none z-10 transition-transform',
            count > 0
              ? 'bg-slate-950 text-yellow-300 border-2 border-yellow-400/90'
              : 'bg-black/90 text-white/40 border border-white/20',
            size === 'lg'
              ? 'min-w-6 h-6 text-xs sm:text-sm px-1.5'
              : size === 'md'
              ? 'min-w-5 h-5 text-[11px] sm:text-xs px-1'
              : 'min-w-4 h-4 text-[9.5px] px-0.5',
          ].join(' ')}
        >
          {count}
        </span>
      )}
    </button>
  );
};

// ─── Crystal Pool Display (Row of Tokens) ────────────────────

interface CrystalRowProps {
  pool: Partial<Record<CrystalColor, number>>;
  onSelect?: (color: CrystalColor) => void;
  selected?: CrystalColor[];
  hideZero?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showGold?: boolean;
}

const ALL_MAIN_COLORS: CrystalColor[] = [
  'ruby',
  'sapphire',
  'emerald',
  'obsidian',
  'topaz',
  'amethyst',
];

export const CrystalRow: React.FC<CrystalRowProps> = ({
  pool,
  onSelect,
  selected = [],
  hideZero = false,
  size = 'md',
  showGold = true,
}) => {
  const colors = showGold ? [...ALL_MAIN_COLORS, 'gold' as CrystalColor] : ALL_MAIN_COLORS;

  return (
    <div className="flex flex-wrap gap-2.5 items-center">
      {colors.map((color) => {
        const count = pool[color] ?? 0;
        if (hideZero && count === 0) return null;
        return (
          <GemToken
            key={color}
            color={color}
            count={count}
            size={size}
            onClick={onSelect ? () => onSelect(color) : undefined}
            selected={selected.includes(color)}
            disabled={!onSelect || count === 0}
          />
        );
      })}
    </div>
  );
};
