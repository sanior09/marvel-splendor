// ============================================================
//  Lobby.tsx — Marvel Splendor Room Creation & Solo AI Customizer
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { RoomInfo } from '@shared/types/game.types';
import type { UserProfile } from '../hooks/useAuth';

import { soundManager } from '../utils/soundManager';
import { MARVEL_MAPS, getMarvelMap } from '../data/marvelMaps';
import { TutorialModal } from './TutorialModal';
import { HeroVFXTestModal } from './HeroVFXTestModal';
import { AboutDisclaimerModal } from './AboutDisclaimerModal';
import { AvatarPicker, MARVEL_AVATARS } from './AvatarPicker';
import { ProfileBadge } from './ProfileBadge';
import { RankBadge } from './RankBadge';
import { resolveMarvelAvatar, getMarvelFallbackEmoji } from '../utils/avatarUtils';

const resolvePlayerAvatar = (name: string, avatarUrl?: string): string | undefined => {
  return resolveMarvelAvatar(name, avatarUrl);
};

interface LobbyProps {
  onCreateRoom: (playerName: string, callback: (room: RoomInfo) => void, mapId?: string, avatarUrl?: string, targetScore?: number) => void;
  onCreateSolo: (playerName: string, botCount: number, botNames?: string[], mapId?: string, avatarUrl?: string, targetScore?: number) => void;
  onJoinRoom: (roomId: string, playerName: string, callback: (success: boolean, err?: string) => void, avatarUrl?: string) => void;
  onLeaveRoom?: () => void;
  onStartGame: () => void;
  countdown?: number | null;
  onStartCountdown?: () => void;
  onCancelCountdown?: () => void;
  onToggleReady?: () => void;
  onAddBot: (botName?: string, personality?: string, callback?: (success: boolean) => void, avatarUrl?: string) => void;
  onRemoveBot: (botId: string) => void;
  onSetTargetScore?: (targetScore: number) => void;
  onListRooms: (callback: (rooms: RoomInfo[]) => void) => void;
  currentRoom: RoomInfo | null;
  myPlayerId: string | null;
  connectionStatus: string;
  afkNotice?: string | null;
  onClearAfkNotice?: () => void;
  // Auth / Profile
  userProfile?: UserProfile | null;
  isGuest?: boolean;
  onLogout?: () => void;
  onResumeRoom?: (roomId: string, playerId: string) => void;
  onClearActiveRoom?: () => void;
}

interface MarvelBotPreset {
  name: string;
  personality: string;
  avatar: string;
  desc: string;
  avatarUrl?: string;
}

const POPULAR_MARVEL_BOTS: MarvelBotPreset[] = [
  { name: 'Doctor Doom', personality: 'stark', avatar: '👑', desc: 'จอมบงการยุทธวิธี เน้นสะสมแต้มใหญ่', avatarUrl: resolveMarvelAvatar('doctor_doom') },
  { name: 'Loki', personality: 'ultron', avatar: '🐍', desc: 'เจ้าเล่ห์ ขัดจังหวะและแย่งจองการ์ด', avatarUrl: resolveMarvelAvatar('loki') },
  { name: 'Thanos Bot', personality: 'thanos', avatar: '🧤', desc: 'มุ่งชิงถุงมือและกวาดอัญมณีทุกสี', avatarUrl: resolveMarvelAvatar('thanos') },
  { name: 'Tony Stark AI', personality: 'stark', avatar: '🦾', desc: 'อัจฉริยะเกราะเหล็ก บริหารเหรียญคุ้มค่า', avatarUrl: resolveMarvelAvatar('iron_man') },
  { name: 'Spider-Man', personality: 'stark', avatar: '🕷️', desc: 'รวดเร็วและคล่องตัว เน้นปิดเกมไว', avatarUrl: resolveMarvelAvatar('spider_man') },
  { name: 'Thor Odinson', personality: 'thanos', avatar: '⚡', desc: 'พลังเทพเจ้าสายฟ้า มุ่งเป้าหมายใหญ่', avatarUrl: resolveMarvelAvatar('thor') },
  { name: 'Wolverine', personality: 'thanos', avatar: '🐺', desc: 'สัญชาตญาณดุดัน ตัดแต้มคู่แข่งทันที', avatarUrl: resolveMarvelAvatar('wolverine') },
  { name: 'Deadpool', personality: 'ultron', avatar: '⚔️', desc: 'คาดเดายาก กวนประสาท ป่วนกระดาน', avatarUrl: resolveMarvelAvatar('deadpool') },
  { name: 'Doctor Strange', personality: 'stark', avatar: '✨', desc: 'จอมเวทย์สูงสุด วางแผนล่วงหน้าหลายก้าว', avatarUrl: resolveMarvelAvatar('doctor_strange') },
  { name: 'Black Panther', personality: 'stark', avatar: '🐾', desc: 'กษัตริย์วากานด้า เน้นทรัพยากรหนาแน่น', avatarUrl: resolveMarvelAvatar('black_panther') },
  { name: 'Vision', personality: 'friday', avatar: '🤖', desc: 'ปัญญาประดิษฐ์อัจฉริยะ เดินเกมสมดุลแม่นยำ', avatarUrl: resolveMarvelAvatar('vision') },
  { name: 'Scarlet Witch', personality: 'ultron', avatar: '🔮', desc: 'บิดเบือนความเป็นจริง ชิงจังหวะการ์ดสำคัญ', avatarUrl: resolveMarvelAvatar('scarlet_witch') },
  { name: 'Captain America', personality: 'stark', avatar: '🛡️', desc: 'ผู้นำทีมอเวนเจอร์ส เล่นรอบคอบรัดกุม', avatarUrl: resolveMarvelAvatar('captain_america') },
  { name: 'Hulk', personality: 'thanos', avatar: '💚', desc: 'จอมพลังทุบแหลก บุกทะลวงแต้มตรงไปตรงมา', avatarUrl: resolveMarvelAvatar('hulk') },
];

export const AI_PERSONALITY_META: Record<string, { label: string; icon: string; bg: string; text: string; border: string }> = {
  stark: {
    label: 'สายกลยุทธ์',
    icon: '🧠',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/35',
  },
  ultron: {
    label: 'สายก่อกวน',
    icon: '⚡',
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-300',
    border: 'border-cyan-500/35',
  },
  thanos: {
    label: 'สายดุดัน',
    icon: '🔥',
    bg: 'bg-red-500/15',
    text: 'text-red-300',
    border: 'border-red-500/35',
  },
  friday: {
    label: 'สายสมดุล',
    icon: '🤖',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/35',
  },
};

export const getBotPersonalityInfo = (personality?: string) => {
  const p = personality?.toLowerCase() || 'stark';
  return AI_PERSONALITY_META[p] || AI_PERSONALITY_META['stark'];
};

// ── QuickAvatarThumb: tiny avatar with error fallback ─────────
const QUICK_EMOJI: Record<string, string> = {
  iron_man: '🦾', thor: '⚡', captain_america: '🛡️', hulk: '💚',
  spider_man: '🕷️', black_panther: '🐾', doctor_strange: '✨', thanos: '🧤',
};
const QuickAvatarThumb: React.FC<{ src: string; fallbackEmoji: string }> = ({ src, fallbackEmoji }) => {
  const [failed, setFailed] = React.useState(false);
  return failed ? (
    <div className="w-full h-full bg-gradient-to-br from-red-700 to-purple-700 flex items-center justify-center text-xs select-none">
      {QUICK_EMOJI[fallbackEmoji] ?? '🦸'}
    </div>
  ) : (
    <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="w-full h-full object-cover object-center" />
  );
};

