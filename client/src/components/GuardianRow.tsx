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
      <div className="text-[10px] uppercase font-bold tracking-wider text-white/50 text-center">
        ดินแดนและสถานที่มาร์เวล (Marvel Locations • +3 PTS)
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {guardians.map((guardian) => {
          const eligible = isEligible(currentPlayer, guardian);
          const reqEntries = Object.entries(guardian.requirement).filter(([, v]) => (v ?? 0) > 0);

          return (
            <div
              key={guardian.id}
              className={[
                'w-24 h-20 rounded-xl flex flex-col justify-between overflow-hidden relative shadow-lg transition-all duration-300 border',
                eligible
                  ? 'ring-3 ring-yellow-400 scale-105 z-10 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
                  : 'border-white/20 hover:border-white/40',
              ].join(' ')}
              title={`${guardian.name} — ได้รับทันที 3 แต้มเมื่อสะสมโบนัสการ์ดครบตามเงื่อนไข (+3 PTS)`}
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
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70 z-0" />

              {/* Name & Points Top Bar */}
              <div className="relative z-10 px-1.5 py-1 flex items-center justify-between bg-black/75 backdrop-blur-sm border-b border-white/10">
                <h4
                  className="text-[9.5px] font-black uppercase tracking-tight text-white leading-tight drop-shadow truncate flex-1 pr-1"
                  title={guardian.name}
                >
                  {guardian.name}
                </h4>
                <span className="text-yellow-300 font-black text-xs drop-shadow leading-none bg-black/80 border border-yellow-400/50 px-1 py-0.5 rounded flex-shrink-0">
                  +{guardian.points}
                </span>
              </div>

              {/* Requirements */}
              <div className="relative z-10 flex flex-wrap gap-1 p-1.5 items-end justify-start">
                {reqEntries.map(([color, count]) => {
                  const playerBonus = currentPlayer.bonuses[color as keyof typeof currentPlayer.bonuses] ?? 0;
                  const satisfied = playerBonus >= (count ?? 0);
                  return (
                    <div
                      key={color}
                      className={`h-5 pl-1 pr-1.5 rounded-full flex items-center justify-center gap-1 border bg-black/60 backdrop-blur-sm ${
                        satisfied ? 'border-yellow-300 ring-1 ring-yellow-300' : 'border-white/30'
                      } shadow`}
                      title={`${color} bonus required: ${count} (You have: ${playerBonus})`}
                    >
                      <img
                        src={`/images/tokens/${color}.png`}
                        alt={color}
                        className="w-3.5 h-3.5 object-contain"
                      />
                      <span className="text-[10px] font-black text-white drop-shadow">
                        {String(count)}
                      </span>
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
