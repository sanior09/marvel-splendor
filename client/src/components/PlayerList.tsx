// ============================================================
//  PlayerList.tsx — Marvel Splendor Scoreboard & AI Indicators
// ============================================================

import React from 'react';
import type { Player, CrystalColor } from '@shared/types/game.types';
import { ALL_CRYSTAL_COLORS } from '@shared/types/game.types';
import { countAvengersSymbols } from '../../../src/engine/WinConditions';
import { STONE_NAMES } from './GemToken';
import marvelAvatarsData from '../data/marvelAvatarsData.json';
import { RankBadge } from './RankBadge';

const resolvePlayerAvatar = (player: Player): string | undefined => {
  if (player.avatarUrl) return player.avatarUrl;
  const lower = player.name.toLowerCase();
  const avatarMap = marvelAvatarsData as Record<string, string>;
  if (lower.includes('doom')) return avatarMap['doctor_doom'] || '/images/avatars/doctor_doom.jpg';
  if (lower.includes('loki')) return avatarMap['loki'] || '/images/avatars/loki.jpg';
  if (lower.includes('thanos')) return avatarMap['thanos'] || '/images/avatars/thanos.jpg';
  if (lower.includes('stark') || lower.includes('iron')) return avatarMap['iron_man'] || '/images/avatars/iron_man.jpg';
  return undefined;
};

interface PlayerListProps {
  players: Player[];
  currentPlayerIndex: number;
  myPlayerId: string;
  targetScore?: number;
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

const ALL_TOKENS_LIST: CrystalColor[] = [
  'topaz',
  'sapphire',
  'emerald',
  'obsidian',
  'amethyst',
  'ruby',
  'gold',
];

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPlayerIndex,
  myPlayerId,
  targetScore = 16,
  onSelectPlayer,
}) => {
  return (
    <div className="glass rounded-xl overflow-hidden border border-white/10 shadow-lg">
      <div className="px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-display text-[11px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1">
          <span>ผู้เล่นในสมรภูมิ</span>
        </h3>
        <span className="text-[9px] text-white/50 uppercase font-semibold">เป้าหมาย: {targetScore} แต้ม</span>
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
                    'w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] text-white shadow overflow-hidden border border-white/20 shrink-0',
                    `bg-gradient-to-br ${AVATAR_GRADIENTS[index % 4]}`,
                    isActive ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-black' : '',
                  ].join(' ')}
                >
                {(() => {
                  const avatarSrc = resolvePlayerAvatar(player);
                  const isDoom = player.name.toLowerCase().includes('doom');
                  const fallbackEmoji = isDoom ? '👑' : player.isBot ? '🤖' : player.name.charAt(0).toUpperCase();
                  return (
                    <>
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={player.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const doomBase64 = (marvelAvatarsData as Record<string, string>)['doctor_doom'];
                            if (isDoom && doomBase64 && target.src !== doomBase64) {
                              target.src = doomBase64;
                              return;
                            }
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = 'block';
                            }
                          }}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : null}
                      <span className={avatarSrc ? 'hidden' : 'block'}>
                        {fallbackEmoji}
                      </span>
                    </>
                  );
                })()}
                </div>
                {isActive && (
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-xs font-bold truncate ${
                      isMe ? 'text-yellow-300' : 'text-white/90'
                    }`}
                  >
                    {player.name}
                  </span>

                  {/* Rank Tag / Badge directly attached after name! */}
                  <RankBadge rank={player.rank} isBot={player.isBot} />

                  {isMe && (
                    <span className="text-[9px] bg-yellow-400/20 text-yellow-300 px-1 rounded font-bold">
                      คุณ
                    </span>
                  )}
                  {player.isBot && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-all ${
                        isActive
                          ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50 animate-pulse inline-flex items-center gap-1'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {isActive ? 'กำลังคิด...' : 'AI BOT'}
                    </span>
                  )}
                </div>

                {/* Progress bar: Stone dots, active tokens & stats */}
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {/* Infinity Stone micro-indicators (card bonuses) */}
                  <div className="flex items-center gap-0.5" title={`โบนัสการ์ดฮีโร่ (${ownedStonesCount}/6 สี)`}>
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

                  <span className="text-white/20 text-[9px]">•</span>

                  {/* Active Tokens Breakdown */}
                  <div className="flex items-center gap-1" title={`มณีในมือ (${totalCrystals}/10)`}>
                    {ALL_TOKENS_LIST.map((c) => {
                      const count = player.crystals[c] ?? 0;
                      if (count === 0) return null;
                      return (
                        <span
                          key={c}
                          className="inline-flex items-center gap-0.5 bg-black/60 border border-white/15 px-1 py-0.2 rounded text-[8.5px] font-bold text-white shadow-sm"
                          title={`${STONE_NAMES[c]}: มี ${count} เหรียญ`}
                        >
                          <img src={`/images/tokens/${c}.png`} alt={c} className="w-3 h-3 object-contain" />
                          <span>{count}</span>
                        </span>
                      );
                    })}
                    {totalCrystals === 0 && (
                      <span className="text-[9px] text-white/30 italic">0 มณี</span>
                    )}
                  </div>

                  <span className="text-white/20 text-[9px]">•</span>

                  <span className="text-[10px] text-white/50 flex items-center gap-1">
                    <span title={`การ์ดที่เกณฑ์แล้ว (${player.ownedCards.length} ใบ)`}>🃏 {player.ownedCards.length}</span>
                    {avengerCount > 0 && (
                      <span className="text-red-400 font-bold" title={`Avengers Assemble: ${avengerCount} ตรา`}>🅰{avengerCount}</span>
                    )}
                    {hasTier3 && (
                      <span className="text-amber-400 font-bold" title="มีฮีโร่ Tier 3">★T3</span>
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
