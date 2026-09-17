// ============================================================
//  Lobby.tsx — Marvel Splendor Room Creation & Solo AI Customizer
// ============================================================

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { RoomInfo } from '@shared/types/game.types';

import { soundManager } from '../utils/soundManager';
import { MARVEL_MAPS, getMarvelMap } from '../data/marvelMaps';
import { TutorialModal } from './TutorialModal';
import { AvatarPicker, MARVEL_AVATARS } from './AvatarPicker';
import marvelAvatarsData from '../data/marvelAvatarsData.json';

const resolvePlayerAvatar = (name: string, avatarUrl?: string): string | undefined => {
  if (avatarUrl) return avatarUrl;
  const lower = name.toLowerCase();
  const avatarMap = marvelAvatarsData as Record<string, string>;
  if (lower.includes('doom')) return avatarMap['doctor_doom'] || '/images/avatars/doctor_doom.jpg';
  if (lower.includes('loki')) return avatarMap['loki'] || '/images/avatars/loki.jpg';
  if (lower.includes('thanos')) return avatarMap['thanos'] || '/images/avatars/thanos.jpg';
  if (lower.includes('stark') || lower.includes('iron')) return avatarMap['iron_man'] || '/images/avatars/iron_man.jpg';
  return undefined;
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
}

interface MarvelBotPreset {
  name: string;
  personality: string;
  avatar: string;
  desc: string;
  avatarUrl?: string;
}

