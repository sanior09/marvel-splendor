// ============================================================
//  PlayerPanel.tsx — Marvel Player Status & Infinity Gauntlet
// ============================================================

import React from 'react';
import type { Player, GameAction, CrystalColor } from '@shared/types/game.types';
import { ALL_CRYSTAL_COLORS } from '@shared/types/game.types';
import { CrystalRow, STONE_NAMES } from './GemToken';
import { CardSlot } from './CardSlot';
import { countAvengersSymbols } from '../../../src/engine/WinConditions';

interface PlayerPanelProps {
  player: Player;
  isMyTurn: boolean;
  onBuyCard: (cardId: string) => void;
  onSendAction: (action: GameAction) => void;
  onViewCards?: () => void;
}

const GAUNTLET_BONUS_STONES: CrystalColor[] = [
  'topaz',     // Mind (Yellow)
  'sapphire',  // Space (Blue)
  'obsidian',  // Soul (Orange)
  'amethyst',  // Power (Purple)
  'ruby',      // Reality (Red)
];

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  isMyTurn,
  onBuyCard,
  onViewCards,
}) => {
  const totalCrystals =
    ALL_CRYSTAL_COLORS.reduce((sum, c) => sum + (player.crystals[c] ?? 0), 0) +
    (player.crystals.gold ?? 0);

  const bonusColors = GAUNTLET_BONUS_STONES.filter((c) => (player.bonuses[c] ?? 0) > 0);
  const avengersCount = countAvengersSymbols(player);
  const hasTimeStone = (player.crystals.emerald ?? 0) >= 1;
  const ownedBonusesCount = GAUNTLET_BONUS_STONES.filter((c) => (player.bonuses[c] ?? 0) > 0).length;
  const totalGauntletProgress = ownedBonusesCount + (hasTimeStone ? 1 : 0);

  return (
    <div className="space-y-1.5">
      {/* Player info banner */}
      <div
        className={[
          'glass rounded-xl px-3 py-1.5 flex items-center gap-2.5 border border-white/10 shadow-md',
          isMyTurn ? 'ring-2 ring-yellow-400/80 bg-yellow-400/10' : '',
        ].join(' ')}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white bg-gradient-to-br from-red-600 to-amber-600 shadow flex-shrink-0">
          {player.isBot ? '🤖' : player.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-xs truncate flex items-center gap-1">
            <span>{player.name}</span>
            {player.isBot && (
              <span className="text-[8px] bg-purple-500/30 text-purple-300 px-1 py-0.2 rounded font-bold">
                AI
              </span>
            )}
          </p>
          <p className="text-[10px] text-white/50 leading-tight">
            {isMyTurn ? (
              <span className="text-yellow-400 font-black animate-pulse">⚡ ถึงตาคุณ (YOUR TURN)</span>
            ) : (
              'รอตา... (Waiting)'
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-black font-display text-yellow-400 leading-none">
            {player.score}
          </div>
          <div className="text-[8px] text-white/40 uppercase tracking-wider">แต้ม (PTS)</div>
        </div>
      </div>

      {/* Infinity Gauntlet Mastery Widget */}
      <div className="glass rounded-xl p-2.5 space-y-1.5 border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-black/40">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="text-sm">🧤</span>
            <h4 className="text-[11px] font-black text-amber-300 uppercase tracking-wider">
              ถุงมืออินฟินิตี้ (Gauntlet)
            </h4>
          </div>
          <span className="text-[10px] font-bold text-amber-400/80">
            {totalGauntletProgress}/6 มณี (Stones)
          </span>
        </div>

        {/* 6 Gauntlet Sockets: 5 Bonuses + 1 Time Stone */}
        <div className="grid grid-cols-6 gap-1 p-1.5 rounded-lg bg-black/40 border border-white/5">
          {GAUNTLET_BONUS_STONES.map((color) => {
            const hasStone = (player.bonuses[color] ?? 0) > 0;
            return (
              <div
                key={color}
                className="flex flex-col items-center gap-0.5"
                title={`${STONE_NAMES[color]}: ${hasStone ? `ได้รับโบนัสแล้ว (${player.bonuses[color]} cards)` : 'ยังขาดโบนัสสีนี้'}`}
              >
                <div
                  className={[
                    'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 relative',
                    hasStone
                      ? 'ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)] scale-105'
                      : 'opacity-25 grayscale border border-white/10',
                  ].join(' ')}
                >
                  <img
                    src={`/images/tokens/${color}.png`}
                    alt={STONE_NAMES[color]}
                    className="w-full h-full object-contain rounded-full"
                  />
                  {hasStone && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[7px] font-black border border-black shadow">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-[7.5px] uppercase tracking-tighter text-white/40 font-semibold truncate w-full text-center">
                  {color.slice(0, 3)}
                </span>
              </div>
            );
          })}

          {/* 6th Socket: Time Stone Token */}
          <div
            className="flex flex-col items-center gap-0.5"
            title={`Time Stone: ${hasTimeStone ? 'ครอบครองแล้ว (โทเคนเขียว)' : 'ยังขาดโทเคน (เกณฑ์ฮีโร่ Tier-3 ใบแรก)'}`}
          >
            <div
              className={[
                'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 relative',
                hasTimeStone
                  ? 'ring-2 ring-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] scale-105'
                  : 'opacity-25 grayscale border border-white/10',
              ].join(' ')}
            >
              <img
                src="/images/tokens/emerald.png"
                alt="Time Stone"
                className="w-full h-full object-contain rounded-full"
              />
              {hasTimeStone && (
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[7px] font-black border border-black shadow">
                  ✓
                </span>
              )}
            </div>
            <span className="text-[7.5px] uppercase tracking-tighter text-emerald-400/70 font-semibold truncate w-full text-center">
              Time
            </span>
          </div>
        </div>

        {/* Win Conditions Checklist */}
        <div className="space-y-0.5 pt-0.5 text-[11px]">
          <WinRequirementRow
            label="แต้มรวม 16+ แต้ม (16+ PTS)"
            met={player.score >= 16}
            current={player.score}
            target={16}
          />
          <WinRequirementRow
            label="โบนัสการ์ดครบ 5 สี (5 Bonuses)"
            met={ownedBonusesCount === 5}
            current={ownedBonusesCount}
            target={5}
          />
          <WinRequirementRow
            label="โทเคนมณีเวลา (Time Stone 🟢)"
            met={hasTimeStone}
            current={hasTimeStone ? 1 : 0}
            target={1}
          />
        </div>
      </div>

      {/* Avengers Symbols Banner */}
      <div className="glass rounded-xl px-3 py-1.5 flex items-center justify-between border border-red-500/20 bg-red-950/20">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 w-5 h-5 rounded-full flex items-center justify-center border border-yellow-300 shadow">
            <span className="text-yellow-300 font-black text-[10px]">A</span>
          </div>
          <span className="text-[11px] font-bold text-white/80">รวมพลังอเวนเจอร์ส (Avengers)</span>
        </div>
        <span className="text-[11px] font-black text-yellow-300 bg-black/40 px-2 py-0.5 rounded-full border border-yellow-400/30">
          {avengersCount} สัญลักษณ์ {avengersCount >= 3 ? '(ถือไทล์)' : ''}
        </span>
      </div>

      {/* Stones in hand */}
      <div className="glass rounded-xl p-2.5 space-y-1.5 border border-white/10">
        <div className="flex justify-between items-center">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/70">
            มณีในมือ (Stones in Hand)
          </h4>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
              totalCrystals >= 10
                ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                : 'bg-white/10 text-white/50'
            }`}
          >
            {totalCrystals}/10
          </span>
        </div>
        <CrystalRow pool={player.crystals} size="sm" hideZero showGold />
      </div>

      {/* Recruited Heroes & Bonuses */}
      <div className="glass rounded-xl p-2.5 space-y-1.5 border border-white/10">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/70">
            ฮีโร่ที่เกณฑ์แล้ว (Recruited: {player.ownedCards.length})
          </h4>
          {onViewCards && (
            <button
              type="button"
              onClick={onViewCards}
              className="text-[10.5px] px-2.5 py-1 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 font-bold border border-yellow-400/40 rounded-lg transition-all flex items-center gap-1 cursor-pointer hover:scale-105 shadow"
              title="เปิดดูการ์ดฮีโร่ทั้งหมดที่คุณเกณฑ์แล้วแบบขยายใหญ่ (View Recruited Heroes)"
            >
              <span>🃏 ดูการ์ดทั้งหมด (View All)</span>
            </button>
          )}
        </div>

        {bonusColors.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {bonusColors.map((color) => (
              <div
                key={color}
                className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-lg border border-white/10 shadow"
                title={`${STONE_NAMES[color]} Stone Bonus: +${player.bonuses[color]}`}
              >
                <img
                  src={`/images/tokens/${color}.png`}
                  alt={STONE_NAMES[color]}
                  className="w-4 h-4 object-contain pointer-events-none drop-shadow"
                />
                <span className="text-xs font-black text-white">+{player.bonuses[color]}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-white/40 italic">
            ยังไม่ได้เกณฑ์ฮีโร่คนใด (No heroes recruited yet)
          </p>
        )}
      </div>

      {/* Reserved cards */}
      {player.reservedCards.length > 0 && (
        <div className="glass rounded-2xl p-4 space-y-3 border border-white/10">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">
              ฮีโร่ที่จองไว้ (Reserved: {player.reservedCards.length}/3)
            </h4>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {player.reservedCards.map((card) => (
              <CardSlot
                key={card.id}
                card={card}
                isMyTurn={isMyTurn}
                currentPlayer={player}
                onBuy={onBuyCard}
                isReserved
              />
            ))}
          </div>
        </div>
      )}

      {/* Marvel Locations Claimed */}
      {player.guardians.length > 0 && (
        <div className="glass rounded-2xl p-4 space-y-2 border border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">
            สถานที่ที่ครอบครอง (Locations Controlled)
          </h4>
          <div className="flex flex-wrap gap-2">
            {player.guardians.map((g) => (
              <div
                key={g.id}
                className="bg-amber-500/10 border border-amber-400/30 rounded-lg px-3 py-1.5 flex items-center justify-between w-full"
              >
                <div className="text-xs font-bold text-amber-200">{g.name}</div>
                <div className="text-xs font-black text-yellow-300">+{g.points} แต้ม (PTS)</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const WinRequirementRow: React.FC<{
  label: string;
  met: boolean;
  current: number;
  target: number;
}> = ({ label, met, current, target }) => (
  <div className="flex items-center justify-between text-[11px]">
    <div className="flex items-center gap-1.5">
      <span className={met ? 'text-emerald-400 font-bold' : 'text-white/30'}>
        {met ? '✓' : '○'}
      </span>
      <span className={met ? 'text-emerald-300 font-semibold' : 'text-white/60'}>{label}</span>
    </div>
    <span className={met ? 'text-emerald-400 font-bold' : 'text-white/40'}>
      {Math.min(current, target)}/{target}
    </span>
  </div>
);
