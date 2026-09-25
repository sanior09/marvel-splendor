import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Player } from '@shared/types/game.types';
import { soundManager } from '../utils/soundManager';
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

import type { UserProfile } from '../hooks/useAuth';

interface GameOverProps {
  winners: string[];
  players: Player[];
  myPlayerId: string;
  onLeave: () => void;
  gameOverData?: { winners: string[]; xpData?: Record<string, any> } | null;
  userProfile?: UserProfile | null;
  refreshProfile?: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  winners,
  players,
  myPlayerId,
  onLeave,
  gameOverData,
  userProfile,
  refreshProfile,
}) => {
  const winnerPlayers = players.filter((p) => winners.includes(p.id));
  const isIWon = winners.includes(myPlayerId);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const myPlayer = players.find((p) => p.id === myPlayerId);

  useEffect(() => {
    soundManager.playVictory();
    if (refreshProfile) {
      refreshProfile();
    }
  }, [refreshProfile]);

  // XP & Rank Calculations
  const myXpData = gameOverData?.xpData?.[myPlayerId];
  const fallbackTier3Count = myPlayer ? myPlayer.ownedCards.filter((c) => c.tier === 3).length : 0;
  const fallbackGuardianCount = myPlayer?.guardians.length ?? 0;
  const fallbackBonusXP = (fallbackTier3Count * 3) + (fallbackGuardianCount * 5);
  const fallbackBaseXP = 15;
  const fallbackWinXP = isIWon ? 35 : 0;
  const fallbackXpGained = fallbackBaseXP + fallbackWinXP + fallbackBonusXP;

  const displayXpGained = myXpData?.xpGained ?? fallbackXpGained;
  const breakdown = myXpData?.breakdown ?? {
    baseXP: fallbackBaseXP,
    winXP: fallbackWinXP,
    bonusXP: fallbackBonusXP,
  };

  const activeProfile = myXpData?.profile ?? userProfile;
  const currentRank = activeProfile?.rank;
  const nextRank = activeProfile?.nextRank;
  const xpToNextRank = activeProfile?.xpToNextRank;
  const isOwner = Boolean(currentRank?.isOwner || (activeProfile && activeProfile.xp >= 50000));

  const xpPercent = (activeProfile && nextRank)
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((activeProfile.xp - currentRank!.minXP) / (nextRank.minXP - currentRank!.minXP)) * 100
          )
        )
      )
    : 100;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-xl" />

      {/* Scrollable wrapper */}
      <div className="relative min-h-full flex items-center justify-center p-4 py-6">
      {/* Card */}
      <div className="relative glass-strong rounded-3xl p-5 sm:p-10 max-w-lg w-full text-center space-y-5 sm:space-y-7 border border-yellow-400/30 shadow-[0_0_90px_rgba(245,158,11,0.25)] animate-slide-up">
        {/* Marvel Badge */}
        <div className="flex items-center justify-center gap-2">
          <span className="marvel-badge px-3 py-0.5 rounded text-base font-black">MARVEL</span>
          <span className="font-display font-black text-xl text-white tracking-widest">
            SPLENDOR
          </span>
        </div>

        {/* Win/Lose header */}
        <div className="space-y-2">
          <div className="text-5xl sm:text-7xl">{isIWon ? '🧤' : '🎖️'}</div>
          <h1
            className={[
              'font-display text-2xl sm:text-4xl font-black uppercase tracking-wider',
              isIWon ? 'shimmer-text' : 'text-white/90',
            ].join(' ')}
          >
            {isIWon ? 'ชัยชนะแห่งจักรวาล!' : 'จบการแข่งขัน'}
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-sm mx-auto">
            {isIWon
              ? 'คุณรวบรวมมณีครบทั้ง 6 ชนิดและครอบครอง Infinity Gauntlet สำเร็จ!'
              : `${winnerPlayers.map((p) => p.name).join(' & ')} รวบรวม Infinity Gauntlet สำเร็จและชนะเกมนี้!`}
          </p>
        </div>

        {/* ── EXP & Rank Progression Card ── */}
        <div
          className="rounded-2xl p-4 sm:p-5 text-left border relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 20, 50, 0.85) 0%, rgba(12, 10, 24, 0.95) 100%)',
            borderColor: isOwner ? 'rgba(255, 215, 0, 0.6)' : 'rgba(168, 85, 247, 0.4)',
            boxShadow: isOwner
              ? '0 10px 30px rgba(255, 0, 128, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.15)'
              : '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(168, 85, 247, 0.12)',
          }}
        >
          {/* Top Row: Title & XP Gained Pill */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <div className="text-white font-black text-sm uppercase tracking-wider">
                สรุป EXP
              </div>
            </div>

            {/* Glowing XP Gained Pill */}
            <div
              className="px-3 py-1 rounded-full flex items-center gap-1.5 border font-black text-xs shadow-lg animate-pulse"
              style={{
                background: 'linear-gradient(90deg, #f59e0b, #ec4899)',
                borderColor: '#fef08a',
                color: '#ffffff',
                boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)',
              }}
            >
              <span>+<span className="font-num font-black">{displayXpGained}</span> EXP</span>
            </div>
          </div>

          {/* XP Breakdown Details */}
          <div className="flex flex-wrap gap-1.5 mb-3 text-[11px]">
            <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80 flex items-center gap-1">
              <span>🎮 เล่นจบ</span>
              <strong className="text-white font-black font-num">+{breakdown.baseXP}</strong>
            </span>
            {breakdown.winXP > 0 && (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30 text-amber-300 font-bold flex items-center gap-1">
                <span>🏆 ชนะเกม</span>
                <strong className="font-num font-black">+{breakdown.winXP}</strong>
              </span>
            )}
            {breakdown.bonusXP > 0 && (
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-400/30 text-purple-300 flex items-center gap-1">
                <span>✨ โบนัสการ์ด/สถานที่</span>
                <strong className="font-num font-black">+{breakdown.bonusXP}</strong>
              </span>
            )}
          </div>

          {/* Current Rank & Next Rank Progress */}
          {activeProfile && currentRank ? (
            <div className="space-y-2 pt-3 border-t border-white/10">
              {/* Rank title row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`text-2xl ${isOwner ? 'animate-bounce' : ''}`}>{currentRank.icon}</span>
                  <div>
                    <div className="text-[10px] text-white/40">ยศปัจจุบัน</div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span style={{ color: currentRank.color }}>{currentRank.name}</span>
                    </div>
                  </div>
                </div>

                {/* Total XP */}
                <div className="text-right">
                  <div className="text-[10px] text-white/50">EXP รวมสะสม</div>
                  <div className="text-sm font-black font-num text-amber-300">
                    {activeProfile.xp.toLocaleString()} XP
                  </div>
                </div>
              </div>

              {/* Progress Bar towards Next Rank */}
              {nextRank ? (
                <div className="space-y-1 pt-1">
                  <div className="h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/10 relative">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${xpPercent}%`,
                        background: `linear-gradient(90deg, ${currentRank.color}, #ffd700, #ff007f)`,
                        boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                      }}
                    />
                  </div>

                  {/* Next rank highlight banner */}
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-amber-300 font-bold flex items-center gap-1 flex-wrap">
                      <span>🚀 อีก <span className="font-num font-black">{xpToNextRank?.toLocaleString()}</span> XP</span>
                      <span className="text-white/60">จะเลื่อนสู่ยศ</span>
                      <span className="text-white font-extrabold underline decoration-amber-400">
                        {nextRank.name} {nextRank.icon}
                      </span>
                    </span>
                    <span className="text-white/40 text-[10px] font-num">{xpPercent}%</span>
                  </div>
                </div>
              ) : (
                <div className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-400/40 text-center">
                  <span className="text-xs font-black text-amber-300 flex items-center justify-center gap-1.5">
                    <span>👑</span>
                    <span>ท่านอยู่ในระดับสูงสุดแห่งจักรวาลแล้ว (MAX RANK)</span>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-2 border-t border-white/10 text-center text-xs text-white/50">
              💡 คุณเล่นเป็นผู้เยี่ยมชม — เข้าสู่ระบบเพื่อสะสมแต้ม EXP และไต่แรงก์ถาวร
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="glass rounded-2xl overflow-hidden border border-white/10">
          <div className="px-4 py-2 border-b border-white/10 bg-black/30">
            <span className="text-xs text-white/50 uppercase tracking-widest font-bold">
              ผลการแข่งขัน
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {sortedPlayers.map((player, rank) => {
              const isWinner = winners.includes(player.id);
              const isMe = player.id === myPlayerId;
              const medals = ['🥇', '🥈', '🥉', '4️⃣'];
              return (
                <div
                  key={player.id}
                  className={[
                    'flex items-center gap-4 px-5 py-3',
                    isWinner ? 'bg-yellow-400/10' : '',
                  ].join(' ')}
                >
                  <span className="text-xl w-8">{medals[rank] ?? '—'}</span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0 bg-white/10 flex items-center justify-center text-xs font-bold text-white shadow">
                    {(() => {
                      const avatarSrc = resolvePlayerAvatar(player);
                      const isDoom = player.name.toLowerCase().includes('doom');
                      const fallbackEmoji = isDoom ? '👑' : player.isBot ? '🤖' : player.name.charAt(0).toUpperCase();
                      return avatarSrc ? (
                        <img src={avatarSrc} alt={player.name} className="w-full h-full object-cover object-center" />
                      ) : (
                        fallbackEmoji
                      );
                    })()}
                  </div>
                  <div className="flex-1 text-left flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`font-bold text-sm ${isMe ? 'text-yellow-300' : 'text-white/90'}`}
                    >
                      {player.name}
                    </span>
                    <RankBadge rank={player.rank} isBot={player.isBot} size="md" />
                    {player.isBot && (
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                        AI BOT
                      </span>
                    )}
                    {isMe && (
                      <span className="text-[10px] text-yellow-400/80 font-bold">
                        คุณ
                      </span>
                    )}
                  </div>
                  <span className="text-2xl font-black font-num text-yellow-400 drop-shadow-[0_2px_8px_rgba(250,204,21,0.5)]">
                    {player.score}
                  </span>
                  <span className="text-xs text-white/40 uppercase font-bold">แต้ม</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onLeave();
          }}
          className="w-full py-3 sm:py-4 rounded-xl font-black font-display text-sm sm:text-base bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white transition-all duration-200 shadow-xl hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
        >
          กลับสู่ล็อบบี้หลัก
        </button>
      </div>
      </div>
    </div>,
    document.body,
  );
};
