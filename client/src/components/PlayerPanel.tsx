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
  holdsAvengersAssemble?: boolean;
  targetScore?: number;
  onBuyCard: (cardId: string) => void;
  onSendAction: (action: GameAction) => void;
  onViewCards?: (color?: CrystalColor) => void;
}

const GAUNTLET_BONUS_STONES: CrystalColor[] = [
  'topaz',     // Mind (Yellow)
  'sapphire',  // Space (Blue)
  'obsidian',  // Soul (Orange)
  'amethyst',  // Power (Purple)
  'ruby',      // Reality (Red)
];

const CARD_BONUS_THEMES: Record<
  string,
  {
    border: string;
    bgActive: string;
    glow: string;
    textColor: string;
  }
> = {
  topaz: {
    border: 'border-yellow-400/80',
    bgActive: 'bg-gradient-to-b from-amber-500/30 via-yellow-950/40 to-black/90',
    glow: 'shadow-[0_0_10px_rgba(250,204,21,0.4)]',
    textColor: 'text-yellow-300',
  },
  sapphire: {
    border: 'border-blue-400/80',
    bgActive: 'bg-gradient-to-b from-blue-600/30 via-blue-950/40 to-black/90',
    glow: 'shadow-[0_0_10px_rgba(96,165,250,0.4)]',
    textColor: 'text-blue-300',
  },
  obsidian: {
    border: 'border-orange-400/80',
    bgActive: 'bg-gradient-to-b from-orange-600/30 via-orange-950/40 to-black/90',
    glow: 'shadow-[0_0_10px_rgba(251,146,60,0.4)]',
    textColor: 'text-orange-300',
  },
  amethyst: {
    border: 'border-purple-400/80',
    bgActive: 'bg-gradient-to-b from-purple-600/30 via-purple-950/40 to-black/90',
    glow: 'shadow-[0_0_10px_rgba(192,132,252,0.4)]',
    textColor: 'text-purple-300',
  },
  ruby: {
    border: 'border-red-500/80',
    bgActive: 'bg-gradient-to-b from-red-600/30 via-red-950/40 to-black/90',
    glow: 'shadow-[0_0_10px_rgba(239,68,68,0.4)]',
    textColor: 'text-red-300',
  },
};

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  isMyTurn,
  targetScore = 16,
  onBuyCard,
  onViewCards,
}) => {
  const totalCrystals =
    ALL_CRYSTAL_COLORS.reduce((sum, c) => sum + (player.crystals[c] ?? 0), 0) +
    (player.crystals.gold ?? 0);

  const avengersCount = countAvengersSymbols(player);
  const hasTimeStone = (player.crystals.emerald ?? 0) >= 1;
  const ownedBonusesCount = GAUNTLET_BONUS_STONES.filter((c) => (player.bonuses[c] ?? 0) > 0).length;
  const totalGauntletProgress = ownedBonusesCount + (hasTimeStone ? 1 : 0);

  return (
    <div className="space-y-1.5">
      {/* Infinity Gauntlet Mastery Widget */}
      <div className="glass rounded-xl p-2.5 space-y-1.5 border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-black/40">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="text-sm">🧤</span>
            <h4 className="text-[11px] font-black text-amber-300 uppercase tracking-wider">
              Infinity Gauntlet
            </h4>
          </div>
          <span className="font-num font-black text-amber-300 text-xs">{totalGauntletProgress}<span className="text-amber-500/60 font-normal">/6</span></span>
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
            label={`แต้มรวม ${targetScore}+ แต้ม (${targetScore}+ PTS)`}
            met={player.score >= targetScore}
            current={player.score}
            target={targetScore}
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
          <div className="bg-red-600 w-5 h-5 rounded-full flex items-center justify-center border border-yellow-300/80 shadow">
            <span className="text-yellow-300 font-black text-[10px]">A</span>
          </div>
          <span className="text-[11px] font-bold text-white/70">Avengers</span>
        </div>
        <span className="text-[11px] font-black text-yellow-300 bg-black/60 px-2.5 py-0.5 rounded-full border border-yellow-400/30 shadow-sm">
          <span className="font-num text-xs">{avengersCount}</span>
          <span className="text-white/40 font-normal ml-1 text-[9px]">{avengersCount >= 3 ? 'ไทล์' : 'สัญลักษณ์'}</span>
        </span>
      </div>

      {/* Stones in hand & Hero Discount Cards */}
      <div className="glass rounded-xl p-2.5 space-y-2 border border-white/10">
        {/* Row 1: Stones in Hand */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">💎</span>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                มณีในมือ
              </h4>
            </div>
            <span
              className={`text-xs font-black font-num px-2 py-0.5 rounded-full shadow-sm ${
                totalCrystals >= 10
                  ? 'bg-red-500/30 text-red-300 border border-red-500/50 animate-pulse'
                  : 'bg-black/60 text-yellow-300 border border-white/20'
              }`}
            >
              {totalCrystals}/10
            </span>
          </div>
          {totalCrystals > 0 ? (
            <CrystalRow pool={player.crystals} size="sm" hideZero showGold />
          ) : (
            <p className="text-[10px] text-white/40 italic py-0.5">
              ไม่มีมณีในมือ (หยิบมณีจากคลังด้านซ้าย)
            </p>
          )}
        </div>

        {/* Row 2: Hero Card Discounts (ไพ่ที่เอาไปแลกซื้อการ์ด แสดงเป็นการ์ดแต่ละสีพร้อมตัวเลข) */}
        <div className="border-t border-white/10 pt-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🃏</span>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-yellow-300/80">
                ส่วนลด
                <span className="ml-1 font-num font-black text-yellow-300">{player.ownedCards.length}</span>
                <span className="text-white/30 font-normal"> ใบ</span>
              </h4>
            </div>
            {onViewCards && (
              <button
                type="button"
                onClick={() => onViewCards()}
                className="text-[10px] px-2 py-0.5 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 font-bold border border-yellow-400/40 rounded-lg transition-all flex items-center gap-1 cursor-pointer hover:scale-105 shadow"
                title="เปิดดูสมุดการ์ดฮีโร่ทั้งหมดที่คุณเกณฑ์แล้ว (View Recruited Heroes)"
              >
                <span>ดูสมุดการ์ด ➔</span>
              </button>
            )}
          </div>

          {/* 5 Mini Discount Cards Row */}
          <div className="grid grid-cols-5 gap-1">
            {GAUNTLET_BONUS_STONES.map((color) => {
              const count = player.bonuses[color] ?? 0;
              const theme = CARD_BONUS_THEMES[color];
              const isOwned = count > 0;
              return (
                <div
                  key={color}
                  onClick={() => onViewCards?.(color)}
                  className={[
                    'relative rounded-lg border flex flex-col items-center justify-between p-1 transition-all duration-200 select-none cursor-pointer group',
                    'aspect-[3/4] min-h-[56px]',
                    isOwned
                      ? `${theme.border} ${theme.bgActive} ${theme.glow} hover:scale-105 hover:brightness-110`
                      : 'border-white/10 bg-black/40 opacity-40 hover:opacity-75',
                  ].join(' ')}
                  title={`ไพ่ฮีโร่สี${color} (${STONE_NAMES[color]}): มี ${count} ใบ (ส่วนลดถาวร +${count}) - คลิกเพื่อเปิดดู`}
                >
                  {/* Top: Gem Token Icon */}
                  <div className="w-4 h-4 flex items-center justify-center">
                    <img
                      src={`/images/tokens/${color}.png`}
                      alt={STONE_NAMES[color]}
                      className={`w-full h-full object-contain pointer-events-none drop-shadow ${
                        isOwned ? '' : 'grayscale-[40%]'
                      }`}
                    />
                  </div>

                  {/* Center: Big Bold Count */}
                  <div className="flex flex-col items-center justify-center -my-0.5">
                    <span
                      className={[
                        'font-black font-num text-lg sm:text-xl leading-none transition-all',
                        isOwned
                          ? `${theme.textColor} drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] scale-105`
                          : 'text-white/30',
                      ].join(' ')}
                    >
                      {count}
                    </span>
                  </div>

                  {/* Bottom: Label 'X ใบ' */}
                  <span
                    className={[
                      'text-[7.5px] font-bold tracking-tight uppercase leading-none',
                      isOwned ? 'text-white/90 font-black' : 'text-white/30',
                    ].join(' ')}
                  >
                    {count} ใบ
                  </span>
                </div>
              );
            })}
          </div>
        </div>
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
  <div className="flex items-center justify-between text-[11px] py-0.5">
    <div className="flex items-center gap-1.5">
      {/* Dot indicator — more visual than ASCII ✓/○ */}
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300"
        style={{
          background: met
            ? 'radial-gradient(circle at 35% 35%, #6ee7b7, #10b981)'
            : 'rgba(255,255,255,0.12)',
          boxShadow: met ? '0 0 6px rgba(16,185,129,0.6)' : 'none',
        }}
      />
      <span className={met ? 'text-emerald-300 font-semibold' : 'text-white/55'}>{label}</span>
    </div>
    <span className={`font-num font-black text-xs ${met ? 'text-emerald-300' : 'text-white/60'}`}>
      {Math.min(current, target)}<span className="text-white/30 font-normal">/{target}</span>
    </span>
  </div>
);
