// ============================================================
//  HeroRecruitVFX.tsx — Signature Visual Effect Overlay
// ============================================================
//  Fires when a major Marvel hero is recruited/bought.
//  Renders dynamic SVG/CSS particle animations, signature card,
//  and recruiter banner without blocking background game state.
// ============================================================

import React, { useEffect, useState } from 'react';
import type { HeroSignature } from '../data/heroSignatures';
import type { Card } from '@shared/types/game.types';

interface HeroRecruitVFXProps {
  signature: HeroSignature;
  card: Card;
  playerName: string;
  isMyPlayer: boolean;
  onDismiss: () => void;
}

export const HeroRecruitVFX: React.FC<HeroRecruitVFXProps> = ({
  signature,
  card,
  playerName,
  isMyPlayer,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 2.3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Allow fade-out transition
    }, 2200);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-300 select-none cursor-pointer ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* ── 1. Ambient Backdrop Flash ─────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none animate-pulse duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${signature.glowColor} 0%, rgba(0, 0, 0, 0.75) 75%)`,
        }}
      />

      {/* ── 2. Signature Animated VFX by Hero Type ───────────── */}

      {/* A. Lightning VFX (Thor & Storm) */}
      {signature.vfxType === 'lightning' && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="lightningGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Branching lightning bolts */}
            <path
              d="M 100 0 L 250 160 L 220 220 L 450 320 L 420 370 L 560 500"
              stroke="#e0f2fe"
              strokeWidth="4"
              fill="none"
              filter="url(#lightningGlow)"
              className="animate-ping"
              style={{ animationDuration: '0.4s', animationIterationCount: 3 }}
            />
            <path
              d="M 1100 0 L 950 180 L 980 230 L 780 340 L 810 390 L 660 500"
              stroke="#38bdf8"
              strokeWidth="4"
              fill="none"
              filter="url(#lightningGlow)"
              className="animate-ping"
              style={{ animationDuration: '0.5s', animationIterationCount: 3 }}
            />
            <path
              d="M 200 600 L 400 480 L 370 430 L 560 380"
              stroke="#bae6fd"
              strokeWidth="3"
              fill="none"
              filter="url(#lightningGlow)"
              className="animate-pulse"
            />
            <path
              d="M 1000 600 L 800 480 L 830 430 L 660 380"
              stroke="#38bdf8"
              strokeWidth="3"
              fill="none"
              filter="url(#lightningGlow)"
              className="animate-pulse"
            />
          </svg>
        </div>
      )}

      {/* B. Repulsor Blast VFX (Iron Man) */}
      {signature.vfxType === 'repulsor' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Concentric Arc Reactor energy pulses */}
          <div className="absolute w-[450px] h-[450px] rounded-full border-4 border-amber-400/80 animate-ping opacity-75" />
          <div className="absolute w-[320px] h-[320px] rounded-full border-2 border-cyan-400/90 animate-pulse" />
          {/* Repulsor laser beam flash across the screen */}
          <div className="absolute w-full h-8 bg-gradient-to-r from-transparent via-amber-300 to-transparent blur-sm transform -rotate-12 animate-pulse" />
          <div className="absolute w-full h-2 bg-gradient-to-r from-transparent via-cyan-200 to-transparent transform rotate-12" />
        </div>
      )}

      {/* C. Vibranium Shield Ricochet VFX (Captain America) */}
      {signature.vfxType === 'shield' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Concentric red & blue shield rings */}
          <div className="absolute w-[460px] h-[460px] rounded-full border-8 border-red-500/50 animate-ping" />
          <div className="absolute w-[360px] h-[360px] rounded-full border-4 border-blue-400/80 animate-pulse" />
          <div className="absolute w-[260px] h-[260px] rounded-full border-2 border-white/90" />
          {/* Star flare glint */}
          <div className="absolute text-8xl text-yellow-300 filter drop-shadow-[0_0_25px_rgba(253,224,71,0.9)] animate-spin-slow">
            ★
          </div>
        </div>
      )}

      {/* D. Gamma Ground Smash VFX (Hulk) */}
      {signature.vfxType === 'smash' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Expanding green shockwaves */}
          <div className="absolute w-[600px] h-[600px] rounded-full border-8 border-emerald-500/70 animate-ping" />
          <div className="absolute w-[400px] h-[400px] rounded-full border-4 border-green-400/90 animate-pulse" />
          {/* Screen fissure energy bursts */}
          <div className="absolute inset-0 bg-green-500/10 animate-pulse" />
        </div>
      )}

      {/* E. Mystic Mandala Rune Circles VFX (Doctor Strange) */}
      {signature.vfxType === 'mystic' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Outer rotating Eldritch mandala ring */}
          <div className="absolute w-[420px] h-[420px] rounded-full border-4 border-dashed border-orange-400/80 animate-spin-slow filter drop-shadow-[0_0_20px_rgba(249,115,22,0.8)]" />
          {/* Inner counter-rotating geometric ring */}
          <div
            className="absolute w-[300px] h-[300px] rounded-full border-2 border-amber-300/90 animate-spin filter drop-shadow-[0_0_15px_rgba(245,158,11,0.9)]"
            style={{ animationDirection: 'reverse', animationDuration: '6s' }}
          />
          {/* Mystic square runes */}
          <div className="absolute w-[220px] h-[220px] border-2 border-orange-300/60 transform rotate-45" />
        </div>
      )}

      {/* F. Web Shooter Burst VFX (Spider-Man) */}
      {signature.vfxType === 'web' && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="0" x2="560" y2="300" stroke="white" strokeWidth="2.5" strokeDasharray="6,4" className="animate-pulse" />
            <line x1="1200" y1="0" x2="660" y2="300" stroke="white" strokeWidth="2.5" strokeDasharray="6,4" className="animate-pulse" />
            <line x1="0" y1="600" x2="560" y2="340" stroke="white" strokeWidth="2.5" strokeDasharray="6,4" className="animate-pulse" />
            <line x1="1200" y1="600" x2="660" y2="340" stroke="white" strokeWidth="2.5" strokeDasharray="6,4" className="animate-pulse" />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-white/40 animate-ping" />
        </div>
      )}

      {/* G. Vibranium Kinetic Pulse VFX (Black Panther) */}
      {signature.vfxType === 'vibranium' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="absolute w-[500px] h-[500px] rounded-full border-4 border-purple-500/80 animate-ping" />
          <div className="absolute w-[340px] h-[340px] rounded-full border-2 border-fuchsia-400/90 animate-pulse" />
          {/* Claw slash accents */}
          <div className="absolute w-72 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent transform -rotate-45" />
          <div className="absolute w-72 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent transform -rotate-30 translate-y-4" />
        </div>
      )}

      {/* H. Cosmic Infinity Gauntlet VFX (Thanos) */}
      {signature.vfxType === 'infinity' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* 6 Infinity Stones orbiting flash */}
          <div className="absolute w-[440px] h-[440px] rounded-full border-2 border-yellow-400/60 animate-spin-slow">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl drop-shadow-[0_0_10px_#eab308]">🟡</span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xl drop-shadow-[0_0_10px_#3b82f6]">🔵</span>
            <span className="absolute top-1/2 -left-3 -translate-y-1/2 text-xl drop-shadow-[0_0_10px_#ef4444]">🔴</span>
            <span className="absolute top-1/2 -right-3 -translate-y-1/2 text-xl drop-shadow-[0_0_10px_#a855f7]">🟣</span>
            <span className="absolute top-1/4 left-6 text-xl drop-shadow-[0_0_10px_#f97316]">🟠</span>
            <span className="absolute top-1/4 right-6 text-xl drop-shadow-[0_0_10px_#10b981]">🟢</span>
          </div>
          <div className="absolute w-[520px] h-[520px] rounded-full border-4 border-amber-400/60 animate-ping" />
        </div>
      )}

      {/* ── 3. Central Hero Splash Card & Banner ────────────────── */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full mx-4 transform animate-in zoom-in-95 duration-200">
        {/* Recruiter Headline Tag */}
        <div className="mb-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md border shadow-lg bg-black/60 border-white/20 text-white flex items-center gap-1.5">
          <span>{isMyPlayer ? '⭐ YOU ASSEMBLED' : '📢 HERO RECRUITED BY'}</span>
          <span className="text-yellow-300 font-extrabold">{playerName}</span>
        </div>

        {/* Hero Card Visual Container */}
        <div
          className={`relative p-3 rounded-2xl border-2 backdrop-blur-xl shadow-2xl bg-gradient-to-b ${signature.bgGradient} transition-all transform hover:scale-105`}
          style={{
            borderColor: signature.accentColor,
            boxShadow: `0 0 35px ${signature.glowColor}, 0 10px 40px rgba(0,0,0,0.8)`,
          }}
        >
          {/* Card Portrait */}
          <div className="relative w-44 h-60 sm:w-48 sm:h-64 rounded-xl overflow-hidden border border-white/20 shadow-inner bg-black/50">
            <img
              src={`/images/cards/${card.id}.jpg`}
              alt={card.name}
              className="w-full h-full object-cover object-center transform scale-105"
            />
            {/* Avengers Symbol badge if present */}
            {card.avengersSymbol && (
              <div
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border border-yellow-200 flex items-center justify-center font-black text-black shadow-lg text-sm"
                title="Avengers Symbol"
              >
                A
              </div>
            )}
            {/* Victory points badge */}
            {card.points > 0 && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 border border-white/20 font-black text-yellow-300 text-sm shadow">
                {card.points} PTS
              </div>
            )}
          </div>

          {/* Hero Name & Titles */}
          <div className="mt-3 text-center">
            <div
              className="font-black text-lg sm:text-xl tracking-wider uppercase drop-shadow flex items-center justify-center gap-1.5"
              style={{ color: signature.accentColor }}
            >
              <span>{signature.icon}</span>
              <span>{signature.titleEn}</span>
            </div>
            <div className="text-white/90 text-xs font-semibold mt-0.5">
              {signature.titleTh}
            </div>
            <div className="text-[11px] text-yellow-200/80 font-medium italic mt-1 px-2">
              "{signature.tagline}"
            </div>
          </div>
        </div>

        {/* Hint text to dismiss */}
        <div className="mt-2 text-[10px] text-white/40 tracking-wider">
          (แตะที่ใดก็ได้เพื่อปิด / Click anywhere to dismiss)
        </div>
      </div>
    </div>
  );
};
