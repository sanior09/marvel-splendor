// ============================================================
//  Lobby.tsx — Marvel Splendor Room Creation & Solo AI Customizer
// ============================================================

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { RoomInfo } from '@shared/types/game.types';
import { ResponsiveScaler } from './ResponsiveScaler';

interface LobbyProps {
  onCreateRoom: (playerName: string, callback: (room: RoomInfo) => void) => void;
  onCreateSolo: (playerName: string, botCount: number, botNames?: string[]) => void;
  onJoinRoom: (roomId: string, playerName: string, callback: (success: boolean, err?: string) => void) => void;
  onStartGame: () => void;
  onAddBot: (botName?: string, personality?: string, callback?: (success: boolean) => void) => void;
  onRemoveBot: (botId: string) => void;
  onListRooms: (callback: (rooms: RoomInfo[]) => void) => void;
  currentRoom: RoomInfo | null;
  myPlayerId: string | null;
  connectionStatus: string;
}

interface MarvelBotPreset {
  name: string;
  personality: string;
  avatar: string;
  desc: string;
}

const POPULAR_MARVEL_BOTS: MarvelBotPreset[] = [
  { name: 'Doctor Doom', personality: 'stark', avatar: '👑', desc: 'Tactical Mastermind' },
  { name: 'Loki', personality: 'ultron', avatar: '🐍', desc: 'Trickster & Schemer' },
  { name: 'Kang the Conqueror', personality: 'stark', avatar: '⏳', desc: 'Time Traveler' },
  { name: 'Hela', personality: 'ultron', avatar: '⚔️', desc: 'Goddess of Death' },
  { name: 'Magneto', personality: 'stark', avatar: '🧲', desc: 'Mutant Leader' },
  { name: 'J.A.R.V.I.S.', personality: 'friday', avatar: '🤖', desc: 'Stark AI Assistant' },
  { name: 'Thanos Bot', personality: 'thanos', avatar: '🧤', desc: 'Infinity Gauntlet Seeker' },
  { name: 'Ultron', personality: 'ultron', avatar: '⚡', desc: 'Vengeful AI' },
  { name: 'Tony Stark AI', personality: 'stark', avatar: '🦾', desc: 'Armored Strategist' },
  { name: 'Green Goblin', personality: 'ultron', avatar: '🎃', desc: 'Chaotic Threat' },
];

