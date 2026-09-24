// ============================================================
//  FinalRoundModal.tsx — Final Round Cosmic Alert Popup
//  แสดง popup แจ้งเตือนเมื่อมีผู้เล่นทำคะแนนถึงเป้าหมาย
//  พร้อม countdown auto-dismiss 8 วินาที
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import type { Player } from '@shared/types/game.types';

interface FinalRoundModalProps {
  /** ผู้เล่นที่ทำคะแนนถึงเป้าหมาย */
  triggerPlayer: Player;
  /** คะแนนเป้าหมาย */
  targetScore: number;
  /** ปิด modal */
  onClose: () => void;
  /** auto-dismiss หลังจาก N วินาที (default 8) */
  autoDismissSeconds?: number;
}

export const FinalRoundModal: React.FC<FinalRoundModalProps> = ({
  triggerPlayer,
  targetScore,
  onClose,
  autoDismissSeconds = 8,
}) => {
  const [timeLeft, setTimeLeft] = useState(autoDismissSeconds);
  const [animIn, setAnimIn] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate in
  useEffect(() => {
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimIn(true));
    });
    return () => cancelAnimationFrame(t);
  }, []);

  // Countdown timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          onClose();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onClose]);

  const progress = (timeLeft / autoDismissSeconds) * 100;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Final Round Alert"
    >
      {/* Stop propagation so clicking inside doesn't close */}
      <div
        className="relative mx-4 w-full max-w-sm rounded-2xl overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: animIn ? 'scale(1) translateY(0px)' : 'scale(0.85) translateY(32px)',
          opacity: animIn ? 1 : 0,
          transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease',
          boxShadow: '0 0 60px rgba(220, 38, 38, 0.5), 0 0 120px rgba(251, 191, 36, 0.25), 0 20px 60px rgba(0,0,0,0.8)',
          border: '1.5px solid rgba(251, 191, 36, 0.5)',
          background: 'linear-gradient(135deg, #1a0505 0%, #0d0505 30%, #0a0a1a 70%, #050d1a 100%)',
        }}
      >
        {/* Animated glow border overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(220,38,38,0.15) 0%, transparent 50%, rgba(251,191,36,0.10) 100%)',
          }}
        />

        {/* Pulsing red warning stripe at top */}
        <div
          className="relative h-1.5 w-full"
          style={{
            background: 'linear-gradient(90deg, #dc2626, #f59e0b, #dc2626, #f59e0b, #dc2626)',
            backgroundSize: '200% 100%',
            animation: 'bgSlide 1.5s linear infinite',
          }}
        />

        {/* Content */}
        <div className="px-5 py-5 flex flex-col items-center gap-3 text-center">

          {/* Icon + Title */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="text-4xl mb-1"
              style={{
                filter: 'drop-shadow(0 0 12px rgba(220,38,38,0.9))',
                animation: 'pulse 0.8s ease-in-out infinite alternate',
              }}
            >
              🚨
            </div>
            <h2
              className="font-display font-black tracking-widest uppercase leading-none"
              style={{
                fontSize: 'clamp(1.1rem, 5vw, 1.5rem)',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #ef4444 80%, #dc2626 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
                filter: 'drop-shadow(0 2px 8px rgba(220,38,38,0.6))',
              }}
            >
              ตาสุดท้ายแล้ว!
            </h2>
            <p
              className="font-bold tracking-[0.3em] text-[11px] uppercase"
              style={{ color: 'rgba(251, 191, 36, 0.85)' }}
            >
              FINAL ROUND — LAST TURN
            </p>
          </div>

          {/* Divider */}
          <div
            className="w-full h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)' }}
          />

          {/* Trigger Player Info */}
          <div className="flex flex-col items-center gap-2">
            {triggerPlayer.avatarUrl && (
              <div
                className="w-14 h-14 rounded-full overflow-hidden"
                style={{
                  border: '2px solid rgba(251,191,36,0.7)',
                  boxShadow: '0 0 16px rgba(251,191,36,0.4)',
                }}
              >
                <img
                  src={triggerPlayer.avatarUrl}
                  alt={triggerPlayer.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            {!triggerPlayer.avatarUrl && (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #dc2626)',
                  border: '2px solid rgba(251,191,36,0.6)',
                  boxShadow: '0 0 16px rgba(251,191,36,0.3)',
                }}
              >
                {triggerPlayer.isBot ? '🤖' : triggerPlayer.name[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div>
              <p className="font-black text-white text-base leading-tight">{triggerPlayer.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(251,191,36,0.9)' }}>
                ทำได้{' '}
                <span
                  className="font-num font-black text-base"
                  style={{ color: '#f59e0b' }}
                >
                  {triggerPlayer.score}
                </span>
                {' '}/ {targetScore} คะแนนแล้ว!
              </p>
            </div>
          </div>

          {/* Rule explanation */}
          <div
            className="w-full rounded-xl px-3 py-2.5 text-xs leading-relaxed text-center"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            <span className="text-yellow-300 font-bold">⚡ กติกา:</span>{' '}
            ผู้เล่นทุกคนจะได้เล่น{' '}
            <span className="text-white font-bold">อีก 1 เทิร์น</span>{' '}
            จนครบรอบ เพื่อแย่งชิงชัยชนะแห่งจักรวาล!
          </div>

          {/* Dismiss button + countdown */}
          <div className="w-full flex flex-col items-center gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              id="final-round-dismiss-btn"
              className="w-full py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
                color: '#fff',
                border: '1px solid rgba(251,191,36,0.4)',
                boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
              }}
            >
              ⚡ รับทราบ — เข้าสู่ตาสุดท้าย
            </button>

            {/* Countdown progress bar */}
            <div className="w-full flex items-center gap-2">
              <div
                className="flex-1 h-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
                    transition: 'width 1s linear',
                  }}
                />
              </div>
              <span className="text-[10px] font-num font-bold text-white/40 w-4 text-right">
                {timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom warning stripe */}
        <div
          className="h-1 w-full"
          style={{
            background: 'linear-gradient(90deg, #dc2626, #f59e0b, #dc2626)',
            backgroundSize: '200% 100%',
            animation: 'bgSlide 1.5s linear infinite reverse',
          }}
        />
      </div>

      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes bgSlide {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes pulse {
          0%   { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
};
