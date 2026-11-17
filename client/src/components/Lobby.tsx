// ============================================================
//  Lobby.tsx — Marvel Splendor Room Creation & Solo AI Customizer
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  Brain,
  Building2,
  Check,
  Clock,
  Compass,
  Copy,
  Cpu,
  Crown,
  Flame,
  Globe,
  KeyRound,
  Map as MapIcon,
  Package,
  Pencil,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Rocket,
  RotateCcw,
  Search,
  Shield,
  Shuffle,
  SlidersHorizontal,
  Swords,
  Target,
  Trophy,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import type { RoomInfo } from '@shared/types/game.types';
import type { UserProfile } from '../hooks/useAuth';

import { soundManager } from '../utils/soundManager';
import { MARVEL_MAPS, getMarvelMap } from '../data/marvelMaps';
import { TutorialModal } from './TutorialModal';
import { AboutDisclaimerModal } from './AboutDisclaimerModal';
import { AvatarPicker, MARVEL_AVATARS } from './AvatarPicker';
import { ProfileBadge } from './ProfileBadge';
import { RankBadge } from './RankBadge';
import { resolveMarvelAvatar } from '../utils/avatarUtils';

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

function getBotPersonalityIcon(personality?: string) {
  switch (personality?.toLowerCase()) {
    case 'ultron':
      return Zap;
    case 'thanos':
      return Flame;
    case 'friday':
      return Cpu;
    default:
      return Brain;
  }
}

function getMapLucideIcon(mapId?: string) {
  switch (mapId) {
    case 'avengers_tower':
      return Building2;
    case 'wakanda':
      return Shield;
    case 'sanctum':
      return Compass;
    case 'knowhere':
      return Globe;
    case 'vormir':
      return Rocket;
    default:
      return Zap;
  }
}

