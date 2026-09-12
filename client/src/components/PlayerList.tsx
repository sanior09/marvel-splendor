// ============================================================
//  PlayerList.tsx — Marvel Splendor Scoreboard & AI Indicators
// ============================================================

import React from 'react';
import type { Player } from '@shared/types/game.types';
import { ALL_CRYSTAL_COLORS } from '@shared/types/game.types';
import { countAvengersSymbols } from '../../../src/engine/WinConditions';

interface PlayerListProps {
  players: Player[];
  currentPlayerIndex: number;
  myPlayerId: string;
  onSelectPlayer?: (player: Player) => void;
}

const AVATAR_GRADIENTS = [
  'from-red-600 to-rose-700',
  'from-blue-600 to-indigo-700',
  'from-purple-600 to-violet-700',
  'from-amber-600 to-yellow-700',
];

const STONE_ORDER: (keyof Player['bonuses'])[] = [
  'ruby',
  'sapphire',
  'emerald',
  'obsidian',
  'topaz',
  'amethyst',
];

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPlayerIndex,
  myPlayerId,
  onSelectPlayer,
}) => {
  return (
    <div className="glass rounded-xl overflow-hidden border border-white/10 shadow-lg">
      <div className="px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-display text-[11px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1">
          <span>ผู้เล่นในเกม (Marvel Rivals)</span>
        </h3>
        <span className="text-[9px] text-white/50 uppercase font-semibold">ชนะ (Win): 16 PTS</span>
      </div>
      <div className="divide-y divide-white/5">
        {players.map((player, index) => {
          const isActive = index === currentPlayerIndex;
          const isMe = player.id === myPlayerId;
          const totalCrystals =
            ALL_CRYSTAL_COLORS.reduce((sum, c) => sum + (player.crystals[c] ?? 0), 0) +
            (player.crystals.gold ?? 0);
          const avengerCount = countAvengersSymbols(player);
          const ownedStonesCount = STONE_ORDER.filter((c) => (player.bonuses[c] ?? 0) > 0).length;
          const hasTier3 = player.ownedCards.some((c) => c.tier === 3);

          return (
            <div
              key={player.id}
              onClick={() => onSelectPlayer?.(player)}
              className={[
                'px-3 py-1.5 flex items-center gap-2.5 transition-all cursor-pointer select-none',
                isActive ? 'bg-yellow-400/10 border-l-4 border-yellow-400' : 'hover:bg-white/5',
              ].join(' ')}
              title={`คลิกเพื่อดูการ์ดฮีโร่ของ ${player.name} (${player.ownedCards.length} ใบ)`}
            >
              {/* Avatar */}
              <div className="relative">
                <div
                  className={[
                    'w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px] text-white shadow',
                    `bg-gradient-to-br ${AVATAR_GRADIENTS[index % 4]}`,
                    isActive ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-black' : '',
                  ].join(' ')}
                >
                  {player.isBot ? '🤖' : player.name.charAt(0).toUpperCase()}
                </div>
                {isActive && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold truncate ${
                      isMe ? 'text-yellow-300' : 'text-white/90'
                    }`}
                  >
                    {player.name}
                  </span>
                  {isMe && (
                    <span className="text-[9px] bg-yellow-400/20 text-yellow-300 px-1 rounded font-bold">
                      คุณ (YOU)
                    </span>
                  )}
                  {player.isBot && (
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1 rounded font-bold">
                      บอท (BOT)
                    </span>
                  )}
                </div>

                {/* Progress bar: Stone dots & stats */}
                <div className="flex items-center gap-2 mt-1">
                  {/* Infinity Stone micro-indicators */}
                  <div className="flex items-center gap-0.5" title={`${ownedStonesCount}/6 Infinity Stones`}>
                    {STONE_ORDER.map((stoneColor) => {
                      const owned = (player.bonuses[stoneColor] ?? 0) > 0;
                      return (
                        <div
                          key={stoneColor}
                          className={`w-2 h-2 rounded-full ${
                            owned
                              ? `crystal-${stoneColor} ring-1 ring-white/60 shadow-sm`
                              : 'bg-white/10 border border-white/10'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <span className="text-[10px] text-white/40">
                    Stones: {totalCrystals} | 🃏 {player.ownedCards.length}
                    {avengerCount > 0 && (
                      <span className="text-red-400 font-bold ml-1">🅰{avengerCount}</span>
                    )}
                    {hasTier3 && (
                      <span className="text-amber-400 font-bold ml-1" title="Has Tier 3 Card">★T3</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div
                  className={[
                    'text-base font-black font-display leading-tight',
                    isActive ? 'text-yellow-300' : 'text-white/80',
                  ].join(' ')}
                >
                  {player.score}
                </div>
                <div className="text-[8px] text-white/30 uppercase tracking-wider">PTS</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
