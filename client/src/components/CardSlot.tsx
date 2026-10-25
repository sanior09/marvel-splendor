// ============================================================
//  CardSlot.tsx — Marvel Collectible Character Card Display
// ============================================================

import React, { useState } from 'react';
import type { Card, Player, CrystalColor } from '@shared/types/game.types';
import { ALL_CRYSTAL_COLORS } from '@shared/types/game.types';
import { soundManager } from '../utils/soundManager';

interface CardSlotProps {
  card: Card | null;
  isMyTurn: boolean;
  currentPlayer: Player;
  onBuy?: (cardId: string) => void;
  onReserve?: (cardId: string) => void;
  isReserved?: boolean;
  /** Show as opponent's hidden reserved card */
  isHidden?: boolean;
}

const TIER_BORDER: Record<number, string> = {
  1: 'border-slate-500/50 shadow-md',
  2: 'border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
  3: 'border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.35)]',
};

const TIER_BG: Record<number, string> = {
  1: 'from-slate-900/90 to-slate-950',
  2: 'from-indigo-950/90 to-purple-950',
  3: 'from-amber-950/90 to-yellow-950',
};

const STONE_NAMES: Record<CrystalColor, string> = {
  ruby: 'Reality',
  sapphire: 'Space',
  emerald: 'Time',
  obsidian: 'Soul',
  topaz: 'Mind',
  amethyst: 'Power',
  gold: 'S.H.I.E.L.D.',
};

const STONE_EFFECTS: Record<CrystalColor, { color: string; glow: string; glowAlpha: string }> = {
  ruby: {
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.85)',
    glowAlpha: 'rgba(239, 68, 68, 0.55)',
  },
  sapphire: {
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.85)',
    glowAlpha: 'rgba(59, 130, 246, 0.55)',
  },
  obsidian: {
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.85)',
    glowAlpha: 'rgba(249, 115, 22, 0.55)',
  },
  topaz: {
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.85)',
    glowAlpha: 'rgba(234, 179, 8, 0.55)',
  },
  amethyst: {
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.85)',
    glowAlpha: 'rgba(168, 85, 247, 0.55)',
  },
  emerald: {
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.85)',
    glowAlpha: 'rgba(16, 185, 129, 0.55)',
  },
  gold: {
    color: '#e2e8f0',
    glow: 'rgba(226, 232, 240, 0.85)',
    glowAlpha: 'rgba(226, 232, 240, 0.55)',
  },
};

export function computeAffordability(card: Card, player: Player): { canAfford: boolean; goldNeeded: number } {
  let goldNeeded = 0;
  for (const color of ALL_CRYSTAL_COLORS) {
    const cost = card.cost[color] ?? 0;
    const have = (player.crystals[color] ?? 0) + (player.bonuses[color] ?? 0);
    if (have < cost) {
      goldNeeded += cost - have;
    }
  }
  return { canAfford: goldNeeded <= (player.crystals.gold ?? 0), goldNeeded };
}

