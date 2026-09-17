// ============================================================
//  InactivityWarningModal.tsx — 60s Grace Period Warning Modal
// ============================================================

import React from 'react';
import { createPortal } from 'react-dom';
import { soundManager } from '../utils/soundManager';

interface InactivityWarningModalProps {
  remainingSeconds: number;
  onStay: () => void;
}

export const InactivityWarningModal: React.FC<InactivityWarningModalProps> = ({
  remainingSeconds,
  onStay,
}) => {
  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStayClick = () => {
    soundManager.playButtonClick();
    onStay();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={handleStayClick}
    >
      <div
        className="relative glass-strong rounded-3xl p-5 sm:p-7 max-w-sm w-full border border-amber-500/50 shadow-[0_0_60px_rgba(245,158,11,0.3)] text-center space-y-4 animate-slide-up bg-slate-950/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Warning Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner animate-pulse">
          ⏳
        </div>

        <div className="space-y-1.5">
          <h3 className="font-display text-lg sm:text-xl font-black text-amber-400 uppercase tracking-wide">
            เตือนความไม่เคลื่อนไหว (AFK Alert)
          </h3>
          <p className="text-white/70 text-xs sm:text-sm">
            คุณไม่มีการเคลื่อนไหวเกือบ 3 นาที ระบบจะให้บอท AI เข้ามาเล่นแทนคุณอัตโนมัติในอีก:
          </p>
        </div>

        {/* Big Countdown Timer */}
        <div className="py-2.5 px-4 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center justify-center gap-2">
          <span className="font-mono text-3xl sm:text-4xl font-black text-amber-400 tracking-wider">
            {formatTime(remainingSeconds)}
          </span>
          <span className="text-xs text-amber-300/70 font-semibold uppercase">วินาที (Sec)</span>
        </div>

        <p className="text-[11px] text-white/50">
          แตะที่หน้าจอ ขยับเมาส์ หรือกดปุ่มด้านล่างเพื่อเล่นเกมต่อ
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleStayClick}
          className="w-full py-3 rounded-xl font-display font-bold text-sm sm:text-base text-white bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 active:scale-98 transition-all shadow-lg shadow-amber-600/30 cursor-pointer"
        >
          ✓ ฉันยังเล่นอยู่ (I'm Still Here)
        </button>
      </div>
    </div>,
    document.body,
  );
};