export const Lobby: React.FC<LobbyProps> = ({
  onCreateRoom,
  onCreateSolo,
  onJoinRoom,
  onLeaveRoom,
  onStartGame,
  countdown,
  onStartCountdown,
  onCancelCountdown,
  onToggleReady,
  onAddBot,
  onRemoveBot,
  onSetTargetScore,
  onListRooms,
  currentRoom,
  myPlayerId,
  connectionStatus,
  afkNotice,
  onClearAfkNotice,
  userProfile,
  isGuest,
  onLogout,
  onResumeRoom,
  onClearActiveRoom,
}) => {
  const [playerName, setPlayerName] = useState(userProfile?.username || '');

  // Pre-fill with logged-in username automatically; user can click and edit anytime
  useEffect(() => {
    if (userProfile?.username && !playerName) {
      setPlayerName(userProfile.username);
    }
  }, [userProfile?.username]);

  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openRooms, setOpenRooms] = useState<RoomInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'solo' | 'create' | 'join' | 'browse'>('solo');
  const [selectedMapId, setSelectedMapId] = useState<string>('asgard');
  const [targetScore, setTargetScore] = useState<number>(16);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showVFXLab, setShowVFXLab] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [roomCodeCopied, setRoomCodeCopied] = useState(false);

  // Solo mode local countdown state
  const [soloCountdown, setSoloCountdown] = useState<number | null>(null);
  const soloCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // For solo mode: hold the args to pass to onCreateSolo when countdown finishes
  const [soloContext, setSoloContext] = useState<{
    finalName: string;
    botCount: number;
    botNames: string[];
    mapId: string;
    avatarUrl?: string;
    targetScore: number;
  } | null>(null);

  // Active countdown: either solo mode local timer or multiplayer server room countdown
  const activeCountdown = soloCountdown !== null ? soloCountdown : (countdown ?? null);

  // Audio effect: play tactical countdown tick whenever activeCountdown ticks down
  useEffect(() => {
    if (activeCountdown !== null && activeCountdown > 0) {
      soundManager.playCountdownTick(activeCountdown);
    }
  }, [activeCountdown]);

  const startSoloCountdownTimer = (onFinish: () => void) => {
    setSoloCountdown(5);
    soloCountdownRef.current = setInterval(() => {
      setSoloCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(soloCountdownRef.current!);
          soundManager.playBattleLaunch();
          onFinish();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartGame = () => {
    if (!canStart) {
      soundManager.playError();
      return;
    }
    soundManager.playButtonClick();
    setSoloContext(null); // multiplayer mode
    if (onStartCountdown) {
      onStartCountdown();
    } else {
      onStartGame();
    }
  };

  const handleCancelStart = () => {
    if (soloCountdownRef.current) clearInterval(soloCountdownRef.current);
    setSoloCountdown(null);
    setSoloContext(null);
    if (onCancelCountdown) {
      onCancelCountdown();
    }
    soundManager.playButtonClick();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (soloCountdownRef.current) clearInterval(soloCountdownRef.current); };
  }, []);

  // Avatar / Profile picture state (Default to Iron Man so avatar is never null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(MARVEL_AVATARS[0]?.src || null);
  const [avatarId, setAvatarId] = useState<string | null>(MARVEL_AVATARS[0]?.id || 'iron_man');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleAvatarSelect = (url: string, id: string) => {
    setAvatarUrl(url);
    setAvatarId(id);
  };

  // Default fallback avatar display when nothing is chosen
  const avatarInitial = playerName.trim().charAt(0).toUpperCase() || '?';

  // Solo mode customization state
  const [botCount, setBotCount] = useState<number>(2);
  const [botNames, setBotNames] = useState<string[]>([
    'Doctor Doom',
    'Loki',
    'Thanos Bot',
  ]);
  const [customBotSlots, setCustomBotSlots] = useState<Record<number, boolean>>({});
  const [selectingBotSlot, setSelectingBotSlot] = useState<number | null>(null);

  // Modal state for adding bot in waiting room
  const [showAddBotModal, setShowAddBotModal] = useState(false);
  const [newBotName, setNewBotName] = useState('Doctor Doom');
  const [newBotPersonality, setNewBotPersonality] = useState('stark');

  const isHost = currentRoom?.hostId === myPlayerId;
  const nonHostHumans = currentRoom?.players.filter((p) => p.id !== currentRoom.hostId && !p.isBot) ?? [];
  const unreadyHumans = nonHostHumans.filter((p) => !p.isReady);
  const allReady = nonHostHumans.length === 0 || unreadyHumans.length === 0;
  const canStart = isHost && (currentRoom?.players.length ?? 0) >= 2 && allReady;
  const canAddMoreBots = isHost && (currentRoom?.players.length ?? 0) < 4;

  const myPlayerInRoom = currentRoom?.players.find((p) => p.id === myPlayerId);
  const isMeReady = Boolean(myPlayerInRoom?.isReady);

  useEffect(() => {
    if (!currentRoom) {
      const interval = setInterval(() => {
        onListRooms(setOpenRooms);
      }, 3000);
      onListRooms(setOpenRooms);
      return () => clearInterval(interval);
    }
  }, [currentRoom, onListRooms]);

  const handleCreate = (): void => {
    const finalName = playerName.trim() || userProfile?.username || '';
    if (!finalName) {
      soundManager.playError();
      setError('กรุณาระบุชื่อฮีโร่ของคุณ');
      document.getElementById('player-name')?.focus();
      return;
    }
    soundManager.playButtonClick();
    setIsLoading(true);
    setError('');
    onCreateRoom(finalName, () => setIsLoading(false), selectedMapId, avatarUrl || undefined, targetScore);
  };

  const handleSolo = (): void => {
    const finalName = playerName.trim() || userProfile?.username || '';
    if (!finalName) {
      soundManager.playError();
      setError('กรุณาระบุชื่อฮีโร่ของคุณ');
      document.getElementById('player-name')?.focus();
      return;
    }
    const selectedBotNames = botNames.slice(0, botCount).map((name, idx) => {
      return name.trim() || POPULAR_MARVEL_BOTS[idx]?.name || `Marvel AI ${idx + 1}`;
    });
    soundManager.playButtonClick();
    setError('');
    setSoloContext({
      finalName,
      botCount,
      botNames: selectedBotNames,
      mapId: selectedMapId,
      avatarUrl: avatarUrl || undefined,
      targetScore,
    });
    startSoloCountdownTimer(() => {
      setIsLoading(true);
      onCreateSolo(finalName, botCount, selectedBotNames, selectedMapId, avatarUrl || undefined, targetScore);
    });
  };

  const handleJoin = (roomId?: string): void => {
    const code = (roomId ?? joinCode).trim().toUpperCase();
    const finalName = playerName.trim() || userProfile?.username || '';
    if (!finalName) {
      soundManager.playError();
      setError('กรุณาระบุชื่อฮีโร่ของคุณ');
      document.getElementById('player-name')?.focus();
      return;
    }
    if (!code) {
      soundManager.playError();
      setError('กรุณากรอกรหัสห้อง');
      return;
    }
    soundManager.playButtonClick();
    setIsLoading(true);
    setError('');
    onJoinRoom(code, finalName, (success, err) => {
      setIsLoading(false);
      if (!success) {
        soundManager.playError();
        setError(err ?? 'ไม่สามารถเข้าร่วมห้องได้');
      }
    }, avatarUrl || undefined);
  };

  const updateBotName = (index: number, name: string) => {
    const next = [...botNames];
    next[index] = name;
    setBotNames(next);
  };

  const handleShuffleBot = (index: number) => {
    soundManager.playButtonClick();
    const current = botNames[index];
    const available = POPULAR_MARVEL_BOTS.filter((b) => b.name !== current && !botNames.includes(b.name));
    const pool = available.length > 0 ? available : POPULAR_MARVEL_BOTS.filter((b) => b.name !== current);
    const picked = pool[Math.floor(Math.random() * pool.length)] ?? POPULAR_MARVEL_BOTS[0];
    updateBotName(index, picked.name);
    setCustomBotSlots((prev) => ({ ...prev, [index]: false }));
  };

  const handleRandomizeAllBots = () => {
    soundManager.playButtonClick();
    const shuffled = [...POPULAR_MARVEL_BOTS].sort(() => 0.5 - Math.random());
    const newNames = shuffled.slice(0, botCount).map((b) => b.name);
    setBotNames((prev) => {
      const next = [...prev];
      newNames.forEach((n, i) => { next[i] = n; });
      return next;
    });
    setCustomBotSlots({});
  };

  const handleConfirmAddBot = () => {
    const nameToAdd = newBotName.trim() || 'Marvel AI';
    const preset = POPULAR_MARVEL_BOTS.find((b) => b.name.toLowerCase() === nameToAdd.toLowerCase());
    const botAvatarUrl = preset?.avatarUrl || (nameToAdd.toLowerCase().includes('doom') ? '/images/avatars/doctor_doom.jpg' : undefined);
    soundManager.playButtonClick();
    onAddBot(nameToAdd, newBotPersonality, (success) => {
      if (success) {
        setShowAddBotModal(false);
      } else {
        soundManager.playError();
      }
    }, botAvatarUrl);
  };

  // ── Countdown Overlay (Stark Arc Reactor Warp HUD Console) ──
  const countdownOverlay = activeCountdown !== null
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          style={{
            background: 'rgba(5, 7, 18, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          {/* Ambient Cosmic Particle Backlight */}
          <div
            className="fixed inset-0 pointer-events-none opacity-45"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 25%, rgba(245, 158, 11, 0.22) 0%, transparent 60%),
                radial-gradient(circle at 20% 85%, rgba(239, 68, 68, 0.18) 0%, transparent 55%),
                radial-gradient(circle at 80% 85%, rgba(168, 85, 247, 0.16) 0%, transparent 55%)
              `,
            }}
          />

          <div
            className="relative z-10 flex flex-col items-center gap-3.5 sm:gap-4.5 px-4.5 sm:px-6 py-5 sm:py-6 rounded-3xl border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(245,158,11,0.18)] max-w-[420px] w-full text-center overflow-hidden animate-slide-up select-none my-auto"
            style={{
              background: 'linear-gradient(165deg, rgba(18, 24, 46, 0.98) 0%, rgba(9, 12, 24, 0.99) 100%)',
            }}
          >
            {/* Top Subtle Amber Tech Glow Stripe */}
            <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90" />

            {/* Marvel Splendor & Mission Header */}
            <div className="flex flex-col items-center gap-1.5 w-full border-b border-white/10 pb-2.5">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <span className="marvel-badge px-2 py-0.5 rounded text-[11px] font-black tracking-wider">MARVEL</span>
                  <span className="font-display font-black text-sm text-white tracking-widest">SPLENDOR</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[9.5px] font-mono uppercase text-amber-300 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>WARP INITIATED</span>
                </div>
              </div>
              <p className="text-white/60 text-[11px] font-medium tracking-wide">
                ระบบกำลังจัดเตรียมสมรภูมิและเคลื่อนพลเข้าสู่การประลอง
              </p>
            </div>

            {/* Clean, Modern Countdown Timer (No Circular HUD / No Shockwave Pulse) */}
            <div className="flex flex-col items-center justify-center my-3 select-none">
              <span
                key={`countdown-num-${activeCountdown}`}
                className="font-num font-black leading-none text-7xl sm:text-8xl select-none animate-countdown-tick"
                style={{
                  background: activeCountdown === 1
                    ? 'linear-gradient(135deg, #fef08a, #ef4444)'
                    : 'linear-gradient(135deg, #fde047, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: activeCountdown === 1
                    ? 'drop-shadow(0 0 24px rgba(239,68,68,0.85))'
                    : 'drop-shadow(0 0 18px rgba(245,158,11,0.65))',
                }}
              >
                {activeCountdown}
              </span>
              <span
                className={`text-xs tracking-widest uppercase font-bold mt-2 ${
                  activeCountdown === 1 ? 'text-red-400 animate-pulse font-extrabold' : 'text-white/60'
                }`}
              >
                {activeCountdown === 1 ? '🔥 เตรียมพร้อม!' : 'วินาที (SECONDS)'}
              </span>
            </div>

            {/* Combat Squad Roster Bento Card */}
            <div className="w-full bg-black/45 border border-white/10 rounded-2xl p-2.5 space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-white/50 px-1 font-mono uppercase">
                <span>COMBAT SQUAD S.H.I.E.L.D.</span>
                <span>{soloContext ? `${soloContext.botNames.length + 1} COMBATANTS` : `${currentRoom?.players.length ?? 0} PLAYERS`}</span>
              </div>

              <div className="flex items-center gap-2 justify-center flex-wrap">
                {soloContext ? (
                  <>
                    {/* Human Player */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-400/30">
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-300 ring-1 ring-amber-400/50 shrink-0 bg-neutral-900 flex items-center justify-center">
                        {soloContext.avatarUrl ? (
                          <img src={soloContext.avatarUrl} alt={soloContext.finalName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-[11px]">
                            {soloContext.finalName[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] font-bold text-yellow-300 max-w-[70px] truncate leading-tight">
                          {soloContext.finalName}
                        </div>
                        <span className="text-[8.5px] text-amber-200/60 uppercase font-mono block">YOU</span>
                      </div>
                    </div>

                    {/* Bot Enemies */}
                    {soloContext.botNames.map((name, idx) => {
                      const preset = POPULAR_MARVEL_BOTS.find((b) => b.name === name);
                      const botSrc = resolveMarvelAvatar(name, preset?.avatarUrl);
                      const fallbackEmoji = getMarvelFallbackEmoji(name, true);
                      return (
                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-400/30">
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-purple-400/60 shrink-0 bg-neutral-900 flex items-center justify-center text-xs">
                            {botSrc ? (
                              <img
                                src={botSrc}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  if (target.nextElementSibling) {
                                    (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div className={`${botSrc ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-700 text-white font-black text-[10px]`}>
                              {fallbackEmoji}
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-[11px] font-bold text-purple-200 max-w-[70px] truncate leading-tight">
                              {name}
                            </div>
                            <span className="text-[8.5px] text-purple-300/60 uppercase font-mono block">AI BOT</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  // Multiplayer mode: show currentRoom players
                  currentRoom?.players.map((p) => {
                    const src = resolvePlayerAvatar(p.name, p.avatarUrl);
                    const isMe = p.id === myPlayerId;
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${
                          isMe
                            ? 'bg-amber-500/10 border-amber-400/40 ring-1 ring-amber-400/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full overflow-hidden border shrink-0 bg-neutral-900 flex items-center justify-center text-xs ${
                            isMe ? 'border-amber-300' : 'border-white/20'
                          }`}
                        >
                          {src ? (
                            <img
                              src={src}
                              alt={p.name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.nextElementSibling) {
                                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                          <div className={`${src ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-[10px]`}>
                            {getMarvelFallbackEmoji(p.name, p.isBot)}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className={`text-[11px] font-bold truncate max-w-[75px] leading-tight ${isMe ? 'text-yellow-300' : 'text-white'}`}>
                            {p.name}
                          </div>
                          <span className="text-[8.5px] text-white/50 uppercase font-mono block">
                            {isMe ? 'YOU' : p.isBot ? 'AI' : 'PLAYER'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cancel / Abort Button (Tactile Mobile Friendly) */}
            {isHost || soloContext ? (
              <button
                type="button"
                id="cancel-start-game-btn"
                onClick={handleCancelStart}
                className="w-full py-2.5 rounded-xl font-bold font-display text-xs text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-white/15 bg-white/5 hover:bg-white/10 active:scale-[0.98] touch-manipulation min-h-[42px]"
              >
                <span>✕</span>
                <span>ยกเลิกการเริ่มเกม (ABORT MISSION)</span>
              </button>
            ) : (
              <div className="w-full py-2.5 px-3 rounded-xl font-bold font-display text-xs text-amber-300 border border-amber-400/30 bg-amber-500/10 flex items-center justify-center gap-2 select-none min-h-[42px]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>รอ HOST นำทัพเข้าสู่สมรภูมิ...</span>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  // ── In-Room Lobby (Waiting Room: Stark S.H.I.E.L.D. Command Console) ──
  if (currentRoom) {
    const unfilledSlotsCount = Math.max(0, 4 - currentRoom.players.length);
    const roomMap = getMarvelMap(currentRoom.mapId);

    return (
      <>
        {countdownOverlay}
        <div
          className="w-full h-full overflow-y-auto overflow-x-hidden board-bg flex flex-col items-center justify-start p-2.5 sm:p-5 relative select-none"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          {/* Subtle Ambient Vignette & Lights */}
          <div
            className="fixed inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 15%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 85% 85%, rgba(220, 38, 38, 0.12) 0%, transparent 45%),
                radial-gradient(circle at 15% 85%, rgba(147, 51, 234, 0.12) 0%, transparent 45%)
              `,
            }}
          />

          <div className="relative z-10 w-full max-w-[480px] pt-1 sm:pt-2 pb-8">
            <div
              className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 w-full space-y-3 sm:space-y-3.5 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.12)] relative overflow-hidden"
              style={{
                background: 'linear-gradient(165deg, rgba(16, 22, 42, 0.97) 0%, rgba(8, 11, 22, 0.99) 100%)',
              }}
            >
              {/* Top Cyber Gold Stripe Accent */}
              <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

              {/* ── 1. Top Navigation & Action Row ── */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onLeaveRoom?.();
                  }}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/12 border border-white/15 text-white/80 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 touch-manipulation min-h-[36px]"
                  title="ออกจากห้องแล้วกลับสู่หน้าหลัก"
                >
                  <span className="text-sm">←</span>
                  <span>ออกจากห้อง</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="marvel-badge px-2 py-0.5 rounded text-[10.5px] font-black tracking-wider">MARVEL</span>
                  <span className="font-display font-black text-xs sm:text-sm text-white tracking-widest">SPLENDOR</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playModalOpen();
                    setShowTutorial(true);
                  }}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/35 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 touch-manipulation min-h-[36px]"
                  title="คู่มือวิธีเล่น MARVEL SPLENDOR"
                >
                  <span>📘</span>
                  <span>วิธีเล่น</span>
                </button>
              </div>

              {/* ── 2. Security Clearance Code Banner (Stark Cyber Pass) ── */}
              <div
                className="rounded-2xl p-3 sm:p-3.5 relative overflow-hidden border border-amber-400/35 text-center"
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 24, 15, 0.7) 0%, rgba(13, 16, 28, 0.9) 100%)',
                  boxShadow: 'inset 0 0 20px rgba(245, 158, 11, 0.08), 0 4px 15px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div className="flex items-center justify-between text-[10px] text-amber-300/80 font-mono tracking-wider uppercase mb-1">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>SECURE WAR ROOM CODE</span>
                  </span>
                  <span>แชร์ให้เพื่อนร่วมทีม</span>
                </div>

                <div className="flex items-center justify-center gap-2.5 my-1">
                  <div className="bg-black/75 border border-red-500/40 rounded-xl px-4 py-1.5 flex items-center shadow-inner">
                    <span
                      className="font-mono font-black text-2xl sm:text-3xl text-red-400 tracking-[0.28em] drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] select-all"
                    >
                      {currentRoom.roomId}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentRoom.roomId).catch(() => {});
                      soundManager.playButtonClick();
                      setRoomCodeCopied(true);
                      setTimeout(() => setRoomCodeCopied(false), 2000);
                    }}
                    className={`px-3 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 touch-manipulation min-h-[40px] ${
                      roomCodeCopied
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-emerald-950/50'
                        : 'bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-black/40'
                    }`}
                    title="คัดลอกรหัสห้อง"
                  >
                    <span>{roomCodeCopied ? '✓' : '📋'}</span>
                    <span>{roomCodeCopied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>

              {/* ── 3. Mission Parameters Bento (Map & Target Score) ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Map Card */}
                <div className="rounded-xl p-2.5 bg-white/[0.03] border border-white/10 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{roomMap.icon}</span>
                    <div className="min-w-0">
                      <div className="text-[9px] text-white/50 uppercase font-mono tracking-wider">สมรภูมิรบ</div>
                      <div className="text-xs font-bold text-white truncate">{roomMap.name}</div>
                    </div>
                  </div>
                  <span className="text-[9px] bg-red-600/80 text-white font-mono px-1.5 py-0.5 rounded-md uppercase tracking-wider font-bold shrink-0">
                    LOCKED
                  </span>
                </div>

                {/* Target Score Card */}
                <div className="rounded-xl p-2.5 bg-white/[0.03] border border-white/10 flex flex-col justify-center shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🎯</span>
                      <span className="text-[9px] text-white/50 uppercase font-mono tracking-wider">เป้าหมายแต้มชัยชนะ</span>
                    </div>
                    <span className="text-xs font-black font-num text-yellow-300">
                      {currentRoom.targetScore ?? 16} แต้ม
                    </span>
                  </div>

                  {/* Host Quick Adjust Pills */}
                  {isHost && onSetTargetScore ? (
                    <div className="grid grid-cols-4 gap-1 mt-0.5">
                      {[12, 16, 20, 24].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => {
                            soundManager.playScorePresetSelect(pts);
                            onSetTargetScore(pts);
                          }}
                          className={`py-1 rounded-lg font-black font-num text-[11px] transition-all cursor-pointer border active:scale-95 touch-manipulation ${
                            (currentRoom.targetScore ?? 16) === pts
                              ? 'border-yellow-400 bg-yellow-400 text-slate-950 shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                              : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {pts}P
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* ── 4. Combat Squadron Roster Bento (Player List) ── */}
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/45 shadow-inner">
                <div className="px-3.5 py-2 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <span className="text-[11px] text-white/80 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>สมาชิกในทีม (SQUAD ROSTER)</span>
                  </span>
                  <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/25">
                    {currentRoom.players.length} / 4 คน
                  </span>
                </div>

                <div className="p-2 space-y-1.5">
                  {currentRoom.players.map((p) => {
                    const avatarSrc = resolvePlayerAvatar(p.name, p.avatarUrl);
                    const fallbackEmoji = getMarvelFallbackEmoji(p.name, p.isBot);
                    const isHostPlayer = p.id === currentRoom.hostId;
                    const isMe = p.id === myPlayerId;

                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${
                          isMe
                            ? 'bg-amber-500/10 border-amber-400/35 ring-1 ring-amber-400/20'
                            : isHostPlayer
                            ? 'bg-white/[0.04] border-white/15'
                            : 'bg-white/[0.02] border-white/8'
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 shrink-0 bg-neutral-900 flex items-center justify-center text-sm shadow ${
                            isHostPlayer
                              ? 'border-amber-300 ring-1 ring-amber-400/40'
                              : p.isBot
                              ? 'border-purple-400 ring-1 ring-purple-400/30'
                              : 'border-white/20'
                          }`}
                        >
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={p.name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
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
                        </div>

                        {/* Player Details */}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-bold text-xs truncate ${isMe ? 'text-yellow-300' : 'text-white'}`}>
                              {p.name}
                            </span>
                            <RankBadge rank={p.rank} isBot={p.isBot} size="sm" />
                            {isMe && (
                              <span className="text-[8.5px] font-bold text-amber-300 bg-amber-400/20 px-1 py-0.2 rounded border border-amber-400/30">
                                คุณ
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-white/45 font-mono">
                            {p.isBot ? 'MARVEL AI AGENT' : isHostPlayer ? 'MISSION HOST' : 'ALLIED OPERATIVE'}
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isHostPlayer ? (
                            <span className="text-[9.5px] font-bold text-yellow-300 bg-yellow-400/15 px-2 py-0.5 rounded-full border border-yellow-400/35 flex items-center gap-1">
                              <span>👑</span>
                              <span>หัวหน้าห้อง</span>
                            </span>
                          ) : p.isBot ? (
                            <span className="text-[9.5px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>พร้อม</span>
                            </span>
                          ) : p.isReady ? (
                            <span className="text-[9.5px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>พร้อมแล้ว</span>
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-medium text-amber-300/90 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-400/25 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              <span>ยังไม่พร้อม</span>
                            </span>
                          )}

                          {/* Bot Remove Button (Host only) */}
                          {isHost && p.isBot && (
                            <button
                              type="button"
                              onClick={() => {
                                soundManager.playButtonClick();
                                onRemoveBot(p.id);
                              }}
                              className="text-red-400 hover:text-red-300 w-6 h-6 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 flex items-center justify-center text-xs transition-all cursor-pointer active:scale-95 touch-manipulation"
                              title="ลบบอทออก"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Ghost Slots (Visual indicator for open spots) */}
                  {Array.from({ length: unfilledSlotsCount }).map((_, idx) => (
                    <div
                      key={`empty-slot-${idx}`}
                      className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-dashed border-white/10 bg-white/[0.01] text-white/30 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center text-[10px] text-white/30">
                          +
                        </div>
                        <span className="text-[11px] font-medium">รอผู้เล่นเข้าร่วม...</span>
                      </div>
                      <span className="text-[9px] font-mono uppercase text-white/30 tracking-wider">OPEN SLOT</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 5. Add Bot Action (Host Only) ── */}
              {isHost && canAddMoreBots && (
                <button
                  type="button"
                  onClick={() => {
                    const used = new Set(currentRoom.players.map((p) => p.name));
                    const available = POPULAR_MARVEL_BOTS.find((b) => !used.has(b.name));
                    setNewBotName(available?.name ?? 'Doctor Doom');
                    setNewBotPersonality(available?.personality ?? 'stark');
                    soundManager.playButtonClick();
                    setShowAddBotModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl border border-dashed border-purple-400/50 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-400 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98] touch-manipulation min-h-[42px]"
                >
                  <span className="text-sm">🤖</span>
                  <span>+ เพิ่มคู่ต่อสู้ MARVEL AI BOT</span>
                </button>
              )}

              {/* ── 6. Token Pool Info Indicator ── */}
              {currentRoom && currentRoom.players.length >= 2 && (
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2.5 text-center text-[10.5px] text-emerald-200 shadow-inner">
                  <div className="font-bold flex items-center justify-center gap-1">
                    <span>⚡ กองกลางตามจำนวนผู้เล่น ({currentRoom.players.length} คน):</span>
                  </div>
                  <div className="text-white/80 mt-0.5 flex items-center justify-center gap-1.5 flex-wrap">
                    <span>5 สีหลักละ <strong className="text-amber-300 font-num">{currentRoom.players.length === 2 ? 4 : currentRoom.players.length === 3 ? 5 : 7}</strong> ก้อน</span>
                    <span>•</span>
                    <span>🟢 Time Stone <strong className="text-emerald-300 font-num">{currentRoom.players.length}</strong> ก้อน</span>
                    <span>•</span>
                    <span>🛡️ S.H.I.E.L.D. <strong className="text-slate-100 font-num">5</strong> ก้อน</span>
                  </div>
                </div>
              )}

              {/* ── 7. Primary Action Launch Deck ── */}
              {!isHost ? (
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onToggleReady?.();
                    }}
                    className={[
                      'w-full py-3 sm:py-3.5 rounded-xl font-black font-display text-sm transition-all duration-200 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] touch-manipulation min-h-[46px]',
                      isMeReady
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border border-amber-400/40 shadow-amber-950/40'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 shadow-emerald-950/40 animate-pulse',
                    ].join(' ')}
                  >
                    {isMeReady ? (
                      <>
                        <span>✕</span>
                        <span>ยกเลิกพร้อมเล่น (CANCEL READY)</span>
                      </>
                    ) : (
                      <>
                        <span className="text-base">⚡</span>
                        <span>ยืนยันพร้อมเล่น (CONFIRM READY)</span>
                      </>
                    )}
                  </button>
                  {isMeReady ? (
                    <p className="text-center text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                      <span>✨</span> คุณพร้อมแล้ว! กำลังรอหัวหน้าห้องกดเริ่มเกม...
                    </p>
                  ) : (
                    <p className="text-center text-amber-300/90 text-xs flex items-center justify-center gap-1.5">
                      <span>⚠️</span> กรุณากดปุ่มเพื่อส่งสัญญาณให้หัวหน้าห้องทราบว่าคุณพร้อม
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleStartGame();
                    }}
                    disabled={!canStart}
                    className={[
                      'w-full py-3 sm:py-3.5 rounded-xl font-black font-display text-sm transition-all duration-200 uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] touch-manipulation min-h-[46px]',
                      canStart
                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_8px_25px_rgba(16,185,129,0.4)] cursor-pointer hover:-translate-y-0.5'
                        : 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10',
                    ].join(' ')}
                  >
                    <span className="text-base">🚀</span>
                    <span>
                      {(currentRoom?.players.length ?? 0) < 2
                        ? `ต้องการผู้เล่นอีกอย่างน้อย ${2 - (currentRoom?.players.length ?? 0)} คน`
                        : !allReady
                        ? `รอผู้เล่นยืนยัน (${nonHostHumans.length - unreadyHumans.length}/${nonHostHumans.length} พร้อม)`
                        : 'เริ่มเกม MARVEL SPLENDOR'}
                    </span>
                    {canStart && <span className="text-yellow-300">➔</span>}
                  </button>

                  {(currentRoom?.players.length ?? 0) >= 2 && !allReady && (
                    <p className="text-center text-amber-400/90 text-xs flex items-center justify-center gap-1">
                      <span>⏳</span>
                      <span>รอผู้เล่น: <span className="font-bold text-amber-300">{unreadyHumans.map((p) => p.name).join(', ')}</span> กดยืนยันพร้อมเล่น</span>
                    </p>
                  )}
                  {canStart && (
                    <p className="text-center text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1">
                      <span>✨</span>
                      <span>ทุกคนพร้อมเข้าสู่สมรภูมิแล้ว! หัวหน้าห้องเริ่มเกมได้เลย</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>



          {/* Add Bot Modal */}
          {showAddBotModal &&
            createPortal(
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                <div className="glass-strong rounded-3xl p-6 max-w-sm w-full space-y-4 border border-purple-500/40 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                      <span>🤖</span> เพิ่มคู่ต่อสู้บอท AI
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddBotModal(false)}
                      className="text-white/40 hover:text-white text-lg leading-none cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block mb-1.5">
                      ชื่อบอท AI (เลือกด่วนหรือพิมพ์เอง)
                    </label>
                    <input
                      type="text"
                      value={newBotName}
                      onChange={(e) => setNewBotName(e.target.value)}
                      placeholder="ระบุชื่อบอท (เช่น Doctor Doom)..."
                      maxLength={20}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 font-semibold text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">
                      เลือกตัวละครด่วน
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {POPULAR_MARVEL_BOTS.map((bot) => (
                        <button
                          key={bot.name}
                          type="button"
                          onClick={() => {
                            soundManager.playButtonClick();
                            setNewBotName(bot.name);
                            setNewBotPersonality(bot.personality);
                          }}
                          className={[
                            'text-left p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                            newBotName === bot.name
                              ? 'border-purple-400 bg-purple-500/30 text-white shadow'
                              : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white',
                          ].join(' ')}
                        >
                          <span>{bot.avatar}</span>
                          <span className="truncate">{bot.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBotModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAddBot}
                      disabled={!newBotName.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                    >
                      + เพิ่มบอท
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}
            {/* Tutorial Modal in Waiting Room */}
            <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
        <HeroVFXTestModal isOpen={showVFXLab} onClose={() => setShowVFXLab(false)} playerName={userProfile?.username || playerName || 'SANIOR'} />
        </div>
      </>
    );
  }

  // ── Main Lobby Screen ───────────────────────────────
  // ── Main Lobby Screen (Tactical War Room Command Center) ──
  return (
    <>
      {countdownOverlay}

      {/* ── Dynamic Battlefield Realm Wallpaper with Cinematic Scrim ── */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 transform scale-105 pointer-events-none -z-10"
        style={{
          backgroundImage: `url('${getMarvelMap(selectedMapId).imageUrl}'), url('/images/maps/asgard.jpg')`,
          filter: 'brightness(0.24) saturate(1.2) contrast(1.15)',
        }}
      />
      {/* Dark Ambient Scrim */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 25%, rgba(6,9,19,0.72) 0%, rgba(5,7,14,0.94) 70%, #05070e 100%)',
        }}
      />
      {/* Structural Technical Gridlines */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] -z-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div
        className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start px-3 sm:px-6 py-1.5 lg:py-2.5 relative select-none touch-pan-y"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        
        {/* Top Command Telemetry Bar */}
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 pt-0.5 pb-1 lg:pb-1.5">
          {/* Telemetry watermark on left */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-white/40 uppercase tracking-wider font-['Prompt',sans-serif] text-[10px] hidden sm:inline-block">
              MARVEL SPLENDOR ONLINE
            </span>
            <span className="text-white/20 hidden sm:inline-block">•</span>
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
              style={{
                background: connectionStatus === 'connected' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                borderColor: connectionStatus === 'connected' ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)',
                color: connectionStatus === 'connected' ? '#6ee7b7' : '#fca5a5',
              }}
            >
              {connectionStatus === 'connected' ? '● ONLINE' : connectionStatus}
            </span>
          </div>

          {/* Top-Right Control Bar: Tutorial Guide + Profile Badge */}
          <div className="flex items-center gap-2">
            {/* 🎬 Hero VFX Test Lab Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playModalOpen();
                setShowVFXLab(true);
              }}
              className="px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-xl bg-gradient-to-r from-purple-600/40 via-pink-600/40 to-amber-600/40 hover:from-purple-600/60 hover:to-amber-600/60 border border-purple-400/70 text-purple-200 hover:text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_18px_rgba(168,85,247,0.45)] hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md animate-pulse"
              title="ห้องทดสอบเอฟเฟกต์การซื้อฮีโร่และเสียงจริง (22 ตัวละคร)"
            >
              <span>🎬</span>
              <span>ทดสอบเอฟเฟกต์</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playModalOpen();
                setShowTutorial(true);
              }}
              className="px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-600/30 hover:from-amber-500/40 hover:to-yellow-500/40 border border-yellow-400/50 text-yellow-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
              title="คู่มือวิธีเล่น MARVEL SPLENDOR"
            >
              <span>📘</span>
              <span className="hidden sm:inline">วิธีเล่น</span>
            </button>

            {userProfile && !isGuest && onLogout && (
              <ProfileBadge
                profile={userProfile}
                onLogout={onLogout}
                activeRoomId={userProfile.activeRoomId}
                activePlayerId={userProfile.activePlayerId}
                onResumeRoom={onResumeRoom}
                onClearActiveRoom={onClearActiveRoom}
                avatarUrl={avatarUrl}
              />
            )}
            {isGuest && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-xl border border-white/15 bg-white/[0.04] text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                title="เข้าสู่ระบบเพื่อสะสมแต้มและบันทึกประวัติ"
              >
                เข้าสู่ระบบ
              </button>
            )}
          </div>
        </div>

        {/* Hero Header Title */}
        <div className="w-full text-center space-y-1 my-1 lg:my-1.5">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="px-3 py-0.5 bg-[#e23636] text-white font-black text-xl lg:text-2xl tracking-[0.06em] rounded shadow-[0_0_24px_rgba(226,54,54,0.45)] uppercase border border-red-400/30 font-['Bebas_Neue',sans-serif]">
              MARVEL
            </span>
            <span className="text-xl lg:text-3xl font-black tracking-wider uppercase font-['Montserrat',sans-serif] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-[0_2px_12px_rgba(234,179,8,0.3)]">
              SPLENDOR
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-[10.5px] lg:text-xs font-medium text-slate-300 font-['Prompt',sans-serif]">
            <span className="text-amber-400 font-bold">ศูนย์บัญชาการยุทธวิธี</span>
            <span className="text-white/30">•</span>
            <span>เลือกโหมดการเล่น ปรับแต่งทีมฮีโร่ และเข้าสู่สมรภูมิรบ</span>
          </div>
        </div>

        {/* AFK / Inactivity notification banner */}
        {afkNotice && (
          <div className="max-w-6xl w-full mb-2 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-slide-up">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">⏳</span>
              <span className="font-medium">{afkNotice}</span>
            </div>
            {onClearAfkNotice && (
              <button
                type="button"
                onClick={onClearAfkNotice}
                className="text-amber-300 hover:text-white text-base leading-none px-1 cursor-pointer shrink-0"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* ── Main Bento Command Center Grid (Responsive 2-Col Bento on Desktop) ── */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-3.5 pb-2 items-start">
          
          {/* Card 1: Operative Identification (Order 1 on Mobile, Left Column Row 1 on Desktop) */}
          <div
            className="order-1 lg:order-1 lg:col-span-5 rounded-2xl lg:rounded-3xl border border-white/[0.12] p-3 lg:p-3.5 space-y-2 lg:space-y-2.5 transition-all self-start"
            style={{
              background: 'linear-gradient(165deg, rgba(17, 24, 39, 0.88) 0%, rgba(9, 13, 22, 0.96) 100%)',
              backdropFilter: 'blur(28px)',
              boxShadow: '0 16px 40px -10px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
                <span className="font-['Prompt',sans-serif] font-bold tracking-wide text-xs lg:text-sm text-white block">
                  ข้อมูลฮีโร่ของคุณ
                </span>
              </div>
              {userProfile?.username ? (
                <span className="text-[9px] lg:text-[10px] font-mono text-emerald-400/90 tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  ● SYNCED
                </span>
              ) : (
                <span className="text-[9px] lg:text-[10px] font-['Prompt',sans-serif] text-slate-400/90 tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  โหมดผู้มาเยือน
                </span>
              )}
            </div>

            {/* Avatar + Callsign input */}
            <div className="flex items-center gap-3 pt-0.5">
              {/* Tactile Avatar Badge with quick hover indicator */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setShowAvatarPicker(true);
                }}
                title="เปลี่ยนรูปโปรไฟล์มาร์เวล"
                className="relative shrink-0 w-12 h-12 lg:w-13 lg:h-13 rounded-xl overflow-hidden border-2 border-amber-400/70 shadow-[0_0_16px_rgba(245,158,11,0.25)] hover:border-amber-300 hover:scale-105 transition-all cursor-pointer group active:scale-95"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover object-center" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-700 to-amber-600 flex items-center justify-center font-black text-white text-lg">
                    {avatarInitial}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs">✏️</span>
                  <span className="text-[8px] text-white font-bold tracking-tight">เปลี่ยน</span>
                </div>
              </button>

              {/* Hero Name Input */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="player-name" className="text-[11px] lg:text-xs font-bold text-slate-200 font-['Prompt',sans-serif]">
                    ชื่อฮีโร่ของคุณ
                  </label>
                  {userProfile?.username && playerName.trim() !== userProfile.username && (
                    <button
                      type="button"
                      onClick={() => setPlayerName(userProfile.username)}
                      className="text-[9px] text-amber-300 hover:text-amber-200 underline cursor-pointer"
                      title="กดเพื่อรีเซ็ตกลับเป็นชื่อบัญชี"
                    >
                      ↺ คืนค่า
                    </button>
                  )}
                </div>
                <input
                  id="player-name"
                  type="text"
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && (activeTab === 'solo' ? handleSolo() : handleCreate())}
                  maxLength={20}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={userProfile?.username ? userProfile.username : 'ระบุชื่อฮีโร่ของคุณ...'}
                  className={`w-full px-3 py-1.5 lg:py-2 rounded-xl bg-black/45 border text-sm text-white placeholder-slate-500 focus:outline-none transition-all font-['Prompt',sans-serif] ${
                    error
                      ? 'border-red-500 ring-2 ring-red-500/40 bg-red-950/25'
                      : 'border-white/10 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20'
                  }`}
                />
              </div>
            </div>

            {/* Quick Marvel Avatars Reel */}
            <div className="space-y-1 pt-1 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-mono text-slate-400 tracking-wider">
                  เลือกอวตารด่วน:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setShowAvatarPicker(true);
                  }}
                  className="text-[9.5px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer transition-colors"
                >
                  ดูทั้งหมด ＋
                </button>
              </div>
              <div
                className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none touch-pan-x"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {MARVEL_AVATARS.slice(0, 8).map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      handleAvatarSelect(av.src, av.id);
                      soundManager.playButtonClick();
                    }}
                    title={av.name}
                    className={[
                      'shrink-0 w-7 h-7 sm:w-7 sm:h-7 rounded-lg overflow-hidden border transition-all cursor-pointer hover:scale-110 active:scale-95',
                      avatarId === av.id
                        ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-105'
                        : 'border-white/10 opacity-70 hover:opacity-100',
                    ].join(' ')}
                  >
                    <QuickAvatarThumb src={av.src} fallbackEmoji={av.id} />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setShowAvatarPicker(true);
                  }}
                  className="shrink-0 w-7 h-7 sm:w-7 sm:h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-[10px] text-white/70 hover:text-white transition-all cursor-pointer hover:scale-105"
                  title="ดูฮีโร่ทั้งหมด"
                >
                  ＋
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Column: Mission Deployment Console (Order 2 on Mobile, Right Column Spanning 3 Rows on Desktop) ───────── */}
          <div className="order-2 lg:order-2 lg:col-span-7 lg:row-span-3 flex flex-col gap-3">
            
            <div
              className="rounded-2xl lg:rounded-3xl border border-white/[0.12] p-3.5 lg:p-4 space-y-3 lg:space-y-3.5 transition-all"
              style={{
                background: 'linear-gradient(165deg, rgba(17, 24, 39, 0.88) 0%, rgba(9, 13, 22, 0.96) 100%)',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 20px 50px -10px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              {/* Segmented Mode Switcher Tab Bar */}
              <div className="p-0.5 rounded-xl bg-black/45 border border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-1">
                {(['solo', 'create', 'join', 'browse'] as const).map((tab) => {
                  const tabConfig = {
                    solo:   { label: 'เล่นกับ AI', icon: '🤖', sub: 'สู้กับบอท' },
                    create: { label: 'สร้างห้อง',  icon: '⚔️', sub: 'เล่นกับเพื่อน' },
                    join:   { label: 'เข้ารหัสห้อง', icon: '🔑', sub: 'ใส่รหัส PIN' },
                    browse: { label: 'ค้นหาห้อง',  icon: '🔍', sub: 'ห้องเปิดอยู่' },
                  };
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        soundManager.playButtonClick();
                        setActiveTab(tab);
                      }}
                      className={`py-1.5 px-1 rounded-lg text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[38px] ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-md scale-[1.01]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className="text-xs">{tabConfig[tab].icon}</span>
                      <span className="text-[11px] tracking-tight font-bold">{tabConfig[tab].label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Tab 1: Solo AI Skirmish (Marvel Character Roster Console) ──────── */}
              {activeTab === 'solo' && (
                <div className="space-y-2.5 lg:space-y-3 pt-0.5 animate-fadeIn">
                  
                  {/* Bot Opponents Count Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">👥</span>
                        <label className="text-xs lg:text-sm font-bold text-white font-['Prompt',sans-serif]">
                          จำนวนคู่ต่อสู้ AI
                        </label>
                      </div>
                      <span className="text-[9.5px] font-['Prompt',sans-serif] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                        {botCount === 1 ? 'ดวล 1v1' : botCount === 2 ? 'แข่ง 3 คน' : 'เต็มสนาม 4 คน'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { num: 1, title: '1 บอท', sub: 'ดวลเดี่ยว 1v1', icon: '⚔️' },
                        { num: 2, title: '2 บอท', sub: 'ไตรภาคี 3 คน', icon: '⚡' },
                        { num: 3, title: '3 บอท', sub: 'สังเวียนเต็ม 4 คน', icon: '👑' },
                      ].map((item) => (
                        <button
                          key={item.num}
                          type="button"
                          onClick={() => {
                            soundManager.playButtonClick();
                            setBotCount(item.num);
                          }}
                          className={[
                            'p-1.5 lg:p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[42px] relative overflow-hidden group',
                            botCount === item.num
                              ? 'border-amber-400 bg-gradient-to-b from-amber-500/25 to-amber-600/10 text-yellow-300 ring-1 ring-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.25)] font-black scale-[1.01]'
                              : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white font-medium hover:border-white/20',
                          ].join(' ')}
                        >
                          <span className="text-xs font-black font-num flex items-center gap-1">
                            <span>{item.icon}</span> {item.title}
                          </span>
                          <span className="text-[9px] opacity-75 pt-0.5">
                            {item.sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bot Combatants Roster Cards */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between pb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🦸</span>
                        <label className="text-xs lg:text-sm font-bold text-white font-['Prompt',sans-serif]">
                          จัดทัพคู่ต่อสู้ AI
                        </label>
                      </div>
                      <span className="text-[9.5px] font-['Prompt',sans-serif] text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                        {botCount} บอท AI
                      </span>
                    </div>

                    {/* Quick Team Formation Presets Bar */}
                    <div
                      className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none touch-pan-x"
                      style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                      <span className="text-[9.5px] font-mono text-slate-400 shrink-0">จัดทีมด่วน:</span>
                      {[
                        { label: 'อเวนเจอร์ส', icon: '🛡️', bots: ['Tony Stark AI', 'Captain America', 'Thor Odinson'] },
                        { label: 'วายร้าย', icon: '👑', bots: ['Doctor Doom', 'Loki', 'Thanos Bot'] },
                        { label: 'จอมเวทย์', icon: '✨', bots: ['Doctor Strange', 'Scarlet Witch', 'Vision'] },
                        { label: 'เอ็กซ์เมน', icon: '⚔️', bots: ['Wolverine', 'Deadpool', 'Spider-Man'] },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            soundManager.playButtonClick();
                            const count = Math.min(botCount, preset.bots.length);
                            const newNames = preset.bots.slice(0, count);
                            setBotNames((prev) => {
                              const next = [...prev];
                              newNames.forEach((n, i) => { next[i] = n; });
                              return next;
                            });
                            setCustomBotSlots({});
                          }}
                          className="px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-[10px] text-slate-300 hover:text-amber-200 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shrink-0 active:scale-95"
                        >
                          <span>{preset.icon}</span>
                          <span className="font-['Prompt'] font-medium">{preset.label}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleRandomizeAllBots}
                        title="สุ่มคู่ต่อสู้ใหม่ทั้งทีม"
                        className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 border border-amber-400/30 text-[10px] text-amber-300 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shrink-0 ml-auto active:scale-95"
                      >
                        <span>🎲</span>
                        <span className="font-['Prompt'] font-bold">สุ่มทั้งทีม</span>
                      </button>
                    </div>

                    {/* Character Cards List */}
                    <div className="space-y-1.5">
                      {Array.from({ length: botCount }).map((_, idx) => {
                        const currentName = botNames[idx] ?? '';
                        const isCustom = Boolean(customBotSlots[idx]);
                        const matchedPreset = POPULAR_MARVEL_BOTS.find((b) => b.name === currentName);
                        const botAvatarSrc = resolveMarvelAvatar(currentName, matchedPreset?.avatarUrl);
                        const fallbackEmoji = getMarvelFallbackEmoji(currentName, true);
                        const tacticDesc = matchedPreset?.desc ?? 'Custom Marvel AI';

                        return (
                          <div
                            key={idx}
                            className="bg-gradient-to-r from-black/60 to-black/35 hover:from-amber-500/[0.07] hover:to-transparent p-2 lg:p-2.5 rounded-xl border border-white/10 hover:border-amber-400/40 transition-all shadow-sm flex items-center justify-between gap-2.5 group"
                          >
                            {isCustom ? (
                              /* Custom Bot Name Mode */
                              <div className="flex items-center gap-2 w-full">
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[11px] font-mono font-bold text-amber-400">
                                    #{idx + 1}
                                  </span>
                                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg overflow-hidden border border-amber-400/50 bg-neutral-900 flex items-center justify-center shrink-0 shadow">
                                    {botAvatarSrc ? (
                                      <img
                                        src={botAvatarSrc}
                                        alt={currentName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          if (target.nextElementSibling) {
                                            (target.nextElementSibling as HTMLElement).style.display = 'block';
                                          }
                                        }}
                                      />
                                    ) : null}
                                    <span className={botAvatarSrc ? 'hidden text-sm' : 'block text-sm'}>
                                      {fallbackEmoji}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <input
                                    type="text"
                                    value={botNames[idx] ?? ''}
                                    onChange={(e) => updateBotName(idx, e.target.value)}
                                    placeholder="พิมพ์ชื่อบอท เช่น Magneto, Ultron..."
                                    maxLength={20}
                                    autoFocus
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    className="w-full bg-neutral-900/90 border border-amber-400/60 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 font-semibold"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    soundManager.playButtonClick();
                                    setCustomBotSlots((prev) => ({ ...prev, [idx]: false }));
                                    const fallbackPreset = POPULAR_MARVEL_BOTS[idx % POPULAR_MARVEL_BOTS.length];
                                    updateBotName(idx, fallbackPreset.name);
                                  }}
                                  className="shrink-0 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-amber-300 hover:text-amber-200 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                                  title="กลับไปเลือกจากรายชื่อฮีโร่สำเร็จรูป"
                                >
                                  <span>↺</span>
                                  <span className="hidden sm:inline">พรีเซ็ต</span>
                                </button>
                              </div>
                            ) : (
                              /* AAA Game Character Roster Tile */
                              <>
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  {/* Slot Index */}
                                  <div className="flex flex-col items-center shrink-0 w-5 text-center">
                                    <span className="text-[8px] font-mono font-bold text-amber-400/70">SLOT</span>
                                    <span className="text-[11px] font-num font-black text-amber-300">#{idx + 1}</span>
                                  </div>

                                  {/* Character Avatar with Stark Ring */}
                                  <div
                                    onClick={() => {
                                      soundManager.playButtonClick();
                                      setSelectingBotSlot(idx);
                                    }}
                                    className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-lg overflow-hidden border border-white/20 bg-neutral-900 shrink-0 shadow cursor-pointer group-hover:border-amber-400 transition-all"
                                    title="คลิกเพื่อเลือกตัวละครนี้"
                                  >
                                    {botAvatarSrc ? (
                                      <img
                                        src={botAvatarSrc}
                                        alt={currentName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          if (target.nextElementSibling) {
                                            (target.nextElementSibling as HTMLElement).style.display = 'block';
                                          }
                                        }}
                                      />
                                    ) : null}
                                    <span className={botAvatarSrc ? 'hidden text-sm' : 'flex items-center justify-center w-full h-full text-sm'}>
                                      {fallbackEmoji}
                                    </span>
                                  </div>

                                  {/* Character Info */}
                                  <div
                                    onClick={() => {
                                      soundManager.playButtonClick();
                                      setSelectingBotSlot(idx);
                                    }}
                                    className="min-w-0 flex-1 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="text-xs lg:text-sm font-bold text-white group-hover:text-amber-200 transition-colors truncate font-display">
                                        {currentName}
                                      </h4>
                                      {matchedPreset && (() => {
                                        const pInfo = getBotPersonalityInfo(matchedPreset.personality);
                                        return (
                                          <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded-full ${pInfo.bg} border ${pInfo.border} ${pInfo.text} font-['Prompt',sans-serif] font-semibold shrink-0 shadow-sm`}>
                                            <span>{pInfo.icon}</span>
                                            <span>{pInfo.label}</span>
                                          </span>
                                        );
                                      })()}
                                    </div>
                                    <p className="text-[10px] text-slate-400 truncate leading-tight pt-0.5 font-['Prompt']">
                                      {tacticDesc}
                                    </p>
                                  </div>
                                </div>

                                {/* Right Side Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleShuffleBot(idx)}
                                    title="สุ่มเปลี่ยนตัวละครนี้ (Random Roll)"
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95 text-xs flex items-center gap-1"
                                  >
                                    <span>🎲</span>
                                    <span className="hidden lg:inline text-[9.5px]">สุ่ม</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      soundManager.playButtonClick();
                                      setSelectingBotSlot(idx);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 hover:border-amber-400 text-amber-300 font-bold text-xs transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1 shadow"
                                  >
                                    <span>🔄</span>
                                    <span>เลือกตัว</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Winning Points Selector */}
                  <div className="space-y-1.5 pt-1.5 border-t border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🏆</span>
                        <label className="text-xs lg:text-sm font-bold text-white font-['Prompt',sans-serif]">
                          เป้าหมายแต้มชัยชนะ
                        </label>
                      </div>
                      <span
                        key={`solo-top-target-${targetScore}`}
                        className="text-xs font-num font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg animate-score-bump select-none"
                      >
                        {targetScore} แต้ม
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { pts: 12, label: 'จบไว' },
                        { pts: 16, label: 'มาตรฐาน' },
                        { pts: 20, label: 'ท้าทาย' },
                        { pts: 24, label: 'ศึกใหญ่' },
                      ].map((item) => (
                        <button
                          key={item.pts}
                          type="button"
                          onClick={() => {
                            soundManager.playScorePresetSelect(item.pts);
                            setTargetScore(item.pts);
                          }}
                          className={[
                            'py-1 px-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[38px] active:scale-95',
                            targetScore === item.pts
                              ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400 font-black shadow-[0_0_12px_rgba(250,204,21,0.35)]'
                              : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white font-semibold',
                          ].join(' ')}
                        >
                          <span className="text-xs lg:text-sm font-black font-num">{item.pts} แต้ม</span>
                          <span className="text-[7.5px] lg:text-[8px] opacity-70">
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 bg-black/45 px-2.5 py-1.5 rounded-xl border border-white/10 text-xs shadow-inner">
                      <span className="text-slate-400 text-[9.5px] font-semibold whitespace-nowrap flex items-center gap-1 select-none">
                        <span>🎯</span>
                        <span>ปรับละเอียด (10–50):</span>
                      </span>
                      <input
                        type="range"
                        min={10}
                        max={50}
                        step={1}
                        value={targetScore}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          soundManager.playScoreSliderTick(val, 10, 50);
                          setTargetScore(val);
                        }}
                        className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-white/15 rounded-lg hover:brightness-110 active:brightness-125"
                      />
                      <span
                        key={`solo-target-${targetScore}`}
                        className="font-num font-black text-yellow-300 text-xs lg:text-sm w-7 text-right animate-score-bump select-none"
                      >
                        {targetScore}
                      </span>
                    </div>
                  </div>

                  {/* Primary Launch Action Button (Arc Reactor Theme) */}
                  <button
                    type="button"
                    onClick={handleSolo}
                    disabled={isLoading}
                    className="relative group w-full py-2.5 lg:py-3 px-5 rounded-xl lg:rounded-2xl font-display font-black text-sm lg:text-base tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] shadow-2xl overflow-hidden mt-1.5 min-h-[44px]"
                    style={{
                      background: isLoading
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #b45309 100%)',
                      color: isLoading ? 'rgba(255, 255, 255, 0.4)' : '#05070d',
                      boxShadow: isLoading ? 'none' : '0 10px 30px -4px rgba(234, 88, 12, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <span className="text-lg group-hover:scale-125 transition-transform duration-300">⚡</span>
                    <span>เข้าสู่สมรภูมิเดี่ยว</span>
                    <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">➔</span>
                  </button>
                </div>
              )}

              {/* ── Tab 2: Create Multiplayer Room ────────────────────────────────── */}
              {activeTab === 'create' && (
                <div className="space-y-3 pt-0.5 animate-fadeIn">
                  
                  {/* Target Winning Points Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🏆</span>
                        <label className="text-xs lg:text-sm font-bold text-white font-['Prompt',sans-serif]">
                          เป้าหมายแต้มชัยชนะ
                        </label>
                      </div>
                      <span
                        key={`mp-top-target-${targetScore}`}
                        className="text-xs font-num font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg animate-score-bump select-none"
                      >
                        {targetScore} แต้ม
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {[12, 16, 20, 24].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => {
                            soundManager.playScorePresetSelect(pts);
                            setTargetScore(pts);
                          }}
                          className={[
                            'py-1 px-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[38px] active:scale-95',
                            targetScore === pts
                              ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400 font-black shadow-[0_0_12px_rgba(250,204,21,0.35)]'
                              : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white font-semibold',
                          ].join(' ')}
                        >
                          <span className="text-xs lg:text-sm font-black font-num">{pts} แต้ม</span>
                          <span className="text-[7.5px] lg:text-[8px] opacity-70">
                            {pts === 12 ? 'จบไว' : pts === 16 ? 'มาตรฐาน' : pts === 20 ? 'ท้าทาย' : 'ศึกใหญ่'}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 bg-black/45 px-2.5 py-1.5 rounded-xl border border-white/10 text-xs shadow-inner">
                      <span className="text-slate-400 text-[9.5px] font-semibold whitespace-nowrap flex items-center gap-1 select-none">
                        <span>🎯</span>
                        <span>ปรับละเอียด (10–50):</span>
                      </span>
                      <input
                        type="range"
                        min={10}
                        max={50}
                        step={1}
                        value={targetScore}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          soundManager.playScoreSliderTick(val, 10, 50);
                          setTargetScore(val);
                        }}
                        className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-white/15 rounded-lg hover:brightness-110 active:brightness-125"
                      />
                      <span
                        key={`mp-target-${targetScore}`}
                        className="font-num font-black text-yellow-300 text-xs lg:text-sm w-7 text-right animate-score-bump select-none"
                      >
                        {targetScore}
                      </span>
                    </div>
                  </div>

                  {/* Room Deployment Note */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-2.5 space-y-1 text-xs text-slate-300">
                    <p className="font-bold text-amber-300 flex items-center gap-1.5 text-xs font-['Prompt',sans-serif]">
                      <span>🛡️</span> ศูนย์ควบคุมห้องออนไลน์
                    </p>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">
                      เมื่อสร้างห้องเสร็จ ระบบจะสร้างรหัสห้อง 6 ตัวอักษร คุณสามารถชวนเพื่อนมาร่วมประลอง หรือเพิ่มบอท Marvel AI เข้ามาร่วมเล่นจนครบ 4 คนได้ในห้องรอ
                    </p>
                  </div>

                  {/* Primary Create Action Button */}
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isLoading}
                    className="w-full py-2.5 lg:py-3 px-5 rounded-xl lg:rounded-2xl font-extrabold text-sm lg:text-base tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-xl min-h-[44px]"
                    style={{
                      background: isLoading
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                      color: isLoading ? 'rgba(255, 255, 255, 0.4)' : '#05070d',
                      boxShadow: isLoading ? 'none' : '0 10px 30px -4px rgba(245, 158, 11, 0.5)',
                    }}
                  >
                    <span>⚔️ เปิดห้องต่อสู้ออนไลน์</span>
                  </button>
                </div>
              )}

              {/* ── Tab 3: Join Room with Code ────────────────────────────────────── */}
              {activeTab === 'join' && (
                <div className="space-y-3 pt-0.5 animate-fadeIn">
                  <div className="space-y-1.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-sm">🔑</span>
                      <label htmlFor="room-code" className="text-xs lg:text-sm font-bold text-white font-['Prompt',sans-serif]">
                        กรอกรหัสห้อง 6 หลัก (PIN)
                      </label>
                    </div>
                    <input
                      id="room-code"
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                      placeholder="ABC123"
                      maxLength={6}
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      className="w-full bg-black/45 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono tracking-[0.25em] text-center text-xl uppercase font-black"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJoin()}
                    disabled={isLoading || !joinCode.trim()}
                    className="w-full py-2.5 lg:py-3 px-5 rounded-xl lg:rounded-2xl font-extrabold text-sm lg:text-base tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-xl min-h-[44px]"
                    style={{
                      background: isLoading || !joinCode.trim()
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                      color: isLoading || !joinCode.trim() ? 'rgba(255, 255, 255, 0.4)' : '#05070d',
                      boxShadow: isLoading || !joinCode.trim() ? 'none' : '0 10px 30px -4px rgba(245, 158, 11, 0.5)',
                    }}
                  >
                    <span>🔑 เข้าร่วมห้องทันที</span>
                  </button>
                </div>
              )}

              {/* ── Tab 4: Browse Open Rooms ──────────────────────────────────────── */}
              {activeTab === 'browse' && (
                <div className="space-y-2.5 pt-0.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">📡</span>
                      <span className="text-xs lg:text-sm font-bold text-white font-['Prompt',sans-serif]">
                        ห้องที่กำลังรอผู้เล่น
                      </span>
                    </div>
                    <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      {openRooms.length} ห้องเปิดอยู่
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {openRooms.length === 0 ? (
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-1.5">
                        <span className="text-xl block animate-pulse">📡</span>
                        <p className="text-xs text-slate-400">
                          ขณะนี้ยังไม่มีห้องเปิดอยู่ สร้างห้องใหม่เพื่อเริ่มเล่นได้ทันที
                        </p>
                      </div>
                    ) : (
                      openRooms.map((room) => {
                        const roomMap = getMarvelMap(room.mapId);
                        return (
                          <div
                            key={room.roomId}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-amber-400/50 transition-all"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <code className="text-amber-300 font-mono font-bold text-xs tracking-wider">
                                  {room.roomId}
                                </code>
                                <span className="text-[9.5px] text-white/50 bg-white/5 px-1.5 py-0.2 rounded-full border border-white/10">
                                  {roomMap.icon} {roomMap.name.split(' ')[0]}
                                </span>
                              </div>
                              <p className="text-[9.5px] text-slate-400">
                                ผู้เล่น <span className="font-num font-black text-amber-300">{room.players.length}</span>/<span className="font-num font-bold text-white/80">{room.maxPlayers}</span> คน • เป้าหมาย {room.targetScore ?? 16}P
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleJoin(room.roomId)}
                              disabled={isLoading}
                              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all cursor-pointer shadow active:scale-95"
                            >
                              เข้าร่วม
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Error Message Notification */}
              {error && (
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-start gap-2 animate-fadeIn">
                  <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="leading-relaxed font-medium text-xs">{error}</span>
                </div>
              )}

            </div>

          </div>

          {/* Card 2: Battlefield Holo-Deck Preview (Order 3 on Mobile, Left Column middle on Desktop) */}
          <div
            className="order-3 lg:order-3 lg:col-span-5 rounded-2xl lg:rounded-3xl border border-white/[0.12] p-3 lg:p-3.5 space-y-2 lg:space-y-2.5 transition-all self-start"
            style={{
              background: 'linear-gradient(165deg, rgba(17, 24, 39, 0.88) 0%, rgba(9, 13, 22, 0.96) 100%)',
              backdropFilter: 'blur(28px)',
              boxShadow: '0 16px 40px -10px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-sm">🗺️</span>
                <span className="font-sans font-bold tracking-wide text-xs lg:text-sm text-white block">
                  สมรภูมิรบที่เลือก
                </span>
              </div>
              <span className="text-[9px] lg:text-[10px] font-sans text-amber-400/90 tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                แผนที่ปัจจุบัน
              </span>
            </div>

            {/* Selected Battlefield Visual Hero Card */}
            {(() => {
              const currentMap = getMarvelMap(selectedMapId);
              return (
                <div className="relative rounded-xl overflow-hidden border border-white/15 h-24 lg:h-26 group shadow-md">
                  <img
                    key={currentMap.id}
                    src={currentMap.imageUrl}
                    alt={currentMap.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 animate-fadeIn"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent flex flex-col justify-end p-2.5">
                    <div className="flex items-center gap-1.5 text-[8.5px] font-mono font-bold tracking-wider text-amber-300 uppercase">
                      <span>{currentMap.icon}</span>
                      <span>{currentMap.realm}</span>
                    </div>
                    <h4 className="font-sans font-bold text-sm lg:text-base text-white leading-tight">
                      {currentMap.name}
                    </h4>
                    <p className="text-[10px] text-slate-300/80 truncate leading-tight pt-0.5 font-sans">
                      {currentMap.subtitle} — {currentMap.description}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Quick Interactive Map Switcher Chips */}
            <div className="grid grid-cols-3 gap-1 pt-0.5">
              {MARVEL_MAPS.map((map) => {
                const isSelected = selectedMapId === map.id;
                return (
                  <button
                    key={map.id}
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      setSelectedMapId(map.id);
                    }}
                    className={[
                      'py-1 px-1.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-1 min-w-0',
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.25)] font-bold'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]',
                    ].join(' ')}
                  >
                    <span className="text-xs shrink-0">{map.icon}</span>
                    <span className="text-[10px] font-sans truncate leading-tight">
                      {map.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Infinity Stones Power Matrix & Rules Guide (Order 4 on Mobile, Left Column bottom on Desktop) */}
          <div
            className="order-4 lg:order-4 lg:col-span-5 rounded-2xl lg:rounded-3xl border border-white/[0.12] p-3 lg:p-3.5 space-y-2 transition-all self-start"
            style={{
              background: 'linear-gradient(165deg, rgba(17, 24, 39, 0.88) 0%, rgba(9, 13, 22, 0.96) 100%)',
              backdropFilter: 'blur(28px)',
              boxShadow: '0 16px 40px -10px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-sm">🧤</span>
                <span className="font-['Prompt',sans-serif] font-bold tracking-wide text-xs lg:text-sm text-white block">
                  คลังอัญมณีอินฟินิตี้
                </span>
              </div>
              <span className="text-[9px] lg:text-[10px] font-['Prompt',sans-serif] text-emerald-400/90 tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                {botCount + 1} ผู้เล่นในเกม
              </span>
            </div>

            {/* 6 Infinity Stones Interactive Power Grid */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'ruby', name: 'Reality', th: 'ความจริง', color: 'from-red-600/25 via-red-950/40 to-black/60', border: 'border-red-500/40 hover:border-red-400', glow: 'text-red-400', shadow: 'rgba(239,68,68,0.35)' },
                { id: 'sapphire', name: 'Space', th: 'อวกาศ', color: 'from-blue-600/25 via-blue-950/40 to-black/60', border: 'border-blue-500/40 hover:border-blue-400', glow: 'text-blue-400', shadow: 'rgba(59,130,246,0.35)' },
                { id: 'obsidian', name: 'Soul', th: 'วิญญาณ', color: 'from-amber-600/25 via-amber-950/40 to-black/60', border: 'border-amber-500/40 hover:border-amber-400', glow: 'text-amber-400', shadow: 'rgba(245,158,11,0.35)' },
                { id: 'topaz', name: 'Mind', th: 'จิตใจ', color: 'from-yellow-500/25 via-yellow-950/40 to-black/60', border: 'border-yellow-500/40 hover:border-yellow-400', glow: 'text-yellow-400', shadow: 'rgba(234,179,8,0.35)' },
                { id: 'amethyst', name: 'Power', th: 'พลัง', color: 'from-purple-600/25 via-purple-950/40 to-black/60', border: 'border-purple-500/40 hover:border-purple-400', glow: 'text-purple-400', shadow: 'rgba(168,85,247,0.35)' },
                { id: 'emerald', name: 'Time', th: 'เวลา (+1)', color: 'from-emerald-600/25 via-emerald-950/40 to-black/60', border: 'border-emerald-500/40 hover:border-emerald-400', glow: 'text-emerald-400', shadow: 'rgba(16,185,129,0.35)' },
              ].map((st) => (
                <div
                  key={st.id}
                  className={`p-1.5 lg:p-2 rounded-xl bg-gradient-to-b ${st.color} border ${st.border} flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 cursor-default group`}
                  style={{ boxShadow: `0 4px 12px -2px ${st.shadow}` }}
                >
                  <div className={`w-3.5 h-3.5 rounded-full crystal-${st.id} shrink-0 ring-1.5 ring-white/60 shadow-[0_0_8px_currentColor] group-hover:scale-110 transition-transform`} />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-white truncate leading-tight font-['Montserrat',sans-serif]">
                      {st.name}
                    </div>
                    <div className={`text-[8.5px] ${st.glow} truncate leading-tight font-['Prompt'] font-medium`}>
                      {st.th}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Match Rules & Inventory Quick Status Pill */}
            <div className="bg-black/50 border border-white/10 rounded-xl p-2 text-[10px] text-slate-300 flex items-center justify-between gap-1.5 flex-wrap">
              <span className="text-slate-400 flex items-center gap-1 font-mono text-[9.5px]">
                <span>📦</span> สต็อกรอบนี้:
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                <span className="text-white bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                  สีละ {botCount === 1 ? 4 : botCount === 2 ? 5 : 7}
                </span>
                <span className="text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/25">
                  เวลา {botCount + 1}
                </span>
                <span className="text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/25">
                  ทอง 5
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Developer Credits & Non-Commercial Disclaimer Footer ────────── */}
        <footer className="w-full max-w-6xl mx-auto mt-1 pt-1.5 border-t border-white/[0.06] flex flex-col items-center text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1.5 flex-wrap text-[10px] sm:text-[10.5px]">
            <span className="text-slate-300 font-medium">🛠️ พัฒนาโดย:</span>
            <span className="font-bold text-amber-200 bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border border-amber-400/40 px-2 py-0.2 rounded-full text-[10px] sm:text-[10.5px] tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              sanior09
            </span>
            <button
              type="button"
              onClick={() => {
                soundManager.playModalOpen();
                setShowDisclaimerModal(true);
              }}
              className="text-amber-400/90 hover:text-amber-200 underline underline-offset-2 transition-colors cursor-pointer ml-0.5 font-semibold drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
              title="อ่านข้อกำหนดทางลิขสิทธิ์และวัตถุประสงค์โครงการ"
            >
              (ข้อกำหนดและลิขสิทธิ์)
            </button>
          </div>
          <p className="text-[9px] sm:text-[9.5px] text-slate-400/90 max-w-md leading-tight px-2 font-sans">
            จัดทำขึ้นเพื่อการศึกษา ความบันเทิงส่วนบุคคล และเป็น Fan-Made Project เท่านั้น <br className="hidden sm:inline" />
            <span className="text-amber-300/90 font-medium">
              มิได้จัดทำขึ้นเพื่อใช้ในเชิงพาณิชย์ หรือเพื่อการแสวงหาผลกำไร/หารายได้ใดๆ ทั้งสิ้น
            </span>
          </p>
          <p className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-mono tracking-wider">
            © 2026 Marvel Splendor • Fan-Made Project by sanior09
          </p>
        </footer>

        {/* Interactive Modals */}
        <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
        <HeroVFXTestModal isOpen={showVFXLab} onClose={() => setShowVFXLab(false)} playerName={userProfile?.username || playerName || 'SANIOR'} />
        <AboutDisclaimerModal
          isOpen={showDisclaimerModal}
          onClose={() => setShowDisclaimerModal(false)}
        />
        <AvatarPicker
          isOpen={showAvatarPicker}
          currentAvatarId={avatarId}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarPicker(false)}
        />

        {/* ── Marvel Combatant Selector Modal for Solo AI Slots ───────────── */}
        {selectingBotSlot !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
            onClick={() => setSelectingBotSlot(null)}
          >
            <div
              className="w-full max-w-2xl bg-gradient-to-b from-[#111827] via-[#0d121c] to-[#080b12] border border-amber-400/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-4 max-h-[85vh] overflow-y-auto overscroll-contain touch-pan-y"
              style={{ WebkitOverflowScrolling: 'touch' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-lg shadow">
                    ⚡
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-['Prompt',sans-serif] font-bold text-white">
                      เลือกคู่ต่อสู้ AI สำหรับช่อง #{selectingBotSlot + 1}
                    </h3>
                    <p className="text-xs text-amber-300/90 font-medium font-['Prompt',sans-serif]">
                      เลือกฮีโร่หรือวายร้ายที่คุณต้องการประลองฝีมือ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectingBotSlot(null)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Grid of Characters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {POPULAR_MARVEL_BOTS.map((bot) => {
                  const isSelected = botNames[selectingBotSlot] === bot.name && !customBotSlots[selectingBotSlot];
                  const botAvatarSrc = resolveMarvelAvatar(bot.name, bot.avatarUrl);
                  const fallbackEmoji = getMarvelFallbackEmoji(bot.name, true);

                  return (
                    <button
                      key={bot.name}
                      type="button"
                      onClick={() => {
                        soundManager.playButtonClick();
                        updateBotName(selectingBotSlot, bot.name);
                        setCustomBotSlots((prev) => ({ ...prev, [selectingBotSlot]: false }));
                        setSelectingBotSlot(null);
                      }}
                      className={[
                        'group p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3',
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20',
                      ].join(' ')}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20 bg-neutral-900 shrink-0 shadow group-hover:scale-105 transition-transform">
                        {botAvatarSrc ? (
                          <img src={botAvatarSrc} alt={bot.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-lg">{fallbackEmoji}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white group-hover:text-amber-300 truncate">
                            {bot.name}
                          </span>
                          <span className="text-xs shrink-0">{bot.avatar}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate leading-tight pt-0.5 font-['Prompt']">
                          {bot.desc}
                        </p>
                        {(() => {
                          const pInfo = getBotPersonalityInfo(bot.personality);
                          return (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-['Prompt',sans-serif] ${pInfo.text} font-medium pt-0.5`}>
                              <span>{pInfo.icon}</span>
                              <span>{pInfo.label}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Or Custom Name Field */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <label className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                  ✍️ หรือกำหนดชื่อบอทเอง (Custom AI Identity)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customBotSlots[selectingBotSlot] ? botNames[selectingBotSlot] : ''}
                    onChange={(e) => {
                      updateBotName(selectingBotSlot, e.target.value);
                      setCustomBotSlots((prev) => ({ ...prev, [selectingBotSlot]: true }));
                    }}
                    placeholder="พิมพ์ชื่อฮีโร่หรือวายร้ายที่ต้องการ..."
                    maxLength={20}
                    className="flex-1 bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (botNames[selectingBotSlot]?.trim()) {
                        soundManager.playButtonClick();
                        setCustomBotSlots((prev) => ({ ...prev, [selectingBotSlot]: true }));
                        setSelectingBotSlot(null);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow"
                  >
                    ยืนยัน
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
