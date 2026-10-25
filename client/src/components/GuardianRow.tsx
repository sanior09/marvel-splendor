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
      <div className="text-center text-white/30 text-xs py-3 italic bg-black/20 rounded-xl px-4 border border-white/5">
        สถานที่มาร์เวลทั้งหมดถูกครอบครองแล้ว (All Locations Claimed)
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-center">
        <div className="bg-black/85 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/20 shadow-sm flex items-center gap-1.5">
          <span className="text-[11px]">🏛️</span>
          <span className="text-[10.5px] font-bold tracking-wide text-white leading-none">
            สถานที่มาร์เวล (สะสมการ์ดครบรับทันที • Marvel Locations • +3 PTS)
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {guardians.map((guardian) => {
          const eligible = isEligible(currentPlayer, guardian);
          const reqEntries = Object.entries(guardian.requirement).filter(([, v]) => (v ?? 0) > 0);

          return (
            <div
              key={guardian.id}
              className={[
                'w-[96px] sm:w-[104px] h-[72px] rounded-xl flex flex-col justify-between overflow-hidden relative shadow-md transition-all duration-300 border',
                eligible
                  ? 'ring-2 ring-yellow-400 scale-105 z-10 border-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.5)]'
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
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/80 z-0" />

              {/* Name & Points Top Bar */}
              <div className="relative z-10 px-1 py-0.5 flex items-center justify-between bg-black/90 backdrop-blur-sm border-b border-white/15">
                <h4
                  className="text-[10.5px] font-bold tracking-normal text-white leading-tight truncate flex-1 pr-1"
                  title={guardian.name}
                >
                  {guardian.name}
                </h4>
                <span className="text-yellow-300 font-black font-num text-[11px] leading-none bg-slate-950/95 border border-yellow-400/80 px-1.5 py-0.5 rounded flex-shrink-0 shadow-sm">
                  +{guardian.points}
                </span>
              </div>

              {/* Requirements: Mini Hero Cards instead of round coin tokens */}
              <div className="relative z-10 flex flex-wrap gap-1 p-1 items-end justify-start">
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
                          ? 'bg-black/85 border-yellow-300 ring-1 ring-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                          : 'bg-black/75 border-white/25',
                      ].join(' ')}
                      title={`ต้องสะสมการ์ดฮีโร่สี${theme.labelTh} จำนวน ${count} ใบ (ปัจจุบันคุณมี: ${playerBonus}/${count} ใบ)`}
                    >
                      {/* Mini Card Graphic (Unmistakable vertical rectangular character card) */}
                      <div
                        className={`w-3.5 h-[19px] rounded-[2.5px] border ${theme.border} bg-gradient-to-b ${theme.bg} shadow-md flex flex-col items-center justify-between p-[1px] shrink-0 relative overflow-hidden`}
                      >
                        {/* Top Card Accent Line */}
                        <div className="w-full h-[2px] bg-white/60 rounded-t-[1.5px]" />
                        {/* Hero Stone Symbol inside card */}
                        <img
                          src={`/images/tokens/${color}.png`}
                          alt=""
                          className="w-2.5 h-2.5 object-contain drop-shadow"
                        />
                        {/* Bottom Card Accent Frame */}
                        <div className="w-full h-[1.5px] bg-black/50 rounded-b-[1.5px]" />
                      </div>

                      {/* Number of Cards Required */}
                      <span className={`text-[11px] font-black font-num leading-none ${satisfied ? 'text-yellow-300' : 'text-white'} drop-shadow`}>
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
    </div>
  );
};