// ── QuickAvatarThumb: tiny avatar with clean fallback ─────────
const QuickAvatarThumb: React.FC<{ src: string; fallbackLabel?: string }> = ({ src, fallbackLabel }) => {
  const [failed, setFailed] = React.useState(false);
  return failed ? (
    <div className="w-full h-full bg-[#1a1e28] flex items-center justify-center text-[11px] font-medium text-[#a3a9b8] select-none">
      {fallbackLabel?.slice(0, 2).toUpperCase() || 'MV'}
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

  // ── Countdown Overlay ──
  const countdownOverlay = activeCountdown !== null
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto bg-black/80"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-6 rounded-2xl bg-[#11141c] border border-white/[0.1] shadow-2xl max-w-[420px] w-full text-center animate-slide-up select-none my-auto">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 w-full border-b border-white/[0.08] pb-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#c51d24] text-white font-marvel text-base tracking-wider rounded leading-none">
                    MARVEL
                  </span>
                  <span className="font-display font-medium text-sm text-[#eef0f5] tracking-wide">
                    SPLENDOR
                  </span>
                </div>
                <span className="text-xs text-amber-300 font-medium">กำลังเริ่มเกม</span>
              </div>
              <p className="text-[#a3a9b8] text-xs">
                กำลังจัดเตรียมกระดานและเข้าสู่สมรภูมิ
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="flex flex-col items-center justify-center my-3 select-none">
              <span
                key={`countdown-num-${activeCountdown}`}
                className={`font-num font-medium leading-none text-7xl sm:text-8xl animate-countdown-tick ${
                  activeCountdown === 1 ? 'text-[#e5484d]' : 'text-amber-400'
                }`}
              >
                {activeCountdown}
              </span>
              <span
                className={`text-xs font-medium mt-2 ${
                  activeCountdown === 1 ? 'text-[#e5484d]' : 'text-[#a3a9b8]'
                }`}
              >
                {activeCountdown === 1 ? 'เตรียมพร้อม' : 'วินาที'}
              </span>
            </div>

            {/* Squad Roster */}
            <div className="w-full bg-[#07080d] border border-white/[0.08] rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#7a8296] px-1">
                <span>รายชื่อผู้ร่วมเล่น</span>
                <span className="font-num">
                  {soloContext ? `${soloContext.botNames.length + 1} คน` : `${currentRoom?.players.length ?? 0} คน`}
                </span>
              </div>

              <div className="flex items-center gap-2 justify-center flex-wrap">
                {soloContext ? (
                  <>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1a1e28] border border-amber-400/40">
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400/60 shrink-0 bg-[#11141c] flex items-center justify-center">
                        {soloContext.avatarUrl ? (
                          <img src={soloContext.avatarUrl} alt={soloContext.finalName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#eef0f5] font-medium text-xs">
                            {soloContext.finalName[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-medium text-[#eef0f5] max-w-[76px] truncate leading-tight">
                          {soloContext.finalName}
                        </div>
                        <span className="text-[11px] text-amber-300 block">คุณ</span>
                      </div>
                    </div>

                    {soloContext.botNames.map((name, idx) => {
                      const preset = POPULAR_MARVEL_BOTS.find((b) => b.name === name);
                      const botSrc = resolveMarvelAvatar(name, preset?.avatarUrl);
                      return (
                        <div key={idx} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#11141c] border border-white/[0.08]">
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-white/[0.12] shrink-0 bg-[#1a1e28] flex items-center justify-center">
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
                            <div className={`${botSrc ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-[#a3a9b8]`}>
                              <Bot className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-medium text-[#eef0f5] max-w-[76px] truncate leading-tight">
                              {name}
                            </div>
                            <span className="text-[11px] text-[#7a8296] block">บอท</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  currentRoom?.players.map((p) => {
                    const src = resolvePlayerAvatar(p.name, p.avatarUrl);
                    const isMe = p.id === myPlayerId;
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${
                          isMe
                            ? 'bg-[#1a1e28] border-amber-400/40'
                            : 'bg-[#11141c] border-white/[0.08]'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-white/[0.12] shrink-0 bg-[#1a1e28] flex items-center justify-center">
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
                          <div className={`${src ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-[#a3a9b8] text-xs font-medium`}>
                            {p.isBot ? <Bot className="w-3.5 h-3.5" strokeWidth={1.5} /> : p.name[0]?.toUpperCase()}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-medium truncate max-w-[76px] leading-tight text-[#eef0f5]">
                            {p.name}
                          </div>
                          <span className={`text-[11px] block ${isMe ? 'text-amber-300' : 'text-[#7a8296]'}`}>
                            {isMe ? 'คุณ' : p.isBot ? 'บอท' : 'ผู้เล่น'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {isHost || soloContext ? (
              <button
                type="button"
                id="cancel-start-game-btn"
                onClick={handleCancelStart}
                className="w-full h-10 rounded-lg font-medium text-xs text-[#a3a9b8] hover:text-[#eef0f5] transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-white/[0.08] bg-[#1a1e28] hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
                <span>ยกเลิกการเริ่มเกม</span>
              </button>
            ) : (
              <div className="w-full h-10 px-3 rounded-lg font-medium text-xs text-amber-300 border border-white/[0.08] bg-[#1a1e28] flex items-center justify-center gap-2 select-none">
                <Clock className="w-4 h-4" strokeWidth={1.5} />
                <span>กำลังรอหัวหน้าห้องเริ่มเกม</span>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  // ── In-Room Lobby ──
  if (currentRoom) {
    const unfilledSlotsCount = Math.max(0, 4 - currentRoom.players.length);
    const roomMap = getMarvelMap(currentRoom.mapId);
    const RoomMapIcon = getMapLucideIcon(roomMap.id);

    return (
      <>
        {countdownOverlay}
        <div
          className="w-full h-full overflow-y-auto overflow-x-hidden bg-[#0b0d14] text-[#eef0f5] flex flex-col items-center justify-start p-4 sm:p-6 relative select-none"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          <div className="relative z-10 w-full max-w-[480px] py-2 pb-8">
            <div className="rounded-2xl p-4 sm:p-5 w-full space-y-4 bg-[#11141c] border border-white/[0.08] shadow-xl">
              {/* Top Navigation */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onLeaveRoom?.();
                  }}
                  className="h-9 px-3 rounded-lg bg-[#1a1e28] hover:bg-white/[0.08] border border-white/[0.08] text-[#a3a9b8] hover:text-[#eef0f5] font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                  <span>ออกจากห้อง</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#c51d24] text-white font-marvel text-base tracking-wider rounded leading-none">
                    MARVEL
                  </span>
                  <span className="font-display font-medium text-sm text-[#eef0f5] tracking-wide">
                    SPLENDOR
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playModalOpen();
                    setShowTutorial(true);
                  }}
                  className="h-9 px-3 rounded-lg bg-[#1a1e28] hover:bg-white/[0.08] border border-white/[0.08] text-[#eef0f5] font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <BookOpen className="w-4 h-4 text-[#a3a9b8]" strokeWidth={1.5} />
                  <span>วิธีเล่น</span>
                </button>
              </div>

              {/* Room Code Banner */}
              <div className="rounded-xl p-4 bg-[#07080d] border border-white/[0.08]">
                <div className="flex items-center justify-between text-xs text-[#7a8296] mb-2">
                  <span>รหัสเข้าร่วมห้อง</span>
                  <span>ส่งให้เพื่อนเพื่อเข้าห้องนี้</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono font-semibold text-2xl sm:text-3xl text-[#eef0f5] tracking-[0.22em] select-all">
                    {currentRoom.roomId}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentRoom.roomId).catch(() => {});
                      soundManager.playButtonClick();
                      setRoomCodeCopied(true);
                      setTimeout(() => setRoomCodeCopied(false), 2000);
                    }}
                    className={`h-9 px-3 rounded-lg border font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98] ${
                      roomCodeCopied
                        ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                        : 'bg-[#1a1e28] hover:bg-white/[0.08] border-white/[0.08] text-[#eef0f5]'
                    }`}
                  >
                    {roomCodeCopied ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={1.75} />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#a3a9b8]" strokeWidth={1.5} />
                    )}
                    <span>{roomCodeCopied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>

              {/* Map & Target Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl p-3 bg-[#1a1e28] border border-white/[0.08] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#11141c] border border-white/[0.08] flex items-center justify-center shrink-0">
                      <RoomMapIcon className="w-4 h-4 text-[#a3a9b8]" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#7a8296]">สมรภูมิรบ</div>
                      <div className="text-xs font-medium text-[#eef0f5] truncate">{roomMap.name}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-3 bg-[#1a1e28] border border-white/[0.08] flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#7a8296]" strokeWidth={1.5} />
                      <span className="text-xs text-[#a3a9b8]">เป้าหมาย</span>
                    </div>
                    <span className="text-xs font-medium font-num text-amber-300">
                      {currentRoom.targetScore ?? 16} แต้ม
                    </span>
                  </div>

                  {isHost && onSetTargetScore ? (
                    <div className="grid grid-cols-4 gap-1 mt-2">
                      {[12, 16, 20, 24].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => {
                            soundManager.playScorePresetSelect(pts);
                            onSetTargetScore(pts);
                          }}
                          className={`h-7 rounded-md font-medium font-num text-xs transition-colors cursor-pointer border ${
                            (currentRoom.targetScore ?? 16) === pts
                              ? 'border-amber-400/70 bg-amber-400 text-[#07080d]'
                              : 'border-white/[0.08] bg-[#11141c] text-[#a3a9b8] hover:text-[#eef0f5]'
                          }`}
                        >
                          {pts}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Player Roster */}
              <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#07080d]">
                <div className="px-4 py-2.5 border-b border-white/[0.08] bg-[#11141c] flex items-center justify-between">
                  <span className="text-xs text-[#eef0f5] font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#7a8296]" strokeWidth={1.5} />
                    <span>ผู้เล่นในห้อง</span>
                  </span>
                  <span className="text-xs text-[#a3a9b8] font-num">
                    {currentRoom.players.length} / 4 คน
                  </span>
                </div>

                <div className="p-2.5 space-y-2">
                  {currentRoom.players.map((p) => {
                    const avatarSrc = resolvePlayerAvatar(p.name, p.avatarUrl);
                    const isHostPlayer = p.id === currentRoom.hostId;
                    const isMe = p.id === myPlayerId;

                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                          isMe
                            ? 'bg-[#1a1e28] border-amber-400/40'
                            : 'bg-[#11141c] border-white/[0.08]'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/[0.12] shrink-0 bg-[#1a1e28] flex items-center justify-center text-xs font-medium text-[#a3a9b8]">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={p.name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.nextElementSibling) {
                                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : null}
                          <span className={avatarSrc ? 'hidden' : 'flex items-center justify-center'}>
                            {p.isBot ? <Bot className="w-4 h-4" strokeWidth={1.5} /> : p.name[0]?.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-xs truncate text-[#eef0f5]">
                              {p.name}
                            </span>
                            <RankBadge rank={p.rank} isBot={p.isBot} size="sm" />
                            {isMe && (
                              <span className="text-[11px] font-medium text-amber-300">
                                คุณ
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#7a8296]">
                            {p.isBot ? 'บอท AI' : isHostPlayer ? 'หัวหน้าห้อง' : 'ผู้เล่น'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isHostPlayer ? (
                            <span className="text-[11px] font-medium text-amber-300 bg-[#1a1e28] px-2 py-0.5 rounded-md border border-white/[0.08] flex items-center gap-1">
                              <Crown className="w-3 h-3" strokeWidth={1.5} />
                              <span>หัวหน้าห้อง</span>
                            </span>
                          ) : p.isBot || p.isReady ? (
                            <span className="text-[11px] font-medium text-[#4cc38a] flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" strokeWidth={1.75} />
                              <span>พร้อม</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#a3a9b8]">รอพร้อม</span>
                          )}

                          {isHost && p.isBot && (
                            <button
                              type="button"
                              onClick={() => {
                                soundManager.playButtonClick();
                                onRemoveBot(p.id);
                              }}
                              className="text-[#7a8296] hover:text-[#e5484d] w-7 h-7 rounded-md bg-[#1a1e28] hover:bg-red-950/40 border border-white/[0.08] flex items-center justify-center transition-colors cursor-pointer"
                              aria-label="ลบบอทออก"
                            >
                              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {Array.from({ length: unfilledSlotsCount }).map((_, idx) => (
                    <div
                      key={`empty-slot-${idx}`}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-dashed border-white/[0.08] bg-[#11141c]/50 text-[#7a8296] text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full border border-dashed border-white/[0.12] flex items-center justify-center">
                          <UserPlus className="w-4 h-4 text-[#7a8296]" strokeWidth={1.5} />
                        </div>
                        <span>รอผู้เล่นเข้าร่วม</span>
                      </div>
                      <span className="text-[11px] font-num">ที่ว่าง</span>
                    </div>
                  ))}
                </div>
              </div>

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
                  className="w-full h-10 rounded-lg border border-dashed border-white/[0.14] bg-[#1a1e28]/60 hover:bg-[#1a1e28] hover:border-white/[0.25] text-[#eef0f5] font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <Bot className="w-4 h-4 text-[#a3a9b8]" strokeWidth={1.5} />
                  <span>เพิ่มบอท AI เข้าห้อง</span>
                </button>
              )}

              {currentRoom && currentRoom.players.length >= 2 && (
                <div className="bg-[#07080d] border border-white/[0.08] rounded-xl p-3 text-center text-xs text-[#a3a9b8]">
                  <div>กองกลางสำหรับ {currentRoom.players.length} ผู้เล่น</div>
                  <div className="text-[#eef0f5] mt-1 flex items-center justify-center gap-2 flex-wrap font-num">
                    <span>สีหลักละ {currentRoom.players.length === 2 ? 4 : currentRoom.players.length === 3 ? 5 : 7}</span>
                    <span className="text-[#7a8296]">•</span>
                    <span className="text-[#4cc38a]">Time {currentRoom.players.length}</span>
                    <span className="text-[#7a8296]">•</span>
                    <span>S.H.I.E.L.D. 5</span>
                  </div>
                </div>
              )}

              {!isHost ? (
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onToggleReady?.();
                    }}
                    className={`w-full h-11 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                      isMeReady
                        ? 'bg-[#1a1e28] hover:bg-white/[0.08] text-[#eef0f5] border border-white/[0.1]'
                        : 'bg-amber-400 hover:bg-amber-300 text-[#07080d]'
                    }`}
                  >
                    {isMeReady ? (
                      <>
                        <X className="w-4 h-4" strokeWidth={1.5} />
                        <span>ยกเลิกพร้อมเล่น</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" strokeWidth={1.75} />
                        <span>พร้อมเล่นแล้ว</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-[#a3a9b8]">
                    {isMeReady ? 'คุณพร้อมแล้ว กำลังรอหัวหน้าห้องเริ่มเกม' : 'กดยืนยันความพร้อมเพื่อเริ่มเกม'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleStartGame}
                    disabled={!canStart}
                    className={`w-full h-11 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 active:scale-[0.98] ${
                      canStart
                        ? 'bg-amber-400 hover:bg-amber-300 text-[#07080d] cursor-pointer'
                        : 'bg-[#1a1e28] text-[#7a8296] cursor-not-allowed border border-white/[0.08]'
                    }`}
                  >
                    <Play className="w-4 h-4" strokeWidth={1.75} />
                    <span>
                      {(currentRoom?.players.length ?? 0) < 2
                        ? `ต้องการผู้เล่นอีก ${2 - (currentRoom?.players.length ?? 0)} คน`
                        : !allReady
                        ? `รอผู้เล่นพร้อม (${nonHostHumans.length - unreadyHumans.length}/${nonHostHumans.length})`
                        : 'เริ่มเกม'}
                    </span>
                  </button>

                  {(currentRoom?.players.length ?? 0) >= 2 && !allReady && (
                    <p className="text-center text-xs text-[#a3a9b8]">
                      รอผู้เล่น: <span className="text-[#eef0f5] font-medium">{unreadyHumans.map((p) => p.name).join(', ')}</span> กดพร้อม
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add Bot Modal */}
          {showAddBotModal &&
            createPortal(
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 animate-fade-in">
                <div className="bg-[#11141c] rounded-2xl p-5 max-w-sm w-full space-y-4 border border-white/[0.1] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <h3 className="font-medium text-sm text-[#eef0f5] flex items-center gap-2">
                      <Bot className="w-4 h-4 text-[#a3a9b8]" strokeWidth={1.5} />
                      <span>เพิ่มคู่ต่อสู้บอท AI</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddBotModal(false)}
                      className="w-7 h-7 rounded-md bg-[#1a1e28] hover:bg-white/[0.1] text-[#a3a9b8] hover:text-[#eef0f5] flex items-center justify-center cursor-pointer"
                      aria-label="ปิด"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#a3a9b8] block mb-1.5">
                      ชื่อบอท AI
                    </label>
                    <input
                      type="text"
                      value={newBotName}
                      onChange={(e) => setNewBotName(e.target.value)}
                      placeholder="ระบุชื่อบอท เช่น Doctor Doom"
                      maxLength={20}
                      className="w-full h-10 bg-[#07080d] border border-white/[0.08] rounded-lg px-3 text-[#eef0f5] placeholder-[#7a8296] focus:outline-none focus:border-amber-400/70 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#a3a9b8] block mb-1.5">
                      เลือกตัวละครด่วน
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                      {POPULAR_MARVEL_BOTS.map((bot) => (
                        <button
                          key={bot.name}
                          type="button"
                          onClick={() => {
                            soundManager.playButtonClick();
                            setNewBotName(bot.name);
                            setNewBotPersonality(bot.personality);
                          }}
                          className={`text-left px-2.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                            newBotName === bot.name
                              ? 'border-amber-400/60 bg-[#1a1e28] text-[#eef0f5]'
                              : 'border-white/[0.08] bg-[#07080d] text-[#a3a9b8] hover:text-[#eef0f5]'
                          }`}
                        >
                          <Bot className="w-3.5 h-3.5 text-[#7a8296] shrink-0" strokeWidth={1.5} />
                          <span className="truncate">{bot.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddBotModal(false)}
                      className="flex-1 h-9 rounded-lg bg-[#1a1e28] hover:bg-white/[0.08] border border-white/[0.08] text-[#a3a9b8] hover:text-[#eef0f5] font-medium text-xs transition-colors cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAddBot}
                      disabled={!newBotName.trim()}
                      className="flex-1 h-9 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#07080d] font-medium text-xs transition-colors cursor-pointer disabled:opacity-40"
                    >
                      เพิ่มบอท
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}
          <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
        </div>
      </>
    );
  }

  // ── Main Lobby Screen ──
  const currentMap = getMarvelMap(selectedMapId);
  const CurrentMapIcon = getMapLucideIcon(currentMap.id);

  return (
    <>
      {countdownOverlay}

      {/* Dimmed Battlefield Art blended cleanly into Ink #0b0d14 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none -z-10 opacity-15"
        style={{
          backgroundImage: `url('${currentMap.imageUrl}'), url('/images/maps/asgard.jpg')`,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 25%, rgba(11,13,20,0.72) 0%, rgba(11,13,20,0.96) 70%, #0b0d14 100%)',
        }}
      />

      <div
        className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start px-4 sm:px-6 py-4 relative select-none touch-pan-y text-[#eef0f5]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Top Bar */}
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-2 text-xs text-[#a3a9b8]">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-[#4cc38a]' : 'bg-[#e5484d]'
              }`}
            />
            <span>{connectionStatus === 'connected' ? 'ออนไลน์' : connectionStatus}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playModalOpen();
                setShowTutorial(true);
              }}
              className="h-9 px-3 rounded-lg bg-[#11141c] hover:bg-[#1a1e28] border border-white/[0.08] text-[#eef0f5] font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4 text-[#a3a9b8]" strokeWidth={1.5} />
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
                className="h-9 px-3 rounded-lg border border-white/[0.08] bg-[#11141c] hover:bg-[#1a1e28] text-[#eef0f5] text-xs font-medium transition-colors cursor-pointer"
              >
                เข้าสู่ระบบ
              </button>
            )}
          </div>
        </div>

        {/* Brand Header */}
        <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-5">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 bg-[#c51d24] text-white font-marvel text-2xl tracking-wider rounded leading-none">
              MARVEL
            </span>
            <h1 className="font-display font-semibold text-2xl tracking-wide text-[#eef0f5] leading-none">
              SPLENDOR
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#a3a9b8]">
            เลือกโหมดการเล่น จัดทีมคู่ต่อสู้ และกำหนดสมรภูมิรบ
          </p>
        </div>

        {/* AFK Notification */}
        {afkNotice && (
          <div className="max-w-6xl w-full mb-4 p-3 rounded-xl bg-[#11141c] border border-amber-400/35 text-amber-200 text-xs flex items-center justify-between gap-3 animate-slide-up">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" strokeWidth={1.5} />
              <span>{afkNotice}</span>
            </div>
            {onClearAfkNotice && (
              <button
                type="button"
                onClick={onClearAfkNotice}
                className="text-[#a3a9b8] hover:text-[#eef0f5] p-1 cursor-pointer shrink-0"
                aria-label="ปิดการแจ้งเตือน"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}

        {/* Main 2-Column Layout */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 pb-6 items-start">
          {/* Card 1: Player Profile & Avatar */}
          <div className="order-1 lg:order-1 lg:col-span-5 rounded-2xl bg-[#11141c] border border-white/[0.08] p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="font-medium text-sm text-[#eef0f5]">ข้อมูลผู้เล่น</span>
              <span
                className={`text-xs ${
                  userProfile?.username ? 'text-[#4cc38a]' : 'text-[#7a8296]'
                }`}
              >
                {userProfile?.username ? 'ซิงก์บัญชีแล้ว' : 'ผู้เยี่ยมชม'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setShowAvatarPicker(true);
                }}
                title="เปลี่ยนรูปโปรไฟล์"
                className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-white/[0.14] hover:border-amber-400/70 transition-colors cursor-pointer group active:scale-[0.98]"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover object-center" />
                ) : (
                  <div className="w-full h-full bg-[#1a1e28] flex items-center justify-center font-medium text-[#eef0f5] text-base">
                    {avatarInitial}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="w-4 h-4 text-[#eef0f5]" strokeWidth={1.5} />
                </div>
              </button>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="player-name" className="text-xs font-medium text-[#a3a9b8]">
                    ชื่อฮีโร่ของคุณ
                  </label>
                  {userProfile?.username && playerName.trim() !== userProfile.username && (
                    <button
                      type="button"
                      onClick={() => setPlayerName(userProfile.username)}
                      className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
                      <span>คืนค่า</span>
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
                  placeholder={userProfile?.username ? userProfile.username : 'ระบุชื่อฮีโร่ของคุณ'}
                  className={`w-full h-10 px-3 rounded-lg bg-[#07080d] border text-sm text-[#eef0f5] placeholder-[#7a8296] focus:outline-none transition-colors ${
                    error
                      ? 'border-[#e5484d]'
                      : 'border-white/[0.08] focus:border-amber-400/70'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7a8296]">เลือกอวตารด่วน</span>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setShowAvatarPicker(true);
                  }}
                  className="text-amber-300 hover:text-amber-200 font-medium cursor-pointer"
                >
                  ดูทั้งหมด
                </button>
              </div>
              <div
                className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none touch-pan-x"
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
                    className={`shrink-0 w-8 h-8 rounded-lg overflow-hidden border transition-opacity cursor-pointer ${
                      avatarId === av.id
                        ? 'border-amber-400 opacity-100'
                        : 'border-white/[0.08] opacity-65 hover:opacity-100'
                    }`}
                  >
                    <QuickAvatarThumb src={av.src} fallbackLabel={av.name} />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setShowAvatarPicker(true);
                  }}
                  className="shrink-0 w-8 h-8 rounded-lg bg-[#1a1e28] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-[#a3a9b8] hover:text-[#eef0f5] transition-colors cursor-pointer"
                  title="ดูฮีโร่ทั้งหมด"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Game Mode & Match Setup */}
          <div className="order-2 lg:order-2 lg:col-span-7 lg:row-span-3 flex flex-col gap-4">
            <div className="rounded-2xl bg-[#11141c] border border-white/[0.08] p-4 sm:p-5 space-y-5">
              {/* Segmented Mode Tabs */}
              <div className="p-1 rounded-xl bg-[#07080d] border border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-1">
                {(['solo', 'create', 'join', 'browse'] as const).map((tab) => {
                  const tabConfig = {
                    solo: { label: 'เล่นกับ AI', Icon: Bot },
                    create: { label: 'สร้างห้อง', Icon: Swords },
                    join: { label: 'เข้าด้วยรหัส', Icon: KeyRound },
                    browse: { label: 'ค้นหาห้อง', Icon: Search },
                  };
                  const TabIcon = tabConfig[tab].Icon;
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        soundManager.playButtonClick();
                        setActiveTab(tab);
                      }}
                      className={`h-10 px-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-medium ${
                        isActive
                          ? 'bg-[#1a1e28] text-[#eef0f5] border border-white/[0.1]'
                          : 'text-[#7a8296] hover:text-[#a3a9b8]'
                      }`}
                    >
                      <TabIcon
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-[#7a8296]'}`}
                        strokeWidth={1.5}
                      />
                      <span>{tabConfig[tab].label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Solo AI */}
              {activeTab === 'solo' && (
                <div className="space-y-5 animate-fade-in">
                  {/* Bot Count Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#7a8296]" strokeWidth={1.5} />
                        <span className="text-xs sm:text-sm font-medium text-[#eef0f5]">
                          จำนวนคู่ต่อสู้ AI
                        </span>
                      </div>
                      <span className="text-xs text-[#a3a9b8] font-num">
                        {botCount === 1 ? 'ดวล 1v1' : botCount === 2 ? 'เล่น 3 คน' : 'เล่น 4 คน'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { num: 1, title: '1 บอท', sub: 'ดวลเดี่ยว' },
                        { num: 2, title: '2 บอท', sub: '3 ผู้เล่น' },
                        { num: 3, title: '3 บอท', sub: '4 ผู้เล่น' },
                      ].map((item) => (
                        <button
                          key={item.num}
                          type="button"
                          onClick={() => {
                            soundManager.playButtonClick();
                            setBotCount(item.num);
                          }}
                          className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                            botCount === item.num
                              ? 'border-amber-400/60 bg-[#1a1e28] text-[#eef0f5]'
                              : 'border-white/[0.08] bg-[#07080d] text-[#a3a9b8] hover:text-[#eef0f5] hover:border-white/[0.14]'
                          }`}
                        >
                          <span className="text-xs font-medium font-num">{item.title}</span>
                          <span className="text-[11px] text-[#7a8296] mt-0.5">{item.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bot Roster */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-[#7a8296]" strokeWidth={1.5} />
                        <span className="text-xs sm:text-sm font-medium text-[#eef0f5]">
                          จัดทัพคู่ต่อสู้ AI
                        </span>
                      </div>
                      <span className="text-xs text-[#7a8296] font-num">{botCount} ตัว</span>
                    </div>

                    {/* Team Presets Bar */}
                    <div
                      className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none touch-pan-x"
                      style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                      <span className="text-xs text-[#7a8296] shrink-0 mr-1">ทีมสำเร็จรูป</span>
                      {[
                        { label: 'อเวนเจอร์ส', bots: ['Tony Stark AI', 'Captain America', 'Thor Odinson'] },
                        { label: 'วายร้าย', bots: ['Doctor Doom', 'Loki', 'Thanos Bot'] },
                        { label: 'จอมเวทย์', bots: ['Doctor Strange', 'Scarlet Witch', 'Vision'] },
                        { label: 'เอ็กซ์เมน', bots: ['Wolverine', 'Deadpool', 'Spider-Man'] },
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
                              newNames.forEach((n, i) => {
                                next[i] = n;
                              });
                              return next;
                            });
                            setCustomBotSlots({});
                          }}
                          className="h-7 px-2.5 rounded-md bg-[#1a1e28] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-[#a3a9b8] hover:text-[#eef0f5] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          {preset.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleRandomizeAllBots}
                        title="สุ่มคู่ต่อสู้ใหม่ทั้งทีม"
                        className="h-7 px-2.5 rounded-md bg-[#1a1e28] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-amber-300 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ml-auto"
                      >
                        <Shuffle className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>สุ่มทั้งทีม</span>
                      </button>
                    </div>

                    {/* Bot Slot Cards */}
                    <div className="space-y-2">
                      {Array.from({ length: botCount }).map((_, idx) => {
                        const currentName = botNames[idx] ?? '';
                        const isCustom = Boolean(customBotSlots[idx]);
                        const matchedPreset = POPULAR_MARVEL_BOTS.find((b) => b.name === currentName);
                        const botAvatarSrc = resolveMarvelAvatar(currentName, matchedPreset?.avatarUrl);
                        const tacticDesc = matchedPreset?.desc ?? 'บอทตั้งชื่อเอง';
                        const PersonalityIcon = getBotPersonalityIcon(matchedPreset?.personality);

                        return (
                          <div
                            key={idx}
                            className="bg-[#1a1e28]/70 hover:bg-[#1a1e28] p-3 rounded-xl border border-white/[0.08] transition-colors flex items-center justify-between gap-3"
                          >
                            {isCustom ? (
                              <div className="flex items-center gap-2.5 w-full">
                                <span className="text-xs font-num text-[#7a8296] w-5 text-center shrink-0">
                                  #{idx + 1}
                                </span>
                                <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/[0.12] bg-[#07080d] flex items-center justify-center shrink-0">
                                  {botAvatarSrc ? (
                                    <img
                                      src={botAvatarSrc}
                                      alt={currentName}
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
                                  <span className={`${botAvatarSrc ? 'hidden' : 'flex'} items-center justify-center text-[#7a8296]`}>
                                    <Bot className="w-4 h-4" strokeWidth={1.5} />
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  value={botNames[idx] ?? ''}
                                  onChange={(e) => updateBotName(idx, e.target.value)}
                                  placeholder="พิมพ์ชื่อบอท เช่น Magneto"
                                  maxLength={20}
                                  autoFocus
                                  autoCapitalize="none"
                                  autoCorrect="off"
                                  spellCheck={false}
                                  className="flex-1 min-w-0 h-9 bg-[#07080d] border border-amber-400/50 rounded-lg px-3 text-xs text-[#eef0f5] placeholder-[#7a8296] focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    soundManager.playButtonClick();
                                    setCustomBotSlots((prev) => ({ ...prev, [idx]: false }));
                                    const fallbackPreset = POPULAR_MARVEL_BOTS[idx % POPULAR_MARVEL_BOTS.length];
                                    updateBotName(idx, fallbackPreset.name);
                                  }}
                                  className="shrink-0 h-9 px-2.5 rounded-lg bg-[#11141c] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-[#a3a9b8] hover:text-[#eef0f5] transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                                  <span className="hidden sm:inline">พรีเซ็ต</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                <div
                                  onClick={() => {
                                    soundManager.playButtonClick();
                                    setSelectingBotSlot(idx);
                                  }}
                                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                                >
                                  <span className="text-xs font-num text-[#7a8296] w-5 text-center shrink-0">
                                    #{idx + 1}
                                  </span>

                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/[0.12] bg-[#07080d] shrink-0">
                                    {botAvatarSrc ? (
                                      <img
                                        src={botAvatarSrc}
                                        alt={currentName}
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
                                    <span className={`${botAvatarSrc ? 'hidden' : 'flex'} items-center justify-center w-full h-full text-[#7a8296]`}>
                                      <Bot className="w-4 h-4" strokeWidth={1.5} />
                                    </span>
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-sm font-medium text-[#eef0f5] truncate">
                                        {currentName}
                                      </h4>
                                      {matchedPreset && (() => {
                                        const pInfo = getBotPersonalityInfo(matchedPreset.personality);
                                        return (
                                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#11141c] border border-white/[0.08] text-[#a3a9b8] shrink-0">
                                            <PersonalityIcon className="w-3 h-3 text-[#7a8296]" strokeWidth={1.5} />
                                            <span>{pInfo.label}</span>
                                          </span>
                                        );
                                      })()}
                                    </div>
                                    <p className="text-xs text-[#a3a9b8] truncate mt-0.5">
                                      {tacticDesc}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleShuffleBot(idx)}
                                    title="สุ่มตัวละครนี้"
                                    className="h-8 px-2.5 rounded-lg bg-[#11141c] hover:bg-white/[0.08] border border-white/[0.08] text-[#a3a9b8] hover:text-[#eef0f5] transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                                  >
                                    <Shuffle className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    <span className="hidden sm:inline">สุ่ม</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      soundManager.playButtonClick();
                                      setSelectingBotSlot(idx);
                                    }}
                                    className="h-8 px-3 rounded-lg bg-[#11141c] hover:bg-white/[0.08] border border-white/[0.08] text-[#eef0f5] font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 text-[#a3a9b8]" strokeWidth={1.5} />
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

                  {/* Target Score Selector */}
                  <div className="space-y-2.5 pt-3 border-t border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[#7a8296]" strokeWidth={1.5} />
                        <span className="text-xs sm:text-sm font-medium text-[#eef0f5]">
                          เป้าหมายแต้มชัยชนะ
                        </span>
                      </div>
                      <span
                        key={`solo-top-target-${targetScore}`}
                        className="text-xs font-num font-medium text-amber-300 animate-score-bump select-none"
                      >
                        {targetScore} แต้ม
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
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
                          className={`py-2 px-2 rounded-lg border text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                            targetScore === item.pts
                              ? 'border-amber-400/60 bg-[#1a1e28] text-[#eef0f5]'
                              : 'border-white/[0.08] bg-[#07080d] text-[#a3a9b8] hover:text-[#eef0f5]'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-medium font-num">{item.pts} แต้ม</span>
                          <span className="text-[11px] text-[#7a8296] mt-0.5">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 bg-[#07080d] px-3 py-2 rounded-lg border border-white/[0.08] text-xs">
                      <span className="text-[#a3a9b8] whitespace-nowrap flex items-center gap-1.5 select-none">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#7a8296]" strokeWidth={1.5} />
                        <span>ปรับละเอียด (10–50)</span>
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
                        className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-white/15 rounded-lg"
                      />
                      <span
                        key={`solo-target-${targetScore}`}
                        className="font-num font-medium text-amber-300 text-sm w-7 text-right animate-score-bump select-none"
                      >
                        {targetScore}
                      </span>
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <button
                    type="button"
                    onClick={handleSolo}
                    disabled={isLoading}
                    className="w-full h-11 px-5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50 bg-amber-400 hover:bg-amber-300 text-[#07080d]"
                    style={{
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.28)',
                    }}
                  >
                    <span>เริ่มเล่นกับบอท AI</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              )}

              {/* Tab 2: Create Multiplayer Room */}
              {activeTab === 'create' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[#7a8296]" strokeWidth={1.5} />
                        <span className="text-xs sm:text-sm font-medium text-[#eef0f5]">
                          เป้าหมายแต้มชัยชนะ
                        </span>
                      </div>
                      <span
                        key={`mp-top-target-${targetScore}`}
                        className="text-xs font-num font-medium text-amber-300 animate-score-bump select-none"
                      >
                        {targetScore} แต้ม
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[12, 16, 20, 24].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => {
                            soundManager.playScorePresetSelect(pts);
                            setTargetScore(pts);
                          }}
                          className={`py-2 px-2 rounded-lg border text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                            targetScore === pts
                              ? 'border-amber-400/60 bg-[#1a1e28] text-[#eef0f5]'
                              : 'border-white/[0.08] bg-[#07080d] text-[#a3a9b8] hover:text-[#eef0f5]'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-medium font-num">{pts} แต้ม</span>
                          <span className="text-[11px] text-[#7a8296] mt-0.5">
                            {pts === 12 ? 'จบไว' : pts === 16 ? 'มาตรฐาน' : pts === 20 ? 'ท้าทาย' : 'ศึกใหญ่'}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 bg-[#07080d] px-3 py-2 rounded-lg border border-white/[0.08] text-xs">
                      <span className="text-[#a3a9b8] whitespace-nowrap flex items-center gap-1.5 select-none">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#7a8296]" strokeWidth={1.5} />
                        <span>ปรับละเอียด (10–50)</span>
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
                        className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-white/15 rounded-lg"
                      />
                      <span
                        key={`mp-target-${targetScore}`}
                        className="font-num font-medium text-amber-300 text-sm w-7 text-right animate-score-bump select-none"
                      >
                        {targetScore}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#07080d] border border-white/[0.08] rounded-xl p-4 space-y-1.5 text-xs">
                    <div className="font-medium text-[#eef0f5] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#7a8296]" strokeWidth={1.5} />
                      <span>วิธีใช้งานห้องออนไลน์</span>
                    </div>
                    <p className="text-[#a3a9b8] leading-relaxed">
                      เมื่อสร้างห้องเสร็จจะได้รหัสห้อง 6 ตัวอักษร สามารถส่งให้เพื่อนเข้าร่วมหรือเพิ่มบอท AI ร่วมเล่นได้สูงสุด 4 คน
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isLoading}
                    className="w-full h-11 px-5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50 bg-amber-400 hover:bg-amber-300 text-[#07080d]"
                    style={{
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.28)',
                    }}
                  >
                    <Swords className="w-4 h-4" strokeWidth={1.75} />
                    <span>สร้างห้องเล่นออนไลน์</span>
                  </button>
                </div>
              )}

              {/* Tab 3: Join with Code */}
              {activeTab === 'join' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label
                      htmlFor="room-code"
                      className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#eef0f5]"
                    >
                      <KeyRound className="w-4 h-4 text-[#7a8296]" strokeWidth={1.5} />
                      <span>กรอกรหัสห้อง 6 หลัก</span>
                    </label>
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
                      className="w-full h-12 bg-[#07080d] border border-white/[0.1] rounded-xl px-4 text-[#eef0f5] placeholder-[#7a8296] focus:outline-none focus:border-amber-400/70 transition-colors font-mono tracking-[0.25em] text-center text-lg font-medium"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJoin()}
                    disabled={isLoading || !joinCode.trim()}
                    className="w-full h-11 px-5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-amber-400 hover:bg-amber-300 text-[#07080d]"
                    style={{
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.28)',
                    }}
                  >
                    <span>เข้าร่วมห้อง</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              )}

              {/* Tab 4: Browse Open Rooms */}
              {activeTab === 'browse' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#7a8296]" strokeWidth={1.5} />
                      <span className="text-xs sm:text-sm font-medium text-[#eef0f5]">
                        ห้องที่กำลังรอผู้เล่น
                      </span>
                    </div>
                    <span className="text-xs font-num text-[#a3a9b8]">
                      {openRooms.length} ห้องเปิดอยู่
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {openRooms.length === 0 ? (
                      <div className="p-6 rounded-xl bg-[#07080d] border border-white/[0.08] text-center space-y-2">
                        <Radio className="w-5 h-5 text-[#7a8296] mx-auto" strokeWidth={1.5} />
                        <p className="text-xs text-[#a3a9b8]">
                          ขณะนี้ยังไม่มีห้องเปิดอยู่ สามารถสร้างห้องใหม่เพื่อเริ่มเล่นได้
                        </p>
                      </div>
                    ) : (
                      openRooms.map((room) => {
                        const roomMap = getMarvelMap(room.mapId);
                        return (
                          <div
                            key={room.roomId}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#1a1e28]/70 border border-white/[0.08] hover:border-white/[0.16] transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <code className="text-amber-300 font-mono font-medium text-xs tracking-wider">
                                  {room.roomId}
                                </code>
                                <span className="text-[11px] text-[#a3a9b8]">
                                  {roomMap.name.split(' ')[0]}
                                </span>
                              </div>
                              <p className="text-xs text-[#7a8296] font-num">
                                ผู้เล่น {room.players.length}/{room.maxPlayers} คน • เป้าหมาย {room.targetScore ?? 16} แต้ม
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleJoin(room.roomId)}
                              disabled={isLoading}
                              className="h-8 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#07080d] font-medium text-xs transition-colors cursor-pointer"
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

              {error && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-[#e5484d] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Battlefield Selection (Moment 1) */}
          <div className="order-3 lg:order-3 lg:col-span-5 rounded-2xl bg-[#11141c] border border-white/[0.08] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-[#7a8296]" strokeWidth={1.5} />
                <span className="font-medium text-sm text-[#eef0f5]">สมรภูมิรบที่เลือก</span>
              </div>
              <span className="text-xs text-[#7a8296]">{currentMap.realm}</span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-white/[0.08] h-28">
              <img
                key={currentMap.id}
                src={currentMap.imageUrl}
                alt={currentMap.name}
                className="w-full h-full object-cover animate-fade-in"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-300">
                  <CurrentMapIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{currentMap.subtitle}</span>
                </div>
                <h4 className="font-medium text-sm sm:text-base text-[#eef0f5] leading-snug">
                  {currentMap.name}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {MARVEL_MAPS.map((map) => {
                const isSelected = selectedMapId === map.id;
                const MapItemIcon = getMapLucideIcon(map.id);
                return (
                  <button
                    key={map.id}
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      setSelectedMapId(map.id);
                    }}
                    className={`h-8 px-2 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-1.5 min-w-0 ${
                      isSelected
                        ? 'bg-[#1a1e28] border-amber-400/60 text-[#eef0f5]'
                        : 'bg-[#07080d] border-white/[0.08] text-[#a3a9b8] hover:text-[#eef0f5]'
                    }`}
                  >
                    <MapItemIcon
                      className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-[#7a8296]'}`}
                      strokeWidth={1.5}
                    />
                    <span className="text-xs truncate">{map.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Infinity Stones Matrix (Moment 2) */}
          <div className="order-4 lg:order-4 lg:col-span-5 rounded-2xl bg-[#11141c] border border-white/[0.08] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
              <span className="font-medium text-sm text-[#eef0f5]">คลังอัญมณีอินฟินิตี้</span>
              <span className="text-xs text-[#a3a9b8] font-num">
                {botCount + 1} ผู้เล่น
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ruby', name: 'Reality', th: 'ความจริง' },
                { id: 'sapphire', name: 'Space', th: 'อวกาศ' },
                { id: 'obsidian', name: 'Soul', th: 'วิญญาณ' },
                { id: 'topaz', name: 'Mind', th: 'จิตใจ' },
                { id: 'amethyst', name: 'Power', th: 'พลัง' },
                { id: 'emerald', name: 'Time', th: 'เวลา' },
              ].map((st) => (
                <div
                  key={st.id}
                  className="p-2.5 rounded-xl bg-[#1a1e28] border border-white/[0.08] flex items-center gap-2.5"
                >
                  <div className={`w-3.5 h-3.5 rounded-full crystal-${st.id} shrink-0`} />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#eef0f5] truncate leading-tight">
                      {st.name}
                    </div>
                    <div className="text-[11px] text-[#a3a9b8] truncate leading-tight mt-0.5">
                      {st.th}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#07080d] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#a3a9b8] flex items-center justify-between gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-[#7a8296]">
                <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>สต็อกรอบนี้</span>
              </span>
              <div className="flex items-center gap-3 font-num text-[#eef0f5]">
                <span>สีละ {botCount === 1 ? 4 : botCount === 2 ? 5 : 7}</span>
                <span className="text-[#4cc38a]">เวลา {botCount + 1}</span>
                <span className="text-amber-300">ทอง 5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full max-w-6xl mx-auto pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7a8296]">
          <div className="flex items-center gap-2">
            <span>พัฒนาโดย sanior09</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                soundManager.playModalOpen();
                setShowDisclaimerModal(true);
              }}
              className="text-[#a3a9b8] hover:text-[#eef0f5] underline underline-offset-2 transition-colors cursor-pointer"
            >
              ข้อกำหนดและลิขสิทธิ์
            </button>
          </div>
          <span>จัดทำเพื่อการศึกษาและแฟนบอร์ดเกม ไม่แสวงหาผลกำไร</span>
        </footer>

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

        {/* Bot Character Selector Modal */}
        {selectingBotSlot !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectingBotSlot(null)}
          >
            <div
              className="w-full max-w-2xl bg-[#11141c] border border-white/[0.1] rounded-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto overscroll-contain touch-pan-y"
              style={{ WebkitOverflowScrolling: 'touch' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#1a1e28] border border-white/[0.08] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-[#eef0f5]">
                      เลือกคู่ต่อสู้ AI สำหรับช่อง #{selectingBotSlot + 1}
                    </h3>
                    <p className="text-xs text-[#a3a9b8]">
                      เลือกตัวละครหรือตั้งชื่อคู่ต่อสู้เอง
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectingBotSlot(null)}
                  className="w-8 h-8 rounded-lg bg-[#1a1e28] hover:bg-white/[0.1] border border-white/[0.08] text-[#a3a9b8] hover:text-[#eef0f5] flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="ปิด"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {POPULAR_MARVEL_BOTS.map((bot) => {
                  const isSelected = botNames[selectingBotSlot] === bot.name && !customBotSlots[selectingBotSlot];
                  const botAvatarSrc = resolveMarvelAvatar(bot.name, bot.avatarUrl);
                  const pInfo = getBotPersonalityInfo(bot.personality);
                  const PIcon = getBotPersonalityIcon(bot.personality);

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
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'border-amber-400/60 bg-[#1a1e28]'
                          : 'border-white/[0.08] bg-[#07080d] hover:bg-[#1a1e28]/70'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-lg overflow-hidden border border-white/[0.12] bg-[#11141c] shrink-0">
                        {botAvatarSrc ? (
                          <img src={botAvatarSrc} alt={bot.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-[#7a8296]">
                            <Bot className="w-4 h-4" strokeWidth={1.5} />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-[#eef0f5] truncate">
                          {bot.name}
                        </div>
                        <p className="text-xs text-[#a3a9b8] truncate mt-0.5">{bot.desc}</p>
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#7a8296] mt-1">
                          <PIcon className="w-3 h-3" strokeWidth={1.5} />
                          <span>{pInfo.label}</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-[#07080d] border border-white/[0.08] space-y-2">
                <label className="text-xs font-medium text-[#a3a9b8] block">
                  หรือกำหนดชื่อบอทเอง
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customBotSlots[selectingBotSlot] ? botNames[selectingBotSlot] : ''}
                    onChange={(e) => {
                      updateBotName(selectingBotSlot, e.target.value);
                      setCustomBotSlots((prev) => ({ ...prev, [selectingBotSlot]: true }));
                    }}
                    placeholder="พิมพ์ชื่อตัวละครที่ต้องการ"
                    maxLength={20}
                    className="flex-1 h-9 bg-[#11141c] border border-white/[0.08] rounded-lg px-3 text-xs text-[#eef0f5] placeholder-[#7a8296] focus:outline-none focus:border-amber-400/70"
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
                    className="h-9 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#07080d] font-medium text-xs cursor-pointer transition-colors"
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
