// ============================================================
//  GuardianRow.tsx — Marvel Locations Row
// ============================================================

import React from 'react';
import type { Guardian, Player } from '@shared/types/game.types';

interface GuardianRowProps {
  guardians: Guardian[];
  currentPlayer: Player;
}

function isEligible(player: Player, guardian: Guardian): boolean {
  return Object.entries(guardian.requirement).every(([color, req]) => {
    return (player.bonuses[color as keyof typeof player.bonuses] ?? 0) >= (req ?? 0);
  });
}

const CARD_THEMES: Record<string, { bg: string; border: string; labelTh: string }> = {
  ruby: {
    bg: 'from-red-600 via-rose-700 to-red-950',
    border: 'border-red-400/80',
    labelTh: 'แดง (Reality)',
  },
  sapphire: {
    bg: 'from-blue-600 via-sky-700 to-blue-950',
    border: 'border-blue-400/80',
    labelTh: 'ฟ้า (Space)',
  },
  emerald: {
    bg: 'from-emerald-500 via-green-700 to-emerald-950',
    border: 'border-emerald-400/80',
    labelTh: 'เขียว (Time)',
  },
  obsidian: {
    bg: 'from-amber-500 via-orange-600 to-orange-950',
    border: 'border-amber-400/80',
    labelTh: 'ส้ม (Soul)',
  },
  topaz: {
    bg: 'from-yellow-400 via-amber-500 to-yellow-900',
    border: 'border-yellow-300/90',
    labelTh: 'เหลือง (Mind)',
  },
  amethyst: {
    bg: 'from-purple-600 via-fuchsia-700 to-indigo-950',
    border: 'border-purple-400/80',
    labelTh: 'ม่วง (Power)',
  },
};

export const GuardianRow: React.FC<GuardianRowProps> = ({ guardians, currentPlayer }) => {
  if (guardians.length === 0) {
    return (
      <div className="h-[78px] flex items-center justify-center text-center text-white/40 text-xs italic bg-black/40 rounded-xl px-4 border border-white/10">
        สถานที่ทั้งหมดถูกครอบครองแล้ว (All Locations Claimed)
      </div>
    );
  }

  return (
    <div className="flex gap-1.5 items-center justify-center">
      {guardians.map((guardian) => {
        const eligible = isEligible(currentPlayer, guardian);
        const reqEntries = Object.entries(guardian.requirement).filter(([, v]) => (v ?? 0) > 0);

        return (
          <div
            key={guardian.id}
            className={[
              'w-[98px] sm:w-[104px] h-[78px] rounded-xl flex flex-col justify-between overflow-hidden relative shadow-md transition-all duration-300 border flex-shrink-0',
              eligible
                ? 'ring-2 ring-yellow-400 scale-105 z-10 border-yellow-300 shadow-[0_0_14px_rgba(250,204,21,0.6)]'
                : 'border-white/25 hover:border-white/40',
            ].join(' ')}
            title={`${guardian.name} — ได้รับทันที 3 แต้มเมื่อสะสมโบนัสการ์ดฮีโร่ครบตามเงื่อนไข (+3 PTS)`}
          >
            {/* Background Location Image */}
            <img
              src={`/images/locations/${guardian.id}.jpg`}
              alt={guardian.name}
              className="absolute inset-0 w-full h-full object-cover z-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/85 z-0 pointer-events-none" />

            {/* Name & Points Top Bar */}
            <div className="relative z-10 px-1.5 py-0.5 flex items-center justify-between bg-black/90 backdrop-blur-sm border-b border-white/20">
              <h4
                className="text-[10px] font-bold tracking-tight text-white leading-tight truncate flex-1 pr-1 font-sans"
                title={guardian.name}
              >
                {guardian.name}
              </h4>
              <span className="text-yellow-300 font-black font-num text-[10.5px] leading-none bg-slate-950/95 border border-yellow-400/80 px-1 py-0.5 rounded flex-shrink-0 shadow-sm">
                +{guardian.points}
              </span>
            </div>

            {/* Requirements: Mini Hero Cards (Compact, Perfectly fitting, Never Clipped) */}
            <div className="relative z-10 flex flex-wrap gap-1 p-1 items-center justify-start min-h-[36px]">
              {reqEntries.map(([color, count]) => {
                const theme = CARD_THEMES[color] ?? CARD_THEMES.ruby;
                const playerBonus = currentPlayer.bonuses[color as keyof typeof currentPlayer.bonuses] ?? 0;
                const satisfied = playerBonus >= (count ?? 0);
                return (
                  <div
                    key={color}
                    className={[
                      'flex items-center gap-1 px-1 py-0.5 rounded-md border backdrop-blur-md transition-all shadow-sm',
                      satisfied
                        ? 'bg-black/90 border-yellow-300 ring-1 ring-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                        : 'bg-black/80 border-white/25',
                    ].join(' ')}
                    title={`ต้องสะสมการ์ดฮีโร่สี${theme.labelTh} จำนวน ${count} ใบ (ปัจจุบันคุณมี: ${playerBonus}/${count} ใบ)`}
                  >
                    {/* Mini Card Graphic */}
                    <div
                      className={`w-3 h-4 rounded-[2px] border ${theme.border} bg-gradient-to-b ${theme.bg} shadow-md flex flex-col items-center justify-between p-[1px] shrink-0 relative overflow-hidden`}
                    >
                      <div className="w-full h-[1.5px] bg-white/70 rounded-t-[1px]" />
                      <img
                        src={`/images/tokens/${color}.png`}
                        alt=""
                        className="w-2 h-2 object-contain drop-shadow"
                      />
                      <div className="w-full h-[1px] bg-black/50 rounded-b-[1px]" />
                    </div>

                    {/* Number of Cards Required */}
                    <span className={`text-[10.5px] font-black font-num leading-none ${satisfied ? 'text-yellow-300' : 'text-white'} drop-shadow`}>
                      {String(count)}
                    </span>
                    {satisfied && (
                      <span className="text-[8px] text-yellow-300 leading-none font-black -ml-0.5" title="สะสมการ์ดครบแล้ว!">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

