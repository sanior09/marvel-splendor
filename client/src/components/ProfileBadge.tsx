// ============================================================
//  ProfileBadge.tsx — Player Profile & XP Stats widget
// ============================================================

import React, { useState } from 'react';
import {
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Gamepad2,
  Lock,
  LogOut,
  MapPin,
  Play,
  Star,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import type { UserProfile } from '../hooks/useAuth';
import { RankBadge, getRankLucideIcon } from './RankBadge';
import { GAME_RANKS, XP_GAIN_RULES } from '../data/ranks';
import { soundManager } from '../utils/soundManager';

interface ProfileBadgeProps {
  profile: UserProfile;
  onLogout: () => void;
  activeRoomId?: string;
  activePlayerId?: string;
  onResumeRoom?: (roomId: string, playerId: string) => void;
  onClearActiveRoom?: () => void;
  avatarUrl?: string | null;
}

function getXpRuleIcon(label: string) {
  if (label.includes('ชนะ')) return Trophy;
  if (label.includes('Tier 3')) return Star;
  if (label.includes('สถานที่')) return MapPin;
  return Gamepad2;
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
    ? Math.min(
        100,
        Math.round(
          ((profile.xp - profile.rank.minXP) / (profile.nextRank.minXP - profile.rank.minXP)) * 100
        )
      )
    : 100;

  const isOwner = Boolean(profile.rank.isOwner || profile.rank.minXP >= 50000);
  const RankIcon = getRankLucideIcon(profile.rank.nameEn, isOwner);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2.5 h-9 px-3 rounded-lg border transition-colors cursor-pointer select-none ${
          isOwner
            ? 'border-amber-400/40 bg-[#11141c] hover:bg-[#1a1e28]'
            : 'border-white/[0.08] bg-[#11141c] hover:bg-[#1a1e28]'
        }`}
      >
        <div
          className="w-6 h-6 rounded-md shrink-0 flex items-center justify-center bg-[#1a1e28] border border-white/[0.08]"
          style={{ borderColor: isOwner ? 'rgba(245, 158, 11, 0.4)' : undefined }}
        >
          <RankIcon
            className="w-3.5 h-3.5"
            strokeWidth={1.5}
            style={{ color: isOwner ? '#fbbf24' : profile.rank.color }}
          />
        </div>

        <div className="text-left leading-tight">
          <div className="text-[#eef0f5] text-xs font-medium">{profile.username}</div>
          <div className="text-[11px] text-amber-300">{profile.rank.name}</div>
        </div>

        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-[#7a8296] ml-0.5" strokeWidth={1.5} />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[#7a8296] ml-0.5" strokeWidth={1.5} />
        )}
      </button>

      {/* Click outside backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/60 sm:bg-transparent"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Dropdown Modal */}
      {expanded && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:translate-x-0 sm:translate-y-0 sm:mt-2 w-[min(94vw,376px)] sm:w-[376px] max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl p-4 z-50 border border-white/[0.1] bg-[#11141c] shadow-2xl animate-fade-in select-none">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 bg-[#1a1e28]"
                style={{
                  borderColor: isOwner ? 'rgba(245, 158, 11, 0.45)' : 'rgba(238, 240, 245, 0.12)',
                }}
              >
                <RankIcon
                  className="w-5 h-5"
                  strokeWidth={1.5}
                  style={{ color: isOwner ? '#fbbf24' : profile.rank.color }}
                />
              </div>

              <div className="min-w-0">
                <div className="text-[#eef0f5] font-medium text-sm truncate">
                  {profile.username}
                </div>
                <div className="mt-1">
                  <RankBadge rank={profile.rank} size="sm" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="w-8 h-8 rounded-lg bg-[#1a1e28] hover:bg-white/[0.1] border border-white/[0.08] text-[#a3a9b8] hover:text-[#eef0f5] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="ปิด"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* EXP Progress */}
          <div className="mb-3 p-3.5 rounded-xl border border-white/[0.08] bg-[#1a1e28]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#a3a9b8]">
                <Zap className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
                <span>EXP สะสม</span>
              </div>
              <span className="text-xs font-medium font-num text-[#eef0f5]">
                {profile.xp.toLocaleString()} XP
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-[#07080d] overflow-hidden my-2">
              <div
                className="h-full rounded-full transition-[width] duration-500 bg-amber-400"
                style={{
                  width: `${xpPercent}%`,
                  backgroundColor: isOwner ? '#fbbf24' : profile.rank.color,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs mt-2">
              {profile.nextRank ? (
                <>
                  <span className="text-[#a3a9b8]">
                    ถัดไป: <span className="text-[#eef0f5] font-medium">{profile.nextRank.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      setViewMode('roadmap');
                    }}
                    className="text-amber-300 hover:text-amber-200 font-medium font-num cursor-pointer"
                  >
                    อีก {profile.xpToNextRank?.toLocaleString()} XP
                  </button>
                </>
              ) : (
                <div className="w-full text-center text-amber-300 text-xs font-medium">
                  ระดับยศสูงสุดของเกม
                </div>
              )}
            </div>
          </div>

          {/* View Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#07080d] border border-white/[0.08] rounded-xl mb-3 gap-1">
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                setViewMode('stats');
              }}
              className={`h-8 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'stats'
                  ? 'bg-[#1a1e28] border border-white/[0.1] text-[#eef0f5]'
                  : 'text-[#7a8296] hover:text-[#a3a9b8]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>สถิติการเล่น</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                setViewMode('roadmap');
              }}
              className={`h-8 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'roadmap'
                  ? 'bg-[#1a1e28] border border-white/[0.1] text-[#eef0f5]'
                  : 'text-[#7a8296] hover:text-[#a3a9b8]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>ตารางยศ</span>
            </button>
          </div>

          {viewMode === 'stats' ? (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-[#1a1e28] border border-white/[0.08] rounded-xl p-3 text-center">
                <Gamepad2 className="w-4 h-4 text-[#7a8296] mx-auto mb-1.5" strokeWidth={1.5} />
                <div className="text-lg font-medium font-num text-[#eef0f5] leading-tight">
                  {profile.gamesPlayed.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#a3a9b8] mt-1">เกมที่เล่น</div>
              </div>

              <div className="bg-[#1a1e28] border border-white/[0.08] rounded-xl p-3 text-center">
                <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1.5" strokeWidth={1.5} />
                <div className="text-lg font-medium font-num text-[#eef0f5] leading-tight">
                  {profile.gamesWon.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#a3a9b8] mt-1">ชนะ</div>
              </div>

              <div className="bg-[#1a1e28] border border-white/[0.08] rounded-xl p-3 text-center">
                <TrendingUp className="w-4 h-4 text-[#4cc38a] mx-auto mb-1.5" strokeWidth={1.5} />
                <div className="text-lg font-medium font-num text-[#eef0f5] leading-tight">
                  {profile.winRate}%
                </div>
                <div className="text-[11px] text-[#a3a9b8] mt-1">อัตราชนะ</div>
              </div>
            </div>
          ) : (
            <div className="mb-3 space-y-3">
              <div className="space-y-1.5 max-h-[236px] overflow-y-auto pr-1">
                {GAME_RANKS.map((r) => {
                  const isCurrent = profile.rank.name === r.name;
                  const isPassed = profile.xp >= r.minXP && !isCurrent;
                  const isLocked = profile.xp < r.minXP;
                  const remainingXP = isLocked ? r.minXP - profile.xp : 0;
                  const ItemIcon = getRankLucideIcon(r.nameEn, r.isOwner);

                  return (
                    <div
                      key={r.name}
                      className={`p-2.5 rounded-xl border transition-colors flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-[#1a1e28] border-amber-400/50'
                          : isPassed
                          ? 'bg-[#1a1e28]/60 border-white/[0.08]'
                          : 'bg-[#07080d] border-white/[0.06] opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/[0.08] bg-[#11141c]">
                          <ItemIcon className="w-3.5 h-3.5" strokeWidth={1.5} style={{ color: r.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-[#eef0f5] truncate">
                            {r.name}
                          </div>
                          <div className="text-[11px] text-[#7a8296] truncate">
                            <span>{r.nameEn}</span>
                            {!r.isOwner && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="font-num text-[#a3a9b8]">{r.minXP.toLocaleString()} XP</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right pl-1">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-400 text-[#07080d]">
                            <Crown className="w-3 h-3" strokeWidth={1.75} />
                            <span>ยศปัจจุบัน</span>
                          </span>
                        ) : r.isOwner ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#1a1e28] border border-amber-400/30 text-amber-300">
                            <span>เฉพาะผู้สร้าง</span>
                          </span>
                        ) : isPassed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4cc38a]">
                            <Check className="w-3 h-3" strokeWidth={1.75} />
                            <span>ปลดล็อกแล้ว</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#7a8296] font-num">
                            <Lock className="w-3 h-3" strokeWidth={1.5} />
                            <span>อีก {remainingXP.toLocaleString()} XP</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* XP Gain Rules */}
              <div className="p-3 rounded-xl bg-[#07080d] border border-white/[0.08] text-xs space-y-2">
                <div className="font-medium text-[#a3a9b8]">วิธีได้รับ EXP</div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {XP_GAIN_RULES.map((rule) => {
                    const RuleIcon = getXpRuleIcon(rule.label);
                    return (
                      <div
                        key={rule.label}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#11141c] border border-white/[0.06] overflow-hidden"
                      >
                        <span className="text-[#a3a9b8] truncate flex items-center gap-1.5">
                          <RuleIcon className="w-3 h-3 text-[#7a8296] shrink-0" strokeWidth={1.5} />
                          <span className="truncate">{rule.label}</span>
                        </span>
                        <span className="font-medium text-amber-300 font-num shrink-0 pl-1">
                          {rule.xp}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Resume Room Banner */}
          {activeRoomId && activePlayerId && onResumeRoom && (
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  onResumeRoom(activeRoomId, activePlayerId);
                  setExpanded(false);
                }}
                className="flex-1 h-9 px-3 rounded-lg text-xs font-medium text-[#07080d] bg-amber-400 hover:bg-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>กลับเข้าห้อง {activeRoomId}</span>
              </button>
              {onClearActiveRoom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearActiveRoom();
                  }}
                  className="w-9 h-9 rounded-lg text-[#7a8296] hover:text-[#eef0f5] hover:bg-[#1a1e28] border border-white/[0.08] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="ล้างสถานะห้อง"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              onLogout();
              setExpanded(false);
            }}
            className="w-full h-9 rounded-lg text-[#a3a9b8] hover:text-red-300 text-xs font-medium bg-[#1a1e28] hover:bg-red-950/40 border border-white/[0.08] hover:border-red-500/30 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      )}
    </div>
  );
};
