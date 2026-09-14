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
import { SoundToggle } from './SoundToggle';
import { soundManager } from '../utils/soundManager';

interface BoardProps {
  state: GameState;
  myPlayerId: string;
  onSendAction: (action: GameAction) => void;
  onLeave: () => void;
  error: string | null;
  onClearError: () => void;
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
}) => {
  const { board, players, currentPlayerIndex, phase } = state;
  const currentPlayer = players[currentPlayerIndex];
  const myPlayer = players.find((p) => p.id === myPlayerId);
  const isMyTurn = currentPlayer?.id === myPlayerId;

  const [heroModalPlayer, setHeroModalPlayer] = useState<Player | null>(null);
  const [heroModalColor, setHeroModalColor] = useState<CrystalColor | 'all'>('all');

  // Play audio alert when turn transitions to this player
  const prevIsMyTurnRef = useRef<boolean>(isMyTurn);
  useEffect(() => {
    if (isMyTurn && !prevIsMyTurnRef.current) {
      soundManager.playTurnAlert();
    }
    prevIsMyTurnRef.current = isMyTurn;
  }, [isMyTurn]);

  // Play audio SFX when an opponent / bot executes an action
  const prevStateRef = useRef<GameState>(state);
  useEffect(() => {
    const prevState = prevStateRef.current;
    if (prevState && prevState !== state) {
      const prevPlayer = prevState.players[prevState.currentPlayerIndex];
      const currPlayerInNewState = state.players.find((p) => p.id === prevPlayer?.id);

      if (prevPlayer && currPlayerInNewState && prevPlayer.id !== myPlayerId) {
        // Did bot/opponent buy a card?
        if (currPlayerInNewState.ownedCards.length > prevPlayer.ownedCards.length) {
          soundManager.playCardBuy(2);
        }
        // Did bot/opponent reserve a card?
        else if (currPlayerInNewState.reservedCards.length > prevPlayer.reservedCards.length) {
          soundManager.playCardReserve();
        }
        // Did bot/opponent take gems?
        else {
          const prevTotalGems = Object.values(prevPlayer.crystals).reduce((a, b) => a + b, 0);
          const currTotalGems = Object.values(currPlayerInNewState.crystals).reduce((a, b) => a + b, 0);
          if (currTotalGems > prevTotalGems) {
            soundManager.playGemCollect();
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

  return (
    <ResponsiveScaler baseWidth={1120} baseHeight={580}>
      <div className="h-full w-full board-bg flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="glass border-b border-white/10 px-3 flex items-center justify-between h-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="marvel-badge px-2 py-0.5 rounded text-xs tracking-wider">
                MARVEL
              </span>
              <span className="font-display text-base font-black tracking-widest text-white">
                SPLENDOR
              </span>
            </div>

            {/* Nachapol Industries X J.A.R.V.I.S. Branding */}
            <div className="h-4 w-px bg-white/20 mx-0.5" />
            <div className="flex items-center gap-1 sm:gap-1.5 select-none" title="Nachapol Industries X J.A.R.V.I.S.">
              <span className="text-[8px] sm:text-[9px] font-semibold tracking-widest text-white/50 uppercase">
                POWERED BY
              </span>
              <span className="text-[9px] sm:text-[10.5px] font-black tracking-wider text-white uppercase drop-shadow-sm">
                NACHAPOL INDUSTRIES
              </span>
              <span className="text-cyan-400 font-black text-[9px] sm:text-[10px]">
                X
              </span>
              <span className="text-[9px] sm:text-[10.5px] font-black tracking-widest text-cyan-300 uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                J.A.R.V.I.S.
              </span>
            </div>

            <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full font-semibold border border-white/5">
              รอบที่ (Round) {state.turnNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio SFX Toggle Button */}
            <SoundToggle />

            {/* Quick Action: View My Recruited Marvel Heroes in large modal */}
            <button
              type="button"
              onClick={() => {
                soundManager.playModalOpen();
                setHeroModalColor('all');
                setHeroModalPlayer(myPlayer);
              }}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600/40 via-purple-600/30 to-amber-600/40 hover:from-red-600/60 hover:to-amber-600/60 border border-yellow-400/50 text-yellow-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow hover:scale-105"
              title="เปิดดูการ์ดฮีโร่ทั้งหมดที่คุณครอบครองแบบขยายใหญ่ (View Recruited Heroes)"
            >
              <span>🦸‍♂️ ดูฮีโร่ของฉัน (My Heroes)</span>
              <span className="bg-yellow-400 text-black text-[9px] font-black px-1.5 rounded-full shadow">
                {myPlayer.ownedCards.length}
              </span>
            </button>

            <span className="text-[11px]">
              {isMyTurn ? (
                <span className="text-yellow-400 font-extrabold tracking-wide animate-pulse bg-yellow-400/10 border border-yellow-400/30 px-2.5 py-0.5 rounded-full">
                  ⚡ ถึงตาคุณแล้ว (YOUR TURN)
                </span>
              ) : currentPlayer?.isBot ? (
                <span className="bg-purple-950/50 border border-purple-500/40 px-2.5 py-0.5 rounded-full text-purple-200 font-semibold inline-flex items-center gap-1.5 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  <span>🤖 <strong className="text-white font-bold">{currentPlayer.name}</strong> กำลังคิด... (Thinking)</span>
                </span>
              ) : (
                <span className="text-white/60 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                  รอตาของ (Waiting): <strong className="text-white font-bold">{currentPlayer?.name}</strong>
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
              ออกจากห้อง (Leave)
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
        <div className="flex flex-1 min-h-0 overflow-hidden">
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
                    <span className="font-black text-[10.5px] text-white drop-shadow leading-none">
                      ชนะ (WIN): 16 PTS
                    </span>
                    <div className="text-[6.5px] text-yellow-100/90 font-bold uppercase tracking-tight">
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
                      className={`absolute -top-1 -right-2 text-[8px] font-mono font-black px-1 rounded-full border leading-tight ${
                        board.timeStoneAvailable
                          ? 'bg-emerald-500 text-black border-emerald-300 shadow'
                          : 'bg-slate-700 text-white/50 border-slate-600'
                      }`}
                    >
                      x{board.timeStoneCount ?? (board.timeStoneAvailable ? 1 : 0)}
                    </span>
                  </div>

                  <div className="text-center w-full">
                    {board.timeStoneAvailable ? (
                      <div className="text-[6.5px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-0.5 py-0.2 rounded font-black tracking-tight uppercase">
                        เหลือ {board.timeStoneCount ?? 1} ก้อน
                      </div>
                    ) : (
                      <div className="text-[6.5px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-0.5 py-0.2 rounded font-bold truncate max-w-[65px] mx-auto">
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
                    <span className="text-[8px] font-black text-yellow-300 bg-black/50 px-1 py-0.2 rounded-full border border-yellow-300/30">
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
              onSelectPlayer={(p) => {
                setHeroModalColor('all');
                setHeroModalPlayer(p);
              }}
            />

            {/* My hand & Infinity Gauntlet */}
            <PlayerPanel
              player={myPlayer}
              isMyTurn={isMyTurn}
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

        {/* Game over overlay */}
        {phase === 'finished' && (
          <GameOver
            winners={state.winners}
            players={players}
            myPlayerId={myPlayerId}
            onLeave={onLeave}
          />
        )}
      </div>
    </ResponsiveScaler>
  );
};
