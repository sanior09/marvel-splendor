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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative glass-strong rounded-3xl p-8 max-w-md w-full mx-4 border border-red-500/30 shadow-[0_0_60px_rgba(230,57,70,0.2)] animate-slide-up">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="text-4xl">⚠️</div>
          <h2 className="font-display text-2xl font-bold text-red-400">Token Limit Overflow!</h2>
          <p className="text-white/60 text-sm">
            You have <span className="text-red-400 font-bold">{totalInHand}</span> tokens.{' '}
            You must discard at least{' '}
            <span className="text-red-400 font-bold">{mustDrop}</span> to reach 10 or fewer.
          </p>
          {(player.crystals.emerald ?? 0) > 0 && (
            <p className="text-[11px] text-emerald-400/90 font-semibold bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full inline-block">
              🛡️ Time Stone is protected and cannot be returned to bank
            </p>
          )}
        </div>

        {/* Gem selectors */}
        <div className="space-y-3 mb-6">
          {droppableColors.map((color) => {
            const have = player.crystals[color] ?? 0;
            if (have === 0) return null;
            const dropping = toDrop[color] ?? 0;
            return (
              <div key={color} className="flex items-center gap-3">
                <GemToken color={color} size="sm" showCount={false} />
                <span className="text-sm text-white/80 font-medium flex-1">{STONE_NAMES[color]}</span>
                <span className="text-xs text-white/40 w-12 text-right">Have: {have}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => decrement(color)}
                    disabled={dropping === 0}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 font-bold text-white transition-colors"
                  >
                    −
                  </button>
                  <span className={`w-6 text-center font-bold text-sm ${dropping > 0 ? 'text-red-400' : 'text-white/40'}`}>
                    {dropping}
                  </span>
                  <button
                    type="button"
                    onClick={() => increment(color)}
                    disabled={dropping >= have}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 font-bold text-white transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status bar */}
        <div className="glass rounded-xl p-3 mb-4 text-center">
          <div className={`text-sm font-semibold ${afterDrop <= 10 ? 'text-emerald' : 'text-red-400'}`}>
            After discard: {afterDrop} / 10 gems
          </div>
          {afterDrop > 10 && (
            <div className="text-xs text-red-400/70 mt-1">
              Drop {afterDrop - 10} more gem{afterDrop - 10 > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Confirm button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isValid}
          className={[
            'w-full py-3 rounded-xl font-bold text-base font-display transition-all duration-200',
            isValid
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg hover:shadow-indigo-500/25'
              : 'bg-white/5 text-white/30 cursor-not-allowed',
          ].join(' ')}
        >
          Confirm Discard
        </button>
      </div>
    </div>,
    document.body,
  );
};
