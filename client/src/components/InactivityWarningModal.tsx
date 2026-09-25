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
  const handleStayClick = () => {
    soundManager.playButtonClick();
    onStay();
  };

  const urgency = remainingSeconds <= 15 ? 'critical' : remainingSeconds <= 30 ? 'warning' : 'normal';
  const pct = Math.max(0, Math.min(100, (remainingSeconds / 60) * 100));
  const circumference = 2 * Math.PI * 38;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={handleStayClick}
    >
      <div
        className="relative rounded-2xl p-6 sm:p-8 max-w-xs w-full text-center space-y-5 animate-fade-in"
        style={{
          background: 'linear-gradient(145deg, rgba(17,10,28,0.98) 0%, rgba(8,6,18,0.99) 100%)',
          border: urgency === 'critical'
            ? '1.5px solid rgba(239,68,68,0.7)'
            : urgency === 'warning'
            ? '1.5px solid rgba(245,158,11,0.6)'
            : '1.5px solid rgba(245,158,11,0.4)',
          boxShadow: urgency === 'critical'
            ? '0 0 60px rgba(239,68,68,0.35), 0 20px 60px rgba(0,0,0,0.9)'
            : '0 0 50px rgba(245,158,11,0.25), 0 20px 60px rgba(0,0,0,0.9)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* SVG Countdown Ring */}
        <div className="relative w-24 h-24 mx-auto">
          <svg width="96" height="96" viewBox="0 0 96 96" className="rotate-[-90deg]">
            {/* Track */}
            <circle
              cx="48" cy="48" r="38"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="6"
            />
            {/* Progress */}
            <circle
              cx="48" cy="48" r="38"
              fill="none"
              stroke={urgency === 'critical' ? '#ef4444' : '#f59e0b'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
              style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-black leading-none tabular-nums"
              style={{
                fontFamily: "'Chakra Petch', monospace",
                fontSize: '2rem',
                color: urgency === 'critical' ? '#fca5a5' : '#fbbf24',
                filter: urgency === 'critical' ? 'drop-shadow(0 0 8px #ef4444)' : 'drop-shadow(0 0 8px #f59e0b)',
              }}
            >
              {remainingSeconds}
            </span>
            <span className="text-[9px] text-white/40 uppercase tracking-widest">วินาที</span>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3
            className="font-black text-base uppercase tracking-wide"
            style={{ color: urgency === 'critical' ? '#fca5a5' : '#fbbf24' }}
          >
            {urgency === 'critical' ? '⚠️ หมดเวลาเกือบแล้ว!' : 'คุณยังอยู่ไหม?'}
          </h3>
          <p className="text-white/55 text-xs leading-relaxed">
            ไม่มีการเคลื่อนไหวเกือบ 3 นาที<br />
            ระบบจะส่ง AI เข้าเล่นแทนคุณอัตโนมัติ
          </p>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleStayClick}
          className="w-full py-3 rounded-xl font-bold text-sm text-black tracking-wide transition-all active:scale-95 cursor-pointer shadow-lg"
          style={{
            background: urgency === 'critical'
              ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
              : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            boxShadow: urgency === 'critical'
              ? '0 6px 20px rgba(239,68,68,0.4)'
              : '0 6px 20px rgba(245,158,11,0.4)',
            color: urgency === 'critical' ? '#fff' : '#000',
          }}
        >
          ฉันยังเล่นอยู่
        </button>

        <p className="text-[10px] text-white/25">แตะที่ใดก็ได้เพื่อเล่นต่อ</p>
      </div>
    </div>,
    document.body,
  );
};
