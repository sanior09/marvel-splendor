// ============================================================
//  HeroVFXTestModal.tsx — Marvel Hero Recruit VFX & Audio Lab
//  Interactive Showcase to Test All 22 Iconic Heroes
// ============================================================

import React, { useState, useMemo } from 'react';
import { HERO_SIGNATURES, playHeroSignatureSound, type HeroSignature } from '../data/heroSignatures';
import { HeroRecruitVFX } from './HeroRecruitVFX';
import type { Card } from '@shared/types/game.types';

interface HeroVFXTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName?: string;
}

// Map each signature to its canonical card ID and metadata for rendering
const HERO_CARD_MAPPING: Record<string, { cardId: string; points: number; tier: 1 | 2 | 3; avengersCount: number }> = {
  thor: { cardId: 't3_a02', points: 5, tier: 3, avengersCount: 2 },
  storm: { cardId: 't3_r04', points: 6, tier: 3, avengersCount: 0 },
  iron_man: { cardId: 't3_o01', points: 4, tier: 3, avengersCount: 2 },
  captain_america: { cardId: 't3_r02', points: 5, tier: 3, avengersCount: 2 },
  hulk: { cardId: 't3_a04', points: 4, tier: 3, avengersCount: 2 },
  doctor_strange: { cardId: 't3_s01', points: 4, tier: 3, avengersCount: 0 },
  spider_man: { cardId: 't2_a05', points: 3, tier: 2, avengersCount: 0 },
  black_panther: { cardId: 't3_r01', points: 4, tier: 3, avengersCount: 1 },
  thanos: { cardId: 't3_t04', points: 6, tier: 3, avengersCount: 0 },
  scarlet_witch: { cardId: 't3_a01', points: 4, tier: 3, avengersCount: 1 },
  captain_marvel: { cardId: 't3_r03', points: 4, tier: 3, avengersCount: 1 },
  hawkeye: { cardId: 't2_s06', points: 3, tier: 2, avengersCount: 1 },
  loki: { cardId: 't2_t01', points: 1, tier: 2, avengersCount: 0 },
  deadpool: { cardId: 't2_s04', points: 2, tier: 2, avengersCount: 0 },
  black_widow: { cardId: 't2_r03', points: 2, tier: 2, avengersCount: 1 },
  wolverine: { cardId: 'wolverine', points: 4, tier: 3, avengersCount: 0 },
  she_hulk: { cardId: 't2_a03', points: 2, tier: 2, avengersCount: 0 },
  magneto: { cardId: 't3_o03', points: 4, tier: 3, avengersCount: 0 },
  groot: { cardId: 't3_s04', points: 5, tier: 3, avengersCount: 0 },
  star_lord: { cardId: 't3_a03', points: 4, tier: 3, avengersCount: 0 },
  jean_grey: { cardId: 't3_o02', points: 5, tier: 3, avengersCount: 0 },
  nick_fury: { cardId: 't3_t01', points: 4, tier: 3, avengersCount: 1 },
};

