import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Player } from '@shared/types/game.types';
import { soundManager } from '../utils/soundManager';
import marvelAvatarsData from '../data/marvelAvatarsData.json';

const resolvePlayerAvatar = (player: Player): string | undefined => {
  if (player.avatarUrl) return player.avatarUrl;
  const lower = player.name.toLowerCase();
  const avatarMap = marvelAvatarsData as Record<string, string>;
  if (lower.includes('doom')) return avatarMap['doctor_doom'] || '/images/avatars/doctor_doom.jpg';
  if (lower.includes('loki')) return avatarMap['loki'] || '/images/avatars/loki.jpg';
  if (lower.includes('thanos')) return avatarMap['thanos'] || '/images/avatars/thanos.jpg';
  if (lower.includes('stark') || lower.includes('iron')) return avatarMap['iron_man'] || '/images/avatars/iron_man.jpg';
  return undefined;
};

interface GameOverProps {
  winners: string[];
  players: Player[];
  myPlayerId: string;
  onLeave: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ winners, players, myPlayerId, onLeave }) => {
  const winnerPlayers = players.filter((p) => winners.includes(p.id));
  const isIWon = winners.includes(myPlayerId);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  useEffect(() => {
    soundManager.playVictory();
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-xl" />

      {/* Scrollable wrapper */}
      <div className="relative min-h-full flex items-center justify-center p-4 py-6">
      {/* Card */}
      <div className="relative glass-strong rounded-3xl p-5 sm:p-10 max-w-lg w-full text-center space-y-5 sm:space-y-7 border border-yellow-400/30 shadow-[0_0_90px_rgba(245,158,11,0.25)] animate-slide-up">
        {/* Marvel Badge */}
        <div className="flex items-center justify-center gap-2">
          <span className="marvel-badge px-3 py-0.5 rounded text-base font-black">MARVEL</span>
          <span className="font-display font-black text-xl text-white tracking-widest">
            SPLENDOR
          </span>
        </div>

        {/* Win/Lose header */}
        <div className="space-y-2">
          <div className="text-5xl sm:text-7xl">{isIWon ? '🧤' : '🎖️'}</div>
          <h1
            className={[
              'font-display text-2xl sm:text-4xl font-black uppercase tracking-wider',
              isIWon ? 'shimmer-text' : 'text-white/90',
            ].join(' ')}
          >
            {isIWon ? 'ชัยชนะแห่งจักรวาล! (Cosmic Victory!)' : 'จบเกมแล้ว (Game Over)'}
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-sm mx-auto">
            {isIWon
              ? 'คุณรวบรวมมณีครบทั้ง 6 ชนิดและครอบครอง Infinity Gauntlet สำเร็จ!'
              : `${winnerPlayers.map((p) => p.name).join(' & ')} รวบรวม Infinity Gauntlet สำเร็จและชนะเกมนี้!`}
          </p>
        </div>

        {/* Scoreboard */}
        <div className="glass rounded-2xl overflow-hidden border border-white/10">
          <div className="px-4 py-2 border-b border-white/10 bg-black/30">
            <span className="text-xs text-white/60 uppercase tracking-widest font-bold">
              สรุปอันดับผลการแข่งขัน (Final Standings)
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {sortedPlayers.map((player, rank) => {
              const isWinner = winners.includes(player.id);
              const isMe = player.id === myPlayerId;
              const medals = ['🥇', '🥈', '🥉', '4️⃣'];
              return (
                <div
                  key={player.id}
                  className={[
                    'flex items-center gap-4 px-5 py-3',
                    isWinner ? 'bg-yellow-400/10' : '',
                  ].join(' ')}
                >
                  <span className="text-xl w-8">{medals[rank] ?? '—'}</span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0 bg-white/10 flex items-center justify-center text-xs font-bold text-white shadow">
                    {(() => {
                      const avatarSrc = resolvePlayerAvatar(player);
                      const isDoom = player.name.toLowerCase().includes('doom');
                      const fallbackEmoji = isDoom ? '👑' : player.isBot ? '🤖' : player.name.charAt(0).toUpperCase();
                      return avatarSrc ? (
                        <img src={avatarSrc} alt={player.name} className="w-full h-full object-cover object-center" />
                      ) : (
                        fallbackEmoji
                      );
                    })()}
                  </div>
                  <div className="flex-1 text-left">
                    <span
                      className={`font-bold text-sm ${isMe ? 'text-yellow-300' : 'text-white/90'}`}
                    >
                      {player.name}
                    </span>
                    {player.isBot && (
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded ml-1.5 font-bold">
                        บอท (BOT)
                      </span>
                    )}
                    {isMe && (
                      <span className="text-[10px] text-yellow-400/80 font-semibold ml-1.5">
                        (คุณ)
                      </span>
                    )}
                  </div>
                  <span className="text-xl font-black font-display text-yellow-400">
                    {player.score}
                  </span>
                  <span className="text-xs text-white/40 uppercase">แต้ม (PTS)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onLeave();
          }}
          className="w-full py-3 sm:py-4 rounded-xl font-black font-display text-sm sm:text-base bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white transition-all duration-200 shadow-xl hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
        >
          กลับสู่ล็อบบี้หลัก (Return to Lobby)
        </button>
      </div>
      </div>
    </div>,
    document.body,
  );
};
