// ============================================================
//  Board.tsx — Marvel Splendor Game Board Layout
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import type { GameState, GameAction, CrystalColor, CardTier, Player } from '@shared/types/game.types';
import { CardSlot } from './CardSlot';
import { CardDeck } from './CardDeck';
import { GemBank } from './GemBank';
import { GuardianRow } from './GuardianRow';
import { PlayerPanel } from './PlayerPanel';
import { PlayerList } from './PlayerList';
import { ActionModal } from './ActionModal';
import { GameOver } from './GameOver';
import { HeroModal } from './HeroModal';
import { ResponsiveScaler } from './ResponsiveScaler';
import { RankBadge } from './RankBadge';

import { soundManager } from '../utils/soundManager';
import { getMarvelMap } from '../data/marvelMaps';
import { HeroRecruitVFX } from './HeroRecruitVFX';
import { TutorialModal } from './TutorialModal';
import { getHeroSignature, playHeroSignatureSound, type HeroSignature } from '../data/heroSignatures';
import type { Card } from '@shared/types/game.types';
import { FinalRoundModal } from './FinalRoundModal';

import type { UserProfile } from '../hooks/useAuth';

interface BoardProps {
  state: GameState;
  myPlayerId: string;
  onSendAction: (action: GameAction) => void;
  onLeave: () => void;
  error: string | null;
  onClearError: () => void;
  gameOverData?: { winners: string[]; xpData?: Record<string, any> } | null;
  userProfile?: UserProfile | null;
  refreshProfile?: () => void;
}

const GAUNTLET_5_BONUS_STONES: CrystalColor[] = [
  'topaz',     // Mind (Yellow)
  'sapphire',  // Space (Blue)
  'obsidian',  // Soul (Orange)
  'amethyst',  // Power (Purple)
  'ruby',      // Reality (Red)
];

