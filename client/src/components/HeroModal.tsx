// ============================================================
//  HeroModal.tsx — Large Recruited Marvel Heroes Showcase
// ============================================================

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Player, CrystalColor } from '@shared/types/game.types';
import { BANK_STONE_COLORS } from '@shared/types/game.types';
import { STONE_NAMES } from './GemToken';
import { soundManager } from '../utils/soundManager';

interface HeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
}

const TIER_BORDER: Record<number, string> = {
  1: 'border-slate-500/70 shadow-[0_0_15px_rgba(100,116,139,0.3)]',
  2: 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]',
  3: 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)]',
};

const TIER_BADGE: Record<number, { text: string; bg: string }> = {
  1: { text: 'TIER I', bg: 'bg-slate-700/90 text-slate-200 border-slate-500/50' },
  2: { text: 'TIER II', bg: 'bg-purple-700/90 text-purple-200 border-purple-400/50' },
  3: { text: 'TIER III', bg: 'bg-amber-600/90 text-yellow-100 border-amber-300/60' },
};

export const HeroModal: React.FC<HeroModalProps> = ({ isOpen, onClose, player }) => {
  const [filterTier, setFilterTier] = useState<'all' | 1 | 2 | 3>('all');
  const [filterColor, setFilterColor] = useState<CrystalColor | 'all'>('all');

  if (!isOpen) return null;

  const cards = player.ownedCards;
  const filteredCards = cards.filter((card) => {
    if (filterTier !== 'all' && card.tier !== filterTier) return false;
    if (filterColor !== 'all' && card.bonusColor !== filterColor) return false;
    return true;
  });

  const totalPoints = cards.reduce((sum, c) => sum + c.points, 0);
  const avengersCount = cards.filter((c) => c.avengersSymbol).length;

  const handleClose = () => {
    soundManager.playModalClose();
    onClose();
  };

  const handleTierClick = (tier: 'all' | 1 | 2 | 3) => {
    soundManager.playButtonClick();
    setFilterTier(tier);
  };

  const handleColorClick = (color: CrystalColor | 'all') => {
    soundManager.playButtonClick();
    setFilterColor(color);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative glass-strong rounded-2xl sm:rounded-3xl border border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.9)] max-w-5xl w-full max-h-[96vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-slide-up z-10 bg-slate-950/95">
        {/* Modal Header */}
        <header className="px-3 py-1.5 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-purple-950/30 to-black shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-lg sm:text-2xl shadow-lg border border-yellow-300/40 shrink-0">
              🦸‍♂️
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="font-display text-sm sm:text-xl font-black text-white uppercase tracking-wider">
                  Recruited Marvel Heroes
                </h2>
                <span className="text-yellow-300 text-xs sm:text-sm font-bold hidden sm:inline">
                  (สมุดการ์ดฮีโร่)
                </span>
                <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-[10px] sm:text-xs px-2 py-0.2 rounded-full font-bold">
                  {player.name}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-white/60 hidden sm:block mt-0.5">
                รายชื่อการ์ดฮีโร่และวายร้ายที่คุณเกณฑ์แล้ว มอบส่วนลดอัญมณีถาวรและแต้ม Infinity Points
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-base sm:text-lg transition-colors cursor-pointer border border-white/10 shrink-0"
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        {/* Stats & Discounts Bar */}
        <div className="px-3 py-1 sm:px-6 sm:py-2.5 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-1.5 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg border border-white/10">
              <span className="text-[10px] sm:text-xs text-white/60">ฮีโร่:</span>
              <span className="text-xs sm:text-sm font-black text-white">{cards.length} ใบ</span>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg border border-amber-500/20">
              <span className="text-[10px] sm:text-xs text-amber-300/80">แต้ม:</span>
              <span className="text-xs sm:text-sm font-black text-amber-300">+{totalPoints} PTS</span>
            </div>
            <div className="flex items-center gap-1 bg-red-600/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg border border-red-500/20">
              <div className="bg-red-600 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center border border-yellow-300 text-[8px] sm:text-[9px] font-black text-yellow-300">
                A
              </div>
              <span className="text-[10px] sm:text-xs text-red-300/90 hidden sm:inline">Avengers:</span>
              <span className="text-xs sm:text-sm font-black text-red-300">{avengersCount}</span>
            </div>
          </div>

          {/* Stone Discounts Breakdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] sm:text-xs text-white/50 hidden sm:inline">ส่วนลดถาวร:</span>
            <div className="flex items-center gap-1">
              {BANK_STONE_COLORS.map((c) => {
                const count = player.bonuses[c] ?? 0;
                return (
                  <div
                    key={c}
                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border text-[9px] sm:text-[11px] font-bold ${
                      count > 0 ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/5 text-white/30'
                    }`}
                    title={`${STONE_NAMES[c]} bonus: +${count}`}
                  >
                    <img src={`/images/tokens/${c}.png`} alt={c} className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain" />
                    <span>+{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="px-3 py-1 sm:px-6 sm:py-2 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 shrink-0">
          {/* Tier Filters */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleTierClick('all')}
              className={`text-[10px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg font-bold transition-all cursor-pointer ${
                filterTier === 'all'
                  ? 'bg-yellow-400 text-black shadow-md'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              ทั้งหมด ({cards.length})
            </button>
            <button
              type="button"
              onClick={() => handleTierClick(3)}
              className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg font-bold transition-all cursor-pointer ${
                filterTier === 3
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Tier III ({cards.filter((c) => c.tier === 3).length})
            </button>
            <button
              type="button"
              onClick={() => handleTierClick(2)}
              className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg font-bold transition-all cursor-pointer ${
                filterTier === 2
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Tier II ({cards.filter((c) => c.tier === 2).length})
            </button>
            <button
              type="button"
              onClick={() => handleTierClick(1)}
              className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg font-bold transition-all cursor-pointer ${
                filterTier === 1
                  ? 'bg-slate-500 text-white shadow-md'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Tier I ({cards.filter((c) => c.tier === 1).length})
            </button>
          </div>

          {/* Color Filter */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleColorClick('all')}
              className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg font-bold transition-all cursor-pointer ${
                filterColor === 'all' ? 'bg-white/30 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              ทุกสี
            </button>
            {BANK_STONE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleColorClick(filterColor === c ? 'all' : c)}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center transition-all cursor-pointer p-0.5 ${
                  filterColor === c
                    ? 'ring-2 ring-yellow-400 bg-white/20 scale-105'
                    : 'opacity-50 hover:opacity-100 bg-white/5'
                }`}
                title={`Show only ${STONE_NAMES[c]} heroes`}
              >
                <img src={`/images/tokens/${c}.png`} alt={c} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Cards Gallery Grid (Scrollable with responsive card sizes) */}
        <div className="p-2 sm:p-5 overflow-y-auto flex-1 min-h-0">
          {filteredCards.length === 0 ? (
            <div className="text-center py-10 sm:py-16 space-y-2">
              <div className="text-4xl sm:text-5xl opacity-40">🎴</div>
              <h3 className="text-base sm:text-lg font-bold text-white/90">ยังไม่มีการ์ดฮีโร่ในส่วนนี้</h3>
              <p className="text-xs sm:text-sm text-white/60 max-w-lg mx-auto">
                {cards.length === 0
                  ? 'คุณยังไม่ได้ซื้อการ์ดฮีโร่คนใด สามารถซื้อการ์ดจากกระดานตรงกลางเพื่อสะสมรวมทีมฮีโร่ได้ทันที!'
                  : 'ไม่พบการ์ดฮีโร่ที่ตรงกับตัวกรองที่เลือก'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 justify-items-center">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className={`relative w-32 sm:w-44 h-46 sm:h-64 rounded-xl sm:rounded-2xl border-2 overflow-hidden flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-105 group bg-slate-900 ${TIER_BORDER[card.tier]}`}
                >
                  {/* Character Portrait Artwork */}
                  <img
                    src={`/images/cards/${card.id}.jpg`}
                    alt={card.name}
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Gradient atmospheric scrims */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/60 pointer-events-none" />

                  {/* Top Bar: Points, Avengers Badge, Stone Bonus */}
                  <div className="relative z-10 p-1.5 sm:p-2.5 flex items-start justify-between">
                    <div className="flex items-center gap-1">
                      {card.points > 0 && (
                        <div className="bg-black/80 backdrop-blur-md border sm:border-2 border-yellow-400 text-yellow-300 font-black text-sm sm:text-lg px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded sm:rounded-lg shadow leading-none">
                          {card.points}
                        </div>
                      )}
                      {card.avengersSymbol && (
                        <div
                          className="bg-red-600 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border border-yellow-300 shadow"
                          title="Avengers Assemble Symbol"
                        >
                          <span className="text-yellow-300 font-black text-xs sm:text-sm leading-none">A</span>
                        </div>
                      )}
                    </div>

                    {/* Permanent Stone Bonus Badge */}
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/70 backdrop-blur-md p-0.5 border sm:border-2 border-white/40 shadow-md flex items-center justify-center"
                      title={`Permanent ${STONE_NAMES[card.bonusColor]} Stone Bonus`}
                    >
                      <img
                        src={`/images/tokens/${card.bonusColor}.png`}
                        alt={STONE_NAMES[card.bonusColor]}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Bottom Info Bar: Tier badge & Character Name */}
                  <div className="relative z-10 p-1.5 sm:p-2.5 bg-gradient-to-t from-black via-black/90 to-transparent pt-3 sm:pt-6">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-[8px] sm:text-[9px] font-black px-1 py-0.2 rounded border ${TIER_BADGE[card.tier].bg}`}
                      >
                        {TIER_BADGE[card.tier].text}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-white/60 font-semibold capitalize">
                        {STONE_NAMES[card.bonusColor]}
                      </span>
                    </div>
                    <h3 className="font-display font-black text-xs sm:text-sm text-white tracking-wide truncate drop-shadow">
                      {card.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="px-4 py-2 bg-black/60 border-t border-white/10 flex items-center justify-between text-xs text-white/50 shrink-0">
          <span className="hidden sm:inline">
            คลิกด้านนอกหรือกด <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">ESC</kbd> เพื่อปิดหน้าต่างกลับสู่เกม (Close)
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-1 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer text-center"
          >
            ปิดหน้าต่าง (Close)
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
};
