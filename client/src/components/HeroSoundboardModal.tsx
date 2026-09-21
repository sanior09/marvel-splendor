// ============================================================
//  HeroSoundboardModal.tsx — Marvel Splendor Hero Sound Lab
// ============================================================
//  Interactive soundboard and audio showcase for all Marvel heroes
//  and Infinity Stones procedural sound synthesis effects.
// ============================================================

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  HERO_SIGNATURES,
  HERO_SOUND_STAGES,
  playHeroSignatureSound,
  type HeroSignature,
} from '../data/heroSignatures';
import { soundManager } from '../utils/soundManager';
import { HeroRecruitVFX } from './HeroRecruitVFX';
import type { Card } from '@shared/types/game.types';

interface HeroSoundboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SoundboardTab = 'all' | 'avengers' | 'cosmic_mystic' | 'mutants_street' | 'game_sfx';

// Categorize heroes
const AVENGERS_IDS = new Set([
  'thor',
  'iron_man',
  'captain_america',
  'hulk',
  'black_widow',
  'hawkeye',
  'black_panther',
  'nick_fury',
  'she_hulk',
]);

const COSMIC_MYSTIC_IDS = new Set([
  'doctor_strange',
  'thanos',
  'scarlet_witch',
  'captain_marvel',
  'loki',
  'jean_grey',
]);

const MUTANTS_STREET_IDS = new Set([
  'spider_man',
  'wolverine',
  'deadpool',
  'magneto',
  'storm',
  'groot',
  'star_lord',
]);

// Infinity Stone SFX items
const STONE_SFX_ITEMS = [
  { id: 'topaz', name: 'Mind Stone (จิตใจ)', color: 'topaz', note: '1046.5Hz (C6) ระฆังแก้วกังวานใส', icon: '🟡' },
  { id: 'sapphire', name: 'Space Stone (อวกาศ)', color: 'sapphire', note: '880.0Hz (A5) คลื่นคริสตัลบริสุทธิ์', icon: '🔵' },
  { id: 'obsidian', name: 'Soul Stone (วิญญาณ)', color: 'obsidian', note: '698.5Hz (F5) ก้องกังวานอบอุ่นลึก', icon: '🟠' },
  { id: 'amethyst', name: 'Power Stone (พลัง)', color: 'amethyst', note: '784.0Hz (G5) คลื่นสะท้อนพลังงานม่วง', icon: '🟣' },
  { id: 'ruby', name: 'Reality Stone (ความเป็นจริง)', color: 'ruby', note: '587.3Hz (D5) แรงกระแทกหนักแน่นสีแดง', icon: '🔴' },
  { id: 'emerald', name: 'Time Stone (กาลเวลา)', color: 'emerald', note: '1174.7Hz (D6) ประกายกาลเวลาสูงใส', icon: '🟢' },
  { id: 'gold', name: 'S.H.I.E.L.D. Gold (เหรียญทอง)', color: 'gold', note: '932.3Hz (Bb5) โลหะทหารสะท้อน', icon: '🪙' },
] as const;

