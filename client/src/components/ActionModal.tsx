// ============================================================
//  ActionModal.tsx — Force Gem Drop Modal (> 10 gems)
// ============================================================

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { CrystalColor, CrystalPool, Player } from '@shared/types/game.types';
import { BANK_STONE_COLORS } from '@shared/types/game.types';
import { GemToken, STONE_NAMES } from './GemToken';
import { soundManager } from '../utils/soundManager';

interface ActionModalProps {
  player: Player;
  onDropGems: (toDrop: Partial<CrystalPool>) => void;
}

function totalPool(pool: Partial<Record<CrystalColor, number>>): number {
  return Object.values(pool).reduce((sum, v) => sum + (v ?? 0), 0);
}

export const ActionModal: React.FC<ActionModalProps> = ({ player, onDropGems }) => {
  const [toDrop, setToDrop] = useState<Partial<Record<CrystalColor, number>>>({});

  useEffect(() => {
    soundManager.playModalOpen();
  }, []);

  // 5 standard bank stones + S.H.I.E.L.D. can be dropped. Green Time Stone CANNOT be dropped!
  const droppableColors: CrystalColor[] = [...BANK_STONE_COLORS, 'gold'];
  const allColors: CrystalColor[] = [...BANK_STONE_COLORS, 'emerald', 'gold'];
  const totalInHand = allColors.reduce((sum, c) => sum + (player.crystals[c] ?? 0), 0);
  const totalDropping = totalPool(toDrop);
  const afterDrop = totalInHand - totalDropping;
  const mustDrop = totalInHand - 10;
  const isValid = afterDrop <= 10 && totalDropping >= mustDrop;

  const increment = (color: CrystalColor): void => {
    if (color === 'emerald') return; // Cannot drop Time Stone!
    const current = toDrop[color] ?? 0;
    if (current < (player.crystals[color] ?? 0)) {
      soundManager.playGemClick(color);
      setToDrop({ ...toDrop, [color]: current + 1 });
    }
  };

  const decrement = (color: CrystalColor): void => {
    const current = toDrop[color] ?? 0;
    if (current > 0) {
      soundManager.playGemDeselect();
      setToDrop({ ...toDrop, [color]: current - 1 });
    }
  };

  const handleConfirm = (): void => {
    if (isValid) {
      soundManager.playButtonClick();
      onDropGems(toDrop as Partial<CrystalPool>);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
      {/* Modal Container */}
      <div className="relative glass-strong rounded-2xl sm:rounded-3xl p-3 sm:p-5 max-w-lg w-full border border-red-500/40 shadow-[0_0_60px_rgba(230,57,70,0.25)] animate-slide-up max-h-[95vh] flex flex-col overflow-hidden bg-slate-950/95">
        {/* Header - Compact */}
        <div className="text-center space-y-1 pb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl sm:text-2xl animate-bounce">⚠️</span>
            <h2 className="font-display text-base sm:text-xl font-black text-red-400 uppercase tracking-wide">
              เหรียญเกินขีดจำกัด (Token Limit Exceeded)
            </h2>
          </div>
          <p className="text-white/80 text-xs sm:text-sm">
            คุณมีเหรียญในมือ <span className="text-red-400 font-black font-num text-sm">{totalInHand}</span> เหรียญ — ต้องเลือกคืนอย่างน้อย{' '}
            <span className="text-red-400 font-black font-num text-sm sm:text-base underline">{mustDrop}</span> เหรียญ (ให้เหลือไม่เกิน 10)
          </p>
          {(player.crystals.emerald ?? 0) > 0 && (
            <p className="text-[10px] sm:text-[11px] text-emerald-300 font-medium bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full inline-block">
              🛡️ มณีเวลา (Time Stone) ได้รับการคุ้มครอง ไม่สามารถคืนเข้าคลังได้
            </p>
          )}
        </div>

        {/* Gem Selectors - Scrollable & Compact 2-column grid */}
        <div className="flex-1 overflow-y-auto min-h-0 py-2 sm:py-3 pr-1 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            {droppableColors.map((color) => {
              const have = player.crystals[color] ?? 0;
              if (have === 0) return null;
              const dropping = toDrop[color] ?? 0;
              return (
                <div
                  key={color}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                    dropping > 0
                      ? 'bg-red-950/30 border-red-500/40 shadow-inner'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GemToken color={color} size="sm" showCount={false} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{STONE_NAMES[color]}</div>
                      <div className="text-[10px] text-white/50">มีอยู่ (Have): <span className="font-num font-bold text-white/80">{have}</span></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => decrement(color)}
                      disabled={dropping === 0}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-20 font-bold text-white text-sm transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span
                      className={`w-6 text-center font-num font-black text-sm sm:text-base ${
                        dropping > 0 ? 'text-red-400' : 'text-white/40'
                      }`}
                    >
                      {dropping}
                    </span>
                    <button
                      type="button"
                      onClick={() => increment(color)}
                      disabled={dropping >= have}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-20 font-bold text-white text-sm transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: Status bar & Confirm Button - Fixed at bottom, NEVER cut off! */}
        <div className="pt-2 border-t border-white/10 shrink-0 space-y-2">
          {/* Status summary */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm">
            <span className="text-white/70">เหรียญหลังคืน (Remaining):</span>
            <span
              className={`font-bold font-num text-sm ${
                afterDrop <= 10 ? 'text-emerald-400' : 'text-red-400 animate-pulse'
              }`}
            >
              <span className="font-black">{afterDrop}</span> / 10 เหรียญ {afterDrop > 10 && `(ต้องคืนอีก ${afterDrop - 10})`}
            </span>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid}
            className={[
              'w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base font-display transition-all duration-200 shadow-xl flex items-center justify-center gap-2',
              isValid
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25 cursor-pointer hover:scale-[1.01] active:scale-[0.98]'
                : 'bg-white/10 text-white/30 cursor-not-allowed border border-white/5',
            ].join(' ')}
          >
            <span>{isValid ? '✓ ตกลง (OK - Confirm Discard)' : `เลือกคืนอีก ${afterDrop - 10} เหรียญ`}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
