// ============================================================
//  GemBank.tsx — Infinity Stones & S.H.I.E.L.D. Supply Bank
// ============================================================

import React, { useState } from 'react';
import type { CrystalColor, CrystalPool, Player } from '@shared/types/game.types';
import { ALL_CRYSTAL_COLORS, BANK_STONE_COLORS } from '@shared/types/game.types';
import { GemToken } from './GemToken';
import { soundManager } from '../utils/soundManager';

interface GemBankProps {
  bank: CrystalPool;
  isMyTurn: boolean;
  currentPlayer: Player;
  onTake3Gems: (colors: [CrystalColor, CrystalColor, CrystalColor]) => void;
  onTake2Gems: (color: CrystalColor) => void;
}

const SHORT_NAMES: Record<CrystalColor, { en: string; th: string }> = {
  ruby: { en: 'Reality', th: 'แดง' },
  sapphire: { en: 'Space', th: 'ฟ้า' },
  emerald: { en: 'Time', th: 'เขียว' },
  obsidian: { en: 'Soul', th: 'ส้ม' },
  topaz: { en: 'Mind', th: 'เหลือง' },
  amethyst: { en: 'Power', th: 'ม่วง' },
  gold: { en: 'S.H.I.E.L.D.', th: 'ชิลด์' },
};

export const GemBank: React.FC<GemBankProps> = ({
  bank,
  isMyTurn,
  currentPlayer,
  onTake3Gems,
  onTake2Gems,
}) => {
  const [selected, setSelected] = useState<CrystalColor[]>([]);
  const [mode, setMode] = useState<'idle' | 'take3' | 'take2'>('idle');

  const totalInHand =
    ALL_CRYSTAL_COLORS.reduce((sum, c) => sum + (currentPlayer.crystals[c] ?? 0), 0) +
    (currentPlayer.crystals.gold ?? 0);

  const handleGemClick = (color: CrystalColor): void => {
    if (!isMyTurn || color === 'gold' || !BANK_STONE_COLORS.includes(color)) return;

    if (mode === 'idle') {
      soundManager.playGemClick(color);
      if (bank[color] >= 4 && selected.length === 0) {
        setMode('take2');
        setSelected([color]);
      } else {
        setMode('take3');
        setSelected([color]);
      }
      return;
    }

    if (mode === 'take2') {
      if (selected[0] === color && bank[color] >= 4) {
        soundManager.playGemCollect();
        onTake2Gems(color);
        reset();
      } else {
        soundManager.playGemClick(color);
        setMode('take3');
        setSelected([color]);
      }
      return;
    }

    if (mode === 'take3') {
      if (selected.includes(color)) {
        soundManager.playGemDeselect();
        setSelected(selected.filter((c) => c !== color));
        if (selected.length === 1) setMode('idle');
        return;
      }
      if (selected.length < 3) {
        const newSelected = [...selected, color] as CrystalColor[];
        setSelected(newSelected);
        if (newSelected.length === 3) {
          soundManager.playGemCollect();
          onTake3Gems(newSelected as [CrystalColor, CrystalColor, CrystalColor]);
          reset();
        } else {
          soundManager.playGemClick(color);
        }
      }
    }
  };

  const reset = (): void => {
    if (selected.length > 0) {
      soundManager.playButtonClick();
    }
    setSelected([]);
    setMode('idle');
  };

  const hint = !isMyTurn
    ? 'รอตาของผู้เล่นคนอื่น (Waiting for active player)...'
    : mode === 'idle'
    ? 'หยิบมณี 3 สีต่าง หรือดับเบิลคลิก 1 สีเพื่อหยิบ 2 ก้อน (ต้องมี 4+ ในคลัง)'
    : mode === 'take2'
    ? `คลิก ${SHORT_NAMES[selected[0]].en} อีกครั้งเพื่อหยิบ 2 ก้อน หรือเลือกสีอื่นเพื่อหยิบ 3 สี`
    : `เลือกมณีเพิ่มอีก ${3 - selected.length} สี (Select ${3 - selected.length} more)`;

  return (
    <div className="rounded-xl p-2 flex flex-col h-full justify-between border border-white/15 shadow-2xl bg-black/85 backdrop-blur-md overflow-hidden">
      {/* Bank Header */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="font-display text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1">
              <span>⚡ คลังมณี (Infinity Bank)</span>
            </h3>
            <p className="text-[9.5px] text-white/90 font-medium">หยิบ 3 สีต่าง หรือ 2 สีเหมือน</p>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors ${
              totalInHand >= 10
                ? 'bg-red-950/90 text-red-300 border-red-500 font-black animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                : 'bg-black/90 text-slate-100 border-white/30'
            }`}
            title="ถือโทเคนในมือได้สูงสุดไม่เกิน 10 เหรียญเมื่อจบเทิร์น (Max 10 in hand)"
          >
            ในมือ: <span className="font-num font-black text-yellow-300">{totalInHand}</span>/10
          </span>
        </div>

        {/* 2-Column Grid for the 5 Standard Stones + S.H.I.E.L.D. */}
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-x-1 content-evenly justify-items-center py-0.5">
          {BANK_STONE_COLORS.map((color) => (
            <div
              key={color}
              className="flex flex-col items-center gap-0.5 p-0.5 rounded-lg hover:bg-white/5 transition-colors w-full"
            >
              <GemToken
                color={color}
                count={bank[color] ?? 0}
                size="lg"
                onClick={() => handleGemClick(color)}
                selected={selected.includes(color)}
                disabled={!isMyTurn || (bank[color] ?? 0) === 0}
              />
              <span className="text-[10.5px] text-white font-bold text-center leading-tight bg-black/80 px-2 py-0.5 rounded-md border border-white/15 shadow-sm">
                {SHORT_NAMES[color].en} <span className="text-yellow-300 text-[9.5px]">({SHORT_NAMES[color].th})</span>
              </span>
            </div>
          ))}

          {/* S.H.I.E.L.D. wildcard token — gained when reserving a card */}
          <div
            className="flex flex-col items-center gap-0.5 p-0.5 rounded-lg w-full opacity-90"
            title="S.H.I.E.L.D. Wild Token: ได้รับอัตโนมัติ 1 เหรียญเมื่อทำการจองการ์ดฮีโร่"
          >
            <GemToken
              color="gold"
              count={bank.gold ?? 0}
              size="lg"
              disabled
            />
            <span className="text-[10.5px] text-white font-bold text-center leading-tight bg-black/80 px-2 py-0.5 rounded-md border border-white/15 shadow-sm">
              S.H.I.E.L.D. <span className="text-slate-300 text-[9.5px]">(ชิลด์)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Selection Hint & Controls */}
      <div className="text-center pt-1 border-t border-white/10 mt-auto">
        <div className="bg-black/85 rounded-lg p-1.5 border border-white/15">
          <p className="text-[10.5px] text-yellow-300 font-bold leading-tight">{hint}</p>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="mt-1 w-full py-0.5 text-[10px] text-red-400 hover:text-red-300 font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded transition-all cursor-pointer"
            >
              ✕ ยกเลิกการเลือก (Cancel)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
