// ============================================================
//  CardDeck.tsx — Face-Down Tier Deck Component
// ============================================================

import React from 'react';
import type { CardTier } from '@shared/types/game.types';
import { soundManager } from '../utils/soundManager';

interface CardDeckProps {
  tier: CardTier;
  count: number;
  isMyTurn: boolean;
  reservedCount: number;
  onReserveFromDeck: (tier: CardTier) => void;
}

const TIER_STYLES: Record<CardTier, { bg: string; label: string; glow: string }> = {
  1: { bg: 'from-slate-700 to-slate-800', label: 'Tier I (ระดับ 1)', glow: 'hover:shadow-[0_0_20px_rgba(100,116,139,0.4)]' },
  2: { bg: 'from-indigo-800 to-purple-900', label: 'Tier II (ระดับ 2)', glow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]' },
  3: { bg: 'from-amber-700 to-orange-800', label: 'Tier III (ระดับ 3)', glow: 'hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]' },
};

export const CardDeck: React.FC<CardDeckProps> = ({
  tier,
  count,
  isMyTurn,
  reservedCount,
  onReserveFromDeck,
}) => {
  const styles = TIER_STYLES[tier];
  const canReserve = isMyTurn && count > 0 && reservedCount < 3;

  const handleClick = () => {
    if (canReserve) {
      soundManager.playCardReserve();
      onReserveFromDeck(tier);
    } else if (isMyTurn && reservedCount >= 3) {
      soundManager.playError();
    }
  };

  return (
    <div
      className={[
        'w-28 h-[136px] rounded-xl bg-gradient-to-b border border-white/10 flex flex-col items-center justify-center gap-1.5 transition-all duration-200',
        styles.bg,
        count === 0 ? 'opacity-30' : '',
        canReserve ? `cursor-pointer ${styles.glow}` : '',
      ].join(' ')}
      onClick={handleClick}
      role={canReserve ? 'button' : undefined}
      aria-label={`${styles.label} deck — ${count} cards remaining${canReserve ? ', click to reserve' : ''}`}
    >
      {/* Stack visual */}
      <div className="relative">
        {[2, 1, 0].map((i) => (
          <div
            key={i}
            className="absolute w-16 h-20 rounded-lg border border-white/10 bg-white/5"
            style={{ bottom: i * 3, right: i * 2, zIndex: i }}
          />
        ))}
        <div className="relative z-10 w-16 h-20 rounded-lg bg-black/65 backdrop-blur-md border border-white/30 flex flex-col items-center justify-center gap-0.5 px-1 shadow-md">
          <span className="text-2xl sm:text-3xl font-black font-num text-yellow-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] leading-none">{count}</span>
          <span className="text-[9.5px] text-white font-extrabold text-center leading-tight drop-shadow">{styles.label}</span>
        </div>
      </div>

      {canReserve && (
        <div className="text-[10px] text-yellow-200 font-bold text-center bg-black/70 rounded px-1.5 py-0.2 border border-yellow-300/30 leading-tight">
          คลิกเพื่อจอง (Reserve)
        </div>
      )}
    </div>
  );
};
