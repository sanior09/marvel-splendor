// ============================================================
//  GameOver.tsx — Marvel Cinematic Victory & Debrief Console
//  Stark Tech & Cosmic Nebula Aesthetics (AAA Production Quality)
// ============================================================

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Player, CrystalColor } from '@shared/types/game.types';
import { soundManager } from '../utils/soundManager';
import { RankBadge } from './RankBadge';
import { resolveMarvelAvatar, getMarvelFallbackEmoji } from '../utils/avatarUtils';
import type { UserProfile } from '../hooks/useAuth';

const resolvePlayerAvatar = (player: Player): string | undefined => {
  return resolveMarvelAvatar(player.name, player.avatarUrl);
};

const SIX_INFINITY_STONES: CrystalColor[] = [
  'topaz',     // Mind
  'sapphire',  // Space
  'ruby',      // Reality
  'amethyst',  // Power
  'emerald',   // Time
  'obsidian',  // Soul
];

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
  const primaryWinner = winnerPlayers[0] ?? players[0];
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
  const fallbackBonusXP = (fallbackTier3Count * 15) + (fallbackGuardianCount * 25);
  const fallbackBaseXP = 50;
  const fallbackWinXP = isIWon ? 150 : 0;
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
      {/* ── Background: Deep Cosmic Space Backdrop with Ambient Lighting ── */}
      <div className="fixed inset-0 bg-[#060812]/90 backdrop-blur-2xl" />
      <div
        className="fixed inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 10%, rgba(245, 158, 11, 0.18) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 80% 90%, rgba(239, 68, 68, 0.12) 0%, transparent 40%)
          `,
        }}
      />

      {/* ── Scrollable Dialog Container ── */}
      <div className="relative min-h-full flex items-center justify-center p-3 sm:p-6 py-6 sm:py-10">
        <div
          className="relative rounded-3xl p-5 sm:p-8 max-w-xl w-full text-center space-y-5 border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.2)] animate-slide-up select-none overflow-hidden"
          style={{
            background: 'linear-gradient(165deg, rgba(16, 21, 38, 0.96) 0%, rgba(8, 11, 22, 0.98) 100%)',
          }}
        >
          {/* Top Subtle Cyber Glow Line */}
          <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

          {/* ── Header: Marvel Brand & Mission Code ── */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="marvel-badge px-2.5 py-0.5 rounded text-xs font-black tracking-wider">MARVEL</span>
              <span className="font-display font-black text-sm sm:text-base text-white tracking-widest">
                SPLENDOR
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider text-amber-300/80 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>BATTLE DEBRIEF</span>
            </div>
          </div>

          {/* ── Champion Spotlight Card ── */}
          <div
            className="rounded-2xl p-4 sm:p-5 relative overflow-hidden border border-amber-400/40 text-center"
            style={{
              background: 'linear-gradient(145deg, rgba(35, 26, 12, 0.6) 0%, rgba(14, 16, 28, 0.85) 100%)',
              boxShadow: 'inset 0 0 30px rgba(245, 158, 11, 0.12), 0 8px 24px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Center Winner Avatar with 6 Infinity Stones Frame */}
            <div className="relative inline-block mb-3">
              {/* Outer Radiant Glow */}
              <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-500 blur-md opacity-60 animate-pulse" />

              {/* Avatar Container */}
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-amber-300 shadow-2xl bg-neutral-900 mx-auto flex items-center justify-center">
                {primaryWinner && (() => {
                  const avatarSrc = resolvePlayerAvatar(primaryWinner);
                  const fallbackEmoji = getMarvelFallbackEmoji(primaryWinner.name, primaryWinner.isBot);
                  return avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={primaryWinner.name}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-3xl">{fallbackEmoji}</span>
                  );
                })()}
              </div>

              {/* Crown Floating Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow-lg border border-yellow-100 flex items-center gap-1 leading-tight">
                <span>👑</span>
                <span>CHAMPION</span>
              </div>
            </div>

            {/* Victory Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 drop-shadow-sm">
                {isIWon ? 'ชัยชนะแห่งจักรวาล!' : `${primaryWinner?.name ?? 'ผู้ชนะ'} คว้าชัยชนะ!`}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm font-medium max-w-md mx-auto leading-relaxed">
                {isIWon
                  ? 'ท่านรวบรวมมณีครบทั้ง 6 ชนิดและครอบครอง Infinity Gauntlet สำเร็จอย่างสง่างาม!'
                  : `${winnerPlayers.map((p) => p.name).join(' & ')} รวบรวม Infinity Gauntlet สำเร็จและยุติสงครามครั้งนี้!`}
              </p>
            </div>

            {/* 6 Infinity Stones Micro Showcase */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 pt-3 border-t border-amber-400/20">
              <span className="text-[10px] uppercase font-bold text-amber-300/70 mr-1 tracking-wider">
                STONES
              </span>
              {SIX_INFINITY_STONES.map((color) => (
                <div
                  key={color}
                  className="w-5 h-5 rounded-full p-0.5 bg-black/60 border border-white/20 shadow-sm transition-transform hover:scale-110"
                  title={`Infinity Stone: ${color}`}
                >
                  <img
                    src={`/images/tokens/${color}.png`}
                    alt={color}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── EXP & Rank Progression Bento Card ── */}
          <div
            className="rounded-2xl p-4 sm:p-5 text-left border relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(22, 17, 38, 0.85) 0%, rgba(10, 12, 24, 0.95) 100%)',
              borderColor: isOwner ? 'rgba(255, 215, 0, 0.5)' : 'rgba(168, 85, 247, 0.35)',
              boxShadow: isOwner
                ? '0 12px 35px rgba(255, 215, 0, 0.12), inset 0 0 20px rgba(255, 215, 0, 0.08)'
                : '0 12px 35px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(168, 85, 247, 0.08)',
            }}
          >
            {/* Top Row: Title & Total EXP Gained */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <div>
                  <div className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                    <span>สรุปผล EXP ที่ได้รับ</span>
                  </div>
                  <div className="text-[10px] text-white/50 font-medium">BATTLE EXPERIENCE POINTS</div>
                </div>
              </div>

              {/* Glowing XP Pill */}
              <div
                className="px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 border font-bold text-xs shadow-md"
                style={{
                  background: 'linear-gradient(90deg, #f59e0b, #ec4899)',
                  borderColor: '#fef08a',
                  color: '#ffffff',
                }}
              >
                <span className="tracking-wide">
                  +<span className="font-num font-black text-sm">{displayXpGained}</span> EXP
                </span>
              </div>
            </div>

            {/* XP Breakdown Chips Bento */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3.5">
              <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-white/80 font-medium flex items-center gap-1">
                  <span>🎮</span>
                  <span>เล่นจบ</span>
                </span>
                <span className="text-white font-bold font-num text-xs">+{breakdown.baseXP}</span>
              </div>

              {breakdown.winXP > 0 && (
                <div className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-between">
                  <span className="text-[11px] text-amber-200 font-medium flex items-center gap-1">
                    <span>🏆</span>
                    <span>ชนะเกม</span>
                  </span>
                  <span className="text-yellow-300 font-bold font-num text-xs">+{breakdown.winXP}</span>
                </div>
              )}

              {breakdown.bonusXP > 0 && (
                <div className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-between col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-purple-200 font-medium flex items-center gap-1">
                    <span>✨</span>
                    <span>การ์ด/สถานที่</span>
                  </span>
                  <span className="text-purple-300 font-bold font-num text-xs">+{breakdown.bonusXP}</span>
                </div>
              )}
            </div>

            {/* Current Rank & Next Rank Progress */}
            {activeProfile && currentRank ? (
              <div className="space-y-2.5 pt-3 border-t border-white/10">
                {/* Rank title row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-2xl ${isOwner ? 'animate-bounce' : ''}`}>{currentRank.icon}</span>
                    <div>
                      <div className="text-[10px] text-white/50 font-medium uppercase tracking-wider">ยศปัจจุบัน</div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span style={{ color: currentRank.color }}>{currentRank.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total XP */}
                  <div className="text-right">
                    <div className="text-[10px] text-white/50 font-medium uppercase tracking-wider">EXP สะสมทั้งหมด</div>
                    <div className="text-sm font-bold font-num text-amber-300">
                      {activeProfile.xp.toLocaleString()} <span className="text-xs text-white/50 font-normal">XP</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar towards Next Rank */}
                {nextRank ? (
                  <div className="space-y-1.5 pt-1">
                    <div className="h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/10 relative">
                      <div
                        className="h-full rounded-full transition-all duration-1000 relative"
                        style={{
                          width: `${xpPercent}%`,
                          background: `linear-gradient(90deg, ${currentRank.color}, #ffd700, #ff007f)`,
                          boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-200 font-medium flex items-center gap-1 flex-wrap">
                        <span>🚀 อีก <span className="font-num font-bold text-yellow-300">{xpToNextRank?.toLocaleString()}</span> XP</span>
                        <span className="text-white/60">จะเลื่อนสู่</span>
                        <span className="text-white font-bold underline decoration-amber-400">
                          {nextRank.name} {nextRank.icon}
                        </span>
                      </span>
                      <span className="text-white/50 text-[10.5px] font-num font-bold">{xpPercent}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-pink-500/20 border border-amber-400/50 text-center shadow-sm">
                    <span className="text-xs font-bold text-amber-200 flex items-center justify-center gap-1.5 tracking-normal">
                      <span>👑</span>
                      <span>ท่านอยู่ในระดับสูงสุดแห่งจักรวาลแล้ว (MAX RANK)</span>
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-2.5 border-t border-white/10 text-center text-xs text-white/60">
                💡 คุณเล่นเป็นผู้เยี่ยมชม — เข้าสู่ระบบเพื่อสะสมแต้ม EXP และไต่แรงก์ถาวร
              </div>
            )}
          </div>

          {/* ── Battle Standings Scoreboard Bento ── */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-inner">
            <div className="px-4 py-2 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <span className="text-xs text-white/70 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <span>🏆</span>
                <span>ผลคะแนนการแข่งขัน (STANDINGS)</span>
              </span>
              <span className="text-[10px] text-white/40 font-mono">INFINITY SCORE</span>
            </div>

            <div className="divide-y divide-white/5">
              {sortedPlayers.map((player, rank) => {
                const isWinner = winners.includes(player.id);
                const isMe = player.id === myPlayerId;
                const medals = ['🥇', '🥈', '🥉', '4️⃣'];
                const rankLabels = ['CHAMPION', '2ND', '3RD', '4TH'];

                return (
                  <div
                    key={player.id}
                    className={[
                      'flex items-center gap-3 sm:gap-4 px-4 py-2.5 transition-colors',
                      isWinner
                        ? 'bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border-l-4 border-amber-400'
                        : isMe
                        ? 'bg-white/[0.04]'
                        : 'hover:bg-white/[0.02]',
                    ].join(' ')}
                  >
                    {/* Position Medal */}
                    <div className="flex flex-col items-center justify-center w-7 shrink-0">
                      <span className="text-xl leading-none">{medals[rank] ?? '—'}</span>
                      <span className="text-[8px] font-mono text-white/40 mt-0.5">{rankLabels[rank]}</span>
                    </div>

                    {/* Avatar with Stark Frame */}
                    <div
                      className={`w-9 h-9 rounded-full overflow-hidden border shrink-0 bg-neutral-900 flex items-center justify-center text-xs font-bold text-white shadow-md ${
                        isWinner ? 'border-amber-300 ring-2 ring-amber-400/40' : 'border-white/20'
                      }`}
                    >
                      {(() => {
                        const avatarSrc = resolvePlayerAvatar(player);
                        const fallbackEmoji = getMarvelFallbackEmoji(player.name, player.isBot);
                        return avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={player.name}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          fallbackEmoji
                        );
                      })()}
                    </div>

                    {/* Player Name & Badges */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`font-bold text-sm truncate ${
                            isWinner ? 'text-yellow-300' : isMe ? 'text-white' : 'text-white/85'
                          }`}
                        >
                          {player.name}
                        </span>
                        <RankBadge rank={player.rank} isBot={player.isBot} size="md" />
                        {player.isBot && (
                          <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-1.5 py-0.2 rounded font-bold">
                            AI BOT
                          </span>
                        )}
                        {isMe && (
                          <span className="text-[9.5px] bg-amber-400/20 text-yellow-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-bold">
                            คุณ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <div className="text-xl sm:text-2xl font-black font-num text-yellow-400 leading-tight">
                        {player.score}
                      </div>
                      <div className="text-[9px] text-white/40 uppercase font-bold tracking-wider">แต้ม</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Action: Return to Lobby Button ── */}
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onLeave();
            }}
            className="w-full py-3.5 sm:py-4 rounded-2xl font-bold font-display text-sm sm:text-base text-white tracking-wide transition-all duration-300 shadow-[0_10px_25px_rgba(220,38,38,0.4)] hover:shadow-[0_15px_35px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 group relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 45%, #d97706 100%)',
              border: '1px solid rgba(254, 240, 138, 0.4)',
            }}
          >
            {/* Gloss Highlight Overlay */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-white/50 pointer-events-none" />
            <span className="text-lg group-hover:-translate-x-1 transition-transform">🚀</span>
            <span>กลับสู่ล็อบบี้หลัก (Return to Lobby)</span>
            <span className="text-yellow-300 group-hover:translate-x-1.5 transition-transform">➔</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
