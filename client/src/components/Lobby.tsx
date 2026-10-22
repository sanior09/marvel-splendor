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
  { name: 'Doctor Doom', personality: 'stark', avatar: '👑', desc: 'Tactical Mastermind', avatarUrl: resolveMarvelAvatar('doctor_doom') },
  { name: 'Loki', personality: 'ultron', avatar: '🐍', desc: 'Trickster & Schemer', avatarUrl: resolveMarvelAvatar('loki') },
  { name: 'Thanos Bot', personality: 'thanos', avatar: '🧤', desc: 'Infinity Gauntlet Seeker', avatarUrl: resolveMarvelAvatar('thanos') },
  { name: 'Tony Stark AI', personality: 'stark', avatar: '🦾', desc: 'Armored Strategist', avatarUrl: resolveMarvelAvatar('iron_man') },
  { name: 'Spider-Man', personality: 'stark', avatar: '🕷️', desc: 'Agile Tactician', avatarUrl: resolveMarvelAvatar('spider_man') },
  { name: 'Thor Odinson', personality: 'thanos', avatar: '⚡', desc: 'God of Thunder', avatarUrl: resolveMarvelAvatar('thor') },
  { name: 'Wolverine', personality: 'thanos', avatar: '🐺', desc: 'Berserker Instinct', avatarUrl: resolveMarvelAvatar('wolverine') },
  { name: 'Deadpool', personality: 'ultron', avatar: '⚔️', desc: 'Unpredictable Chaos', avatarUrl: resolveMarvelAvatar('deadpool') },
  { name: 'Doctor Strange', personality: 'stark', avatar: '✨', desc: 'Sorcerer Supreme', avatarUrl: resolveMarvelAvatar('doctor_strange') },
  { name: 'Black Panther', personality: 'stark', avatar: '🐾', desc: 'Wakandan Mastermind', avatarUrl: resolveMarvelAvatar('black_panther') },
  { name: 'Vision (J.A.R.V.I.S.)', personality: 'friday', avatar: '🤖', desc: 'Synthetic AI Core', avatarUrl: resolveMarvelAvatar('vision') },
  { name: 'Scarlet Witch', personality: 'ultron', avatar: '🔮', desc: 'Reality Warper', avatarUrl: resolveMarvelAvatar('scarlet_witch') },
  { name: 'Captain America', personality: 'stark', avatar: '🛡️', desc: 'Tactical Leader', avatarUrl: resolveMarvelAvatar('captain_america') },
  { name: 'Hulk', personality: 'thanos', avatar: '💚', desc: 'Smash Powerhouse', avatarUrl: resolveMarvelAvatar('hulk') },
];

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
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [roomCodeCopied, setRoomCodeCopied] = useState(false);

  // Countdown loading state (host start game + solo)
  const [startCountdown, setStartCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // For solo mode: hold the args to pass to onCreateSolo when countdown finishes
  const [soloContext, setSoloContext] = useState<{
    finalName: string;
    botCount: number;
    botNames: string[];
    mapId: string;
    avatarUrl?: string;
    targetScore: number;
  } | null>(null);

  const startCountdownTimer = (onFinish: () => void) => {
    setStartCountdown(5);
    countdownRef.current = setInterval(() => {
      setStartCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
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
    soundManager.playCardBuy(3);
    setSoloContext(null); // multiplayer mode
    startCountdownTimer(() => onStartGame());
  };

  const handleCancelStart = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setStartCountdown(null);
    setSoloContext(null);
    soundManager.playButtonClick();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
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
    soundManager.playCardBuy(3);
    setError('');
    setSoloContext({
      finalName,
      botCount,
      botNames: selectedBotNames,
      mapId: selectedMapId,
      avatarUrl: avatarUrl || undefined,
      targetScore,
    });
    startCountdownTimer(() => {
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

  // ── Countdown Overlay (always rendered via portal, works for solo + multiplayer) ──
  const countdownOverlay = startCountdown !== null
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div
            className="flex flex-col items-center gap-6 px-8 py-10 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0505 50%, #0a1a0a 100%)',
              border: '1.5px solid rgba(251,191,36,0.35)',
              boxShadow: '0 0 80px rgba(251,191,36,0.15), 0 20px 60px rgba(0,0,0,0.8)',
              minWidth: '300px',
              maxWidth: '90vw',
            }}
          >
            {/* Marvel Splendor logo */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="marvel-badge px-2 py-0.5 rounded text-xs tracking-wider">MARVEL</span>
                <span className="font-display font-black text-xl text-white tracking-widest">SPLENDOR</span>
              </div>
              <p className="text-white/50 text-xs tracking-widest uppercase font-semibold">กำลังเริ่มการต่อสู้...</p>
            </div>

            {/* Countdown circle */}
            <div className="relative flex items-center justify-center">
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle
                  cx="55" cy="55" r="48"
                  fill="none"
                  stroke="url(#countdownGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - startCountdown / 5)}`}
                  transform="rotate(-90 55 55)"
                  style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                />
                <defs>
                  <linearGradient id="countdownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span
                  className="font-num font-black leading-none"
                  style={{
                    fontSize: '3rem',
                    background: 'linear-gradient(135deg, #fbbf24, #ef4444)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.6))',
                  }}
                >
                  {startCountdown}
                </span>
                <span className="text-white/40 text-[10px] tracking-widest uppercase">วินาที</span>
              </div>
            </div>

            {/* Players summary — Solo or Multiplayer */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {soloContext ? (
                <>
                  {/* Human player */}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden border-2"
                      style={{ borderColor: 'rgba(251,191,36,0.8)' }}
                    >
                      {soloContext.avatarUrl ? (
                        <img src={soloContext.avatarUrl} alt={soloContext.finalName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-sm">
                          {soloContext.finalName[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-yellow-300 font-bold max-w-[48px] truncate text-center">{soloContext.finalName}</span>
                  </div>
                  {/* Bots */}
                  {soloContext.botNames.map((name, idx) => {
                    const preset = POPULAR_MARVEL_BOTS.find((b) => b.name === name);
                    const botSrc = resolveMarvelAvatar(name, preset?.avatarUrl);
                    const fallbackEmoji = getMarvelFallbackEmoji(name, true);
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div
                          className="w-10 h-10 rounded-full overflow-hidden border-2"
                          style={{ borderColor: 'rgba(147,51,234,0.6)' }}
                        >
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
                          <div className={`${botSrc ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-700 text-white font-black text-sm`}>
                            {fallbackEmoji}
                          </div>
                        </div>
                        <span className="text-[9px] text-white/50 max-w-[48px] truncate text-center">{name}</span>
                      </div>
                    );
                  })}
                </>
              ) : (
                // Multiplayer mode: show currentRoom players
                currentRoom?.players.map((p) => {
                  const src = resolvePlayerAvatar(p.name, p.avatarUrl);
                  return (
                    <div key={p.id} className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden border-2"
                        style={{ borderColor: p.id === myPlayerId ? 'rgba(251,191,36,0.8)' : 'rgba(255,255,255,0.2)' }}
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
                        <div className={`${src ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-sm`}>
                          {getMarvelFallbackEmoji(p.name, p.isBot)}
                        </div>
                      </div>
                      <span className="text-[9px] text-white/60 max-w-[48px] truncate text-center">{p.name}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cancel button */}
            <button
              type="button"
              id="cancel-start-game-btn"
              onClick={handleCancelStart}
              className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              ✕ ยกเลิก
            </button>
          </div>
        </div>,
        document.body,
      )
    : null;

  // ── In-Room Lobby (Waiting Room) ──────────────────────────
  if (currentRoom) {
    return (
      <>
        {countdownOverlay}
      <div className="w-full h-full overflow-y-auto overflow-x-hidden board-bg flex flex-col items-center justify-start p-3 sm:p-6 relative select-none">
        <div className="w-full max-w-md pt-2 pb-6 sm:pb-8">
          <div className="glass-strong rounded-2xl p-3.5 sm:p-5 w-full space-y-3 sm:space-y-4 border border-white/15 shadow-2xl relative">
            <div className="absolute top-3 left-3 z-20">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  onLeaveRoom?.();
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow hover:scale-105"
                title="ออกจากห้องแล้วกลับสู่หน้าหลัก"
              >
                <span>ย้อนกลับ</span>
              </button>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
              <button
                type="button"
                onClick={() => {
                  soundManager.playModalOpen();
                  setShowTutorial(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-yellow-400/15 hover:bg-yellow-400/30 border border-yellow-400/50 text-yellow-300 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow hover:scale-105"
                title="คู่มือวิธีเล่น MARVEL SPLENDOR"
              >
                <span>📘</span>
                <span>วิธีเล่น</span>
              </button>
            </div>

            <div className="text-center space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <span className="marvel-badge px-2 py-0.5 rounded text-xs tracking-wider">MARVEL</span>
                <span className="font-display font-black text-lg text-white tracking-widest">SPLENDOR</span>
              </div>
              <h2 className="font-display text-xl font-black text-white">
                รวมพลเหล่าฮีโร่
              </h2>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-white/50 text-xs uppercase tracking-wider font-semibold">
                  รหัสห้อง
                </span>
                <div className="flex items-center gap-1.5">
                  <code
                    className="bg-red-500/15 text-red-300 px-3 py-1 rounded-lg font-mono font-black text-xl tracking-widest border border-red-500/30"
                    style={{ letterSpacing: '0.25em' }}
                  >
                    {currentRoom.roomId}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentRoom.roomId).catch(() => {});
                      setRoomCodeCopied(true);
                      setTimeout(() => setRoomCodeCopied(false), 2000);
                    }}
                    className="text-[10px] px-2 py-1 rounded-lg border transition-all cursor-pointer font-bold"
                    style={{
                      background: roomCodeCopied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                      borderColor: roomCodeCopied ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.15)',
                      color: roomCodeCopied ? '#6ee7b7' : 'rgba(255,255,255,0.5)',
                    }}
                    title="คัดลอกรหัสห้อง"
                  >
                    {roomCodeCopied ? '✓ คัดลอกแล้ว' : 'คัดลอก'}
                  </button>
                </div>
              </div>

              {/* Battlefield Map & Target Score Indicators in waiting room */}
              <div className="flex flex-wrap items-center justify-center gap-2 my-1">
                {(() => {
                  const roomMap = getMarvelMap(currentRoom.mapId);
                  return (
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-white/10 border ${roomMap.accentBorder} shadow-sm`}
                      title={`สมรภูมิรบ: ${roomMap.name} (${roomMap.nameEn}) - ล็อกตลอดทั้งเกม`}
                    >
                      <span className="text-sm">{roomMap.icon}</span>
                      <span>สมรภูมิ: <span className="text-yellow-300 font-extrabold">{roomMap.name}</span></span>
                      <span className="text-[9px] bg-red-600/80 text-white font-mono px-1.5 py-0.2 rounded-full uppercase tracking-wider">LOCKED</span>
                    </div>
                  );
                })()}

                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-amber-950/40 border border-yellow-500/40 shadow-sm"
                  title="แต้มเป้าหมายสำหรับชัยชนะในเกมนี้"
                >
                  <span>🎯 เป้าหมาย:</span>
                  <span className="text-yellow-300 font-black font-num text-sm sm:text-base drop-shadow-sm">
                    {currentRoom.targetScore ?? 16} แต้ม
                  </span>
                </div>
              </div>

              {/* Host Target Score Quick Adjust */}
              {isHost && onSetTargetScore && (
                <div className="flex items-center justify-center gap-1.5 mt-0.5 mb-1 text-[10px] text-white/70">
                  <span className="font-semibold text-yellow-300/80">ปรับแต้มชนะ:</span>
                  {[12, 16, 20, 24].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => {
                        soundManager.playButtonClick();
                        onSetTargetScore(pts);
                      }}
                      className={[
                        'px-2.5 py-0.5 rounded-lg font-black font-num transition-all cursor-pointer border text-xs',
                        (currentRoom.targetScore ?? 16) === pts
                          ? 'border-yellow-400 bg-yellow-400 text-black shadow'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
                      ].join(' ')}
                    >
                      {pts}P
                    </button>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-white/50">
                แชร์รหัสห้องให้เพื่อน หรือเพิ่มบอท AI เข้ามาร่วมประลอง
              </p>
            </div>

            {/* Player list */}
            <div className="glass rounded-xl overflow-hidden border border-white/10 max-h-48 overflow-y-auto">
              <div className="px-3.5 py-2 border-b border-white/10 flex items-center justify-between sticky top-0 bg-neutral-950/80 backdrop-blur-sm z-10">
                <span className="text-[11px] text-white/70 font-bold uppercase tracking-wider">
                  ผู้เล่นที่เข้าร่วม
                </span>
                <span className="text-[11px] text-white/70 font-semibold">
                  ผู้เล่น <span className="font-num font-black text-yellow-300">{currentRoom.players.length}</span>/4 คน
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {currentRoom.players.map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5 px-3.5 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center font-bold text-xs text-white shadow shrink-0 overflow-hidden border border-white/20">
                      {(() => {
                        const avatarSrc = resolvePlayerAvatar(p.name, p.avatarUrl);
                        const fallbackEmoji = getMarvelFallbackEmoji(p.name, p.isBot);
                        return (
                          <>
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
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white text-xs truncate">{p.name}</span>
                        <RankBadge rank={p.rank} isBot={p.isBot} size="sm" />
                      </div>
                      {p.isBot && <span className="text-[8px] text-purple-300 block">AI BOT</span>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.id === currentRoom.hostId ? (
                        <span className="text-[9px] font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full border border-yellow-400/30">
                          👑 หัวหน้าห้อง
                        </span>
                      ) : p.isBot ? (
                        <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          พร้อม
                        </span>
                      ) : p.isReady ? (
                        <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          พร้อมแล้ว
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-amber-300/80 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          ยังไม่พร้อม
                        </span>
                      )}
                      {p.id === myPlayerId && p.id !== currentRoom.hostId && (
                        <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded-full border border-indigo-400/30">
                          คุณ
                        </span>
                      )}
                      {isHost && p.isBot && (
                        <button
                          type="button"
                          onClick={() => onRemoveBot(p.id)}
                          className="text-red-400 hover:text-red-300 text-xs px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
                          title="ลบบอทออก"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Bot button for host */}
            {isHost && canAddMoreBots && (
              <button
                type="button"
                onClick={() => {
                  const used = new Set(currentRoom.players.map((p) => p.name));
                  const available = POPULAR_MARVEL_BOTS.find((b) => !used.has(b.name));
                  setNewBotName(available?.name ?? 'Doctor Doom');
                  setNewBotPersonality(available?.personality ?? 'stark');
                  setShowAddBotModal(true);
                }}
                className="w-full py-2 rounded-xl border border-dashed border-purple-400/40 text-purple-300 hover:bg-purple-500/15 hover:border-purple-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>+ เพิ่มคู่ต่อสู้บอท AI</span>
              </button>
            )}

            {/* Token Pool Info according to player count */}
            {currentRoom && currentRoom.players.length >= 2 && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2 text-center text-[10px] text-emerald-200">
                <div className="font-bold flex items-center justify-center gap-1">
                  <span>⚡ กองกลางตามจำนวนผู้เล่น ({currentRoom.players.length} คน):</span>
                </div>
                <div className="text-white/80 mt-0.5">
                  5 สีหลักละ{' '}
                  <span className="font-black text-amber-300">
                    {currentRoom.players.length === 2 ? 4 : currentRoom.players.length === 3 ? 5 : 7}
                  </span>{' '}
                  ก้อน • 🟢 Time Stone{' '}
                  <span className="font-black text-emerald-300">
                    {currentRoom.players.length}
                  </span>{' '}
                  ก้อน • 🛡️ S.H.I.E.L.D.{' '}
                  <span className="font-black text-slate-200">5</span> ก้อน
                </div>
              </div>
            )}

            {/* Non-Host Ready Toggle Controls */}
            {!isHost && (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onToggleReady?.();
                  }}
                  className={[
                    'w-full py-3.5 rounded-xl font-black font-display text-sm transition-all duration-200 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:-translate-y-0.5',
                    isMeReady
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border border-amber-400/40 shadow-amber-950/40'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 shadow-emerald-950/40 animate-pulse',
                  ].join(' ')}
                >
                  {isMeReady ? (
                    <>
                      <span>✕</span>
                      <span>ยกเลิกพร้อมเล่น</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">⚡</span>
                      <span>ยืนยันพร้อมเล่น</span>
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
            )}

            {/* Host Start Game Controls */}
            {isHost && (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleStartGame();
                  }}
                  disabled={!canStart}
                  className={[
                    'w-full py-3 rounded-xl font-black font-display text-sm transition-all duration-200 uppercase tracking-wider',
                    canStart
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg hover:-translate-y-0.5 cursor-pointer'
                      : 'bg-white/5 text-white/40 cursor-not-allowed border border-white/5',
                  ].join(' ')}
                >
                  {(currentRoom?.players.length ?? 0) < 2
                    ? `ต้องการผู้เล่นอีกอย่างน้อย ${2 - (currentRoom?.players.length ?? 0)} คน`
                    : !allReady
                    ? `รอผู้เล่นยืนยัน (${nonHostHumans.length - unreadyHumans.length}/${nonHostHumans.length} พร้อม)`
                    : 'เริ่มเกม MARVEL SPLENDOR'}
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
        </div>
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

      <div className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start px-3 sm:px-6 py-3 sm:py-5 relative select-none">
        
        {/* Top Command Telemetry Bar */}
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 pt-1 pb-3">
          {/* Telemetry watermark on left */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-white/40 uppercase tracking-widest font-mono text-[10px] hidden sm:inline-block">
              NACHAPOL PROTOCOL // MISSION READY
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

          {/* Top-Right Control Bar: Profile Badge + Tutorial Guide */}
          <div className="flex items-center gap-2">
            {userProfile && !isGuest && onLogout && (
              <ProfileBadge
                profile={userProfile}
                onLogout={onLogout}
                activeRoomId={userProfile.activeRoomId}
                activePlayerId={userProfile.activePlayerId}
                onResumeRoom={onResumeRoom}
                onClearActiveRoom={onClearActiveRoom}
              />
            )}
            {isGuest && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                title="เข้าสู่ระบบเพื่อสะสมแต้มและบันทึกประวัติ"
              >
                เข้าสู่ระบบ
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                soundManager.playModalOpen();
                setShowTutorial(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-600/30 hover:from-amber-500/40 hover:to-yellow-500/40 border border-yellow-400/50 text-yellow-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
              title="คู่มือวิธีเล่น MARVEL SPLENDOR"
            >
              <span>📘</span>
              <span className="hidden sm:inline">วิธีเล่น</span>
            </button>
          </div>
        </div>

        {/* Hero Header Title */}
        <div className="w-full text-center space-y-1.5 my-2 sm:my-3">
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
            <span className="px-3.5 py-1 bg-[#e23636] text-white font-black text-2xl sm:text-3xl tracking-tighter rounded-md shadow-[0_0_30px_rgba(226,54,54,0.5)] uppercase border border-red-400/30 font-['Bebas_Neue',sans-serif]">
              MARVEL
            </span>
            <span className="text-2xl sm:text-4xl font-black tracking-wider uppercase font-['Montserrat',sans-serif] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-[0_2px_14px_rgba(234,179,8,0.35)]">
              SPLENDOR
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-medium text-slate-300 font-['Prompt',sans-serif]">
            <span className="text-amber-400 font-mono tracking-widest uppercase font-bold">// TACTICAL WAR ROOM</span>
            <span className="text-white/30">•</span>
            <span>ศูนย์บัญชาการยุทธวิธี • ปรับแต่งทีมฮีโร่และเลือกสมรภูมิรบ</span>
          </div>
        </div>

        {/* AFK / Inactivity notification banner */}
        {afkNotice && (
          <div className="max-w-6xl w-full mb-3 p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg animate-slide-up">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">⏳</span>
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

        {/* ── Main Bento Command Center Grid (Asymmetrical 2-Column Split) ── */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 pb-6">
          
          {/* ── Left Column: Operative Identity & Battlefield Arena (lg:col-span-5) ── */}
          <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5">
            
            {/* Card 1: Operative Identification (Hero Avatar & Callsign) */}
            <div
              className="rounded-3xl border border-white/[0.12] p-4 sm:p-5 space-y-4 transition-all"
              style={{
                background: 'linear-gradient(165deg, rgba(17, 24, 39, 0.88) 0%, rgba(9, 13, 22, 0.96) 100%)',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 20px 50px -10px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b]" />
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block leading-none">
                      // AGENT IDENTITY
                    </span>
                    <span className="font-['Montserrat',sans-serif] font-bold tracking-wider text-xs uppercase text-slate-200 pt-0.5 block">
                      ข้อมูลเจ้าหน้าที่ปฏิบัติการ
                    </span>
                  </div>
                </div>
                {userProfile?.username && (
                  <span className="text-[10px] font-mono text-emerald-400/90 tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                    ● SYNCED
                  </span>
                )}
              </div>

              {/* Avatar + Callsign input */}
              <div className="flex items-center gap-4 pt-0.5">
                {/* Tactile Avatar Badge with quick hover indicator */}
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setShowAvatarPicker(true);
                  }}
                  title="เปลี่ยนรูปโปรไฟล์มาร์เวล"
                  className="relative shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-[0_0_24px_rgba(245,158,11,0.3)] hover:border-amber-300 hover:scale-105 transition-all cursor-pointer group active:scale-95"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover object-center" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-700 to-amber-600 flex items-center justify-center font-black text-white text-xl">
                      {avatarInitial}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm">✏️</span>
                    <span className="text-[9px] text-white font-bold tracking-tight">เปลี่ยน</span>
                  </div>
                </button>

                {/* Hero Name Input */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="player-name" className="text-xs font-bold text-slate-200 font-['Prompt',sans-serif]">
                      ชื่อเรียกขานฮีโร่ของคุณ
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-amber-400/80 font-bold tracking-wider">CALLSIGN</span>
                      {userProfile?.username && playerName.trim() !== userProfile.username && (
                        <button
                          type="button"
                          onClick={() => setPlayerName(userProfile.username)}
                          className="text-[10px] text-amber-300 hover:text-amber-200 underline cursor-pointer"
                          title="กดเพื่อรีเซ็ตกลับเป็นชื่อบัญชี"
                        >
                          ↺ คืนค่า
                        </button>
                      )}
                    </div>
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
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-black/45 border text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all font-['Prompt',sans-serif] ${
                      error
                        ? 'border-red-500 ring-2 ring-red-500/40 bg-red-950/25'
                        : 'border-white/10 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20'
                    }`}
                  />
                </div>
              </div>

              {/* Quick Marvel Avatars Reel */}
              <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                    เลือกอวตารด่วน:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      setShowAvatarPicker(true);
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer transition-colors"
                  >
                    ดูทั้งหมด ＋
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
                        'shrink-0 w-8 h-8 rounded-xl overflow-hidden border transition-all cursor-pointer hover:scale-110 active:scale-95',
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
                    className="shrink-0 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-xs text-white/70 hover:text-white transition-all cursor-pointer hover:scale-105"
                    title="ดูฮีโร่ทั้งหมด"
                  >
                    ＋
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Battlefield Holo-Deck Preview */}
            <div
              className="rounded-3xl border border-white/[0.12] p-4 sm:p-5 space-y-3.5 transition-all"
              style={{
                background: 'linear-gradient(165deg, rgba(17, 24, 39, 0.88) 0%, rgba(9, 13, 22, 0.96) 100%)',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 20px 50px -10px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">🗺️</span>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block leading-none">
                      // COMBAT THEATER
                    </span>
                    <span className="font-['Montserrat',sans-serif] font-bold tracking-wider text-xs uppercase text-slate-200 pt-0.5 block">
                      สมรภูมิรบที่เลือก
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-amber-400/90 tracking-wider bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  ACTIVE REALM
                </span>
              </div>

              {/* Selected Battlefield Visual Hero Card */}
              {(() => {
                const currentMap = getMarvelMap(selectedMapId);
                return (
                  <div className="relative rounded-2xl overflow-hidden border border-white/15 h-32 sm:h-36 group shadow-lg">
                    <img
                      src={currentMap.imageUrl}
                      alt={currentMap.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent flex flex-col justify-end p-3 sm:p-3.5">
                      <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-wider text-amber-300 uppercase">
                        <span>{currentMap.icon}</span>
                        <span>{currentMap.realm}</span>
                      </div>
                      <h4 className="font-display font-black text-base sm:text-lg text-white leading-tight">
                        {currentMap.name}
                      </h4>
                      <p className="text-[10px] text-slate-300/80 truncate leading-tight pt-0.5">
                        {currentMap.subtitle} — {currentMap.description}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Quick Interactive Map Switcher Chips */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
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
                        'py-1.5 px-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-1.5 min-w-0',
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)] font-bold'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]',
                      ].join(' ')}
                    >
                      <span className="text-xs shrink-0">{map.icon}</span>
                      <span className="text-[10px] font-['Prompt',sans-serif] truncate leading-tight">
                        {map.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Infinity Stones Power Matrix & Rules Guide */}
            <div
              className="rounded-3xl border border-white/[0.12] p-4 sm:p-5 space-y-3.5 transition-all"
              style={{
                background: 'linear-gradient(165deg, rgba(17, 24, 39, 0.88) 0%, rgba(9, 13, 22, 0.96) 100%)',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 20px 50px -10px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">🧤</span>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block leading-none">
                      // INFINITY MATRIX
                    </span>
                    <span className="font-['Montserrat',sans-serif] font-bold tracking-wider text-xs uppercase text-slate-200 pt-0.5 block">
                      คลังอัญมณีอินฟินิตี้
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400/90 tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  {botCount + 1} OPERATIVES
                </span>
              </div>

              {/* 6 Infinity Stones Interactive Power Grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ruby', name: 'Reality', th: 'ความจริง', color: 'from-red-500/20 to-red-950/40', border: 'border-red-500/30', glow: 'text-red-300' },
                  { id: 'sapphire', name: 'Space', th: 'อวกาศ', color: 'from-blue-500/20 to-blue-950/40', border: 'border-blue-500/30', glow: 'text-blue-300' },
                  { id: 'obsidian', name: 'Soul', th: 'วิญญาณ', color: 'from-amber-500/20 to-amber-950/40', border: 'border-amber-500/30', glow: 'text-amber-300' },
                  { id: 'topaz', name: 'Mind', th: 'จิตใจ', color: 'from-yellow-500/20 to-yellow-950/40', border: 'border-yellow-500/30', glow: 'text-yellow-300' },
                  { id: 'amethyst', name: 'Power', th: 'พลัง', color: 'from-purple-500/20 to-purple-950/40', border: 'border-purple-500/30', glow: 'text-purple-300' },
                  { id: 'emerald', name: 'Time', th: 'เวลา (+1)', color: 'from-emerald-500/20 to-emerald-950/40', border: 'border-emerald-500/30', glow: 'text-emerald-300' },
                ].map((st) => (
                  <div
                    key={st.id}
                    className={`p-2 rounded-xl bg-gradient-to-b ${st.color} border ${st.border} flex items-center gap-2 shadow-sm transition-all hover:scale-105 cursor-default`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full crystal-${st.id} shrink-0 ring-1 ring-white/50 shadow-[0_0_8px_currentColor]`} />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-white truncate leading-tight">{st.name}</div>
                      <div className={`text-[9px] ${st.glow} truncate leading-tight font-['Prompt']`}>{st.th}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Match Rules & Inventory Quick Status Pill */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-[11px] text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">สต็อกในรอบนี้:</span>
                <span className="font-num font-bold text-amber-300">
                  สีละ {botCount === 1 ? 4 : botCount === 2 ? 5 : 7} • เวลา {botCount + 1} • ทอง 5
                </span>
              </div>
            </div>

          </div>

          {/* ── Right Column: Mission Deployment Console (lg:col-span-7) ───────── */}
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
            
            <div
              className="rounded-3xl border border-white/[0.12] p-5 sm:p-6 space-y-5 transition-all"
              style={{
                background: 'linear-gradient(165deg, rgba(17, 24, 39, 0.88) 0%, rgba(9, 13, 22, 0.96) 100%)',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 20px 50px -10px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              {/* Segmented Mode Switcher Tab Bar */}
              <div className="p-1 rounded-2xl bg-black/45 border border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-1">
                {(['solo', 'create', 'join', 'browse'] as const).map((tab) => {
                  const tabConfig = {
                    solo:   { label: 'เล่นกับ AI', icon: '🤖', sub: 'Solo Skirmish' },
                    create: { label: 'สร้างห้อง',  icon: '⚔️', sub: 'Multiplayer' },
                    join:   { label: 'เข้ารหัสห้อง', icon: '🔑', sub: 'Join PIN' },
                    browse: { label: 'ค้นหาห้อง',  icon: '🔍', sub: 'Open Lobbies' },
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
                      className={`py-2 px-1.5 rounded-xl text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[44px] ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-md scale-[1.02]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className="text-sm">{tabConfig[tab].icon}</span>
                      <span className="text-xs tracking-tight font-bold">{tabConfig[tab].label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Tab 1: Solo AI Skirmish (Customizable Bot Matrix) ─────────────── */}
              {activeTab === 'solo' && (
                <div className="space-y-4 pt-1 animate-fadeIn">
                  
                  {/* Bot Opponents Count Selector */}
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block leading-none">
                        // SQUAD FORMATION
                      </span>
                      <label className="text-xs font-bold text-slate-200 tracking-wider font-['Montserrat',sans-serif] block pt-1">
                        จำนวนคู่ต่อสู้ AI
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            soundManager.playButtonClick();
                            setBotCount(num);
                          }}
                          className={[
                            'py-2 px-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex flex-col items-center justify-center min-h-[44px]',
                            botCount === num
                              ? 'border-amber-400 bg-amber-500/20 text-yellow-300 ring-1 ring-amber-400 shadow-md font-black'
                              : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white',
                          ].join(' ')}
                        >
                          <span className="font-num text-sm">{num} บอท</span>
                          <span className="text-[9px] opacity-70">
                            {num === 1 ? 'ดวลเดี่ยว 1v1' : num === 2 ? 'ไตรภาคี 3 คน' : 'สังเวียนเต็ม 4 คน'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bot Combatants Roster Cards */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between pb-1">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block leading-none">
                          // AI SQUADRON
                        </span>
                        <label className="text-xs font-bold text-slate-200 tracking-wider font-['Montserrat',sans-serif] block pt-1">
                          จัดทัพคู่ต่อสู้ AI
                        </label>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                        {botCount} COMBATANTS
                      </span>
                    </div>

                    <div className="space-y-2">
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
                            className="bg-black/45 p-2.5 sm:p-3 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all shadow-sm"
                          >
                            {isCustom ? (
                              /* Custom Bot Name Mode */
                              <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs font-mono font-bold text-amber-400">
                                    #{idx + 1}
                                  </span>
                                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-amber-400/50 bg-neutral-900 flex items-center justify-center shrink-0 shadow">
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
                                    className="w-full bg-neutral-900/90 border border-amber-400/60 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 font-semibold"
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
                                  className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-amber-300 hover:text-amber-200 transition-all cursor-pointer flex items-center gap-1"
                                  title="กลับไปเลือกจากรายชื่อฮีโร่สำเร็จรูป"
                                >
                                  <span>↺</span>
                                  <span className="hidden sm:inline">พรีเซ็ต</span>
                                </button>
                              </div>
                            ) : (
                              /* Preset Selection Mode (Streamlined Picker, No Duplicate Input) */
                              <div className="flex items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                                    #{idx + 1}
                                  </span>

                                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 bg-neutral-900 flex items-center justify-center shrink-0 shadow">
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

                                  <div className="min-w-0 flex-1">
                                    <select
                                      value={matchedPreset ? matchedPreset.name : 'custom'}
                                      onChange={(e) => {
                                        soundManager.playButtonClick();
                                        if (e.target.value === 'custom') {
                                          setCustomBotSlots((prev) => ({ ...prev, [idx]: true }));
                                        } else {
                                          updateBotName(idx, e.target.value);
                                        }
                                      }}
                                      className="w-full bg-neutral-900/90 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-semibold cursor-pointer truncate"
                                    >
                                      {POPULAR_MARVEL_BOTS.map((bot) => (
                                        <option key={bot.name} value={bot.name} className="bg-neutral-900 text-white">
                                          {bot.avatar} {bot.name}
                                        </option>
                                      ))}
                                      <option value="custom" className="bg-neutral-900 text-amber-300 font-bold">
                                        ✍️ กำหนดชื่อเอง (Custom)...
                                      </option>
                                    </select>
                                  </div>
                                </div>

                                <div className="hidden sm:flex items-center shrink-0">
                                  <span className="text-[10px] font-mono text-slate-300 bg-white/5 border border-white/10 px-2 py-1 rounded-lg whitespace-nowrap">
                                    {tacticDesc}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Winning Points Selector */}
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block leading-none">
                          // VICTORY CRITERIA
                        </span>
                        <label className="text-xs font-bold text-slate-200 tracking-wider font-['Montserrat',sans-serif] block pt-1">
                          เป้าหมายแต้มชัยชนะ
                        </label>
                      </div>
                      <span className="text-xs font-num font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                        {targetScore} แต้ม
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[12, 16, 20, 24].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => {
                            soundManager.playButtonClick();
                            setTargetScore(pts);
                          }}
                          className={[
                            'py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[42px]',
                            targetScore === pts
                              ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400 font-black shadow'
                              : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white font-semibold',
                          ].join(' ')}
                        >
                          <span className="text-xs sm:text-sm font-black font-num">{pts} แต้ม</span>
                          <span className="text-[8px] opacity-70">
                            {pts === 12 ? 'จบไว' : pts === 16 ? 'มาตรฐาน' : pts === 20 ? 'ท้าทาย' : 'ศึกใหญ่'}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 bg-black/35 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                      <span className="text-slate-400 text-[10px] font-semibold whitespace-nowrap">ปรับละเอียด (10–50):</span>
                      <input
                        type="range"
                        min={10}
                        max={50}
                        step={1}
                        value={targetScore}
                        onChange={(e) => setTargetScore(Number(e.target.value))}
                        className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                      />
                      <span className="font-num font-black text-yellow-300 text-sm w-7 text-right">
                        {targetScore}
                      </span>
                    </div>
                  </div>

                  {/* Primary Launch Action Button */}
                  <button
                    type="button"
                    onClick={handleSolo}
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-xl min-h-[48px] mt-2"
                    style={{
                      background: isLoading
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                      color: isLoading ? 'rgba(255, 255, 255, 0.4)' : '#05070d',
                      boxShadow: isLoading ? 'none' : '0 10px 30px -4px rgba(245, 158, 11, 0.5)',
                    }}
                  >
                    <span>🚀 เข้าสู่สมรภูมิเดี่ยว</span>
                  </button>
                </div>
              )}

              {/* ── Tab 2: Create Multiplayer Room ────────────────────────────────── */}
              {activeTab === 'create' && (
                <div className="space-y-4 pt-1 animate-fadeIn">
                  
                  {/* Target Winning Points Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block leading-none">
                          // VICTORY CRITERIA
                        </span>
                        <label className="text-xs font-bold text-slate-200 tracking-wider font-['Montserrat',sans-serif] block pt-1">
                          เป้าหมายแต้มชัยชนะ
                        </label>
                      </div>
                      <span className="text-xs font-num font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                        {targetScore} แต้ม
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[12, 16, 20, 24].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => {
                            soundManager.playButtonClick();
                            setTargetScore(pts);
                          }}
                          className={[
                            'py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[42px]',
                            targetScore === pts
                              ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400 font-black shadow'
                              : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white font-semibold',
                          ].join(' ')}
                        >
                          <span className="text-xs sm:text-sm font-black font-num">{pts} แต้ม</span>
                          <span className="text-[8px] opacity-70">
                            {pts === 12 ? 'จบไว' : pts === 16 ? 'มาตรฐาน' : pts === 20 ? 'ท้าทาย' : 'ศึกใหญ่'}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 bg-black/35 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                      <span className="text-slate-400 text-[10px] font-semibold whitespace-nowrap">ปรับละเอียด (10–50):</span>
                      <input
                        type="range"
                        min={10}
                        max={50}
                        step={1}
                        value={targetScore}
                        onChange={(e) => setTargetScore(Number(e.target.value))}
                        className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                      />
                      <span className="font-num font-black text-yellow-300 text-sm w-7 text-right">
                        {targetScore}
                      </span>
                    </div>
                  </div>

                  {/* Room Deployment Note */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 space-y-1.5 text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block leading-none">
                        // S.H.I.E.L.D. DISPATCH
                      </span>
                      <p className="font-bold text-amber-300 flex items-center gap-1.5 pt-1">
                        <span>🛡️</span> ศูนย์ควบคุมห้องออนไลน์
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      เมื่อสร้างห้องเสร็จ ระบบจะสร้างรหัสห้อง 6 ตัวอักษร คุณสามารถชวนเพื่อนมาร่วมประลอง หรือเพิ่มบอท Marvel AI เข้ามาร่วมเล่นจนครบ 4 คนได้ในห้องรอ
                    </p>
                  </div>

                  {/* Primary Create Action Button */}
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-xl min-h-[48px]"
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
                <div className="space-y-4 pt-1 animate-fadeIn">
                  <div className="space-y-2 text-center">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block leading-none">
                        // ACCESS AUTHENTICATION
                      </span>
                      <label htmlFor="room-code" className="text-xs font-bold text-slate-200 tracking-wider font-['Montserrat',sans-serif] block pt-1">
                        กรอกรหัสห้อง 6 หลัก
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
                      className="w-full bg-black/45 border border-white/15 rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono tracking-[0.25em] text-center text-2xl uppercase font-black"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJoin()}
                    disabled={isLoading || !joinCode.trim()}
                    className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-xl min-h-[48px]"
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
                <div className="space-y-3 pt-1 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block leading-none">
                        // RADAR SCAN
                      </span>
                      <span className="text-xs font-bold text-slate-200 tracking-wider font-['Montserrat',sans-serif] block pt-1">
                        ห้องที่กำลังรอผู้เล่น
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                      {openRooms.length} ห้องเปิดอยู่
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {openRooms.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                        <span className="text-2xl block animate-pulse">📡</span>
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
                            className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10 hover:border-amber-400/50 transition-all"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <code className="text-amber-300 font-mono font-bold text-sm tracking-wider">
                                  {room.roomId}
                                </code>
                                <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                  {roomMap.icon} {roomMap.name.split(' ')[0]}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                ผู้เล่น <span className="font-num font-black text-amber-300">{room.players.length}</span>/<span className="font-num font-bold text-white/80">{room.maxPlayers}</span> คน • เป้าหมาย {room.targetScore ?? 16}P
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleJoin(room.roomId)}
                              disabled={isLoading}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all cursor-pointer shadow active:scale-95"
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
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* ── Developer Credits & Non-Commercial Disclaimer Footer ────────── */}
        <footer className="w-full max-w-6xl mx-auto mt-2 pt-4 border-t border-white/[0.08] flex flex-col items-center text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400">
            <span className="text-[11px] text-slate-400">🛠️ พัฒนาโดย:</span>
            <span className="font-bold text-amber-200 bg-amber-950/60 border border-amber-400/40 px-3 py-0.5 rounded-full text-xs tracking-wider shadow-inner">
              sanior09
            </span>
            <button
              type="button"
              onClick={() => {
                soundManager.playModalOpen();
                setShowDisclaimerModal(true);
              }}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 underline transition-colors cursor-pointer ml-1 font-semibold"
              title="อ่านข้อกำหนดทางลิขสิทธิ์และวัตถุประสงค์โครงการ"
            >
              (ข้อกำหนดและลิขสิทธิ์)
            </button>
          </div>
          <p className="text-[11px] text-slate-400 max-w-lg leading-relaxed px-2 font-['Prompt',sans-serif]">
            จัดทำขึ้นเพื่อการศึกษา ความบันเทิงส่วนบุคคล และเป็น Fan-Made Project เท่านั้น <br className="hidden sm:inline" />
            <span className="text-amber-200/90 font-medium">
              มิได้จัดทำขึ้นเพื่อใช้ในเชิงพาณิชย์ หรือเพื่อการแสวงหาผลกำไร/หารายได้ใดๆ ทั้งสิ้น
            </span>
          </p>
          <p className="text-[9.5px] text-slate-400 font-mono uppercase tracking-wider">
            NACHAPOL PROTOCOL // MARVEL SPLENDOR FAN EXPERIENCE
          </p>
        </footer>

        {/* Interactive Modals */}
        <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
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
      </div>
    </>
  );
};
