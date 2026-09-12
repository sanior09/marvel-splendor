// ============================================================
//  CardSlot.tsx — Marvel Collectible Character Card Display
// ============================================================

import React from 'react';
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

function computeAffordability(card: Card, player: Player): { canAfford: boolean; goldNeeded: number } {
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

  return (
    <div
      className={[
        'relative artifact-card w-28 h-[136px] rounded-xl border-2 flex flex-col overflow-hidden group select-none transition-all duration-200',
        TIER_BORDER[card.tier],
        canAfford && isMyTurn ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-black' : '',
      ].join(' ')}
      id={`card-${card.id}`}
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
            <div className="bg-black/70 backdrop-blur-sm border border-yellow-400/50 text-yellow-300 font-black text-sm px-1.5 py-0.5 rounded shadow leading-none">
              {card.points}
            </div>
          )}
          {card.avengersSymbol && (
            <div
              className="bg-red-600/90 w-5 h-5 rounded-full flex items-center justify-center border border-yellow-300 shadow-md"
              title="Avengers Symbol (Counts toward Avengers Assemble +3 pts)"
            >
              <span className="text-yellow-300 font-black text-[11px] leading-none">A</span>
            </div>
          )}
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
                className="w-fit flex items-center gap-0.5 bg-black/85 backdrop-blur-sm rounded-full pl-0.5 pr-1.5 py-0.5 border border-white/15 shadow"
                title={`${STONE_NAMES[color]} Stone cost: ${costAmt} (You have: ${have})`}
              >
                <img
                  src={`/images/tokens/${color}.png`}
                  alt={color}
                  className="w-3.5 h-3.5 object-contain pointer-events-none flex-shrink-0"
                />
                <span
                  className={`text-[9.5px] font-black leading-none ${
                    short > 0 ? 'text-red-300' : 'text-white'
                  }`}
                >
                  {costAmt}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hero Character Name Banner (Always 100% visible and un-sunken) */}
        <div className="bg-black/90 backdrop-blur-md rounded border border-white/20 px-1 py-0.5 text-center shadow-md w-full">
          <span className="text-white font-extrabold text-[9.5px] tracking-wide truncate block text-shadow" title={card.name}>
            {card.name}
          </span>
        </div>
      </div>

      {/* Interactive Action Buttons (On Player Turn) — Includes Hero Name on Hover */}
      {isMyTurn && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col opacity-0 group-hover:opacity-100 transition-all duration-150 z-30 shadow-2xl bg-black/95 backdrop-blur-md border-t border-white/20">
          <div className="px-1 py-0.5 text-center text-yellow-300 font-extrabold text-[10px] tracking-wider truncate bg-white/5 border-b border-white/10" title={card.name}>
            {card.name}
          </div>
          <div className="flex">
            {onBuy && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundManager.playCardBuy(card.tier);
                  onBuy(card.id);
                }}
                disabled={!canAfford}
                title={
                  canAfford
                    ? `ซื้อ (Buy) ${card.name}${goldNeeded > 0 ? ` (ใช้ ${goldNeeded} S.H.I.E.L.D.)` : ''}`
                    : 'อัญมณีไม่เพียงพอที่จะซื้อการ์ดใบนี้ (Cannot afford)'
                }
                className={[
                  'flex-1 py-1.5 text-[10px] font-extrabold uppercase tracking-wide transition-colors',
                  canAfford
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
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
                  soundManager.playCardReserve();
                  onReserve(card.id);
                }}
                disabled={!canReserve}
                title={canReserve ? 'จองการ์ด (Reserve) + รับ 1 โทเคน S.H.I.E.L.D.' : 'จองการ์ดได้สูงสุด 3 ใบ (Maximum 3)'}
                className={[
                  'flex-1 py-1.5 text-[10px] font-extrabold uppercase tracking-wide transition-colors border-l border-white/20',
                  canReserve
                    ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                    : 'bg-black/90 text-white/30 cursor-not-allowed',
                ].join(' ')}
              >
                จอง (Rsv)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