export const Lobby: React.FC<LobbyProps> = ({
  onCreateRoom,
  onCreateSolo,
  onJoinRoom,
  onStartGame,
  onAddBot,
  onRemoveBot,
  onListRooms,
  currentRoom,
  myPlayerId,
  connectionStatus,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openRooms, setOpenRooms] = useState<RoomInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'solo' | 'create' | 'join' | 'browse'>('solo');

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
  const canStart = isHost && (currentRoom?.players.length ?? 0) >= 2;
  const canAddMoreBots = isHost && (currentRoom?.players.length ?? 0) < 4;

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
      setError('กรุณาระบุชื่อฮีโร่ของคุณ (Please enter your Hero name)');
      return;
    }
    setIsLoading(true);
    setError('');
    onCreateRoom(playerName.trim(), () => setIsLoading(false));
  };

  const handleSolo = (): void => {
    if (!playerName.trim()) {
      setError('กรุณาระบุชื่อฮีโร่ของคุณ (Please enter your Hero name)');
      return;
    }
    setIsLoading(true);
    setError('');
    const selectedBotNames = botNames.slice(0, botCount).map((name, idx) => {
      return name.trim() || POPULAR_MARVEL_BOTS[idx]?.name || `Marvel AI ${idx + 1}`;
    });
    onCreateSolo(playerName.trim(), botCount, selectedBotNames);
  };

  const handleJoin = (roomId?: string): void => {
    const code = (roomId ?? joinCode).trim().toUpperCase();
    if (!playerName.trim()) {
      setError('กรุณาระบุชื่อฮีโร่ของคุณ (Please enter your Hero name)');
      return;
    }
    if (!code) {
      setError('กรุณากรอกรหัสห้อง (Please enter room code)');
      return;
    }
    setIsLoading(true);
    setError('');
    onJoinRoom(code, playerName.trim(), (success, err) => {
      setIsLoading(false);
      if (!success) setError(err ?? 'ไม่สามารถเข้าร่วมห้องได้ (Failed to join room)');
    });
  };

  const updateBotName = (index: number, name: string) => {
    const next = [...botNames];
    next[index] = name;
    setBotNames(next);
  };

  const handleConfirmAddBot = () => {
    const nameToAdd = newBotName.trim() || 'Marvel AI';
    onAddBot(nameToAdd, newBotPersonality, (success) => {
      if (success) {
        setShowAddBotModal(false);
      }
    });
  };

  // ── In-Room Lobby (Waiting Room) ──────────────────────────
  if (currentRoom) {
    return (
      <ResponsiveScaler baseWidth={880} baseHeight={580}>
        <div className="w-full h-full max-h-full overflow-hidden board-bg flex items-center justify-center p-3 sm:p-4">
          <div className="glass-strong rounded-2xl p-5 max-w-md w-full space-y-4 border border-white/15 shadow-2xl relative">
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
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center font-bold text-xs text-white shadow shrink-0">
                      {p.isBot ? '🤖' : p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-white text-xs truncate block">{p.name}</span>
                      {p.isBot && <span className="text-[8px] text-purple-300 block">🤖 บอทมาร์เวล (Marvel AI Bot)</span>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.id === currentRoom.hostId && (
                        <span className="text-[9px] font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full border border-yellow-400/30">
                          👑 หัวหน้าห้อง (Host)
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

            {/* Status message */}
            {!isHost && (
              <p className="text-center text-white/60 text-xs animate-pulse">
                กำลังรอหัวหน้าห้องเริ่มเกม... (Waiting for host to launch)
              </p>
            )}

            {/* Start button */}
            {isHost && (
              <button
                type="button"
                onClick={onStartGame}
                disabled={!canStart}
                className={[
                  'w-full py-3 rounded-xl font-black font-display text-sm transition-all duration-200 uppercase tracking-wider',
                  canStart
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5',
                ].join(' ')}
              >
                {canStart
                  ? '⚡ เริ่มเกม Splendor: Marvel (Start Game)'
                  : `ต้องการอีก ${2 - (currentRoom?.players.length ?? 0)} คนหรือบอท (Need More Players)`}
              </button>
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
                      className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:bg-white/5 font-semibold text-xs transition-colors cursor-pointer"
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
        </div>
      </ResponsiveScaler>
    );
  }

  // ── Main Lobby Screen ─────────────────────────────────────
  return (
    <ResponsiveScaler baseWidth={880} baseHeight={580}>
      <div className="w-full h-full max-h-full overflow-hidden board-bg flex flex-col items-center justify-center p-3 sm:p-5">
        {/* Hero Header */}
        <div className="text-center space-y-1.5 mb-3">
          <div className="flex items-center justify-center gap-2.5">
            <span className="marvel-badge px-3 py-0.5 rounded text-2xl sm:text-3xl font-black tracking-wider shadow-2xl">
              MARVEL
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-black shimmer-text leading-none tracking-widest">
              SPLENDOR
            </h1>
          </div>
          <p className="text-white/70 text-xs sm:text-sm max-w-lg mx-auto truncate">
            แย่งชิงถุงมืออินฟินิตี้ • เกณฑ์ฮีโร่มาร์เวล • พิชิตจักรวาล (Infinity Gauntlet • Splendor)
          </p>
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            <span className="text-xs text-white/50">
              {connectionStatus === 'connected' ? '🟢 เซิร์ฟเวอร์พร้อมใช้งาน (Server Connected)' : connectionStatus}
            </span>
          </div>
        </div>

        {/* Main card */}
        <div className="glass-strong rounded-2xl p-5 sm:p-6 max-w-lg w-full space-y-3.5 border border-white/10 shadow-2xl">
          {/* Player name */}
          <div>
            <label htmlFor="player-name" className="text-xs font-bold uppercase tracking-wider text-white/80 block mb-1.5">
              ชื่อฮีโร่ของคุณ (Your Hero Name)
            </label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (activeTab === 'solo' ? handleSolo() : handleCreate())}
              placeholder="เช่น Iron Man, Thor, Spider-Man..."
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 transition-colors font-medium text-sm"
            />
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-white/10 p-1 bg-black/30 gap-1.5">
            {(['solo', 'create', 'join', 'browse'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
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

              <button
                type="button"
                onClick={handleSolo}
                disabled={isLoading || !playerName.trim()}
                className="w-full py-3.5 rounded-xl font-black font-display text-sm sm:text-base bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 text-white transition-all duration-200 shadow-xl hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
              >
                {isLoading ? 'กำลังเตรียมเกม... (Assembling...)' : '⚡ เล่นคนเดียวกับบอท (Play Solo vs AI)'}
              </button>
            </div>
          )}

          {/* Create Multiplayer Room Tab */}
          {activeTab === 'create' && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={isLoading || !playerName.trim()}
              className="w-full py-3.5 rounded-xl font-black font-display text-sm sm:text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 text-white transition-all duration-200 shadow-xl hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
            >
              {isLoading ? 'กำลังสร้างห้อง... (Creating...)' : '✦ สร้างห้องเล่นหลายคน (Create Multiplayer Room)'}
            </button>
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
                disabled={isLoading || !playerName.trim() || !joinCode.trim()}
                className="w-full py-3.5 rounded-xl font-black font-display text-sm sm:text-base bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 text-white transition-all duration-200 shadow-xl hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
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
                      disabled={!playerName.trim()}
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
      </div>
    </ResponsiveScaler>
  );
};
