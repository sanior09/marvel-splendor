// ============================================================
//  ProfileBadge.tsx — Player Profile & XP Stats widget
//  Shows rank, XP, win rate, games played in Lobby header
// ============================================================

import React, { useState } from 'react';
import type { UserProfile } from '../hooks/useAuth';

interface ProfileBadgeProps {
  profile: UserProfile;
  onLogout: () => void;
  activeRoomId?: string;
  activePlayerId?: string;
  onResumeRoom?: (roomId: string, playerId: string) => void;
}

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({
  profile,
  onLogout,
  activeRoomId,
  activePlayerId,
  onResumeRoom,
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
      {/* Badge Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
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
        <span className={`text-base leading-none ${isOwner ? 'animate-bounce' : ''}`}>{profile.rank.icon}</span>
        <div className="text-left">
          <div className="flex items-center gap-1">
            <span className="text-white text-xs font-black leading-tight tracking-wide">{profile.username}</span>
            {isOwner && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-gradient-to-r from-amber-500 to-pink-500 text-black font-extrabold uppercase leading-none">
                CREATOR
              </span>
            )}
          </div>
          <div
            className="text-[10px] font-bold leading-tight"
            style={
              isOwner
                ? {
                    background: 'linear-gradient(90deg, #ffd700, #ff007f)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }
                : { color: 'rgba(255,255,255,0.5)' }
            }
          >
            {profile.rank.name}
          </div>
        </div>
        <div className="text-white/30 text-xs ml-1">{expanded ? '▲' : '▼'}</div>
      </button>

      {/* Dropdown */}
      {expanded && (
        <div
          className="absolute right-0 top-full mt-2 w-64 rounded-2xl p-4 z-50 border"
          style={{
            background: 'linear-gradient(135deg, rgba(20,22,40,0.98) 0%, rgba(10,11,20,0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderColor: isOwner ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.15)',
            boxShadow: isOwner
              ? '0 20px 40px rgba(0,0,0,0.8), 0 0 25px rgba(255,0,128,0.3)'
              : '0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2"
              style={{
                borderColor: isOwner ? '#ffd700' : profile.rank.color,
                background: isOwner ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)',
                boxShadow: isOwner ? '0 0 15px rgba(255,215,0,0.5)' : undefined,
              }}
            >
              {profile.rank.icon}
            </div>
            <div>
              <div className="text-white font-bold flex items-center gap-1.5">
                {profile.username}
                {isOwner && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-black font-extrabold shadow-sm">
                    👑 OWNER
                  </span>
                )}
              </div>
              <div
                className="text-xs font-bold"
                style={
                  isOwner
                    ? {
                        background: 'linear-gradient(90deg, #ffd700, #ff007f, #00f0ff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }
                    : { color: profile.rank.color }
                }
              >
                {profile.rank.name}
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>XP {profile.xp.toLocaleString()}</span>
              {profile.nextRank && (
                <span>เป้าหมาย: {profile.nextRank.minXP.toLocaleString()} XP</span>
              )}
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${xpPercent}%`,
                  background: `linear-gradient(90deg, ${profile.rank.color}, ${profile.nextRank?.color ?? '#ffd700'})`,
                }}
              />
            </div>
            {profile.nextRank && (
              <div className="text-right text-[10px] text-white/30 mt-0.5">
                อีก {profile.xpToNextRank?.toLocaleString()} XP → {profile.nextRank.name}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'เกมที่เล่น', value: profile.gamesPlayed, icon: '🎮' },
              { label: 'ชนะ', value: profile.gamesWon, icon: '🏆' },
              { label: 'Win Rate', value: `${profile.winRate}%`, icon: '📊' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-2 text-center border border-white/10"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <div className="text-base">{stat.icon}</div>
                <div className="text-white font-bold text-sm">{stat.value}</div>
                <div className="text-white/40 text-[9px]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Resume Room Banner */}
          {activeRoomId && activePlayerId && onResumeRoom && (
            <button
              onClick={() => {
                onResumeRoom(activeRoomId, activePlayerId);
                setExpanded(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl mb-3 text-sm font-bold text-black flex items-center justify-center gap-2 transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #ea580c 100%)',
                boxShadow: '0 6px 16px rgba(234,179,8,0.35)',
              }}
            >
              ▶ กลับเข้าห้อง {activeRoomId}
            </button>
          )}

          {/* Logout */}
          <button
            onClick={() => { onLogout(); setExpanded(false); }}
            className="w-full py-2 rounded-xl text-white/40 text-xs border border-white/10 hover:text-red-400 hover:border-red-400/30 transition-all"
          >
            🚪 ออกจากระบบ
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
