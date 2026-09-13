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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-2 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative glass-strong rounded-xl sm:rounded-2xl border border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.9)] max-w-5xl w-full max-h-[98vh] sm:max-h-[95vh] flex flex-col overflow-hidden animate-slide-up z-10 bg-slate-950/95">
        {/* Compact Modal Header */}
        <header className="px-2.5 sm:px-4 py-1.5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-red-950/60 via-purple-950/40 to-slate-950 shrink-0 gap-2">
          {/* Left: Title + Player + Core Stats */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-base sm:text-lg">🦸‍♂️</span>
              <h2 className="font-display text-xs sm:text-base font-black text-white uppercase tracking-wider whitespace-nowrap">
                สมุดการ์ดฮีโร่
              </h2>
              <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold truncate max-w-[100px] sm:max-w-[150px]">
                {player.name}
              </span>
            </div>

            {/* Core Stats Pills */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] sm:text-xs bg-white/10 text-white font-bold px-1.5 sm:px-2 py-0.5 rounded border border-white/10">
                {cards.length} ใบ
              </span>
              <span className="text-[10px] sm:text-xs bg-amber-500/20 text-amber-300 font-black px-1.5 sm:px-2 py-0.5 rounded border border-amber-500/30">
                +{totalPoints} PTS
              </span>
              {avengersCount > 0 && (
                <span
                  className="text-[10px] sm:text-xs bg-red-600/20 text-red-300 font-black px-1.5 sm:px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1"
                  title="Avengers Assemble Count"
                >
                  <span className="w-3.5 h-3.5 bg-red-600 text-yellow-300 rounded-full flex items-center justify-center text-[8px] font-black">
                    A
                  </span>
                  {avengersCount}
                </span>
              )}
            </div>
          </div>

          {/* Right: Prominent Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 hover:bg-red-600/80 text-white/80 hover:text-white flex items-center justify-center text-sm sm:text-base transition-colors cursor-pointer border border-white/15 shrink-0 shadow"
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        {/* Unified Filter & Discount Toolbar (Single Compact Row) */}
        <div className="px-2 sm:px-4 py-1 bg-black/40 border-b border-white/10 flex items-center justify-between gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar shrink-0">
          {/* Tier Filters */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleTierClick('all')}
              className={`text-[10px] sm:text-xs px-2 py-0.5 rounded font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterTier === 'all'
                  ? 'bg-yellow-400 text-black shadow-sm font-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              ทั้งหมด ({cards.length})
            </button>
            <button
              type="button"
              onClick={() => handleTierClick(3)}
              className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterTier === 3
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : 'bg-white/5 text-amber-300/70 hover:bg-white/10'
              }`}
            >
              Tier III ({cards.filter((c) => c.tier === 3).length})
            </button>
            <button
              type="button"
              onClick={() => handleTierClick(2)}
              className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterTier === 2
                  ? 'bg-purple-500 text-white shadow-sm font-black'
                  : 'bg-white/5 text-purple-300/70 hover:bg-white/10'
              }`}
            >
              Tier II ({cards.filter((c) => c.tier === 2).length})
            </button>
            <button
              type="button"
              onClick={() => handleTierClick(1)}
              className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterTier === 1
                  ? 'bg-slate-500 text-white shadow-sm font-black'
                  : 'bg-white/5 text-slate-300/70 hover:bg-white/10'
              }`}
            >
              Tier I ({cards.filter((c) => c.tier === 1).length})
            </button>
          </div>

          {/* Color Filter with Integrated Discount Bonus Count */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleColorClick('all')}
              className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterColor === 'all'
                  ? 'bg-white/30 text-white font-bold'
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              ทุกสี
            </button>
            {BANK_STONE_COLORS.map((c) => {
              const bonus = player.bonuses[c] ?? 0;
              const isSelected = filterColor === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleColorClick(isSelected ? 'all' : c)}
                  className={`flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-yellow-400 bg-white/25 border-yellow-400 scale-105'
                      : bonus > 0
                        ? 'bg-white/10 border-white/25 hover:bg-white/15'
                        : 'bg-white/5 border-white/5 opacity-50 hover:opacity-90'
                  }`}
                  title={`${STONE_NAMES[c]} (ส่วนลด: +${bonus}) - กดเพื่อกรอง`}
                >
                  <img src={`/images/tokens/${c}.png`} alt={c} className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain" />
                  <span className={`text-[9px] sm:text-[11px] font-bold ${bonus > 0 ? 'text-yellow-300 font-black' : 'text-white/40'}`}>
                    +{bonus}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards Gallery Grid (Scrollable with responsive card sizes) */}
        <div className="p-2 sm:p-3 overflow-y-auto flex-1 min-h-0">
          {filteredCards.length === 0 ? (
            <div className="text-center py-4 sm:py-8 space-y-1.5">
              <div className="text-2xl sm:text-4xl opacity-50">🎴</div>
              <h3 className="text-xs sm:text-sm font-bold text-white/90">
                {cards.length === 0 ? 'ยังไม่มีการ์ดฮีโร่ที่เกณฑ์' : 'ไม่พบการ์ดฮีโร่ที่ตรงกับตัวกรอง'}
              </h3>
              <p className="text-[10px] sm:text-xs text-white/60 max-w-md mx-auto">
                {cards.length === 0
                  ? 'ซื้อการ์ดจากกระดานเพื่อเพิ่มการ์ดฮีโร่ รับแต้มและส่วนลดอัญมณีถาวร'
                  : 'ลองเลือกตัวกรอง Tier หรือสีอัญมณีอื่น'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 justify-items-center">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className={`relative w-22 sm:w-26 md:w-32 lg:w-36 h-32 sm:h-38 md:h-48 lg:h-52 rounded-lg sm:rounded-xl border-2 overflow-hidden flex flex-col justify-between shadow-lg transition-all duration-200 hover:scale-105 group bg-slate-900 shrink-0 ${TIER_BORDER[card.tier]}`}
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
                  <div className="relative z-10 p-1 sm:p-1.5 flex items-start justify-between">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {card.points > 0 && (
                        <div className="bg-black/85 backdrop-blur-sm border border-yellow-400 text-yellow-300 font-black text-xs sm:text-sm md:text-base px-1 sm:px-1.5 py-0.2 rounded leading-none shadow">
                          {card.points}
                        </div>
                      )}
                      {card.avengersSymbol && (
                        <div
                          className="bg-red-600 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border border-yellow-300 shadow"
                          title="Avengers Assemble Symbol"
                        >
                          <span className="text-yellow-300 font-black text-[9px] sm:text-xs leading-none">A</span>
                        </div>
                      )}
                    </div>

                    {/* Permanent Stone Bonus Badge */}
                    <div
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-black/75 backdrop-blur-sm p-0.5 border border-white/40 shadow-md flex items-center justify-center"
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
                  <div className="relative z-10 p-1 sm:p-1.5 bg-gradient-to-t from-black via-black/90 to-transparent pt-2 sm:pt-4">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-[7px] sm:text-[8px] md:text-[9px] font-black px-1 py-0.2 rounded border ${TIER_BADGE[card.tier].bg}`}
                      >
                        {TIER_BADGE[card.tier].text}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-white/70 font-semibold capitalize hidden sm:inline">
                        {STONE_NAMES[card.bonusColor]}
                      </span>
                    </div>
                    <h3 className="font-display font-black text-[10px] sm:text-xs md:text-sm text-white tracking-wide truncate drop-shadow">
                      {card.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Minimal Modal Footer */}
        <footer className="px-3 py-1 bg-black/70 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50 shrink-0">
          <span className="hidden sm:inline">
            คลิกด้านนอกหรือกด <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[9px]">ESC</kbd> เพื่อปิดหน้าต่าง (Close)
          </span>
          <span className="sm:hidden">แตะ ✕ หรือภายนอกเพื่อปิด</span>
          <button
            type="button"
            onClick={handleClose}
            className="px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold cursor-pointer transition-colors"
          >
            ปิด
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
};