export const CardSlot: React.FC<CardSlotProps> = ({
  card,
  isMyTurn,
  currentPlayer,
  onBuy,
  onReserve,
  isReserved = false,
  isHidden = false,
}) => {
  // Empty slot
  if (!card) {
    return (
      <div className="w-28 h-[136px] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center bg-black/20">
        <span className="text-white/20 text-2xl">✦</span>
      </div>
    );
  }

  // Opponent's hidden reserved card
  if (isHidden) {
    return (
      <div className={`w-28 h-[136px] rounded-xl bg-gradient-to-b border ${TIER_BORDER[card.tier]} ${TIER_BG[card.tier]} flex items-center justify-center`}>
        <div className="text-center space-y-1">
          <div className="text-3xl opacity-40">🔒</div>
          <div className="text-[10px] text-white/60 font-semibold tracking-wider uppercase">Tier {card.tier} (จองไว้)</div>
        </div>
      </div>
    );
  }

  const { canAfford, goldNeeded } = computeAffordability(card, currentPlayer);
  const canReserve = !isReserved && currentPlayer.reservedCards.length < 3;
  const nonZeroCosts = ALL_CRYSTAL_COLORS.filter((c) => (card.cost[c] ?? 0) > 0);
  const [showMobileActions, setShowMobileActions] = useState<boolean>(false);
  const stoneEffect = STONE_EFFECTS[card.bonusColor] ?? STONE_EFFECTS.ruby;

  return (
    <div className="relative group select-none">
      {/* ── Under-Card Ambient Glow Beam (แสงนีออนสะท้อนใต้การ์ดตามสีเหรียญ) ── */}
      <div
        className="absolute -bottom-2 inset-x-2 h-4 rounded-full blur-md opacity-65 group-hover:opacity-100 group-hover:h-5 group-hover:-bottom-2.5 transition-all duration-300 pointer-events-none z-0"
        style={{
          backgroundColor: stoneEffect.glow,
          boxShadow: `0 4px 18px 4px ${stoneEffect.glow}`,
        }}
      />
      {/* Under-Card Center Intense Line */}
      <div
        className="absolute -bottom-0.5 inset-x-3.5 h-[2px] rounded-full blur-[1px] opacity-85 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-0"
        style={{
          backgroundColor: stoneEffect.color,
          boxShadow: `0 0 10px 2px ${stoneEffect.color}`,
        }}
      />

      {/* ── Card Main Container ── */}
      <div
        className={[
          'relative artifact-card w-28 h-[136px] rounded-xl border-2 flex flex-col overflow-hidden transition-all duration-200 z-10',
          TIER_BORDER[card.tier],
          canAfford && isMyTurn ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-black' : '',
          isMyTurn ? 'cursor-pointer' : '',
        ].join(' ')}
        style={{
          boxShadow: `0 10px 22px -4px ${stoneEffect.glowAlpha}`,
        }}
        id={`card-${card.id}`}
        onClick={() => {
          if (isMyTurn) {
            setShowMobileActions((prev) => !prev);
          }
        }}
      >
      {/* Fallback gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${TIER_BG[card.tier]} z-0`} />

      {/* Real Character Portrait Image */}
      <img
        src={`/images/cards/${card.id}.jpg`}
        alt={card.name}
        className="absolute inset-0 w-full h-full object-cover object-top z-0 transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 z-0 pointer-events-none" />

      {/* Top HUD: Points, Avengers Badge, Bonus Stone */}
      <div className="relative z-10 p-1 flex items-start justify-between pointer-events-none">
        {/* Left: Points & Avengers Symbol */}
        <div className="flex items-center gap-1">
          {card.points > 0 && (
            <div className="bg-slate-950/95 backdrop-blur-md border-2 border-yellow-400 text-yellow-300 font-black font-num text-sm sm:text-base px-2 py-0.5 rounded-lg shadow-[0_0_8px_rgba(250,204,21,0.5)] leading-none">
              {card.points}
            </div>
          )}
          {(() => {
            const count = typeof card.avengersCount === 'number'
              ? card.avengersCount
              : typeof card.avengersSymbol === 'number'
              ? card.avengersSymbol
              : card.avengersSymbol
              ? 1
              : 0;
            if (count <= 0) return null;
            return (
              <div
                className="flex items-center -space-x-1.5"
                title={`ตรา Avengers ${count} สัญลักษณ์ (Counts toward Avengers Assemble +3 pts)`}
              >
                {Array.from({ length: count }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-5 h-5 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-950 flex items-center justify-center border border-yellow-300 shadow-md ring-1 ring-black/50 relative z-[1]"
                  >
                    <span className="text-yellow-300 font-black text-[11px] font-num leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] select-none">
                      A
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Right: Permanent Stone Bonus */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
          title={`Permanent ${STONE_NAMES[card.bonusColor]} Stone Bonus`}
        >
          <img
            src={`/images/tokens/${card.bonusColor}.png`}
            alt={STONE_NAMES[card.bonusColor]}
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* Bottom HUD: Cost list on left, Hero name banner at bottom */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-1 pointer-events-none">
        {/* Cost Tokens Stack: 2-column grid when 3+ costs to keep vertical height compact */}
        <div className={`grid ${nonZeroCosts.length >= 3 ? 'grid-cols-2 gap-x-1' : 'grid-cols-1'} gap-y-0.5 mb-1 w-fit`}>
          {nonZeroCosts.map((color) => {
            const costAmt = card.cost[color] ?? 0;
            const have = (currentPlayer.crystals[color] ?? 0) + (currentPlayer.bonuses[color] ?? 0);
            const short = Math.max(0, costAmt - have);
            return (
              <div
                key={color}
                className={`w-fit flex items-center gap-1 bg-slate-950/95 backdrop-blur-md rounded-full pl-0.5 pr-1.5 py-0.5 border shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                  short > 0 ? 'border-red-500/60 bg-red-950/60' : 'border-white/30'
                }`}
                title={`${STONE_NAMES[color]} Stone cost: ${costAmt} (You have: ${have})`}
              >
                <img
                  src={`/images/tokens/${color}.png`}
                  alt={color}
                  className="w-4 h-4 object-contain pointer-events-none flex-shrink-0 drop-shadow"
                />
                <span
                  className={`text-[11px] font-black font-num leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
                    short > 0 ? 'text-rose-300' : 'text-white'
                  }`}
                >
                  {costAmt}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hero Character Name Banner (Always 100% visible and razor-sharp) */}
        <div className="bg-black/95 backdrop-blur-md rounded border border-white/30 px-1 py-0.5 text-center shadow-md w-full">
          <span className="text-white font-bold text-[10px] tracking-wide truncate block" title={card.name}>
            {card.name}
          </span>
        </div>
      </div>

      {/* Interactive Action Buttons (On Player Turn) — Both Desktop Hover and Mobile Touch/Tap */}
      {isMyTurn && (
        <div
          className={[
            'absolute inset-x-0 bottom-0 flex flex-col transition-all duration-150 z-30 shadow-2xl bg-black/95 backdrop-blur-md border-t border-white/20',
            showMobileActions ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto',
          ].join(' ')}
        >
          <div className="px-1.5 py-0.5 flex items-center justify-between text-yellow-300 font-extrabold text-[10px] tracking-wider bg-white/5 border-b border-white/10">
            <span className="truncate flex-1 text-center" title={card.name}>{card.name}</span>
            {showMobileActions && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileActions(false);
                }}
                className="text-white/60 hover:text-white px-1 text-xs leading-none"
                title="ปิด (Close)"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex">
            {onBuy && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileActions(false);
                  onBuy(card.id);
                }}
                disabled={!canAfford}
                title={
                  canAfford
                    ? `ซื้อ (Buy) ${card.name}${goldNeeded > 0 ? ` (ใช้ ${goldNeeded} S.H.I.E.L.D.)` : ''}`
                    : 'อัญมณีไม่เพียงพอที่จะซื้อการ์ดใบนี้ (Cannot afford)'
                }
                className={[
                  'flex-1 py-2 text-[10.5px] font-extrabold uppercase tracking-wide transition-colors',
                  canAfford
                    ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-black/90 text-white/30 cursor-not-allowed',
                ].join(' ')}
              >
                ซื้อ (Buy)
              </button>
            )}
            {onReserve && !isReserved && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileActions(false);
                  soundManager.playCardReserve();
                  onReserve(card.id);
                }}
                disabled={!canReserve}
                title={canReserve ? 'จองการ์ด (Reserve) + รับ 1 โทเคน S.H.I.E.L.D.' : 'จองการ์ดได้สูงสุด 3 ใบ (Maximum 3)'}
                className={[
                  'flex-1 py-2 text-[10.5px] font-extrabold uppercase tracking-wide transition-colors border-l border-white/20',
                  canReserve
                    ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white cursor-pointer'
                    : 'bg-black/90 text-white/30 cursor-not-allowed',
                ].join(' ')}
              >
                จอง (Rsv)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom neon base border matching card bonus coin */}
      <div
        className="absolute bottom-0 inset-x-0 h-[2.5px] z-20 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundColor: stoneEffect.color,
          boxShadow: `0 0 10px 2px ${stoneEffect.color}`,
        }}
      />
    </div>
  </div>
  );
};