export const HeroSoundboardModal: React.FC<HeroSoundboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<SoundboardTab>('all');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(() => soundManager.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.isMuted());
  const [vfxPreviewSignature, setVfxPreviewSignature] = useState<HeroSignature | null>(null);

  useEffect(() => {
    const unsub = soundManager.subscribe((muted) => {
      setIsMuted(muted);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handlePlayHeroSound = (hero: HeroSignature) => {
    setActivePlayingId(hero.id);
    playHeroSignatureSound(hero);

    // Reset active indicator after sound finishes (approx 2.5s)
    setTimeout(() => {
      setActivePlayingId((curr) => (curr === hero.id ? null : curr));
    }, 2500);
  };

  const handlePreviewWithVFX = (hero: HeroSignature) => {
    setVfxPreviewSignature(hero);
    playHeroSignatureSound(hero);
  };

  const handleRandomSound = () => {
    const randomHero = HERO_SIGNATURES[Math.floor(Math.random() * HERO_SIGNATURES.length)];
    if (randomHero) {
      handlePlayHeroSound(randomHero);
    }
  };

  const handleStopAll = () => {
    soundManager.stopAll();
    setActivePlayingId(null);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundManager.setVolume(val);
  };

  const handleToggleMute = () => {
    soundManager.toggleMute();
  };

  // Filter heroes by tab
  const filteredHeroes = HERO_SIGNATURES.filter((hero) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'avengers') return AVENGERS_IDS.has(hero.id);
    if (activeTab === 'cosmic_mystic') return COSMIC_MYSTIC_IDS.has(hero.id);
    if (activeTab === 'mutants_street') return MUTANTS_STREET_IDS.has(hero.id);
    return false;
  });

  // Dummy card for VFX preview
  const dummyCard: Card = {
    id: 'preview_9999',
    tier: 3,
    name: vfxPreviewSignature?.name || 'Hero',
    points: 4,
    bonusColor: 'ruby',
    cost: { gold: 0, ruby: 0, sapphire: 0, emerald: 0, obsidian: 0, topaz: 0, amethyst: 0 },
    avengersSymbol: false,
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => {
          soundManager.playModalClose();
          onClose();
        }}
      />

      {/* Modal Container */}
      <div className="relative glass-strong rounded-2xl border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.95)] max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-slide-up z-10 bg-slate-950/95">
        {/* Header */}
        <header className="px-3 sm:px-6 py-3 border-b border-white/10 flex flex-wrap items-center justify-between bg-gradient-to-r from-cyan-950/70 via-blue-950/50 to-slate-950 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              🎧
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm sm:text-lg font-black text-white uppercase tracking-wider">
                  ห้องทดสอบเสียงฮีโร่ (MARVEL AUDIO LAB)
                </h2>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  100% Web Audio Synthesizer
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/60">
                ทดสอบฟังซาวด์เอฟเฟกต์มัลติสเตจของฮีโร่และมณีแบบแยกเดี่ยวได้ทันที
              </p>
            </div>
          </div>

          {/* Master Audio Controls Bar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Volume slider */}
            <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 px-2.5 py-1 rounded-xl">
              <span className="text-xs">{isMuted || volume === 0 ? '🔇' : '🔊'}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                title={`ระดับเสียง SFX: ${Math.round(volume * 100)}%`}
              />
              <span className="text-[10px] font-mono text-cyan-300 w-8 text-right">
                {isMuted ? 'ปิด' : `${Math.round(volume * 100)}%`}
              </span>
            </div>

            {/* Mute toggle */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={`px-2.5 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isMuted
                  ? 'bg-red-950/60 border-red-500/40 text-red-300 hover:bg-red-900/60'
                  : 'bg-white/10 border-white/20 text-yellow-300 hover:bg-white/20'
              }`}
              title={isMuted ? 'เปิดเสียง (Unmute)' : 'ปิดเสียง (Mute)'}
            >
              {isMuted ? '🔇 เสียงปิดอยู่' : '🔊 เสียงเปิด'}
            </button>

            {/* Random Sound Button */}
            <button
              type="button"
              onClick={handleRandomSound}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/25 to-yellow-500/25 hover:from-amber-500/40 hover:to-yellow-500/40 border border-yellow-400/50 text-yellow-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95 shadow"
              title="สุ่มฟังเสียงฮีโร่"
            >
              <span>🎲</span>
              <span className="hidden sm:inline">สุ่มฟัง</span>
            </button>

            {/* Stop Button */}
            <button
              type="button"
              onClick={handleStopAll}
              className="px-2.5 py-1 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95"
              title="หยุดเสียงทั้งหมดทันที"
            >
              <span>⏹️</span>
              <span className="hidden sm:inline">หยุดเสียง</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playModalClose();
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-red-600/80 text-white/80 hover:text-white flex items-center justify-center text-base transition-colors cursor-pointer border border-white/15"
              aria-label="Close soundboard"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="px-3 sm:px-6 py-2 bg-black/60 border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)] font-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>🌟</span>
            <span>ฮีโร่ทั้งหมด ({HERO_SIGNATURES.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avengers')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'avengers'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)] font-black'
                : 'bg-white/5 text-red-300/80 hover:bg-white/10'
            }`}
          >
            <span>⚡</span>
            <span>Avengers ({HERO_SIGNATURES.filter((h) => AVENGERS_IDS.has(h.id)).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cosmic_mystic')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cosmic_mystic'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] font-black'
                : 'bg-white/5 text-purple-300/80 hover:bg-white/10'
            }`}
          >
            <span>🔮</span>
            <span>เวทมนตร์ & คอสมิก ({HERO_SIGNATURES.filter((h) => COSMIC_MYSTIC_IDS.has(h.id)).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mutants_street')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'mutants_street'
                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)] font-black'
                : 'bg-white/5 text-amber-300/80 hover:bg-white/10'
            }`}
          >
            <span>🧬</span>
            <span>มิวแทนท์ & พิทักษ์เมือง ({HERO_SIGNATURES.filter((h) => MUTANTS_STREET_IDS.has(h.id)).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('game_sfx')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'game_sfx'
                ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)] font-black'
                : 'bg-white/5 text-emerald-300/80 hover:bg-white/10'
            }`}
          >
            <span>💎</span>
            <span>เสียงระบบเกม & มณี</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5">
          {activeTab !== 'game_sfx' ? (
            /* Hero Sound Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredHeroes.map((hero) => {
                const isPlaying = activePlayingId === hero.id;
                const stageInfo = HERO_SOUND_STAGES[hero.soundKey];

                return (
                  <div
                    key={hero.id}
                    className={`relative rounded-xl border transition-all duration-300 flex flex-col justify-between overflow-hidden p-3.5 bg-gradient-to-br ${
                      hero.bgGradient
                    } ${
                      isPlaying
                        ? 'ring-2 scale-[1.02] shadow-[0_0_25px_rgba(255,255,255,0.2)]'
                        : 'hover:border-white/40 hover:shadow-lg'
                    }`}
                    style={{
                      borderColor: isPlaying ? hero.accentColor : 'rgba(255,255,255,0.15)',
                    }}
                  >
                    {/* Top Row: Hero Identity & Stages Badge */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {/* Hero Icon */}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border border-white/20 shrink-0 relative"
                            style={{
                              backgroundColor: `${hero.accentColor}25`,
                              boxShadow: isPlaying ? `0 0 15px ${hero.accentColor}` : undefined,
                            }}
                          >
                            <span>{hero.icon}</span>
                            {/* Live Soundwave Equalizer when playing */}
                            {isPlaying && (
                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                              </span>
                            )}
                          </div>

                          {/* Hero Title */}
                          <div className="min-w-0">
                            <h3 className="font-display font-black text-sm text-white tracking-wide truncate">
                              {hero.name}
                            </h3>
                            <p className="text-[11px] text-white/80 font-medium truncate">
                              {hero.titleTh}
                            </p>
                          </div>
                        </div>

                        {/* Stage Count Badge */}
                        <div
                          className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border shrink-0"
                          style={{
                            backgroundColor: `${hero.accentColor}20`,
                            borderColor: `${hero.accentColor}50`,
                            color: hero.accentColor,
                          }}
                        >
                          {stageInfo ? `${stageInfo.stageCount} STAGES` : 'SIGNATURE'}
                        </div>
                      </div>

                      {/* Tagline */}
                      <p className="text-[11px] text-white/70 italic line-clamp-1 border-l-2 pl-2 border-white/20">
                        "{hero.tagline}"
                      </p>

                      {/* Sound Stages List */}
                      {stageInfo && (
                        <div className="space-y-1 bg-black/40 rounded-lg p-2 border border-white/10 text-[10px]">
                          <div className="text-white/50 font-bold uppercase tracking-wider text-[9px] flex items-center justify-between">
                            <span>โครงสร้างคลื่นเสียง (Audio Blueprint):</span>
                            {isPlaying && (
                              <span className="text-cyan-300 animate-pulse font-bold">
                                กำลังสังเคราะห์เสียง...
                              </span>
                            )}
                          </div>
                          {stageInfo.stages.map((stage, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-1.5 transition-colors ${
                                isPlaying ? 'text-yellow-200' : 'text-white/75'
                              }`}
                            >
                              <span className="text-[8px] opacity-60">🔹</span>
                              <span className="truncate">{stage}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2 pt-3 mt-2 border-t border-white/10">
                      {/* Main Play Sound Button */}
                      <button
                        type="button"
                        onClick={() => handlePlayHeroSound(hero)}
                        className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow active:scale-95 ${
                          isPlaying
                            ? 'bg-yellow-400 text-black font-black animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                            : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                        }`}
                        style={{
                          backgroundColor: isPlaying ? hero.accentColor : undefined,
                          color: isPlaying ? '#000000' : undefined,
                        }}
                      >
                        <span>{isPlaying ? '🔊' : '▶'}</span>
                        <span>{isPlaying ? 'กำลังเล่นเสียง...' : 'ฟังเสียง'}</span>
                      </button>

                      {/* Preview with VFX Overlay */}
                      <button
                        type="button"
                        onClick={() => handlePreviewWithVFX(hero)}
                        className="py-1.5 px-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer hover:border-white/40 active:scale-95"
                        title="ดูเอฟเฟกต์การเปิดตัวพร้อมเสียง"
                      >
                        <span>✨</span>
                        <span className="hidden sm:inline">ดู VFX</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Game SFX & Stones Section */
            <div className="space-y-6">
              {/* Infinity Stones SFX */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💎</span>
                  <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                    เสียงมณีอินฟินิตี้ทั้ง 6 สี (INFINITY STONES CHIMES)
                  </h3>
                </div>
                <p className="text-xs text-white/60">
                  เสียงสังเคราะห์คริสตัลฮาร์โมนิกบริสุทธิ์ของมณีแต่ละเม็ด (Detuned Sine/Triangle Bell Synthesis)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {STONE_SFX_ITEMS.map((stone) => (
                    <button
                      key={stone.id}
                      type="button"
                      onClick={() => soundManager.playGemClick(stone.color as any)}
                      className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/15 hover:border-yellow-400/60 transition-all flex items-center gap-3 text-left cursor-pointer group shadow hover:scale-102 active:scale-95"
                    >
                      <div className="w-10 h-10 rounded-lg bg-black/60 p-1 border border-white/20 shrink-0 flex items-center justify-center">
                        <img
                          src={`/images/tokens/${stone.color}.png`}
                          alt={stone.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white group-hover:text-yellow-300 transition-colors truncate">
                          {stone.name}
                        </div>
                        <div className="text-[10px] text-white/60 font-mono truncate">
                          {stone.note}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Game System Fanfares */}
              <div className="space-y-2 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎺</span>
                  <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                    เสียงแฟนฟาร์ระบบในเกม (GAME EVENT FANFARES)
                  </h3>
                </div>
                <p className="text-xs text-white/60">
                  เสียงดนตรีแฟนฟาร์และเอฟเฟกต์การกระทำต่างๆ ในเกม
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => soundManager.playCardBuy(1)}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/15 hover:border-slate-400 text-left transition-all cursor-pointer flex items-center gap-2.5"
                  >
                    <span className="text-xl">🃏</span>
                    <div>
                      <div className="text-xs font-bold text-white">ซื้อการ์ด Tier I</div>
                      <div className="text-[10px] text-white/50">เสียงรับสมัครฮีโร่ระดับ 1</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => soundManager.playCardBuy(2)}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/15 hover:border-purple-400 text-left transition-all cursor-pointer flex items-center gap-2.5"
                  >
                    <span className="text-xl">🎴</span>
                    <div>
                      <div className="text-xs font-bold text-purple-300">ซื้อการ์ด Tier II</div>
                      <div className="text-[10px] text-white/50">เสียงคอร์ดสังเคราะห์ระดับ 2</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => soundManager.playCardBuy(3)}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/15 hover:border-amber-400 text-left transition-all cursor-pointer flex items-center gap-2.5"
                  >
                    <span className="text-xl">👑</span>
                    <div>
                      <div className="text-xs font-bold text-amber-300">ซื้อการ์ด Tier III</div>
                      <div className="text-[10px] text-white/50">เสียงแฟนฟาร์อลังการระดับ 3</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => soundManager.playCardReserve()}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/15 hover:border-blue-400 text-left transition-all cursor-pointer flex items-center gap-2.5"
                  >
                    <span className="text-xl">📥</span>
                    <div>
                      <div className="text-xs font-bold text-blue-300">จองการ์ด (Reserve Card)</div>
                      <div className="text-[10px] text-white/50">เสียงหยิบการ์ดเข้ามือ</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => soundManager.playGauntletSocket()}
                    className="p-3 rounded-xl bg-gradient-to-r from-amber-950/70 to-yellow-950/70 hover:from-amber-900/80 hover:to-yellow-900/80 border border-yellow-400/40 text-left transition-all cursor-pointer flex items-center gap-2.5 shadow"
                  >
                    <span className="text-xl">🧤</span>
                    <div>
                      <div className="text-xs font-bold text-yellow-300">ถุงมืออินฟินิตี้ (Gauntlet Claim)</div>
                      <div className="text-[10px] text-white/60">เสียงแฟนฟาร์พิชิตถุงมือธานอส</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => soundManager.playVictory()}
                    className="p-3 rounded-xl bg-gradient-to-r from-red-950/70 to-amber-950/70 hover:from-red-900/80 hover:to-amber-900/80 border border-red-500/40 text-left transition-all cursor-pointer flex items-center gap-2.5 shadow"
                  >
                    <span className="text-xl">🏆</span>
                    <div>
                      <div className="text-xs font-bold text-yellow-300">ชนะเกม (Victory Fanfare)</div>
                      <div className="text-[10px] text-white/60">ดนตรีชัยชนะฉลองจบเกม</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-4 py-2 bg-black/80 border-t border-white/10 flex items-center justify-between text-xs text-white/60 shrink-0">
          <span>
            💡 ทุกเสียงเป็น Web Audio API 100% เล่นได้ลื่นไหลทันทีโดยไม่ต้องโหลดไฟล์เสียง
          </span>
          <button
            type="button"
            onClick={() => {
              soundManager.playModalClose();
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer transition-colors"
          >
            ปิด
          </button>
        </footer>
      </div>

      {/* Simulated Hero Recruit VFX Overlay */}
      {vfxPreviewSignature && (
        <HeroRecruitVFX
          signature={vfxPreviewSignature}
          card={dummyCard}
          playerName="PREVIEW"
          isMyPlayer={true}
          onDismiss={() => setVfxPreviewSignature(null)}
        />
      )}
    </div>,
    document.body,
  );
};
