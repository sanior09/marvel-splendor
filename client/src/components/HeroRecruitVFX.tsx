// ============================================================
//  HeroRecruitVFX.tsx -- Cinematic Hero Recruit Visual Effect
//  Hollywood-Grade Marvel VFX with Realistic Impact & Dynamics
// ============================================================

import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');
  const [hasShaken, setHasShaken] = useState(false);

  useEffect(() => {
    // Phase 1 -> Hold slam
    const t1 = setTimeout(() => {
      setPhase('hold');
      setHasShaken(true);
    }, 280);

    // Hold -> Exit
    const t2 = setTimeout(() => setPhase('exit'), 3200);

    // Dismiss
    const t3 = setTimeout(() => onDismiss(), 3550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDismiss]);

  // Cinematic glowing ambient particles (50 floating motes)
  const particles = useMemo(() =>
    Array.from({ length: 48 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2.5 + Math.random() * 6.5,
      delay: Math.random() * 1.5,
      dur: 1.4 + Math.random() * 2.2,
      opacity: 0.35 + Math.random() * 0.55,
      driftX: (Math.random() - 0.5) * 40,
    })), []);

  const isEnter = phase === 'enter';
  const isExit = phase === 'exit';
  const glow = signature.glowColor;
  const accent = signature.accentColor;

  const content = (
    <div
      onClick={onDismiss}
      className={`fixed inset-0 flex items-center justify-center overflow-hidden select-none cursor-pointer ${
        hasShaken && phase === 'hold' ? 'hero-screen-shake-anim' : ''
      }`}
      style={{
        zIndex: 9999,
        opacity: isExit ? 0 : 1,
        transition: isExit ? 'opacity 0.35s ease-in' : 'opacity 0.22s ease-out',
      }}
    >
      {/* 1. Impact Flashbang on Slam */}
      <div
        className="absolute inset-0 pointer-events-none hero-impact-flash"
        style={{
          background: `radial-gradient(circle at 50% 50%, white 0%, ${accent} 40%, transparent 80%)`,
        }}
      />

      {/* 2. Deep Cinematic Vignette & Dynamic Nebula Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${glow} 0%, rgba(5,7,15,0.88) 60%, rgba(2,3,7,0.98) 100%)`,
        }}
      />

      {/* 3. Cinematic Letterbox Bars */}
      <div
        className="hero-vfx-letterbox absolute top-0 left-0 right-0 pointer-events-none z-20"
        style={{
          height: '8.5vh',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.85) 60%, transparent 100%)',
          borderBottom: `1px solid ${accent}33`,
          transform: isEnter ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      <div
        className="hero-vfx-letterbox absolute bottom-0 left-0 right-0 pointer-events-none z-20"
        style={{
          height: '8.5vh',
          background: 'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.85) 60%, transparent 100%)',
          borderTop: `1px solid ${accent}33`,
          transform: isEnter ? 'translateY(100%)' : 'translateY(0)',
          transition: 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />

      {/* 4. Blastwave Shockwaves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="absolute rounded-full hero-shockwave-ring"
          style={{
            borderColor: accent,
            boxShadow: `0 0 45px ${glow}`,
          }}
        />
        <div
          className="absolute rounded-full hero-shockwave-ring"
          style={{
            borderColor: '#ffffff',
            boxShadow: `0 0 35px ${glow}`,
            animationDelay: '0.12s',
          }}
        />
      </div>

      {/* 5. Hero-Specific Signature Grand Visual Effect */}
      {/* ── A. LIGHTNING (Thor / Storm) ── */}
      {signature.vfxType === 'lightning' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="lGlowHero">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Top-Left Bolt */}
            <path
              d="M 50 0 L 220 180 L 170 230 L 410 390 L 350 440 L 520 540"
              stroke="#e0f2fe"
              strokeWidth="5"
              fill="none"
              filter="url(#lGlowHero)"
              className="animate-pulse"
              style={{ animationDuration: '0.2s', animationIterationCount: 'infinite' }}
            />
            {/* Top-Right Bolt */}
            <path
              d="M 1200 0 L 980 180 L 1030 230 L 780 390 L 830 440 L 640 540"
              stroke="#38bdf8"
              strokeWidth="6"
              fill="none"
              filter="url(#lGlowHero)"
              className="animate-pulse"
              style={{ animationDuration: '0.25s', animationDelay: '0.05s', animationIterationCount: 'infinite' }}
            />
            {/* Diagonal Branching Arcs */}
            <path
              d="M 300 280 L 380 260 L 450 330 L 420 380"
              stroke="#67e8f9"
              strokeWidth="3"
              fill="none"
              filter="url(#lGlowHero)"
            />
            <path
              d="M 900 260 L 820 290 L 740 330"
              stroke="#bae6fd"
              strokeWidth="3.5"
              fill="none"
              filter="url(#lGlowHero)"
            />
          </svg>
          <div className="absolute inset-0 bg-sky-400/15 animate-ping" style={{ animationDuration: '0.6s', animationIterationCount: '3' }} />
        </div>
      )}

      {/* ── B. REPULSOR & TACTICAL HUD (Iron Man / Captain Marvel) ── */}
      {signature.vfxType === 'repulsor' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Stark Tech Targeting Reticle */}
          <div
            className="absolute w-[75vmin] h-[75vmin] rounded-full border-2 border-dashed border-amber-400 opacity-60 animate-spin"
            style={{ animationDuration: '14s' }}
          />
          <div
            className="absolute w-[58vmin] h-[58vmin] rounded-full border border-cyan-400 opacity-70 animate-spin"
            style={{ animationDuration: '9s', animationDirection: 'reverse' }}
          />
          {/* Concentric Energy Core */}
          <div
            className="absolute w-[44vmin] h-[44vmin] rounded-full border-2 border-amber-300 opacity-85 animate-pulse"
            style={{ boxShadow: '0 0 40px rgba(251,191,36,0.8), inset 0 0 30px rgba(6,182,212,0.6)' }}
          />
          {/* HUD Crosshairs */}
          <div className="absolute w-[80vw] h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-65" />
          <div className="absolute h-[80vh] w-[1.5px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-65" />
          {/* Intense Unibeam Flare Streak */}
          <div
            className="absolute w-full h-8 opacity-75 animate-pulse"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.3) 20%, rgba(255,255,255,0.95) 50%, rgba(251,191,36,0.3) 80%, transparent)',
              transform: 'rotate(-12deg)',
            }}
          />
        </div>
      )}

      {/* ── C. SHIELD & VIBRANIUM STARBURST (Captain America / Hawkeye) ── */}
      {signature.vfxType === 'shield' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Vibranium Concentric Bands */}
          <div className="absolute w-[78vmin] h-[78vmin] rounded-full border-8 border-red-600 opacity-55 animate-ping" style={{ animationDuration: '1.2s' }} />
          <div className="absolute w-[62vmin] h-[62vmin] rounded-full border-6 border-slate-100 opacity-75 animate-pulse" style={{ boxShadow: '0 0 35px rgba(255,255,255,0.8)' }} />
          <div className="absolute w-[46vmin] h-[46vmin] rounded-full border-8 border-blue-600 opacity-80" />
          {/* Central Gleaming Star Emblem */}
          <div
            className="absolute text-[12vmin] animate-spin"
            style={{
              animationDuration: '18s',
              color: '#fef08a',
              filter: 'drop-shadow(0 0 25px rgba(250,204,21,1)) drop-shadow(0 0 50px rgba(250,204,21,0.6))',
            }}
          >
            &#9733;
          </div>
          {/* Diagonal Shield Ricochet Flash */}
          <div
            className="absolute w-[120vw] h-1.5 opacity-60"
            style={{
              background: 'linear-gradient(to right, transparent, #ef4444, #ffffff, #3b82f6, transparent)',
              transform: 'rotate(35deg)',
            }}
          />
        </div>
      )}

      {/* ── D. SMASH & SEISMIC IMPACT (Hulk / She-Hulk / Deadpool / Wolverine) ── */}
      {signature.vfxType === 'smash' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Massive Seismic Shockwave */}
          <div
            className="absolute w-[88vmin] h-[88vmin] rounded-full border-8 border-emerald-500 opacity-65 animate-ping"
            style={{ animationDuration: '0.75s' }}
          />
          <div
            className="absolute w-[64vmin] h-[64vmin] rounded-full border-4 border-green-300 opacity-80 animate-pulse"
            style={{ boxShadow: '0 0 50px rgba(34,197,94,0.9), inset 0 0 30px rgba(34,197,94,0.6)' }}
          />
          {/* Seismic Ground Fracture Lines SVG */}
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#86efac" strokeWidth="3" fill="none" opacity="0.75" style={{ filter: 'drop-shadow(0 0 10px #22c55e)' }}>
              <path d="M 50% 50% L 35% 30% L 28% 32% L 15% 18%" />
              <path d="M 50% 50% L 65% 28% L 75% 33% L 88% 22%" />
              <path d="M 50% 50% L 38% 70% L 26% 75% L 12% 85%" />
              <path d="M 50% 50% L 68% 72% L 76% 80% L 90% 88%" />
            </g>
          </svg>
          <div className="absolute inset-0 bg-emerald-500/15 animate-pulse" />
        </div>
      )}

      {/* ── E. MYSTIC RUNES & KAMAR-TAJ MANDALA (Doctor Strange / Scarlet Witch / Loki) ── */}
      {signature.vfxType === 'mystic' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Outer Rotating Tao Mandala Ring */}
          <div
            className="absolute w-[74vmin] h-[74vmin] rounded-full border-4 border-dashed border-amber-400 opacity-80 animate-spin"
            style={{
              animationDuration: '10s',
              filter: 'drop-shadow(0 0 24px rgba(245,158,11,0.95))',
            }}
          />
          {/* Reverse Rotating Inner Mandala */}
          <div
            className="absolute w-[54vmin] h-[54vmin] rounded-full border-2 border-orange-400 opacity-90 animate-spin"
            style={{
              animationDuration: '7s',
              animationDirection: 'reverse',
              filter: 'drop-shadow(0 0 18px rgba(249,115,22,0.95))',
            }}
          />
          {/* Eldritch Diamond Core */}
          <div
            className="absolute w-[36vmin] h-[36vmin] border-2 border-yellow-300 opacity-75 animate-spin"
            style={{
              transform: 'rotate(45deg)',
              animationDuration: '5s',
              boxShadow: '0 0 30px rgba(253,224,71,0.7)',
            }}
          />
          {/* Chaos / Mystic Swirling Rays */}
          <div
            className="absolute w-[68vmin] h-[68vmin] rounded-full opacity-40 animate-pulse"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(245,158,11,0.6), transparent, rgba(239,68,68,0.6), transparent)',
            }}
          />
        </div>
      )}

      {/* ── F. SPIDER-WEB TENSILE NETWORK (Spider-Man) ── */}
      {signature.vfxType === 'web' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="webGlow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Radial Web Spines radiating to 8 anchors */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const x2 = 50 + 60 * Math.cos(rad);
              const y2 = 50 + 60 * Math.sin(rad);
              return (
                <line
                  key={idx}
                  x1="50%"
                  y1="50%"
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="rgba(255,255,255,0.75)"
                  strokeWidth="2"
                  filter="url(#webGlow)"
                />
              );
            })}
            {/* Concentric Web Rings */}
            <circle cx="50%" cy="50%" r="18%" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeDasharray="10,6" />
            <circle cx="50%" cy="50%" r="32%" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeDasharray="12,8" />
            <circle cx="50%" cy="50%" r="46%" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="16,10" className="animate-ping" style={{ animationDuration: '1.6s' }} />
          </svg>
        </div>
      )}

      {/* ── G. VIBRANIUM KINETIC MATRIX & CLAW CUTS (Black Panther / Nick Fury) ── */}
      {signature.vfxType === 'vibranium' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Kinetic Energy Shockwave */}
          <div
            className="absolute w-[80vmin] h-[80vmin] rounded-full border-4 border-purple-500 opacity-70 animate-ping"
            style={{ animationDuration: '1.1s', boxShadow: '0 0 40px rgba(168,85,247,0.9)' }}
          />
          <div
            className="absolute w-[56vmin] h-[56vmin] rounded-full border-2 border-fuchsia-400 opacity-85 animate-pulse"
            style={{ boxShadow: '0 0 30px rgba(217,70,239,0.85), inset 0 0 25px rgba(147,51,234,0.6)' }}
          />
          {/* Kinetic Triple Claw Slashes */}
          <div className="absolute w-[45vmin] h-1.5 rounded-full bg-gradient-to-r from-transparent via-purple-300 to-transparent shadow-[0_0_20px_#d946ef] transform -rotate-45 -translate-y-4" />
          <div className="absolute w-[52vmin] h-2 rounded-full bg-gradient-to-r from-transparent via-fuchsia-200 to-transparent shadow-[0_0_25px_#e879f9] transform -rotate-45" />
          <div className="absolute w-[45vmin] h-1.5 rounded-full bg-gradient-to-r from-transparent via-purple-300 to-transparent shadow-[0_0_20px_#d946ef] transform -rotate-45 translate-y-4" />
        </div>
      )}

      {/* ── H. INFINITY ORBIT & COSMIC STONES (Thanos / Jean Grey / Magneto) ── */}
      {signature.vfxType === 'infinity' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* 6 Infinity Stones in Cosmic Orbit */}
          <div
            className="absolute w-[76vmin] h-[76vmin] rounded-full animate-spin"
            style={{ animationDuration: '7.5s' }}
          >
            {[
              { stone: 'Space', color: '#3b82f6', glow: 'rgba(59,130,246,0.9)' },
              { stone: 'Mind', color: '#facc15', glow: 'rgba(250,204,21,0.9)' },
              { stone: 'Reality', color: '#ef4444', glow: 'rgba(239,68,68,0.9)' },
              { stone: 'Power', color: '#a855f7', glow: 'rgba(168,85,247,0.9)' },
              { stone: 'Time', color: '#10b981', glow: 'rgba(16,185,129,0.9)' },
              { stone: 'Soul', color: '#f97316', glow: 'rgba(249,115,22,0.9)' },
            ].map((s, idx) => (
              <div
                key={idx}
                className="absolute w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${idx * 60}deg) translateY(-38vmin) translate(-50%, -50%)`,
                  background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${s.color} 55%, #000000 100%)`,
                  boxShadow: `0 0 16px 5px ${s.glow}, 0 0 35px ${s.glow}`,
                }}
              />
            ))}
          </div>
          {/* Golden Cosmic Distortion Singularity */}
          <div
            className="absolute w-[86vmin] h-[86vmin] rounded-full border-4 border-amber-400 opacity-60 animate-ping"
            style={{ animationDuration: '1.25s', boxShadow: '0 0 50px rgba(251,191,36,0.8)' }}
          />
          <div
            className="absolute w-[60vmin] h-[60vmin] rounded-full border-2 border-yellow-200 opacity-75 animate-pulse"
            style={{ boxShadow: 'inset 0 0 40px rgba(234,179,8,0.7)' }}
          />
        </div>
      )}

      {/* 6. Floating Cosmic Spark Embers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: accent,
              opacity: p.opacity,
              boxShadow: `0 0 ${Math.round(p.size * 2.5)}px ${Math.round(p.size)}px ${glow}`,
              animation: `hero-particle-float ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* 7. Precision Laser Scanline Sweep */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-10"
        style={{
          height: '3px',
          background: `linear-gradient(to right, transparent, ${accent}88, #ffffff, ${accent}88, transparent)`,
          boxShadow: `0 0 20px ${glow}, 0 0 40px #ffffff`,
          animation: 'scan-down 2.4s ease-in-out infinite',
        }}
      />

      {/* 8. Central Hero Card Container (Cinematic Slam Entrance) */}
      <div
        className="hero-vfx-wrapper relative z-20 flex flex-col items-center max-w-xs w-full mx-4"
        style={{
          transform: isEnter ? 'scale(0.35) translateY(60px)' : 'scale(1) translateY(0)',
          opacity: isEnter ? 0 : 1,
          transition: 'transform 0.42s cubic-bezier(0.18, 1.25, 0.4, 1), opacity 0.25s ease-out',
        }}
      >
        {/* Recruiter Badge (Standard Portrait Mode) */}
        <div
          className="hero-vfx-top-tag mb-2.5 sm:mb-3 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-2xl shrink-0"
          style={{
            background: 'rgba(5, 7, 15, 0.92)',
            border: `1.5px solid ${accent}`,
            color: accent,
            boxShadow: `0 0 24px ${glow}, inset 0 0 12px ${glow.replace(/[\d.]+\)$/, '0.3)')}`,
            backdropFilter: 'blur(16px)',
          }}
        >
          <span className="text-sm">{isMyPlayer ? '\u2605' : '\u25BA'}</span>
          <span>{isMyPlayer ? 'YOU RECRUITED' : `${playerName.toUpperCase()} RECRUITED`}</span>
        </div>

        {/* Glowing Holographic Card Frame */}
        <div
          className="hero-vfx-card relative p-3 sm:p-3.5 rounded-2xl backdrop-blur-2xl shadow-2xl flex flex-col items-center overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(12,14,28,0.97), rgba(4,5,14,0.99))',
            border: `2px solid ${accent}`,
            boxShadow: `0 0 60px ${glow}, 0 0 120px ${glow.replace(/[\d.]+\)$/, '0.35)')}, 0 28px 70px rgba(0,0,0,0.95)`,
          }}
        >
          {/* Animated Holographic Prism Sheen */}
          <div
            className="absolute inset-0 pointer-events-none hero-sheen-sweep"
            style={{
              background: `linear-gradient(115deg, transparent 20%, ${accent}33 45%, rgba(255,255,255,0.45) 50%, ${accent}33 55%, transparent 80%)`,
            }}
          />

          {/* Portrait Container */}
          <div className="hero-vfx-portrait relative rounded-xl overflow-hidden border border-white/25 shadow-2xl bg-black/80 shrink-0">
            <img
              src={`/images/cards/${card.id}.jpg`}
              alt={card.name}
              className="w-full h-full object-cover object-center"
              style={{
                transform: 'scale(1.06)',
                filter: `brightness(1.15) saturate(1.25) drop-shadow(0 0 12px ${accent})`,
              }}
            />
            {/* Radial Core Glow */}
            <div
              className="absolute inset-0 animate-pulse"
              style={{ background: `radial-gradient(circle at 50% 25%, ${accent}30 0%, transparent 70%)` }}
            />

            {/* Avengers Crest */}
            {(() => {
              const count =
                typeof card.avengersCount === 'number'
                  ? card.avengersCount
                  : typeof card.avengersSymbol === 'number'
                  ? card.avengersSymbol
                  : card.avengersSymbol
                  ? 1
                  : 0;
              if (count <= 0) return null;
              return (
                <div className="absolute top-1.5 right-1.5 flex items-center -space-x-1.5 sm:-space-x-2 z-10">
                  {Array.from({ length: count }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-950 border-2 border-yellow-300 flex items-center justify-center font-black text-yellow-300 shadow-xl text-xs sm:text-base"
                    >
                      A
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Victory Points Badge */}
            {card.points > 0 && (
              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/90 border border-yellow-400/60 font-black text-yellow-300 text-xs sm:text-sm shadow-lg z-10">
                {card.points} PTS
              </div>
            )}
          </div>

          {/* Hero Identification Information Block */}
          <div className="hero-vfx-info mt-2.5 sm:mt-3 text-center px-1 sm:px-2 z-10 w-full">
            {/* Side Recruiter Tag (Landscape view) */}
            <div
              className="hero-vfx-side-tag hidden mb-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase items-center gap-1.5 shadow-xl shrink-0"
              style={{
                background: 'rgba(5, 7, 15, 0.92)',
                border: `1.5px solid ${accent}`,
                color: accent,
                boxShadow: `0 0 18px ${glow}`,
              }}
            >
              <span>{isMyPlayer ? '\u2605' : '\u25BA'}</span>
              <span>{isMyPlayer ? 'YOU RECRUITED' : `${playerName.toUpperCase()} RECRUITED`}</span>
            </div>

            {/* Hero Main English Title with Signature Glow */}
            <div
              className="hero-vfx-title font-black text-lg sm:text-2xl tracking-widest uppercase flex items-center justify-center gap-2 leading-tight"
              style={{
                color: accent,
                textShadow: `0 0 25px ${glow}, 0 0 50px ${glow}`,
              }}
            >
              <span className="text-xl sm:text-2xl shrink-0">{signature.icon}</span>
              <span className="break-words">{signature.titleEn}</span>
            </div>

            {/* Thai Title */}
            <div className="hero-vfx-th text-white/90 text-[11px] sm:text-xs font-semibold mt-1 tracking-wider">
              {signature.titleTh}
            </div>

            {/* Epic Tagline */}
            <div
              className="hero-vfx-tagline mt-1.5 sm:mt-2 px-3 py-1 rounded-lg text-[10px] sm:text-xs font-medium italic shadow-inner"
              style={{
                background: `${accent}22`,
                border: `1px solid ${accent}55`,
                color: 'rgba(255, 255, 235, 0.95)',
              }}
            >
              {signature.tagline}
            </div>

            {/* Tap to dismiss hint for landscape */}
            <div className="hero-vfx-side-dismiss hidden mt-2 text-[10px] text-white/45 tracking-widest">
              (แตะที่ใดก็ได้เพื่อปิด / Click anywhere to dismiss)
            </div>
          </div>
        </div>

        {/* Tap to dismiss hint for vertical */}
        <div className="hero-vfx-bottom-dismiss mt-3 text-[11px] sm:text-xs text-white/40 tracking-widest">
          (แตะที่ใดก็ได้เพื่อปิด / Click anywhere to dismiss)
        </div>
      </div>

      {/* Keyframe Animations & Responsive Engine */}
      <style>{`
        @keyframes scan-down {
          0%   { top: -4px; opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        @keyframes hero-impact-flash {
          0%   { opacity: 0.95; }
          100% { opacity: 0; }
        }

        .hero-impact-flash {
          animation: hero-impact-flash 0.45s ease-out forwards;
        }

        @keyframes hero-shockwave {
          0% {
            width: 10vmin;
            height: 10vmin;
            border-width: 8px;
            opacity: 1;
          }
          100% {
            width: 140vmin;
            height: 140vmin;
            border-width: 1.5px;
            opacity: 0;
          }
        }

        .hero-shockwave-ring {
          border-style: solid;
          animation: hero-shockwave 1.1s cubic-bezier(0.1, 0.8, 0.25, 1) forwards;
        }

        @keyframes hero-screen-shake {
          0%   { transform: translate(0, 0) scale(1); }
          15%  { transform: translate(-5px, 6px) scale(1.015); }
          30%  { transform: translate(6px, -5px) scale(0.995); }
          45%  { transform: translate(-4px, 4px) scale(1.01); }
          60%  { transform: translate(4px, -2px) scale(1.005); }
          75%  { transform: translate(-2px, 2px) scale(1); }
          100% { transform: translate(0, 0) scale(1); }
        }

        .hero-screen-shake-anim {
          animation: hero-screen-shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        @keyframes hero-particle-float {
          0%   { transform: translateY(0) scale(1); }
          100% { transform: translateY(-24px) scale(1.25); }
        }

        @keyframes hero-sheen {
          0%   { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }

        .hero-sheen-sweep {
          animation: hero-sheen 3s ease-in-out infinite;
        }

        /* Default Portrait Dimensions */
        .hero-vfx-portrait {
          width: 11.5rem;
          height: 15.5rem;
        }

        @media (min-width: 640px) and (min-height: 561px) {
          .hero-vfx-portrait {
            width: 13.5rem;
            height: 18.5rem;
          }
        }

        /* ── Compact Landscape Mode (Mobile Screen Rotated Horizontally) ── */
        @media (max-height: 560px) {
          .hero-vfx-letterbox {
            height: 3.5vh !important;
          }
          .hero-vfx-wrapper {
            max-width: min(94vw, 580px) !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .hero-vfx-top-tag {
            display: none !important;
          }
          .hero-vfx-bottom-dismiss {
            display: none !important;
          }
          .hero-vfx-side-tag {
            display: inline-flex !important;
          }
          .hero-vfx-side-dismiss {
            display: block !important;
          }
          .hero-vfx-card {
            flex-direction: row !important;
            align-items: center !important;
            gap: 1.2rem !important;
            padding: 0.65rem 1.15rem !important;
            width: 100% !important;
          }
          .hero-vfx-portrait {
            width: auto !important;
            height: min(68vh, 215px) !important;
            aspect-ratio: 3 / 4.1 !important;
          }
          .hero-vfx-info {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            text-align: left !important;
            margin-top: 0 !important;
            flex: 1 1 0% !important;
            min-width: 0 !important;
          }
          .hero-vfx-title {
            justify-content: flex-start !important;
            text-align: left !important;
            font-size: clamp(0.95rem, 3.4vw, 1.25rem) !important;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
};
