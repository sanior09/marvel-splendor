// ============================================================
//  ProfileBadge.tsx — Player Profile & XP Stats widget
//  Shows rank, XP, win rate, games played in Lobby header
// ============================================================

import React, { useState } from 'react';
import type { UserProfile } from '../hooks/useAuth';
import { RankBadge } from './RankBadge';

interface ProfileBadgeProps {
  profile: UserProfile;
  onLogout: () => void;
  activeRoomId?: string;
  activePlayerId?: string;
  onResumeRoom?: (roomId: string, playerId: string) => void;
  onClearActiveRoom?: () => void;
}

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({
  profile,
  onLogout,
  activeRoomId,
  activePlayerId,
  onResumeRoom,
  onClearActiveRoom,
}) => {
  const [expanded, setExpanded] = useState(false);

  const xpPercent = profile.nextRank
    ? Math.min(100, Math.round(
        ((profile.xp - profile.rank.minXP) / (profile.nextRank.minXP - profile.rank.minXP)) * 100
      ))
    : 100;

  const isOwner = Boolean(profile.rank.isOwner || profile.rank.minXP >= 50000);

  return (
    <div className="relative">
      {/* Badge Button Trigger */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
          isOwner
            ? 'border-amber-400/60 shadow-[0_0_15px_rgba(255,215,0,0.4)] hover:shadow-[0_0_22px_rgba(255,0,128,0.6)]'
            : 'border-white/15 hover:border-white/30'
        }`}
        style={{
          background: isOwner
            ? 'linear-gradient(135deg, rgba(255,0,128,0.18) 0%, rgba(255,215,0,0.18) 100%)'
            : 'rgba(255,255,255,0.06)',
        }}
      >
        <span className={`text-base leading-none ${isOwner ? 'animate-bounce' : ''}`}>
          {profile.rank.icon}
        </span>
        <div className="text-left">
          <div className="flex items-center gap-1">
            <span className="text-white text-xs font-black leading-tight tracking-wide">
              {profile.username}
            </span>
            {isOwner && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-gradient-to-r from-amber-500 to-pink-500 text-black font-extrabold uppercase leading-none shadow-sm">
                CREATOR
              </span>
            )}
          </div>
          <div
            className="text-[10px] font-black leading-tight tracking-wide"
            style={
              isOwner
                ? {
                    background: 'linear-gradient(90deg, #ffd700, #ff007f)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }
                : { color: profile.rank.color || 'rgba(255,255,255,0.6)' }
            }
          >
            {profile.rank.name}
          </div>
        </div>
        <div className="text-white/30 text-xs ml-1">{expanded ? '▲' : '▼'}</div>
      </button>

      {/* Dropdown Popup Modal */}
      {expanded && (
        <div
          className="absolute right-0 top-full mt-2.5 w-72 rounded-2xl p-4 z-50 border animate-slide-up"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 18, 32, 0.98) 0%, rgba(8, 10, 18, 0.99) 100%)',
            backdropFilter: 'blur(24px)',
            borderColor: isOwner ? 'rgba(255,215,0,0.45)' : 'rgba(255,255,255,0.15)',
            boxShadow: isOwner
              ? '0 20px 45px rgba(0,0,0,0.85), 0 0 30px rgba(255,215,0,0.25)'
              : '0 20px 45px rgba(0,0,0,0.75)',
          }}
        >
          {/* Header Profile Info */}
          <div className="flex items-center gap-3 mb-3.5 pb-3 border-b border-white/10">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 shrink-0 overflow-hidden"
              style={{
                borderColor: isOwner ? '#ffd700' : profile.rank.color,
                background: isOwner
                  ? 'linear-gradient(135deg, rgba(255,215,0,0.25) 0%, rgba(245,158,11,0.15) 100%)'
                  : 'rgba(255,255,255,0.05)',
                boxShadow: isOwner ? '0 0 16px rgba(255,215,0,0.5)' : undefined,
              }}
            >
              {profile.rank.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-black text-sm flex items-center gap-1.5 flex-wrap">
                <span className="truncate">{profile.username}</span>
                {isOwner && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-pink-500 text-black font-black shadow-sm tracking-wider">
                    👑 OWNER
                  </span>
                )}
              </div>
              <div className="mt-1">
                <RankBadge rank={profile.rank} size="sm" />
              </div>
            </div>
          </div>

          {/* ── EXP Progress Card ── */}
          <div
            className="mb-3.5 p-3 rounded-xl border relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(24, 18, 40, 0.7) 0%, rgba(10, 12, 22, 0.85) 100%)',
              borderColor: isOwner ? 'rgba(255, 215, 0, 0.35)' : 'rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Top row: Label + Badge */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 text-xs">⚡</span>
                <span className="text-[11px] font-black text-white/90 uppercase tracking-wider">
                  EXP สะสม
                </span>
              </div>
              <span
                className="text-[11px] font-black px-2 py-0.5 rounded-full border shadow-sm"
                style={{
                  color: isOwner ? '#ffd700' : '#38bdf8',
                  background: isOwner ? 'rgba(255, 215, 0, 0.14)' : 'rgba(56, 189, 248, 0.12)',
                  borderColor: isOwner ? 'rgba(255, 215, 0, 0.45)' : 'rgba(56, 189, 248, 0.3)',
                  textShadow: isOwner ? '0 1px 4px rgba(255,215,0,0.4)' : undefined,
                }}
              >
                {profile.xp.toLocaleString()} XP
              </span>
            </div>

            {/* Glowing Cyber Track */}
            <div className="relative h-2.5 rounded-full bg-black/70 p-0.5 border border-white/15 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-700 relative"
                style={{
                  width: `${xpPercent}%`,
                  background: isOwner
                    ? 'linear-gradient(90deg, #f59e0b 0%, #ffd700 50%, #fb7185 100%)'
                    : `linear-gradient(90deg, ${profile.rank.color}, ${profile.nextRank?.color ?? '#ffd700'})`,
                  boxShadow: isOwner
                    ? '0 0 14px rgba(255, 215, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                    : `0 0 10px ${profile.rank.color}88`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Next Rank Goal Info */}
            <div className="flex items-center justify-between text-[10.5px] mt-1.5 font-bold">
              {profile.nextRank ? (
                <>
                  <span className="text-white/60">
                    เป้าหมาย: <span className="text-amber-300 font-extrabold">{profile.nextRank.name}</span>
                  </span>
                  <span className="text-sky-300 font-black">
                    อีก {profile.xpToNextRank?.toLocaleString()} XP
                  </span>
                </>
              ) : (
                <div className="w-full text-center text-amber-300 text-[10px] font-black flex items-center justify-center gap-1.5 pt-0.5">
                  <span className="animate-pulse">✨</span>
                  <span>บรรลุขีดสุดพลังจักรวาลแล้ว (MAX RANK)</span>
                  <span className="animate-pulse">✨</span>
                </div>
              )}
            </div>
          </div>

          {/* ── 3 Thematic Stat Cards (เกมที่เล่น, ชนะ, Win Rate) ── */}
          <div className="grid grid-cols-3 gap-2 mb-3.5">
            {/* Card 1: Matches Played */}
            <div
              className="rounded-xl p-2.5 text-center border relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.3) 0%, rgba(15, 23, 42, 0.7) 100%)',
                borderColor: 'rgba(59, 130, 246, 0.4)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
              }}
            >
              <div className="text-lg leading-none mb-1 drop-shadow">🎮</div>
              <div className="text-base font-black font-display text-sky-200 tracking-tight leading-tight">
                {profile.gamesPlayed.toLocaleString()}
              </div>
              <div className="text-[9.5px] font-bold text-sky-400/90 uppercase tracking-wider mt-0.5">
                เกมที่เล่น
              </div>
            </div>

            {/* Card 2: Victories */}
            <div
              className="rounded-xl p-2.5 text-center border relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(180deg, rgba(161, 98, 7, 0.3) 0%, rgba(20, 15, 5, 0.7) 100%)',
                borderColor: 'rgba(245, 158, 11, 0.5)',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.2)',
              }}
            >
              <div className="text-lg leading-none mb-1 drop-shadow">🏆</div>
              <div className="text-base font-black font-display text-amber-300 tracking-tight leading-tight drop-shadow-[0_1px_4px_rgba(245,158,11,0.5)]">
                {profile.gamesWon.toLocaleString()}
              </div>
              <div className="text-[9.5px] font-black text-amber-400 uppercase tracking-wider mt-0.5">
                ชนะ
              </div>
            </div>

            {/* Card 3: Win Rate */}
            <div
              className="rounded-xl p-2.5 text-center border relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 78, 59, 0.6) 100%)',
                borderColor: 'rgba(52, 211, 153, 0.45)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
              }}
            >
              <div className="text-lg leading-none mb-1 drop-shadow">📈</div>
              <div className="text-base font-black font-display text-emerald-300 tracking-tight leading-tight">
                {profile.winRate}%
              </div>
              <div className="text-[9.5px] font-bold text-emerald-400/90 uppercase tracking-wider mt-0.5">
                Win Rate
              </div>
            </div>
          </div>

          {/* Resume Room Banner (If active room exists) */}
          {activeRoomId && activePlayerId && onResumeRoom && (
            <div className="flex items-center gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => {
                  onResumeRoom(activeRoomId, activePlayerId);
                  setExpanded(false);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl text-sm font-bold text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ea580c 100%)',
                  boxShadow: '0 6px 16px rgba(234,179,8,0.35)',
                }}
              >
                ▶ กลับเข้าห้อง {activeRoomId}
              </button>
              {onClearActiveRoom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearActiveRoom();
                  }}
                  className="py-2.5 px-3 rounded-xl text-white/50 hover:text-white hover:bg-white/10 text-xs border border-white/10 transition-all cursor-pointer"
                  title="ยกเลิก/ล้างสถานะห้องนี้"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => { onLogout(); setExpanded(false); }}
            className="w-full py-2 rounded-xl text-white/40 text-xs border border-white/10 hover:text-red-400 hover:border-red-400/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🚪</span>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      )}

      {/* Click outside backdrop */}
      {expanded && (
        <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />
      )}
    </div>
  );
};