export const Board: React.FC<BoardProps> = ({
  state,
  myPlayerId,
  onSendAction,
  onLeave,
  error,
  onClearError,
  gameOverData,
  userProfile,
  refreshProfile,
}) => {
  const { board, players, currentPlayerIndex, phase } = state;
  const currentPlayer = players[currentPlayerIndex];
  const myPlayer = players.find((p) => p.id === myPlayerId);
  const isMyTurn = currentPlayer?.id === myPlayerId;

  const [heroModalPlayer, setHeroModalPlayer] = useState<Player | null>(null);
  const [heroModalColor, setHeroModalColor] = useState<CrystalColor | 'all'>('all');

  // Hero signature recruitment VFX overlay state
  const [recruitVFXData, setRecruitVFXData] = useState<{
    signature: HeroSignature;
    card: Card;
    playerName: string;
    isMyPlayer: boolean;
  } | null>(null);

  const [showTutorial, setShowTutorial] = useState(false);
  const lastLocallyBoughtCardIdRef = useRef<string | null>(null);

  // Final Round alert modal state
  const [showFinalRoundModal, setShowFinalRoundModal] = useState(false);
  const prevWinTriggeredByRef = useRef<string | null>(state.winTriggeredBy);

  // Detect when winTriggeredBy transitions from null → a player ID → show modal + play sound
  useEffect(() => {
    if (state.winTriggeredBy !== null && prevWinTriggeredByRef.current === null) {
      setShowFinalRoundModal(true);
      soundManager.playFinalRoundAlert();
    }
    prevWinTriggeredByRef.current = state.winTriggeredBy;
  }, [state.winTriggeredBy]);

  // Play audio alert when turn transitions to this player
  const prevIsMyTurnRef = useRef<boolean>(isMyTurn);
  useEffect(() => {
    if (isMyTurn && !prevIsMyTurnRef.current) {
      soundManager.playTurnAlert();
    }
    prevIsMyTurnRef.current = isMyTurn;
  }, [isMyTurn]);

  // Play audio SFX and trigger signature hero VFX when any player executes an action
  const prevStateRef = useRef<GameState>(state);
  useEffect(() => {
    const prevState = prevStateRef.current;
    if (prevState && prevState !== state) {
      // Check all players for newly acquired cards
      for (const currP of state.players) {
        const prevP = prevState.players.find((p) => p.id === currP.id);
        if (prevP && currP.ownedCards.length > prevP.ownedCards.length) {
          const newlyAcquired = currP.ownedCards[currP.ownedCards.length - 1];
          if (newlyAcquired) {
            const isMe = currP.id === myPlayerId;
            // Check if this card was already triggered locally on button click
            if (isMe && lastLocallyBoughtCardIdRef.current === newlyAcquired.id) {
              lastLocallyBoughtCardIdRef.current = null;
            } else {
              const signature = getHeroSignature(newlyAcquired.name);
              if (signature) {
                // VFX overlay only shows on the buyer's own screen
                if (isMe) {
                  setRecruitVFXData({
                    signature,
                    card: newlyAcquired,
                    playerName: currP.name,
                    isMyPlayer: true,
                  });
                }
                playHeroSignatureSound(signature);
              } else if (!isMe) {
                soundManager.playCardBuy(newlyAcquired.tier);
              }
            }
          }
        } else if (prevP && currP.id !== myPlayerId) {
          // Did bot/opponent reserve a card?
          if (currP.reservedCards.length > prevP.reservedCards.length) {
            soundManager.playCardReserve();
          }
          // Did bot/opponent take gems?
          else {
            const prevTotalGems = Object.values(prevP.crystals).reduce((a, b) => a + b, 0);
            const currTotalGems = Object.values(currP.crystals).reduce((a, b) => a + b, 0);
            if (currTotalGems > prevTotalGems) {
              soundManager.playGemCollect();
            }
          }
        }
      }
    }
    prevStateRef.current = state;
  }, [state, myPlayerId]);

  // Play error sound when error occurs
  useEffect(() => {
    if (error) {
      soundManager.playError();
    }
  }, [error]);

  if (!myPlayer || !currentPlayer) return null;

  // ── Callbacks to emit actions ─────────────────────────────

  const handleBuyCard = (cardId: string): void => {
    // Find the card being bought across board slots and my reserved cards
    const allKnownCards = [
      ...board.tier1,
      ...board.tier2,
      ...board.tier3,
      ...(myPlayer?.reservedCards ?? []),
    ];
    const card = allKnownCards.find((c) => c?.id === cardId);
    if (card) {
      lastLocallyBoughtCardIdRef.current = cardId;
      const signature = getHeroSignature(card.name);
      if (signature) {
        setRecruitVFXData({
          signature,
          card,
          playerName: myPlayer.name,
          isMyPlayer: true,
        });
        playHeroSignatureSound(signature);
      } else {
        soundManager.playCardBuy(card.tier);
      }
    }
    onSendAction({ type: 'BUY_CARD', cardId });
  };

  const handleReserveCard = (cardId: string): void => {
    onSendAction({ type: 'RESERVE_CARD', cardId });
  };

  const handleReserveFromDeck = (tier: CardTier): void => {
    onSendAction({ type: 'RESERVE_CARD', cardId: null, deckTier: tier });
  };

  const handleTake3Gems = (colors: [CrystalColor, CrystalColor, CrystalColor]): void => {
    onSendAction({ type: 'TAKE_3_GEMS', colors });
  };

  const handleTake2Gems = (color: CrystalColor): void => {
    onSendAction({ type: 'TAKE_2_GEMS', color });
  };

  const handleDropGems = (toDrop: Partial<Record<CrystalColor, number>>): void => {
    soundManager.playButtonClick();
    onSendAction({ type: 'DROP_GEMS', toDrop: toDrop as any });
  };

  // ── Tier renderer helper ──────────────────────────────────

  const renderTier = (
    slots: (import('@shared/types/game.types').Card | null)[],
    deckCount: number,
    tier: CardTier,
  ): React.ReactNode => (
    <div className="flex items-center gap-2.5 justify-center">
      {/* Deck */}
      <CardDeck
        tier={tier}
        count={deckCount}
        isMyTurn={isMyTurn}
        reservedCount={myPlayer.reservedCards.length}
        onReserveFromDeck={handleReserveFromDeck}
      />
      {/* Board slots */}
      {slots.map((card, i) => (
        <CardSlot
          key={card?.id ?? `empty-t${tier}-${i}`}
          card={card}
          isMyTurn={isMyTurn}
          currentPlayer={myPlayer}
          onBuy={handleBuyCard}
          onReserve={handleReserveCard}
        />
      ))}
    </div>
  );

  // ── Render ────────────────────────────────────────────────

  const avengersHolder = players.find((p) => p.id === board.avengersAssembleHolder);
  const activeMap = getMarvelMap(state.mapId);

  return (
    <ResponsiveScaler baseWidth={1120} baseHeight={580}>
      <div
        className="h-full w-full relative flex flex-col overflow-hidden select-none bg-[#070913]"
        style={{
          background: activeMap.bgStyle,
        }}
      >
        {/* Actual Marvel Battlefield High-Res Background Image */}
        {activeMap.imageUrl && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img
              src={activeMap.imageUrl}
              alt={activeMap.name}
              className="w-full h-full object-cover object-center opacity-90 transform scale-105 filter brightness-105 contrast-105"
              loading="eager"
            />
          </div>
        )}

        {/* Protective Contrast Scrim: Dark radial gradient that protects card readability in center while showing scenery around */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(7, 10, 20, 0.35) 0%, rgba(3, 5, 12, 0.60) 100%)',
          }}
        />

        {/* Ambient Map Color Glow Tint */}
        <div
          className="absolute -top-20 -right-20 w-[500px] h-[300px] rounded-full blur-[100px] pointer-events-none opacity-30"
          style={{ backgroundColor: activeMap.ambientColor }}
        />

        {/* Top bar */}
        <header className="relative z-10 glass border-b border-white/10 px-3 flex items-center justify-between h-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="marvel-badge px-2 py-0.5 rounded text-xs tracking-wider">
                MARVEL
              </span>
              <span className="font-display text-base font-black tracking-widest text-white">
                SPLENDOR
              </span>
            </div>

            {/* Nachapol Industries Logo */}
            <div className="h-4 w-px bg-white/20 mx-0.5" />
            <div className="flex items-center select-none" title="Nachapol Industries">
              <img
                src="/images/nachapol_industries.png"
                alt="Nachapol Industries"
                className="h-4 sm:h-5 object-contain opacity-90 hover:opacity-100 transition-opacity drop-shadow-sm"
              />
            </div>

            {/* Marvel Battlefield Location Badge */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white/90 bg-white/10 border ${activeMap.accentBorder} shadow-sm`}
              title={`สมรภูมิรบ: ${activeMap.name} (${activeMap.nameEn}) - ล็อกแผนที่แล้วตลอดทั้งเกม`}
            >
              <span className="text-xs">{activeMap.icon}</span>
              <span className="truncate max-w-[130px]">{activeMap.name}</span>
              <span className="text-[8px] bg-black/40 text-yellow-300 font-mono px-1 rounded uppercase tracking-wider">🔒 LOCKED</span>
            </div>

            <span className="text-[10px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full font-bold border border-white/10 shadow-sm">
              รอบที่ (Round) <span className="font-num font-black text-yellow-300">{state.turnNumber}</span>
            </span>

            {/* Final Round Badge — visible during the final round */}
            {state.winTriggeredBy !== null && state.phase !== 'finished' && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.25), rgba(251,191,36,0.15))',
                  border: '1.5px solid rgba(220,38,38,0.6)',
                  color: '#fca5a5',
                  animation: 'finalRoundBadgePulse 1.2s ease-in-out infinite',
                  textShadow: '0 0 8px rgba(220,38,38,0.8)',
                }}
                onClick={() => setShowFinalRoundModal(true)}
                title="คลิกเพื่อดูรายละเอียดตาสุดท้าย"
              >
                <span>🚨</span>
                <span>ตาสุดท้าย!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Interactive Tutorial Guide */}
            <button
              type="button"
              onClick={() => {
                soundManager.playModalOpen();
                setShowTutorial(true);
              }}
              className="px-2 py-1 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/25 border border-yellow-400/40 text-yellow-300 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow hover:scale-105"
              title="เปิดดูคู่มือวิธีเล่น MARVEL SPLENDOR (How to Play)"
            >
              <span>📖 วิธีเล่น</span>
            </button>



            {/* Quick Action: View My Recruited Marvel Heroes in large modal */}
            <button
              type="button"
              onClick={() => {
                soundManager.playModalOpen();
                setHeroModalColor('all');
                setHeroModalPlayer(myPlayer);
              }}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600/40 via-purple-600/30 to-amber-600/40 hover:from-red-600/60 hover:to-amber-600/60 border border-yellow-400/50 text-yellow-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow hover:scale-105"
              title="เปิดดูการ์ดฮีโร่ทั้งหมดที่คุณครอบครองแบบขยายใหญ่"
            >
              <span>คลังการ์ดฮีโร่</span>
              <span className="bg-yellow-400 text-black text-[10px] font-black font-num px-1.5 py-0.2 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                {myPlayer.ownedCards.length}
              </span>
            </button>

            <span className="text-[11px]">
              {isMyTurn ? (
                <span className="text-yellow-400 font-extrabold tracking-wide animate-pulse bg-yellow-400/10 border border-yellow-400/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                  <span>⚡ ถึงตาคุณแล้ว</span>
                  <RankBadge rank={myPlayer?.rank} isBot={false} size="sm" />
                </span>
              ) : currentPlayer?.isBot ? (
                <span className="bg-purple-950/50 border border-purple-500/40 px-2.5 py-0.5 rounded-full text-purple-200 font-semibold inline-flex items-center gap-1.5 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  <span>🤖 <strong className="text-white font-bold">{currentPlayer.name}</strong> กำลังคำนวณ...</span>
                </span>
              ) : (
                <span className="text-white/60 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5 inline-flex items-center gap-1.5">
                  <span>รอตาของ: <strong className="text-white font-bold">{currentPlayer?.name}</strong></span>
                  <RankBadge rank={currentPlayer?.rank} isBot={currentPlayer?.isBot} size="sm" />
                </span>
              )}
            </span>

            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onLeave();
              }}
              className="text-[11px] text-white/50 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-2.5 py-0.5 rounded-lg cursor-pointer"
            >
              ออกจากห้อง
            </button>
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div
            className="bg-red-500/20 border-b border-red-500/30 px-4 py-1.5 text-xs text-red-300 font-medium flex items-center justify-between"
            role="alert"
          >
            <span>⚠️ {error}</span>
            <button
              type="button"
              onClick={onClearError}
              className="text-red-300 hover:text-white text-base leading-none cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Main layout: 3-column no-scroll setup */}
        <div className="flex flex-1 min-h-0 overflow-hidden relative z-10">
          {/* Left Column: Infinity Stones & S.H.I.E.L.D. Bank (Dedicated dock, NO vertical scroll needed) */}
          <aside className="w-44 p-1.5 flex flex-col flex-shrink-0 border-r border-white/10 bg-black/40 min-h-0 overflow-hidden">
            <GemBank
              bank={board.crystalBank}
              isMyTurn={isMyTurn}
              currentPlayer={myPlayer}
              onTake3Gems={handleTake3Gems}
              onTake2Gems={handleTake2Gems}
            />
          </aside>

          {/* Center: Board (Special Tiles & 3 Tiers, fully visible at a glance without scrolling) */}
          <main className="flex-1 min-h-0 px-2 pt-2 pb-1 flex flex-col justify-between overflow-hidden">
            {/* Top Row: Special Tiles & Locations */}
            <div className="flex items-center justify-center gap-2">
              {/* Special Tiles (Gauntlet + Time Stone + Avengers) */}
              <div className="flex gap-1.5">
                {/* Infinity Gauntlet Victory Tile */}
                <div
                  className="w-36 h-[68px] rounded-xl bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 shadow-[0_0_12px_rgba(245,158,11,0.25)] border-2 border-yellow-300/80 flex flex-col items-center justify-between p-1 relative overflow-hidden"
                  title="Infinity Gauntlet Victory: รวมแต้ม 16+ PTS + โบนัสการ์ดครบ 5 สี + มณีกาลเวลา Time Stone"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs">🧤</span>
                    <span className="text-[7.5px] uppercase font-black text-yellow-100 tracking-wider">
                      ถุงมืออินฟินิตี้ (Gauntlet)
                    </span>
                  </div>

                  {/* Sockets: 5 Hero Bonuses + 1 Time Stone */}
                  <div className="flex items-center gap-0.5 bg-black/60 px-1 py-0.5 rounded-full border border-white/20">
                    {GAUNTLET_5_BONUS_STONES.map((c) => {
                      const hasStone = (myPlayer.bonuses[c] ?? 0) > 0;
                      return (
                        <div
                          key={c}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${hasStone
                              ? 'ring-1 ring-yellow-300 shadow-[0_0_5px_rgba(250,204,21,0.8)] scale-110'
                              : 'opacity-25 grayscale'
                            }`}
                          title={`${c}: ${hasStone ? 'โบนัสพร้อมใช้งาน (Active)' : 'ยังขาดโบนัสการ์ดสีนี้'}`}
                        >
                          <img
                            src={`/images/tokens/${c}.png`}
                            alt={c}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      );
                    })}
                    {/* Plus Time Stone socket */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full ml-0.5 transition-all duration-200 ${(myPlayer.crystals.emerald ?? 0) > 0
                          ? 'ring-1 ring-emerald-300 shadow-[0_0_5px_rgba(52,211,153,0.9)] scale-110'
                          : 'opacity-25 grayscale'
                        }`}
                      title={`Time Stone: ${(myPlayer.crystals.emerald ?? 0) > 0 ? 'ครอบครองแล้ว (Possessed)' : 'ยังขาดโทเคนมณีเขียว'}`}
                    >
                      <img
                        src="/images/tokens/emerald.png"
                        alt="Time Stone"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="text-center leading-none">
                    <span className="font-black text-[11px] text-white drop-shadow leading-none">
                      ชนะ (WIN): <span className="font-num font-black text-yellow-300 text-xs">{state.targetScore ?? 16}</span> PTS
                    </span>
                    <div className="text-[7px] text-yellow-200 font-bold uppercase tracking-tight mt-0.5">
                      โบนัส 5 สี + 🟢 Time Stone
                    </div>
                  </div>
                </div>

                {/* Time Stone Pedestal */}
                <div
                  className={`w-18 h-[68px] rounded-xl bg-gradient-to-br ${board.timeStoneAvailable
                      ? 'from-emerald-900/90 via-teal-950 to-emerald-950 border-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'from-slate-900 to-black border-slate-700 opacity-90'
                    } border-2 flex flex-col items-center justify-between p-1 relative overflow-hidden`}
                  title={`Time Stone: มอบให้ผู้เล่นคนละ 1 ก้อนเมื่อเกณฑ์การ์ด Tier-3 ใบแรก (เหลือ ${board.timeStoneCount ?? (board.timeStoneAvailable ? 1 : 0)} ก้อน)`}
                >
                  <div className="text-[7px] uppercase font-black text-emerald-300 tracking-wider flex items-center gap-0.5">
                    <span>🟢 Time Stone</span>
                  </div>

                  <div className="relative">
                    <div
                      className={`w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center ${board.timeStoneAvailable
                          ? 'ring-2 ring-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse'
                          : 'opacity-40 grayscale'
                        }`}
                    >
                      <img
                        src="/images/tokens/emerald.png"
                        alt="Time Stone"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {/* Remaining count badge */}
                    <span
                      className={`absolute -top-1 -right-2 text-[9px] font-num font-black px-1.5 py-0.2 rounded-full border leading-tight ${
                        board.timeStoneAvailable
                          ? 'bg-emerald-400 text-slate-950 border-emerald-200 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                          : 'bg-slate-800 text-white/50 border-slate-600'
                      }`}
                    >
                      x{board.timeStoneCount ?? (board.timeStoneAvailable ? 1 : 0)}
                    </span>
                  </div>

                  <div className="text-center w-full">
                    {board.timeStoneAvailable ? (
                      <div className="text-[7px] bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 px-1 py-0.2 rounded font-black font-num tracking-tight uppercase shadow-sm">
                        เหลือ {board.timeStoneCount ?? 1} ก้อน
                      </div>
                    ) : (
                      <div className="text-[7px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1 py-0.2 rounded font-bold font-num truncate max-w-[65px] mx-auto">
                        หมดแล้ว (0 ก้อน)
                      </div>
                    )}
                  </div>
                </div>

                {/* Avengers Assemble Tile (+3 PTS) */}
                <div
                  className={`w-16 h-[68px] rounded-xl bg-gradient-to-br ${board.avengersAssembleHolder
                      ? 'from-slate-800 to-slate-900 border-slate-600'
                      : 'from-red-600 via-rose-700 to-red-800 border-red-400'
                    } shadow-xl border-2 flex flex-col items-center justify-between p-1 relative overflow-hidden`}
                  title="Avengers Assemble: มอบ +3 แต้มให้ผู้ที่มีสัญลักษณ์ Avengers มากที่สุด (3 สัญลักษณ์ขึ้นไป)"
                >
                  <div className="text-[7px] uppercase font-bold text-white/70 tracking-wider">
                    Avengers
                  </div>
                  <div className="bg-red-600 w-6 h-6 rounded-full flex items-center justify-center border-2 border-yellow-300 shadow-md">
                    <span className="text-yellow-300 font-black text-sm leading-none">A</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-black font-num text-yellow-300 bg-slate-950/90 px-1.5 py-0.5 rounded-full border border-yellow-300/50 shadow-sm">
                      +3 PTS
                    </span>
                    {avengersHolder && (
                      <div className="text-[6.5px] text-yellow-300 font-bold truncate max-w-[58px] mt-0.5">
                        {avengersHolder.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Marvel Locations Row */}
              <GuardianRow
                guardians={board.availableGuardians}
                currentPlayer={myPlayer}
              />
            </div>

            {/* Tier 3 Characters */}
            <div>
              <div className="text-[9px] text-amber-400 uppercase tracking-wider font-extrabold text-center flex items-center justify-center gap-1.5 mb-0.5 leading-none">
                <span className="w-6 h-[1px] bg-amber-400/30" />
                <span>ระดับ 3 (Tier III) • Cosmic Entities • 4-6 PTS</span>
                <span className="w-6 h-[1px] bg-amber-400/30" />
              </div>
              {renderTier(board.tier3, board.tier3DeckCount, 3)}
            </div>

            {/* Tier 2 Characters */}
            <div>
              <div className="text-[9px] text-purple-400 uppercase tracking-wider font-extrabold text-center flex items-center justify-center gap-1.5 mb-0.5 leading-none">
                <span className="w-6 h-[1px] bg-purple-400/30" />
                <span>ระดับ 2 (Tier II) • Heroes & Villains • 1-3 PTS</span>
                <span className="w-6 h-[1px] bg-purple-400/30" />
              </div>
              {renderTier(board.tier2, board.tier2DeckCount, 2)}
            </div>

            {/* Tier 1 Characters */}
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold text-center flex items-center justify-center gap-1.5 mb-0.5 leading-none">
                <span className="w-6 h-[1px] bg-slate-400/30" />
                <span>ระดับ 1 (Tier I) • Street Allies & Recruits • 0-1 PTS</span>
                <span className="w-6 h-[1px] bg-slate-400/30" />
              </div>
              {renderTier(board.tier1, board.tier1DeckCount, 1)}
            </div>
          </main>

          {/* Right sidebar */}
          <aside className="w-68 border-l border-white/10 p-2 overflow-y-auto space-y-2 flex-shrink-0 bg-black/30 min-h-0">
            {/* Player scoreboard */}
            <PlayerList
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              myPlayerId={myPlayerId}
              targetScore={state.targetScore ?? 16}
              onSelectPlayer={(p) => {
                setHeroModalColor('all');
                setHeroModalPlayer(p);
              }}
            />

            {/* My hand & Infinity Gauntlet */}
            <PlayerPanel
              player={myPlayer}
              isMyTurn={isMyTurn}
              holdsAvengersAssemble={board.avengersAssembleHolder === myPlayer.id}
              targetScore={state.targetScore ?? 16}
              onBuyCard={handleBuyCard}
              onSendAction={onSendAction}
              onViewCards={(color) => {
                soundManager.playModalOpen();
                setHeroModalColor(color ?? 'all');
                setHeroModalPlayer(myPlayer);
              }}
            />
          </aside>
        </div>

        {/* Hero cards roster modal */}
        {heroModalPlayer && (
          <HeroModal
            isOpen={!!heroModalPlayer}
            onClose={() => {
              soundManager.playModalClose();
              setHeroModalPlayer(null);
              setHeroModalColor('all');
            }}
            player={heroModalPlayer}
            initialColor={heroModalColor}
          />
        )}

        {/* Gem drop modal — forced when > 10 */}
        {phase === 'dropGems' && isMyTurn && (
          <ActionModal
            player={myPlayer}
            onDropGems={handleDropGems}
          />
        )}

        {/* Signature Hero Recruit Cinematic VFX & Banner */}
        {recruitVFXData && (
          <HeroRecruitVFX
            signature={recruitVFXData.signature}
            card={recruitVFXData.card}
            playerName={recruitVFXData.playerName}
            isMyPlayer={recruitVFXData.isMyPlayer}
            onDismiss={() => setRecruitVFXData(null)}
          />
        )}

        {/* Interactive Roblox-Style Tutorial Modal */}
        <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

        {/* Final Round Alert Modal — pops on every screen when winTriggeredBy first set */}
        {showFinalRoundModal && state.winTriggeredBy !== null && (() => {
          const triggerPlayer = players.find((p) => p.id === state.winTriggeredBy);
          if (!triggerPlayer) return null;
          return (
            <FinalRoundModal
              triggerPlayer={triggerPlayer}
              targetScore={state.targetScore ?? 16}
              onClose={() => setShowFinalRoundModal(false)}
            />
          );
        })()}

        {/* Game over overlay */}
        {phase === 'finished' && (
          <GameOver
            winners={state.winners}
            players={players}
            myPlayerId={myPlayerId}
            onLeave={onLeave}
            gameOverData={gameOverData}
            userProfile={userProfile}
            refreshProfile={refreshProfile}
          />
        )}

        {/* Keyframe: Final Round badge pulse animation */}
        <style>{`
          @keyframes finalRoundBadgePulse {
            0%   { opacity: 1; box-shadow: 0 0 6px rgba(220,38,38,0.4); }
            50%  { opacity: 0.7; box-shadow: 0 0 14px rgba(220,38,38,0.9); }
            100% { opacity: 1; box-shadow: 0 0 6px rgba(220,38,38,0.4); }
          }
        `}</style>
      </div>
    </ResponsiveScaler>
  );
};