export const HeroVFXTestModal: React.FC<HeroVFXTestModalProps> = ({
  isOpen,
  onClose,
  playerName = 'SANIOR',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeVFX, setActiveVFX] = useState<{ signature: HeroSignature; card: Card } | null>(null);

  const categories = [
    { id: 'all', label: 'ทั้งหมด (22)', icon: '⭐' },
    { id: 'lightning', label: 'Lightning', icon: '⚡' },
    { id: 'repulsor', label: 'Repulsor', icon: '🎯' },
    { id: 'shield', label: 'Shield', icon: '🛡️' },
    { id: 'smash', label: 'Smash', icon: '💥' },
    { id: 'mystic', label: 'Mystic', icon: '🔮' },
    { id: 'web', label: 'Web', icon: '🕸️' },
    { id: 'vibranium', label: 'Vibranium', icon: '🐾' },
    { id: 'infinity', label: 'Infinity', icon: '💎' },
  ];

  const filteredHeroes = useMemo(() => {
    return HERO_SIGNATURES.filter((hero) => {
      const matchCategory = selectedCategory === 'all' || hero.vfxType === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        hero.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hero.titleTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hero.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleTestHero = (hero: HeroSignature) => {
    const meta = HERO_CARD_MAPPING[hero.id] || { cardId: 't3_a02', points: 5, tier: 3, avengersCount: 1 };
    const mockCard: Card = {
      id: meta.cardId,
      name: hero.name,
      tier: meta.tier,
      points: meta.points,
      bonusColor: 'amethyst',
      cost: { ruby: 0, sapphire: 0, emerald: 0, obsidian: 0, topaz: 0, amethyst: 0, gold: 0 },
      avengersSymbol: meta.avengersCount > 0,
      avengersCount: meta.avengersCount,
    };

    setActiveVFX({ signature: hero, card: mockCard });
    playHeroSignatureSound(hero);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in font-['Prompt',sans-serif]">
        <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-gradient-to-b from-[#0e1424] to-[#070a14] border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xl shadow-lg border border-yellow-300/40">
                🎬
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                  <span>HERO RECRUIT VFX LAB</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    22 ICONIC HEROES
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  คลิกเพื่อทดสอบภาพเอฟเฟกต์การซื้อการ์ดระดับบล็อกบัสเตอร์ พร้อมเสียงจริงระดับสตูดิโอ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white flex items-center justify-center text-lg transition"
            >
              ✕
            </button>
          </div>

          {/* Controls: Search & Category Filter */}
          <div className="px-5 py-3 border-b border-white/10 bg-black/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อฮีโร่ / วายร้าย..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400/60"
              />
              <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hero Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3.5 scrollbar-thin">
            {filteredHeroes.map((hero) => {
              const meta = HERO_CARD_MAPPING[hero.id];
              return (
                <div
                  key={hero.id}
                  onClick={() => handleTestHero(hero)}
                  className="group relative p-3 rounded-xl bg-gradient-to-b from-white/[0.04] to-black/60 border border-white/10 hover:border-amber-400/60 hover:shadow-[0_0_25px_rgba(251,191,36,0.25)] transition-all duration-200 cursor-pointer flex flex-col items-center text-center active:scale-[0.98]"
                >
                  {/* Category Badge */}
                  <div
                    className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                    style={{
                      background: `${hero.accentColor}25`,
                      color: hero.accentColor,
                      border: `1px solid ${hero.accentColor}55`,
                    }}
                  >
                    {hero.vfxType}
                  </div>

                  {/* Avengers Badge if any */}
                  {meta && meta.avengersCount > 0 && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-700 border border-yellow-300 text-yellow-300 text-[10px] font-black flex items-center justify-center shadow">
                      A
                    </div>
                  )}

                  {/* Thumbnail / Avatar */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mt-3 mb-2 border border-white/20 group-hover:scale-105 group-hover:border-amber-400 transition-all bg-black/60 shadow-lg">
                    <img
                      src={`/images/cards/${meta?.cardId || 't3_a02'}.jpg`}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `/images/avatars/${hero.id}.jpg`;
                      }}
                      alt={hero.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Hero Names */}
                  <div className="font-black text-white text-xs sm:text-sm group-hover:text-amber-300 transition-colors flex items-center gap-1">
                    <span>{hero.icon}</span>
                    <span className="truncate max-w-[120px]">{hero.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-full mt-0.5 font-medium">
                    {hero.titleTh}
                  </div>

                  {/* Test Button */}
                  <button
                    type="button"
                    className="mt-2.5 w-full py-1.5 rounded-lg bg-amber-500/20 group-hover:bg-amber-500 text-amber-300 group-hover:text-black font-bold text-[11px] tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-1 shadow"
                  >
                    <span>▶</span>
                    <span>ทดสอบเอฟเฟกต์</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="px-5 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] text-slate-400">
            <span>✨ ระบบจะเล่นทั้งภาพแอนิเมชันเต็มจอ (Cinematic VFX) และไฟล์เสียงจริง (Authentic Sound)</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>

      {/* Active Fullscreen VFX Overlay during test */}
      {activeVFX && (
        <HeroRecruitVFX
          signature={activeVFX.signature}
          card={activeVFX.card}
          playerName={playerName}
          isMyPlayer={true}
          onDismiss={() => setActiveVFX(null)}
        />
      )}
    </>
  );
};
