// ============================================================
//  GameOver.tsx — Marvel Cinematic Victory & Debrief Console
//  Compact Viewport-Fitted Edition (Guaranteed Zero Vertical Scroll)
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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-3">
      {/* ── Background: Deep Cosmic Space Backdrop with Ambient Lighting ── */}
      <div className="fixed inset-0 bg-[#060812]/92 backdrop-blur-xl" />
      <div
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 10%, rgba(245, 158, 11, 0.16) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 80% 90%, rgba(239, 68, 68, 0.10) 0%, transparent 40%)
          `,
        }}
      />

      {/* ── Compact Screen-Fitted Card Container (No scroll needed) ── */}
      <div
        className="relative rounded-2xl sm:rounded-3xl p-3 sm:p-4.5 max-w-[460px] w-full text-center space-y-2 sm:space-y-2.5 border border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.18)] animate-slide-up select-none overflow-hidden my-auto"
        style={{
          background: 'linear-gradient(165deg, rgba(16, 21, 38, 0.98) 0%, rgba(8, 11, 22, 0.99) 100%)',
        }}
      >
        {/* Top Subtle Cyber Glow Line */}
        <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

        {/* ── 1. Header: Marvel Brand & Mission Code ── */}
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="marvel-badge px-2 py-0.2 rounded text-[11px] font-black tracking-wider">MARVEL</span>
            <span className="font-display font-black text-sm text-white tracking-widest">
              SPLENDOR
            </span>
          </div>
          <div className="flex items-center gap-1 text-[9.5px] font-mono uppercase tracking-wider text-amber-300/90 bg-amber-400/10 px-2 py-0.2 rounded-full border border-amber-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>BATTLE DEBRIEF</span>
          </div>
        </div>

        {/* ── 2. Champion Spotlight Card ── */}
        <div
          className="rounded-xl p-2.5 sm:p-3 relative overflow-hidden border border-amber-400/40 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(35, 26, 12, 0.6) 0%, rgba(14, 16, 28, 0.85) 100%)',
            boxShadow: 'inset 0 0 20px rgba(245, 158, 11, 0.12), 0 4px 16px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Center Winner Avatar with Crown */}
          <div className="relative inline-block mb-1.5">
            {/* Outer Radiant Glow */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-500 blur-sm opacity-60 animate-pulse" />

            {/* Avatar Container */}
            <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full overflow-hidden border-2 border-amber-300 shadow-xl bg-neutral-900 mx-auto flex items-center justify-center">
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
                  <span className="text-2xl">{fallbackEmoji}</span>
                );
              })()}
            </div>

            {/* Crown Floating Badge */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[9.5px] px-2 py-0.2 rounded-full shadow border border-yellow-100 flex items-center gap-1 leading-tight whitespace-nowrap">
              <span>👑</span>
              <span>CHAMPION</span>
            </div>
          </div>

          {/* Victory Title & Subtitle */}
          <div className="space-y-0.5">
            <h1 className="font-display text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 drop-shadow-sm leading-tight">
              {isIWon ? 'ชัยชนะแห่งจักรวาล!' : `${primaryWinner?.name ?? 'ผู้ชนะ'} คว้าชัยชนะ!`}
            </h1>
            <p className="text-white/80 text-[11px] font-medium max-w-sm mx-auto leading-tight">
              {isIWon
                ? 'ท่านรวบรวมมณีครบทั้ง 6 ชนิดและครอบครอง Infinity Gauntlet สำเร็จ!'
                : `${winnerPlayers.map((p) => p.name).join(' & ')} รวบรวม Infinity Gauntlet สำเร็จและยุติสงครามครั้งนี้!`}
            </p>
          </div>

          {/* 6 Infinity Stones Micro Showcase */}
          <div className="flex items-center justify-center gap-1.5 mt-1.5 pt-1.5 border-t border-amber-400/20">
            <span className="text-[9px] uppercase font-bold text-amber-300/70 mr-0.5 tracking-wider">
              STONES
            </span>
            {SIX_INFINITY_STONES.map((color) => (
              <div
                key={color}
                className="w-4 h-4 rounded-full p-0.5 bg-black/60 border border-white/20 shadow-sm"
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

        {/* ── 3. EXP & Rank Progression Bento Card ── */}
        <div
          className="rounded-xl p-2.5 sm:p-3 text-left border relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(22, 17, 38, 0.85) 0%, rgba(10, 12, 24, 0.95) 100%)',
            borderColor: isOwner ? 'rgba(255, 215, 0, 0.5)' : 'rgba(168, 85, 247, 0.35)',
            boxShadow: isOwner
              ? '0 8px 24px rgba(255, 215, 0, 0.1), inset 0 0 15px rgba(255, 215, 0, 0.06)'
              : '0 8px 24px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Top Row: Title & Total EXP Gained */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">⚡</span>
              <div>
                <div className="text-white font-bold text-xs tracking-wide">
                  สรุปผล EXP ที่ได้รับ
                </div>
                <div className="text-[9px] text-white/50 font-medium">BATTLE EXPERIENCE</div>
              </div>
            </div>

            {/* Glowing XP Pill */}
            <div
              className="px-2.5 py-1 rounded-lg flex items-center gap-1 border font-bold text-[11px] shadow-sm"
              style={{
                background: 'linear-gradient(90deg, #f59e0b, #ec4899)',
                borderColor: '#fef08a',
                color: '#ffffff',
              }}
            >
              <span>
                +<span className="font-num font-black text-xs">{displayXpGained}</span> EXP
              </span>
            </div>
          </div>

          {/* XP Breakdown Chips Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
            <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-white/80 font-medium flex items-center gap-1">
                <span>🎮</span>
                <span>เล่นจบ</span>
              </span>
              <span className="text-white font-bold font-num text-[11px]">+{breakdown.baseXP}</span>
            </div>

            {breakdown.winXP > 0 && (
              <div className="px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-between">
                <span className="text-[10px] text-amber-200 font-medium flex items-center gap-1">
                  <span>🏆</span>
                  <span>ชนะเกม</span>
                </span>
                <span className="text-yellow-300 font-bold font-num text-[11px]">+{breakdown.winXP}</span>
              </div>
            )}

            {breakdown.bonusXP > 0 && (
              <div className="px-2 py-1 rounded-lg bg-purple-500/15 border border-purple-400/30 flex items-center justify-between col-span-2 sm:col-span-1">
                <span className="text-[10px] text-purple-200 font-medium flex items-center gap-1">
                  <span>✨</span>
                  <span>การ์ด/สถานที่</span>
                </span>
                <span className="text-purple-300 font-bold font-num text-[11px]">+{breakdown.bonusXP}</span>
              </div>
            )}
          </div>

          {/* Current Rank & Next Rank Progress */}
          {activeProfile && currentRank ? (
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              {/* Rank title row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xl ${isOwner ? 'animate-bounce' : ''}`}>{currentRank.icon}</span>
                  <div>
                    <div className="text-[9px] text-white/50 uppercase tracking-wider">ยศปัจจุบัน</div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span style={{ color: currentRank.color }}>{currentRank.name}</span>
                    </div>
                  </div>
                </div>

                {/* Total XP */}
                <div className="text-right">
                  <div className="text-[9px] text-white/50 uppercase tracking-wider">EXP สะสมทั้งหมด</div>
                  <div className="text-xs font-bold font-num text-amber-300">
                    {activeProfile.xp.toLocaleString()} <span className="text-[10px] text-white/50 font-normal">XP</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar towards Next Rank */}
              {nextRank ? (
                <div className="space-y-1 pt-0.5">
                  <div className="h-2 rounded-full bg-black/60 overflow-hidden border border-white/10 relative">
                    <div
                      className="h-full rounded-full transition-all duration-1000 relative"
                      style={{
                        width: `${xpPercent}%`,
                        background: `linear-gradient(90deg, ${currentRank.color}, #ffd700, #ff007f)`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-200 font-medium flex items-center gap-1 flex-wrap">
                      <span>🚀 อีก <span className="font-num font-bold text-yellow-300">{xpToNextRank?.toLocaleString()}</span> XP</span>
                      <span className="text-white/60">จะเลื่อนสู่</span>
                      <span className="text-white font-bold underline decoration-amber-400">
                        {nextRank.name} {nextRank.icon}
                      </span>
                    </span>
                    <span className="text-white/50 font-num font-bold">{xpPercent}%</span>
                  </div>
                </div>
              ) : (
                <div className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-pink-500/20 border border-amber-400/50 text-center">
                  <span className="text-[11px] font-bold text-amber-200 flex items-center justify-center gap-1 tracking-normal leading-tight">
                    <span>👑</span>
                    <span>ท่านอยู่ในระดับสูงสุดแห่งจักรวาลแล้ว (MAX RANK)</span>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-1.5 border-t border-white/10 text-center text-[10.5px] text-white/60">
              💡 คุณเล่นเป็นผู้เยี่ยมชม — เข้าสู่ระบบเพื่อสะสมแต้ม EXP และไต่แรงก์ถาวร
            </div>
          )}
        </div>

        {/* ── 4. Battle Standings Scoreboard Bento ── */}
        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-inner">
          <div className="px-3 py-1 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <span className="text-[10.5px] text-white/70 uppercase tracking-wider font-bold flex items-center gap-1">
              <span>🏆</span>
              <span>ผลคะแนนการแข่งขัน (STANDINGS)</span>
            </span>
            <span className="text-[9px] text-white/40 font-mono">INFINITY SCORE</span>
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
                    'flex items-center gap-2.5 px-3 py-1.5 transition-colors',
                    isWinner
                      ? 'bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border-l-3 border-amber-400'
                      : isMe
                      ? 'bg-white/[0.04]'
                      : 'hover:bg-white/[0.02]',
                  ].join(' ')}
                >
                  {/* Position Medal */}
                  <span className="text-base leading-none w-5 text-center shrink-0">{medals[rank] ?? '—'}</span>

                  {/* Avatar with Stark Frame */}
                  <div
                    className={`w-7 h-7 rounded-full overflow-hidden border shrink-0 bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                      isWinner ? 'border-amber-300 ring-1 ring-amber-400/40' : 'border-white/20'
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
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = 'block';
                            }
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
                        className={`font-bold text-xs truncate ${
                          isWinner ? 'text-yellow-300' : isMe ? 'text-white' : 'text-white/85'
                        }`}
                      >
                        {player.name}
                      </span>
                      <RankBadge rank={player.rank} isBot={player.isBot} size="sm" />
                      {player.isBot && (
                        <span className="text-[8.5px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-1 py-0.2 rounded font-bold">
                          AI BOT
                        </span>
                      )}
                      {isMe && (
                        <span className="text-[9px] bg-amber-400/20 text-yellow-300 border border-amber-400/40 px-1 py-0.2 rounded font-bold">
                          คุณ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <div className="text-base font-black font-num text-yellow-400 leading-tight">
                      {player.score}
                    </div>
                    <div className="text-[8.5px] text-white/40 uppercase font-bold tracking-wider">แต้ม</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5. Action: Return to Lobby Button ── */}
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onLeave();
          }}
          className="w-full py-2.5 sm:py-3 rounded-xl font-bold font-display text-sm text-white tracking-wide transition-all duration-300 shadow-[0_6px_20px_rgba(220,38,38,0.35)] hover:shadow-[0_10px_25px_rgba(245,158,11,0.45)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 group relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 45%, #d97706 100%)',
            border: '1px solid rgba(254, 240, 138, 0.4)',
          }}
        >
          {/* Gloss Highlight Overlay */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-white/50 pointer-events-none" />
          <span className="text-base group-hover:-translate-x-1 transition-transform">🚀</span>
          <span>กลับสู่ล็อบบี้หลัก (Return to Lobby)</span>
          <span className="text-yellow-300 group-hover:translate-x-1 transition-transform">➔</span>
        </button>
      </div>
    </div>,
    document.body,
  );
};