const POPULAR_MARVEL_BOTS: MarvelBotPreset[] = [
  { name: 'Doctor Doom', personality: 'stark', avatar: '👑', desc: 'Tactical Mastermind', avatarUrl: '/images/avatars/doctor_doom.jpg' },
  { name: 'Loki', personality: 'ultron', avatar: '🐍', desc: 'Trickster & Schemer', avatarUrl: '/images/avatars/loki.jpg' },
  { name: 'Kang the Conqueror', personality: 'stark', avatar: '⏳', desc: 'Time Traveler' },
  { name: 'Hela', personality: 'ultron', avatar: '⚔️', desc: 'Goddess of Death' },
  { name: 'Magneto', personality: 'stark', avatar: '🧲', desc: 'Mutant Leader' },
  { name: 'J.A.R.V.I.S.', personality: 'friday', avatar: '🤖', desc: 'Stark AI Assistant' },
  { name: 'Thanos Bot', personality: 'thanos', avatar: '🧤', desc: 'Infinity Gauntlet Seeker', avatarUrl: '/images/avatars/thanos.jpg' },
  { name: 'Ultron', personality: 'ultron', avatar: '⚡', desc: 'Vengeful AI' },
  { name: 'Tony Stark AI', personality: 'stark', avatar: '🦾', desc: 'Armored Strategist', avatarUrl: '/images/avatars/iron_man.jpg' },
  { name: 'Green Goblin', personality: 'ultron', avatar: '🎃', desc: 'Chaotic Threat' },
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
}) => {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openRooms, setOpenRooms] = useState<RoomInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'solo' | 'create' | 'join' | 'browse'>('solo');
  const [selectedMapId, setSelectedMapId] = useState<string>('asgard');
  const [targetScore, setTargetScore] = useState<number>(16);
  const [showTutorial, setShowTutorial] = useState(false);

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
    if (!playerName.trim()) {
      soundManager.playError();
      setError('กรุณาระบุชื่อฮีโร่ของคุณ (Please enter your Hero name)');
      document.getElementById('player-name')?.focus();
      return;
    }
    soundManager.playButtonClick();
    setIsLoading(true);
    setError('');
    onCreateRoom(playerName.trim(), () => setIsLoading(false), selectedMapId, avatarUrl || undefined, targetScore);
  };

  const handleSolo = (): void => {
    if (!playerName.trim()) {
      soundManager.playError();
      setError('กรุณาระบุชื่อฮีโร่ของคุณ (Please enter your Hero name)');
      document.getElementById('player-name')?.focus();
      return;
    }
    soundManager.playCardBuy(3);
    setIsLoading(true);
    setError('');
    const selectedBotNames = botNames.slice(0, botCount).map((name, idx) => {
      return name.trim() || POPULAR_MARVEL_BOTS[idx]?.name || `Marvel AI ${idx + 1}`;
    });
    onCreateSolo(playerName.trim(), botCount, selectedBotNames, selectedMapId, avatarUrl || undefined, targetScore);
  };

  const handleJoin = (roomId?: string): void => {
    const code = (roomId ?? joinCode).trim().toUpperCase();
    if (!playerName.trim()) {
      soundManager.playError();
      setError('กรุณาระบุชื่อฮีโร่ของคุณ (Please enter your Hero name)');
      document.getElementById('player-name')?.focus();
      return;
    }
    if (!code) {
      soundManager.playError();
      setError('กรุณากรอกรหัสห้อง (Please enter room code)');
      return;
    }
    soundManager.playButtonClick();
    setIsLoading(true);
    setError('');
    onJoinRoom(code, playerName.trim(), (success, err) => {
      setIsLoading(false);
      if (!success) {
        soundManager.playError();
        setError(err ?? 'ไม่สามารถเข้าร่วมห้องได้ (Failed to join room)');
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

  // ── In-Room Lobby (Waiting Room) ──────────────────────────
  if (currentRoom) {
    return (
      <div className="w-full h-full overflow-y-auto overflow-x-hidden board-bg flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 relative select-none">
        <div className="w-full max-w-md my-auto py-2 sm:py-4">
          <div className="glass-strong rounded-2xl p-3.5 sm:p-5 w-full space-y-3 sm:space-y-4 border border-white/15 shadow-2xl relative">
            <div className="absolute top-3 left-3 z-20">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  onLeaveRoom?.();
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow hover:scale-105"
                title="ย้อนกลับไปหน้าแรก (Leave Room & Return to Main Lobby)"
              >
                <span>⬅️</span>
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
                title="กดดูคู่มือวิธีเล่น MARVEL SPLENDOR (How to Play)"
              >
                <span>📖</span>
                <span>สอนเล่น</span>
              </button>
            </div>

            <div className="text-center space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <span className="marvel-badge px-2 py-0.5 rounded text-xs tracking-wider">MARVEL</span>
                <span className="font-display font-black text-lg text-white tracking-widest">SPLENDOR</span>
              </div>
              <h2 className="font-display text-xl font-black text-white">
                รวมพลเหล่าฮีโร่ <span className="text-xs font-normal text-white/50">(Assemble Heroes)</span>
              </h2>
              <div className="flex items-center justify-center gap-2">
                <span className="text-white/60 text-xs uppercase tracking-wider font-semibold">
                  รหัสห้อง (Room Code):
                </span>
                <code className="bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-lg font-mono font-black text-lg tracking-widest border border-red-500/40">
                  {currentRoom.roomId}
                </code>
              </div>

              {/* Battlefield Map & Target Score Indicators in waiting room */}
              <div className="flex flex-wrap items-center justify-center gap-2 my-1">
                {(() => {
                  const roomMap = getMarvelMap(currentRoom.mapId);
                  return (
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-white/10 border ${roomMap.accentBorder} shadow-sm`}
                      title={`สมรภูมิรบที่เลือกไว้: ${roomMap.name} (${roomMap.nameEn}) - ล็อกแล้วไม่สามารถเปลี่ยนได้ในเกม`}
                    >
                      <span className="text-sm">{roomMap.icon}</span>
                      <span>สมรภูมิ: <span className="text-yellow-300 font-extrabold">{roomMap.name}</span></span>
                      <span className="text-[9px] bg-red-600/80 text-white font-mono px-1.5 py-0.2 rounded-full uppercase tracking-wider">🔒 LOCKED</span>
                    </div>
                  );
                })()}

                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-amber-950/40 border border-yellow-500/40 shadow-sm"
                  title="แต้มเป้าหมายสำหรับชัยชนะในเกมนี้"
                >
                  <span>🎯 แต้มเป้าหมาย:</span>
                  <span className="text-yellow-300 font-black text-sm">{currentRoom.targetScore ?? 16} แต้ม</span>
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
                        'px-2 py-0.5 rounded-lg font-black transition-all cursor-pointer border',
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
                แชร์รหัสนี้ให้เพื่อน หรือเพิ่มบอทมาร์เวล AI เข้ามาประลอง (Share code with friends or customize AI Bots)
              </p>
            </div>

            {/* Player list */}
            <div className="glass rounded-xl overflow-hidden border border-white/10 max-h-48 overflow-y-auto">
              <div className="px-3.5 py-2 border-b border-white/10 flex items-center justify-between sticky top-0 bg-neutral-950/80 backdrop-blur-sm z-10">
                <span className="text-[11px] text-white/70 font-bold uppercase tracking-wider">
                  ผู้เล่นที่เข้าร่วม (Recruited Players)
                </span>
                <span className="text-[11px] text-white/50 font-semibold">
                  {currentRoom.players.length}/4 คน (Slots)
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {currentRoom.players.map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5 px-3.5 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center font-bold text-xs text-white shadow shrink-0 overflow-hidden border border-white/20">
                      {(() => {
                        const avatarSrc = resolvePlayerAvatar(p.name, p.avatarUrl);
                        const isDoom = p.name.toLowerCase().includes('doom');
                        const fallbackEmoji = isDoom ? '👑' : p.isBot ? '🤖' : p.name.charAt(0).toUpperCase();
                        return (
                          <>
                            {avatarSrc ? (
                              <img
                                src={avatarSrc}
                                alt={p.name}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const doomBase64 = (marvelAvatarsData as Record<string, string>)['doctor_doom'];
                                  if (isDoom && doomBase64 && target.src !== doomBase64) {
                                    target.src = doomBase64;
                                    return;
                                  }
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
                      <span className="font-bold text-white text-xs truncate block">{p.name}</span>
                      {p.isBot && <span className="text-[8px] text-purple-300 block">🤖 บอทมาร์เวล (Marvel AI Bot)</span>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.id === currentRoom.hostId ? (
                        <span className="text-[9px] font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full border border-yellow-400/30">
                          👑 หัวหน้าห้อง (Host)
                        </span>
                      ) : p.isBot ? (
                        <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          พร้อมเสมอ (Ready)
                        </span>
                      ) : p.isReady ? (
                        <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          ✅ พร้อมเล่น (Ready)
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-amber-300/80 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1">
                          ⏳ ยังไม่พร้อม (Not Ready)
                        </span>
                      )}
                      {p.id === myPlayerId && p.id !== currentRoom.hostId && (
                        <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded-full border border-indigo-400/30">
                          👤 คุณ (YOU)
                        </span>
                      )}
                      {isHost && p.isBot && (
                        <button
                          type="button"
                          onClick={() => onRemoveBot(p.id)}
                          className="text-red-400 hover:text-red-300 text-xs px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
                          title="ลบบอทออก (Remove Bot)"
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
                <span>+ เพิ่มและปรับแต่งบอทมาร์เวล (+ Add Marvel AI Bot)</span>
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
                      <span>ยกเลิกพร้อมเล่น (Cancel Ready)</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">⚡</span>
                      <span>กดพร้อมเล่น (I'm Ready!)</span>
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
                    if (!canStart) {
                      soundManager.playError();
                      return;
                    }
                    soundManager.playCardBuy(3);
                    onStartGame();
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
                    ? `ต้องการอีก ${2 - (currentRoom?.players.length ?? 0)} คนหรือบอท (Need More Players)`
                    : !allReady
                    ? `⏳ รอผู้เล่นกดพร้อม (${nonHostHumans.length - unreadyHumans.length}/${nonHostHumans.length} คนพร้อม)`
                    : '⚡ เริ่มเกม Splendor: Marvel (Start Game)'}
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
                      <span>🤖</span> เพิ่มคู่ต่อสู้บอท AI (Add Marvel AI Opponent)
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
                      ชื่อบอท (Bot Name - พิมพ์เองหรือเลือกด้านล่าง)
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
                      เลือกตัวละครด่วน (Quick Character Select)
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
                      ยกเลิก (Cancel)
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAddBot}
                      disabled={!newBotName.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                    >
                      + เพิ่มบอท (+ Add Bot)
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
    );
  }

  // ── Main Lobby Screen ─────────────────────────────────────
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden board-bg flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 relative">
      {/* Top-Right Control Bar: Roblox-style Tutorial Button & Sound Toggle */}
      <div className="fixed top-2.5 right-2.5 sm:top-4 sm:right-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            soundManager.playModalOpen();
            setShowTutorial(true);
          }}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-600/30 hover:from-amber-500/40 hover:to-yellow-500/40 border border-yellow-400/60 text-yellow-300 font-black text-xs flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
          title="กดดูวิธีเล่น MARVEL SPLENDOR แบบทีละขั้นตอน (Interactive How-To-Play Tutorial)"
        >
          <span className="text-sm animate-bounce">📖</span>
          <span>สอนเล่น (Tutorial)</span>
        </button>
      </div>

      <div className="w-full max-w-lg flex flex-col items-center my-auto py-2 sm:py-6">

        {/* Hero Header */}
        <div className="text-center space-y-1 mb-2 sm:mb-3">
          <div className="flex items-center justify-center gap-2">
            <span className="marvel-badge px-2 sm:px-3 py-0.5 rounded text-xl sm:text-3xl font-black tracking-wider shadow-2xl">
              MARVEL
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-black shimmer-text leading-none tracking-widest">
              SPLENDOR
            </h1>
          </div>
          <p className="text-white/70 text-[10px] sm:text-sm max-w-xs sm:max-w-lg mx-auto truncate">
            แย่งชิงถุงมืออินฟินิตี้ • เกณฑ์ฮีโร่มาร์เวล • พิชิตจักรวาล (Infinity Gauntlet • Splendor)
          </p>
          <div className="flex items-center justify-center gap-3 pt-0.5">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                  }`}
              />
              <span className="text-xs text-white/50">
                {connectionStatus === 'connected' ? '🟢 เซิร์ฟเวอร์พร้อมใช้งาน (Server Connected)' : connectionStatus}
              </span>
            </div>

          </div>
        </div>

        {/* AFK / Inactivity notification banner */}
        {afkNotice && (
          <div className="max-w-lg w-full mb-3 p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg animate-slide-up">
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

        {/* Main card */}
        <div className="glass-strong rounded-2xl p-3.5 sm:p-6 max-w-lg w-full space-y-3 sm:space-y-3.5 border border-white/10 shadow-2xl">
          {/* Player name + Avatar */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/80 block mb-1.5">
              ชื่อฮีโร่ของคุณ (Your Hero Name)
            </label>
            <div className="flex items-center gap-2.5">
              {/* Avatar button */}
              <button
                type="button"
                onClick={() => { soundManager.playButtonClick(); setShowAvatarPicker(true); }}
                title="เปลี่ยนโปรไฟล์ (Change Avatar)"
                className="relative shrink-0 w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-red-400/70 transition-all cursor-pointer active:scale-90 group"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover object-center" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-700 to-amber-600 flex items-center justify-center font-black text-white text-lg select-none">
                    {avatarInitial}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm">✏️</span>
                </div>
              </button>

              {/* Name input */}
              <input
                id="player-name"
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  if (error) setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && (activeTab === 'solo' ? handleSolo() : handleCreate())}
                placeholder="เช่น Iron Man, Thor, Spider-Man..."
                maxLength={20}
                className={`flex-1 bg-white/5 border rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none transition-all font-medium text-sm ${
                  error
                    ? 'border-red-500 ring-2 ring-red-500/40 bg-red-950/20 animate-pulse'
                    : 'border-white/10 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40'
                }`}
              />
            </div>
            {/* Quick Marvel avatar row for fast pick */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5 scrollbar-none">
              <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider shrink-0">เร็ว:</span>
              {MARVEL_AVATARS.slice(0, 8).map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => { handleAvatarSelect(av.src, av.id); soundManager.playButtonClick(); }}
                  title={av.name}
                  className={[
                    'shrink-0 w-7 h-7 rounded-full overflow-hidden ring-1 transition-all cursor-pointer hover:scale-110 active:scale-90',
                    avatarId === av.id ? `${av.color} ring-offset-1 ring-offset-black/50` : 'ring-white/15 hover:ring-white/40',
                  ].join(' ')}
                >
                  <QuickAvatarThumb src={av.src} fallbackEmoji={av.id} />
                </button>
              ))}
              <button
                type="button"
                onClick={() => { soundManager.playButtonClick(); setShowAvatarPicker(true); }}
                className="shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 ring-1 ring-white/15 flex items-center justify-center text-xs text-white/60 hover:text-white transition-all cursor-pointer hover:scale-110"
                title="ดูทั้งหมด"
              >
                ＋
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-white/10 p-1 bg-black/30 gap-1.5">
            {(['solo', 'create', 'join', 'browse'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setActiveTab(tab);
                }}
                className={[
                  'flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all capitalize cursor-pointer',
                  activeTab === tab
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-white/50 hover:text-white hover:bg-white/5',
                ].join(' ')}
              >
                {tab === 'solo'
                  ? '🤖 เล่นกับบอท'
                  : tab === 'create'
                    ? '✦ สร้างห้อง'
                    : tab === 'join'
                      ? '🔗 เข้าร่วม'
                      : '🌐 ค้นหาห้อง'}
              </button>
            ))}
          </div>

          {/* Solo vs AI Tab with Bot Customizer */}
          {activeTab === 'solo' && (
            <div className="space-y-3">
              {/* Number of bots */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">
                  จำนวนคู่ต่อสู้บอท AI (Number of AI Opponents)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBotCount(num)}
                      className={[
                        'py-1.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer',
                        botCount === num
                          ? 'border-red-500 bg-red-600/30 text-white ring-1 ring-red-400'
                          : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10',
                      ].join(' ')}
                    >
                      {num} บอท ({num + 1}P)
                    </button>
                  ))}
                </div>

                {/* Dynamic Token Pool info for solo */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-center text-[10px] text-emerald-200 mt-1.5">
                  <span className="font-bold">⚡ กองกลางเกม {botCount + 1} คน: </span>
                  <span className="text-white/80">
                    5 สีหลักละ{' '}
                    <span className="font-black text-amber-300">
                      {botCount === 1 ? 4 : botCount === 2 ? 5 : 7}
                    </span>{' '}
                    ก้อน • 🟢 Time Stone{' '}
                    <span className="font-black text-emerald-300">{botCount + 1}</span> ก้อน • 🛡️ S.H.I.E.L.D.{' '}
                    <span className="font-black text-slate-200">5</span> ก้อน
                  </span>
                </div>
              </div>

              {/* Custom Bot Names List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">
                    เลือกหรือพิมพ์ชื่อคู่ต่อสู้ AI (Customize Bots)
                  </label>
                  <span className="text-[10px] text-white/40">เลือกด่วนหรือพิมพ์เอง</span>
                </div>
                <div className="space-y-1.5">
                  {Array.from({ length: botCount }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-black/30 px-2.5 py-1.5 rounded-xl border border-white/10">
                      <span className="text-xs font-bold text-purple-300 shrink-0 w-6 text-center">
                        #{idx + 1}
                      </span>

                      {/* Quick Marvel preset select */}
                      <select
                        value={POPULAR_MARVEL_BOTS.some((b) => b.name === botNames[idx]) ? botNames[idx] : 'custom'}
                        onChange={(e) => {
                          if (e.target.value !== 'custom') {
                            updateBotName(idx, e.target.value);
                          }
                        }}
                        className="bg-neutral-900 border border-white/15 rounded-lg px-2 py-1 text-xs sm:text-sm text-white focus:outline-none focus:border-red-400 font-medium shrink-0 max-w-[155px]"
                      >
                        {POPULAR_MARVEL_BOTS.map((bot) => (
                          <option key={bot.name} value={bot.name} className="bg-neutral-900 text-white">
                            {bot.avatar} {bot.name}
                          </option>
                        ))}
                        <option value="custom" className="bg-neutral-900 text-purple-300">
                          ✍️ พิมพ์ชื่อเอง
                        </option>
                      </select>

                      <input
                        type="text"
                        value={botNames[idx] ?? ''}
                        onChange={(e) => updateBotName(idx, e.target.value)}
                        placeholder={`ชื่อบอท ${idx + 1}...`}
                        maxLength={20}
                        className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-400 font-semibold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Marvel Battlefield Map Selector for Solo Mode (Compact Dropdown Bar matching Bot selector) */}
              <div className="space-y-1.5 pt-1 border-t border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5 min-w-0 truncate">
                    <span>🗺️</span>
                    <span className="truncate">แผนที่สมรภูมิมาร์เวล (Marvel Map)</span>
                  </label>
                  <span className="text-[10px] text-yellow-400 font-semibold bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30 shrink-0 whitespace-nowrap">
                    🔒 ล็อกตลอดทั้งเกม
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-black/30 px-2.5 py-1.5 rounded-xl border border-white/10">
                  <span className="text-sm shrink-0 w-6 text-center">
                    {getMarvelMap(selectedMapId).icon}
                  </span>

                  {/* Dropdown Select matching Bot preset select */}
                  <select
                    value={selectedMapId}
                    onChange={(e) => {
                      soundManager.playButtonClick();
                      setSelectedMapId(e.target.value);
                    }}
                    className="bg-neutral-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-400 font-bold min-w-0 flex-1 cursor-pointer truncate"
                  >
                    {MARVEL_MAPS.map((map) => (
                      <option key={map.id} value={map.id} className="bg-neutral-900 text-white">
                        {map.icon} {map.name} ({map.nameEn})
                      </option>
                    ))}
                  </select>

                  <span className="text-[10px] font-bold text-yellow-300 bg-yellow-400/15 border border-yellow-400/30 px-2 py-1 rounded-lg shrink-0 whitespace-nowrap">
                    {getMarvelMap(selectedMapId).realm}
                  </span>
                </div>

                {/* Compact Map Description Hint */}
                {(() => {
                  const currentMap = getMarvelMap(selectedMapId);
                  return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-[10px] text-white/60 overflow-hidden">
                      <span className="font-semibold text-white/80 shrink-0 whitespace-nowrap">{currentMap.subtitle}:</span>
                      <span className="truncate min-w-0">{currentMap.description}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Target Winning Points Selector (Solo Mode) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>แต้มเป้าหมายชัยชนะ (Target Win Points)</span>
                  </label>
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
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
                        'py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center',
                        targetScore === pts
                          ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400 font-black shadow'
                          : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white font-semibold',
                      ].join(' ')}
                    >
                      <span className="text-xs sm:text-sm font-black">{pts} แต้ม</span>
                      <span className="text-[8px] opacity-70">
                        {pts === 12 ? 'เร็ว' : pts === 16 ? 'มาตรฐาน' : pts === 20 ? 'ท้าทาย' : 'ศึกใหญ่'}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                  <span className="text-white/50 text-[10px] font-semibold whitespace-nowrap">ปรับละเอียด (10-50):</span>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={1}
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    className="flex-1 accent-yellow-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                  />
                  <span className="font-mono font-black text-yellow-300 text-sm w-7 text-right">
                    {targetScore}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSolo}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-black font-display text-sm sm:text-base bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 text-white transition-all duration-200 shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                {isLoading ? 'กำลังเตรียมเกม... (Assembling...)' : '⚡ เล่นคนเดียวกับบอท (Play Solo vs AI)'}
              </button>
            </div>
          )}

          {/* Create Multiplayer Room Tab */}
          {activeTab === 'create' && (
            <div className="space-y-3">
              {/* Marvel Battlefield Map Selector for Multiplayer Room (Compact Dropdown Bar matching Bot selector) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5 min-w-0 truncate">
                    <span>🗺️</span>
                    <span className="truncate">แผนที่สมรภูมิมาร์เวล (Marvel Map)</span>
                  </label>
                  <span className="text-[10px] text-yellow-400 font-semibold bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30 shrink-0 whitespace-nowrap">
                    🔒 ล็อกตลอดทั้งเกม
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-black/30 px-2.5 py-1.5 rounded-xl border border-white/10">
                  <span className="text-sm shrink-0 w-6 text-center">
                    {getMarvelMap(selectedMapId).icon}
                  </span>

                  {/* Dropdown Select matching Bot preset select */}
                  <select
                    value={selectedMapId}
                    onChange={(e) => {
                      soundManager.playButtonClick();
                      setSelectedMapId(e.target.value);
                    }}
                    className="bg-neutral-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-400 font-bold min-w-0 flex-1 cursor-pointer truncate"
                  >
                    {MARVEL_MAPS.map((map) => (
                      <option key={map.id} value={map.id} className="bg-neutral-900 text-white">
                         {map.icon} {map.name} ({map.nameEn})
                      </option>
                    ))}
                  </select>

                  <span className="text-[10px] font-bold text-yellow-300 bg-yellow-400/15 border border-yellow-400/30 px-2 py-1 rounded-lg shrink-0 whitespace-nowrap">
                    {getMarvelMap(selectedMapId).realm}
                  </span>
                </div>

                {/* Compact Map Description Hint */}
                {(() => {
                  const currentMap = getMarvelMap(selectedMapId);
                  return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-[10px] text-white/60 overflow-hidden">
                      <span className="font-semibold text-white/80 shrink-0 whitespace-nowrap">{currentMap.subtitle}:</span>
                      <span className="truncate min-w-0">{currentMap.description}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Target Winning Points Selector (Multiplayer Room) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>แต้มเป้าหมายชัยชนะ (Target Win Points)</span>
                  </label>
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
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
                        'py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center',
                        targetScore === pts
                          ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400 font-black shadow'
                          : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white font-semibold',
                      ].join(' ')}
                    >
                      <span className="text-xs sm:text-sm font-black">{pts} แต้ม</span>
                      <span className="text-[8px] opacity-70">
                        {pts === 12 ? 'เร็ว' : pts === 16 ? 'มาตรฐาน' : pts === 20 ? 'ท้าทาย' : 'ศึกใหญ่'}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                  <span className="text-white/50 text-[10px] font-semibold whitespace-nowrap">ปรับละเอียด (10-50):</span>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={1}
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    className="flex-1 accent-yellow-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                  />
                  <span className="font-mono font-black text-yellow-300 text-sm w-7 text-right">
                    {targetScore}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreate}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-black font-display text-sm sm:text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 text-white transition-all duration-200 shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                {isLoading ? 'กำลังสร้างห้อง... (Creating...)' : '✦ สร้างห้องเล่นหลายคน (Create Multiplayer Room)'}
              </button>
            </div>
          )}

          {/* Join Room Tab */}
          {activeTab === 'join' && (
            <div className="space-y-3">
              <input
                id="room-code"
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="กรอกรหัสห้อง 6 หลัก (ROOM CODE)"
                maxLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 transition-colors font-mono tracking-widest text-center text-lg uppercase font-black"
              />
              <button
                type="button"
                onClick={() => handleJoin()}
                disabled={isLoading || !joinCode.trim()}
                className="w-full py-3.5 rounded-xl font-black font-display text-sm sm:text-base bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 text-white transition-all duration-200 shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                {isLoading ? 'กำลังเข้าร่วม... (Joining...)' : '🔗 เข้าร่วมห้อง (Join Room)'}
              </button>
            </div>
          )}

          {/* Browse Rooms Tab */}
          {activeTab === 'browse' && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {openRooms.length === 0 ? (
                <div className="text-center py-5 text-white/40 text-xs">
                  ยังไม่มีห้องที่เปิดอยู่ตอนนี้ สร้างห้องใหม่ได้เลย! (No open rooms right now)
                </div>
              ) : (
                openRooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="flex items-center justify-between glass rounded-xl px-3.5 py-2.5 border border-white/5"
                  >
                    <div>
                      <code className="text-red-300 font-mono font-bold text-sm">{room.roomId}</code>
                      <p className="text-[10px] text-white/50">
                        ผู้เล่น {room.players.length}/{room.maxPlayers} คน (Players)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJoin(room.roomId)}
                      disabled={isLoading}
                      className="text-xs bg-red-600 hover:bg-red-500 disabled:bg-white/10 text-white px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                    >
                      เข้าร่วม (Join)
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 text-xs text-red-300 text-center font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Decorative 6 Infinity Stones */}
        <div className="flex gap-3 mt-3 items-center justify-center">
          {['ruby', 'sapphire', 'emerald', 'obsidian', 'topaz', 'amethyst'].map((c) => (
            <div
              key={c}
              className={`w-4 h-4 rounded-full crystal-${c} shadow-md border border-white/20 transition-transform hover:scale-125 cursor-pointer`}
            />
          ))}
        </div>
        {/* Interactive Roblox-Style Tutorial Modal */}
        <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
        {/* Avatar Picker Modal */}
        <AvatarPicker
          isOpen={showAvatarPicker}
          currentAvatarId={avatarId}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarPicker(false)}
        />
      </div>
    </div>
  );
};
