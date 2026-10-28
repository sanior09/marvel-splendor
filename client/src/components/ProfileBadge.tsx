// ============================================================
//  ProfileBadge.tsx — Player Profile & XP Stats widget
//  Stark Cyber-Gold Design System: Obsidian Glass, Clear Typography
// ============================================================

import React, { useState } from 'react';
import type { UserProfile } from '../hooks/useAuth';
import { RankBadge } from './RankBadge';
import { GAME_RANKS, XP_GAIN_RULES } from '../data/ranks';

interface ProfileBadgeProps {
  profile: UserProfile;
  onLogout: () => void;
  activeRoomId?: string;
  activePlayerId?: string;
  onResumeRoom?: (roomId: string, playerId: string) => void;
  onClearActiveRoom?: () => void;
  avatarUrl?: string | null;
}

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({
  profile,
  onLogout,
  activeRoomId,
  activePlayerId,
  onResumeRoom,
  onClearActiveRoom,
  avatarUrl: _avatarUrl,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'stats' | 'roadmap'>('stats');

  const xpPercent = profile.nextRank
    ? Math.min(100, Math.round(
        ((profile.xp - profile.rank.minXP) / (profile.nextRank.minXP - profile.rank.minXP)) * 100
      ))
    : 100;

  const isOwner = Boolean(profile.rank.isOwner || profile.rank.minXP >= 50000);

  return (
    <div className="relative">
      {/* ── Badge Button Trigger (Stark Gold Cyber Header) ── */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
          isOwner
            ? 'border-amber-400/60 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/20 hover:from-amber-500/25 hover:to-amber-600/30 shadow-[0_0_16px_rgba(245,158,11,0.25)] hover:shadow-[0_0_22px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95'
            : 'border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/30 hover:scale-105 active:scale-95'
        }`}
      >
        {/* Prestige Rank/Crown Emblem (Dedicated Account Badge) */}
        <div
          className={`relative w-6 h-6 rounded-full shrink-0 flex items-center justify-center shadow-sm border ${
            isOwner
              ? 'border-amber-400 bg-gradient-to-br from-amber-400/30 to-yellow-500/20 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
              : 'bg-white/10 text-white'
          }`}
          style={{ borderColor: isOwner ? '#fbbf24' : profile.rank.color }}
        >
          {isOwner ? (
            <span className="leading-none select-none text-[13px] drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]">
              👑
            </span>
          ) : (
            <span className="leading-none select-none text-[12px]">
              {profile.rank.icon || '🛡️'}
            </span>
          )}
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1">
            <span className="text-white text-xs font-black leading-tight tracking-wide font-display">
              {profile.username}
            </span>
          </div>
          <div className="text-[10px] font-bold leading-tight tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-sm">
            {profile.rank.name}
          </div>
        </div>
        <div className="text-amber-400/60 text-xs ml-0.5">{expanded ? '▲' : '▼'}</div>
      </button>

      {/* Click outside backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs sm:bg-transparent"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* ── Dropdown Popup Modal (Stark Obsidian Gold Console) ── */}
      {expanded && (
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:translate-x-0 sm:translate-y-0 sm:mt-2.5 w-[min(94vw,370px)] sm:w-[370px] max-h-[92vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl p-3.5 sm:p-4 z-50 border animate-fade-in shadow-2xl select-none"
          style={{
            background: 'linear-gradient(165deg, rgba(16, 22, 36, 0.98) 0%, rgba(8, 11, 20, 0.99) 100%)',
            backdropFilter: 'blur(28px)',
            borderColor: isOwner ? 'rgba(245, 158, 11, 0.45)' : 'rgba(255, 255, 255, 0.15)',
            boxShadow: isOwner
              ? '0 24px 50px rgba(0,0,0,0.95), 0 0 30px rgba(245,158,11,0.2)'
              : '0 24px 50px rgba(0,0,0,0.85)',
          }}
        >
          {/* Header Profile Info + Close button */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              {/* Prestige Account Rank Emblem */}
              <div
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center border-2 shrink-0 overflow-hidden shadow-md"
                style={{
                  borderColor: isOwner ? '#f59e0b' : profile.rank.color,
                  boxShadow: isOwner
                    ? '0 0 20px rgba(245, 158, 11, 0.45)'
                    : `0 0 14px ${profile.rank.color}40`,
                  background: isOwner
                    ? 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, rgba(16,22,36,0.98) 100%)'
                    : `radial-gradient(circle, ${profile.rank.color}25 0%, rgba(16,22,36,0.98) 100%)`,
                }}
              >
                {isOwner ? (
                  <span className="text-2xl drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] select-none">👑</span>
                ) : (
                  <span className="text-2xl select-none">{profile.rank.icon || '🛡️'}</span>
                )}
                {/* Crown watermark badge for Owner */}
                {isOwner && (
                  <span className="absolute bottom-0 right-0 text-[10px] bg-black/80 px-1 py-0.2 rounded-tl-md border-t border-l border-amber-400/50 leading-none">
                    👑
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="text-white font-black text-sm sm:text-base flex items-center gap-1.5 font-display tracking-wide truncate">
                  {profile.username}
                </div>
                <div className="mt-0.5">
                  <RankBadge rank={profile.rank} size="sm" />
                </div>
              </div>
            </div>

            {/* Quick Close Button */}
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer shrink-0"
              title="ปิด (Close)"
            >
              ✕
            </button>
          </div>

          {/* ── EXP Progress Card (Infinity Arc Energy Core) ── */}
          <div className="mb-3 p-3 rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/[0.08] via-black/40 to-black/60 shadow-inner relative overflow-hidden">
            {/* Top row: Label + Badge */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 text-xs">⚡</span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide font-['Prompt',sans-serif]">
                  EXP สะสม
                </span>
              </div>
              <span className="text-xs font-bold font-num px-2.5 py-0.5 rounded-full border border-amber-400/40 bg-amber-500/15 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                {profile.xp.toLocaleString()} XP
              </span>
            </div>

            {/* Glowing Cyber Track */}
            <div className="relative h-2 rounded-full bg-black/80 p-0.5 border border-white/15 overflow-hidden shadow-inner my-1.5">
              <div
                className="h-full rounded-full transition-all duration-700 relative"
                style={{
                  width: `${xpPercent}%`,
                  background: isOwner
                    ? 'linear-gradient(90deg, #f59e0b 0%, #ffd700 50%, #ea580c 100%)'
                    : `linear-gradient(90deg, ${profile.rank.color}, ${profile.nextRank?.color ?? '#ffd700'})`,
                  boxShadow: isOwner
                    ? '0 0 12px rgba(245, 158, 11, 0.75)'
                    : `0 0 10px ${profile.rank.color}88`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Next Rank Goal Info */}
            <div className="flex items-center justify-between text-xs mt-1.5 font-medium">
              {profile.nextRank ? (
                <>
                  <span className="text-slate-300 text-[11px]">
                    เป้าหมาย: <span className="text-amber-300 font-bold">{profile.nextRank.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewMode('roadmap')}
                    className="text-amber-200 hover:text-amber-100 font-bold font-num text-[11px] underline decoration-amber-400/50 hover:decoration-amber-300 cursor-pointer"
                    title="คลิกเพื่อดูตารางยศทั้งหมด"
                  >
                    อีก {profile.xpToNextRank?.toLocaleString()} XP ▾
                  </button>
                </>
              ) : (
                <div className="w-full text-center text-amber-300 text-xs font-bold font-['Prompt',sans-serif] flex items-center justify-center gap-1.5 pt-0.5">
                  <span>✨</span>
                  <span>บรรลุขีดสุดพลังจักรวาลแล้ว (MAX RANK)</span>
                  <span>✨</span>
                </div>
              )}
            </div>
          </div>

          {/* ── View Switcher: Stats vs Rank Roadmap ── */}
          <div className="grid grid-cols-2 p-1 bg-black/50 border border-white/10 rounded-xl mb-3 gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('stats')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold font-['Prompt',sans-serif] transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                viewMode === 'stats'
                  ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/20 border border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <span>📊</span>
              <span>สถิติการเล่น</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('roadmap')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold font-['Prompt',sans-serif] transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                viewMode === 'roadmap'
                  ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/20 border border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <span>🏆</span>
              <span>ตารางยศ & EXP</span>
            </button>
          </div>

          {viewMode === 'stats' ? (
            /* ── 3 Thematic Stat Cards (Stark Cyber-Gold Triumvirate) ── */
            <div className="grid grid-cols-3 gap-2 mb-3">
              {/* Card 1: Matches Played */}
              <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-amber-400/40 rounded-xl p-2.5 text-center transition-all shadow-md group hover:-translate-y-0.5">
                <div className="text-base leading-none mb-1 group-hover:scale-110 transition-transform">🎮</div>
                <div className="text-lg font-bold font-num text-white tracking-tight leading-tight">
                  {profile.gamesPlayed.toLocaleString()}
                </div>
                <div className="text-[10px] font-medium text-slate-300 uppercase tracking-wide mt-1 font-['Prompt',sans-serif]">
                  เกมที่เล่น
                </div>
              </div>

              {/* Card 2: Victories */}
              <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-amber-400/40 rounded-xl p-2.5 text-center transition-all shadow-md group hover:-translate-y-0.5">
                <div className="text-base leading-none mb-1 group-hover:scale-110 transition-transform">🏆</div>
                <div className="text-lg font-bold font-num text-amber-300 tracking-tight leading-tight">
                  {profile.gamesWon.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wide mt-1 font-['Prompt',sans-serif]">
                  ชนะ
                </div>
              </div>

              {/* Card 3: Win Rate */}
              <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-amber-400/40 rounded-xl p-2.5 text-center transition-all shadow-md group hover:-translate-y-0.5">
                <div className="text-base leading-none mb-1 group-hover:scale-110 transition-transform">📈</div>
                <div className="text-lg font-bold font-num text-emerald-400 tracking-tight leading-tight">
                  {profile.winRate}%
                </div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide mt-1 font-['Prompt',sans-serif]">
                  WIN RATE
                </div>
              </div>
            </div>
          ) : (
            /* ── Rank Roadmap (All 8 Tiers + Remaining EXP) ── */
            <div className="mb-3 space-y-2">
              <div className="space-y-1.5 max-h-[235px] overflow-y-auto pr-1">
                {GAME_RANKS.map((r) => {
                  const isCurrent = profile.rank.name === r.name;
                  const isPassed = profile.xp >= r.minXP && !isCurrent;
                  const isLocked = profile.xp < r.minXP;
                  const remainingXP = isLocked ? r.minXP - profile.xp : 0;

                  return (
                    <div
                      key={r.name}
                      className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-amber-500/25 via-yellow-500/15 to-amber-600/20 border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30'
                          : isPassed
                          ? 'bg-white/[0.04] border-white/10 opacity-85'
                          : 'bg-black/50 border-white/5 opacity-70 hover:opacity-100 hover:border-white/15'
                      }`}
                    >
                      {/* Left: Icon & Names */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 border shadow-xs"
                          style={{
                            borderColor: isCurrent ? r.color : `${r.color}55`,
                            backgroundColor: `${r.color}15`,
                          }}
                        >
                          {r.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className="text-xs font-bold leading-tight tracking-wide font-['Prompt',sans-serif] truncate"
                              style={{ color: isCurrent ? '#fef08a' : r.color }}
                            >
                              {r.name}
                            </span>
                          </div>
                          <div className="text-[10.5px] text-slate-300 font-['Prompt',sans-serif] truncate">
                            <span>{r.nameEn}</span>
                            <span className="mx-1 text-slate-500">•</span>
                            <span className="font-num text-slate-200 font-semibold">{r.minXP.toLocaleString()} XP</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Tag */}
                      <div className="shrink-0 text-right pl-1 font-['Prompt',sans-serif]">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 shadow-sm whitespace-nowrap">
                            <span>👑</span>
                            <span>ยศปัจจุบัน</span>
                          </span>
                        ) : r.isOwner ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-600/20 border border-amber-400/40 text-amber-300 shadow-xs whitespace-nowrap">
                            <span>👑</span>
                            <span>เฉพาะผู้สร้าง</span>
                          </span>
                        ) : isPassed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 whitespace-nowrap">
                            <span>✓</span>
                            <span>ปลดล็อกแล้ว</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-400/40 text-amber-300 whitespace-nowrap">
                            <span>🔒 อีก</span>
                            <strong className="font-bold font-num text-amber-200">{remainingXP.toLocaleString()}</strong>
                            <span>XP</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* XP Gain Rules Footer */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 space-y-1.5 font-['Prompt',sans-serif]">
                <div className="font-bold text-amber-300 flex items-center gap-1 text-xs">
                  <span>⚡</span>
                  <span>วิธีเก็บ EXP ในการเล่น:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {XP_GAIN_RULES.map((rule) => (
                    <div key={rule.label} className="flex items-center justify-between px-2 py-1 rounded-lg bg-white/[0.04] border border-white/5">
                      <span className="text-slate-200">{rule.icon} {rule.label}</span>
                      <span className="font-bold text-amber-300 font-num">{rule.xp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resume Room Banner (If active room exists) */}
          {activeRoomId && activePlayerId && onResumeRoom && (
            <div className="flex items-center gap-1.5 mb-3 font-['Prompt',sans-serif]">
              <button
                type="button"
                onClick={() => {
                  onResumeRoom(activeRoomId, activePlayerId);
                  setExpanded(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-950 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
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
                  className="py-2 px-3 rounded-xl text-white/50 hover:text-white hover:bg-white/10 text-xs border border-white/10 transition-all cursor-pointer"
                  title="ยกเลิก/ล้างสถานะห้องนี้"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* ── Logout Button (Refined Eject Protocol) ── */}
          <button
            type="button"
            onClick={() => {
              onLogout();
              setExpanded(false);
            }}
            className="w-full py-2.5 rounded-xl text-slate-200 hover:text-red-300 text-xs font-semibold font-['Prompt',sans-serif] bg-white/[0.04] hover:bg-red-950/40 border border-white/10 hover:border-red-500/40 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <span className="text-sm">🚪</span>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      )}
    </div>
  );
};
