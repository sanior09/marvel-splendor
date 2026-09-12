// ============================================================
//  CardData.ts — Marvel Splendor Hero/Villain Cards & Locations
//  All game content data. Separated from logic per SRP.
// ============================================================

import type { Card, Guardian, CrystalPool } from '../types/game.types';

// ─── Helper ──────────────────────────────────────────────────
// Cards only cost the 5 standard Infinity Stones (Yellow, Blue, Orange, Purple, Red)
function cost(
  ruby = 0,      // Reality (Red)
  sapphire = 0,  // Space (Blue)
  obsidian = 0,  // Soul (Orange)
  topaz = 0,     // Mind (Yellow)
  amethyst = 0,  // Power (Purple)
): CrystalPool {
  return { ruby, sapphire, emerald: 0, obsidian, topaz, amethyst, gold: 0 };
}

// ─── Tier 1 Cards (40 cards — 8 per stone color) ────────────

export const TIER_1_CARDS: Card[] = [
  // Reality Stone (Ruby / Red) — 8 cards
  { id: 't1_r01', name: 'A-Bomb', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'ruby', cost: cost(0, 1, 1, 1, 1) },
  { id: 't1_r02', name: 'Abomination', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'ruby', cost: cost(0, 2, 2, 0, 0) },
  { id: 't1_r03', name: 'Agent Anti-Venom', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'ruby', cost: cost(0, 0, 2, 1, 1) },
  { id: 't1_r04', name: 'Agent Coulson', tier: 1, avengersSymbol: true, points: 0, bonusColor: 'ruby', cost: cost(0, 0, 0, 3, 0) },
  { id: 't1_r05', name: 'Agatha Harkness', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'ruby', cost: cost(0, 2, 0, 0, 2) },
  { id: 't1_r06', name: 'Angel', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'ruby', cost: cost(0, 0, 0, 0, 3) },
  { id: 't1_r07', name: 'Arcade', tier: 1, avengersSymbol: false, points: 1, bonusColor: 'ruby', cost: cost(0, 4, 0, 0, 0) },
  { id: 't1_r08', name: 'Elektra', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'ruby', cost: cost(0, 2, 0, 2, 0) },

  // Space Stone (Sapphire / Blue) — 8 cards
  { id: 't1_s01', name: 'Batroc', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'sapphire', cost: cost(1, 0, 1, 0, 1) },
  { id: 't1_s02', name: 'Bishop', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'sapphire', cost: cost(2, 0, 2, 0, 0) },
  { id: 't1_s03', name: 'Black Cat', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'sapphire', cost: cost(1, 0, 1, 1, 0) },
  { id: 't1_s04', name: 'Blade', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'sapphire', cost: cost(3, 0, 0, 0, 0) },
  { id: 't1_s05', name: 'Bullseye', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'sapphire', cost: cost(0, 0, 0, 2, 0) },
  { id: 't1_s06', name: 'Cloak', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'sapphire', cost: cost(0, 0, 3, 0, 0) },
  { id: 't1_s07', name: 'Dagger', tier: 1, avengersSymbol: false, points: 1, bonusColor: 'sapphire', cost: cost(0, 0, 4, 0, 0) },
  { id: 't1_s08', name: 'Falcon', tier: 1, avengersSymbol: true, points: 0, bonusColor: 'sapphire', cost: cost(2, 1, 1, 1, 0) },

  // Soul Stone (Obsidian / Orange) — 8 cards
  { id: 't1_o01', name: 'Iron Fist', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'obsidian', cost: cost(1, 1, 0, 1, 0) },
  { id: 't1_o02', name: 'Jubilee', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'obsidian', cost: cost(0, 0, 0, 0, 2) },
  { id: 't1_o03', name: 'Kamala Khan', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'obsidian', cost: cost(1, 2, 0, 1, 0) },
  { id: 't1_o04', name: 'Kraven', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'obsidian', cost: cost(0, 0, 0, 3, 0) },
  { id: 't1_o05', name: 'Lizard', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'obsidian', cost: cost(2, 0, 0, 2, 0) },
  { id: 't1_o06', name: 'Luke Cage', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'obsidian', cost: cost(0, 3, 0, 0, 0) },
  { id: 't1_o07', name: 'M.O.D.O.K.', tier: 1, avengersSymbol: false, points: 1, bonusColor: 'obsidian', cost: cost(0, 0, 0, 4, 0) },
  { id: 't1_o08', name: 'Hammerhead', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'obsidian', cost: cost(0, 2, 0, 0, 2) },

  // Mind Stone (Topaz / Yellow) — 8 cards
  { id: 't1_t01', name: 'Machine Man', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'topaz', cost: cost(1, 1, 0, 0, 1) },
  { id: 't1_t02', name: 'Medusa', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'topaz', cost: cost(2, 0, 0, 0, 2) },
  { id: 't1_t03', name: 'Moon Knight', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'topaz', cost: cost(0, 1, 0, 2, 1) },
  { id: 't1_t04', name: 'Nightcrawler', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'topaz', cost: cost(0, 3, 0, 0, 0) },
  { id: 't1_t05', name: 'Nova', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'topaz', cost: cost(0, 0, 2, 0, 2) },
  { id: 't1_t06', name: 'Okoye', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'topaz', cost: cost(0, 0, 0, 0, 3) },
  { id: 't1_t07', name: 'Patriot', tier: 1, avengersSymbol: false, points: 1, bonusColor: 'topaz', cost: cost(4, 0, 0, 0, 0) },
  { id: 't1_t08', name: 'Dazzler', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'topaz', cost: cost(1, 1, 1, 0, 1) },

  // Power Stone (Amethyst / Purple) — 8 cards
  { id: 't1_a01', name: 'Polaris', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'amethyst', cost: cost(0, 1, 1, 1, 0) },
  { id: 't1_a02', name: 'Prowler', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'amethyst', cost: cost(0, 2, 0, 0, 0) },
  { id: 't1_a03', name: 'Squirrel Girl', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'amethyst', cost: cost(1, 1, 2, 0, 1) },
  { id: 't1_a04', name: 'Taskmaster', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'amethyst', cost: cost(0, 0, 0, 3, 0) },
  { id: 't1_a05', name: 'Taskmaster (Variant)', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'amethyst', cost: cost(0, 0, 0, 2, 2) },
  { id: 't1_a06', name: 'Spider-Woman', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'amethyst', cost: cost(0, 0, 0, 0, 3) },
  { id: 't1_a07', name: 'Gwen Stacy', tier: 1, avengersSymbol: false, points: 1, bonusColor: 'amethyst', cost: cost(0, 0, 0, 0, 4) },
  { id: 't1_a08', name: 'Gwenpool', tier: 1, avengersSymbol: false, points: 0, bonusColor: 'amethyst', cost: cost(0, 0, 3, 0, 0) },
];

// ─── Tier 2 Cards (30 cards — 6 per stone color) ────────────

export const TIER_2_CARDS: Card[] = [
  // Reality Stone (Ruby / Red) — 6 cards
  { id: 't2_r01', name: 'Ant-Man', tier: 2, avengersSymbol: true, points: 1, bonusColor: 'ruby', cost: cost(0, 3, 2, 2, 0) },
  { id: 't2_r02', name: 'Black Bolt', tier: 2, avengersSymbol: false, points: 1, bonusColor: 'ruby', cost: cost(0, 0, 4, 2, 0) },
  { id: 't2_r03', name: 'Black Widow', tier: 2, avengersSymbol: true, points: 2, bonusColor: 'ruby', cost: cost(0, 0, 0, 5, 0) },
  { id: 't2_r04', name: 'Cable', tier: 2, avengersSymbol: false, points: 2, bonusColor: 'ruby', cost: cost(0, 0, 5, 3, 0) },
  { id: 't2_r05', name: 'Carnage', tier: 2, avengersSymbol: false, points: 3, bonusColor: 'ruby', cost: cost(0, 0, 0, 6, 0) },
  { id: 't2_r06', name: 'Dormammu', tier: 2, avengersSymbol: false, points: 1, bonusColor: 'ruby', cost: cost(0, 2, 0, 3, 2) },

  // Space Stone (Sapphire / Blue) — 6 cards
  { id: 't2_s01', name: 'Colossus', tier: 2, avengersSymbol: false, points: 1, bonusColor: 'sapphire', cost: cost(2, 0, 0, 2, 0) },
  { id: 't2_s02', name: 'Cyclops', tier: 2, avengersSymbol: false, points: 1, bonusColor: 'sapphire', cost: cost(2, 0, 0, 0, 1) },
  { id: 't2_s03', name: 'Daredevil', tier: 2, avengersSymbol: false, points: 2, bonusColor: 'sapphire', cost: cost(5, 0, 0, 0, 0) },
  { id: 't2_s04', name: 'Deadpool', tier: 2, avengersSymbol: false, points: 2, bonusColor: 'sapphire', cost: cost(2, 0, 0, 5, 0) },
  { id: 't2_s05', name: 'Doctor Octopus', tier: 2, avengersSymbol: false, points: 3, bonusColor: 'sapphire', cost: cost(0, 0, 0, 0, 6) },
  { id: 't2_s06', name: 'Hawkeye', tier: 2, avengersSymbol: true, points: 3, bonusColor: 'sapphire', cost: cost(0, 0, 0, 6, 0) },

  // Soul Stone (Obsidian / Orange) — 6 cards
  { id: 't2_o01', name: 'Hela', tier: 2, avengersSymbol: false, points: 1, bonusColor: 'obsidian', cost: cost(3, 0, 0, 0, 2) },
  { id: 't2_o02', name: 'Invisible Woman', tier: 2, avengersSymbol: false, points: 1, bonusColor: 'obsidian', cost: cost(0, 3, 0, 2, 2) },
  { id: 't2_o03', name: 'Iron Fist (Level 2)', tier: 2, avengersSymbol: false, points: 2, bonusColor: 'obsidian', cost: cost(0, 0, 0, 0, 5) },
  { id: 't2_o04', name: 'Juggernaut', tier: 2, avengersSymbol: false, points: 2, bonusColor: 'obsidian', cost: cost(0, 0, 3, 0, 0) },
  { id: 't2_o05', name: 'Kingpin', tier: 2, avengersSymbol: false, points: 3, bonusColor: 'obsidian', cost: cost(6, 0, 0, 0, 0) },
  { id: 't2_o06', name: 'Ghost Rider', tier: 2, avengersSymbol: false, points: 2, bonusColor: 'obsidian', cost: cost(0, 5, 0, 0, 0) },

  // Mind Stone (Topaz / Yellow) — 6 cards
  { id: 't2_t01', name: 'Loki', tier: 2, avengersSymbol: false, points: 1, bonusColor: 'topaz', cost: cost(2, 2, 0, 0, 3) },
  { id: 't2_t02', name: 'Miles Morales', tier: 2, avengersSymbol: false, points: 1, bonusColor: 'topaz', cost: cost(0, 4, 0, 1, 0) },
  { id: 't2_t03', name: 'Mysterio', tier: 2, avengersSymbol: false, points: 2, bonusColor: 'topaz', cost: cost(0, 0, 0, 0, 5) },
  { id: 't2_t04', name: 'Mystique', tier: 2, avengersSymbol: false, points: 2, bonusColor: 'topaz', cost: cost(0, 0, 0, 0, 5) },
  { id: 't2_t05', name: 'Punisher', tier: 2, avengersSymbol: false, points: 3, bonusColor: 'topaz', cost: cost(0, 6, 0, 0, 0) },
  { id: 't2_t06', name: 'Green Goblin', tier: 2, avengersSymbol: false, points: 2, bonusColor: 'topaz', cost: cost(0, 0, 5, 0, 3) },

  // Power Stone (Amethyst / Purple) — 6 cards
  { id: 't2_a01', name: 'Red Skull', tier: 2, avengersSymbol: false, points: 1, bonusColor: 'amethyst', cost: cost(0, 0, 3, 0, 2) },
  { id: 't2_a02', name: 'Rogue', tier: 2, avengersSymbol: false, points: 1, bonusColor: 'amethyst', cost: cost(1, 0, 2, 0, 4) },
  { id: 't2_a03', name: 'She-Hulk', tier: 2, avengersSymbol: false, points: 2, bonusColor: 'amethyst', cost: cost(0, 0, 0, 0, 5) },
  { id: 't2_a04', name: 'Spider-Gwen', tier: 2, avengersSymbol: false, points: 2, bonusColor: 'amethyst', cost: cost(0, 0, 0, 3, 5) },
  { id: 't2_a05', name: 'Spider-Man', tier: 2, avengersSymbol: false, points: 3, bonusColor: 'amethyst', cost: cost(0, 0, 6, 0, 0) },
  { id: 't2_a06', name: 'Gambit', tier: 2, avengersSymbol: false, points: 1, bonusColor: 'amethyst', cost: cost(0, 2, 2, 1, 0) },
];

// ─── Tier 3 Cards (20 cards — 4 per stone color) ────────────

export const TIER_3_CARDS: Card[] = [
  // Reality Stone (Ruby / Red) — 4 cards
  { id: 't3_r01', name: 'Black Panther', tier: 3, avengersSymbol: true, points: 4, bonusColor: 'ruby', cost: cost(0, 0, 0, 7, 0) },
  { id: 't3_r02', name: 'Captain America', tier: 3, avengersSymbol: true, points: 5, bonusColor: 'ruby', cost: cost(0, 3, 0, 7, 0) },
  { id: 't3_r03', name: 'Captain Marvel', tier: 3, avengersSymbol: true, points: 4, bonusColor: 'ruby', cost: cost(3, 0, 3, 5, 0) },
  { id: 't3_r04', name: 'Storm', tier: 3, avengersSymbol: false, points: 6, bonusColor: 'ruby', cost: cost(0, 0, 3, 3, 7) },

  // Space Stone (Sapphire / Blue) — 4 cards
  { id: 't3_s01', name: 'Doctor Strange', tier: 3, avengersSymbol: false, points: 4, bonusColor: 'sapphire', cost: cost(7, 0, 0, 0, 0) },
  { id: 't3_s02', name: 'Emma Frost', tier: 3, avengersSymbol: false, points: 5, bonusColor: 'sapphire', cost: cost(7, 0, 0, 0, 0) },
  { id: 't3_s03', name: 'Galactus', tier: 3, avengersSymbol: false, points: 4, bonusColor: 'sapphire', cost: cost(5, 0, 0, 0, 3) },
  { id: 't3_s04', name: 'Groot', tier: 3, avengersSymbol: false, points: 5, bonusColor: 'sapphire', cost: cost(0, 7, 3, 0, 0) },

  // Soul Stone (Obsidian / Orange) — 4 cards
  { id: 't3_o01', name: 'Iron Man', tier: 3, avengersSymbol: true, points: 4, bonusColor: 'obsidian', cost: cost(0, 0, 0, 7, 0) },
  { id: 't3_o02', name: 'Jean Grey', tier: 3, avengersSymbol: false, points: 5, bonusColor: 'obsidian', cost: cost(0, 0, 3, 7, 0) },
  { id: 't3_o03', name: 'Magneto', tier: 3, avengersSymbol: false, points: 4, bonusColor: 'obsidian', cost: cost(3, 3, 0, 0, 3) },
  { id: 't3_o04', name: 'Gamora', tier: 3, avengersSymbol: false, points: 4, bonusColor: 'obsidian', cost: cost(0, 7, 0, 0, 0) },

  // Mind Stone (Topaz / Yellow) — 4 cards
  { id: 't3_t01', name: 'Nick Fury', tier: 3, avengersSymbol: true, points: 4, bonusColor: 'topaz', cost: cost(0, 0, 7, 0, 0) },
  { id: 't3_t02', name: 'Professor X', tier: 3, avengersSymbol: false, points: 5, bonusColor: 'topaz', cost: cost(0, 0, 7, 0, 0) },
  { id: 't3_t03', name: 'Rocket Raccoon', tier: 3, avengersSymbol: false, points: 4, bonusColor: 'topaz', cost: cost(3, 0, 5, 0, 3) },
  { id: 't3_t04', name: 'Thanos', tier: 3, avengersSymbol: false, points: 6, bonusColor: 'topaz', cost: cost(0, 0, 7, 3, 0) },

  // Power Stone (Amethyst / Purple) — 4 cards
  { id: 't3_a01', name: 'Scarlet Witch', tier: 3, avengersSymbol: true, points: 4, bonusColor: 'amethyst', cost: cost(0, 0, 0, 0, 7) },
  { id: 't3_a02', name: 'Silver Surfer', tier: 3, avengersSymbol: false, points: 5, bonusColor: 'amethyst', cost: cost(0, 0, 0, 3, 7) },
  { id: 't3_a03', name: 'Star-Lord', tier: 3, avengersSymbol: false, points: 4, bonusColor: 'amethyst', cost: cost(3, 3, 3, 0, 5) },
  { id: 't3_a04', name: 'Hulk', tier: 3, avengersSymbol: true, points: 4, bonusColor: 'amethyst', cost: cost(0, 5, 3, 3, 3) },
];

// ─── Marvel Locations (10 tiles — +3 PTS each) ───────────────
// Conditions require only the 5 standard Infinity Stones

export const ALL_GUARDIANS: Guardian[] = [
  {
    id: 'g01',
    name: 'Triskelion',
    points: 3,
    requirement: { sapphire: 4, ruby: 4 },
  },
  {
    id: 'g02',
    name: 'Avengers Tower',
    points: 3,
    requirement: { ruby: 3, sapphire: 3, topaz: 3 },
  },
  {
    id: 'g03',
    name: 'Wakanda',
    points: 3,
    requirement: { obsidian: 4, topaz: 4 },
  },
  {
    id: 'g04',
    name: 'Asgard',
    points: 3,
    requirement: { sapphire: 3, obsidian: 3, topaz: 3 },
  },
  {
    id: 'g05',
    name: 'Knowhere',
    points: 3,
    requirement: { topaz: 4, amethyst: 4 },
  },
  {
    id: 'g06',
    name: 'Attilan',
    points: 3,
    requirement: { ruby: 3, sapphire: 3, obsidian: 3 },
  },
  {
    id: 'g07',
    name: "Hell's Kitchen",
    points: 3,
    requirement: { obsidian: 4, amethyst: 4 },
  },
  {
    id: 'g08',
    name: 'Sanctum Sanctorum',
    points: 3,
    requirement: { ruby: 4, topaz: 4 },
  },
  {
    id: 'g09',
    name: 'X-Mansion',
    points: 3,
    requirement: { ruby: 3, obsidian: 3, amethyst: 3 },
  },
  {
    id: 'g10',
    name: 'Helicarrier',
    points: 3,
    requirement: { sapphire: 3, topaz: 3, amethyst: 3 },
  },
];

// ─── Gem distribution by player count ────────────────────────
// 2 players = 4 tokens each, 3 players = 5 tokens each, 4 players = 7 tokens each

export const GEM_COUNT_BY_PLAYERS: Record<number, number> = {
  2: 4,
  3: 5,
  4: 7,
};

export const GOLD_GEM_COUNT = 5; // S.H.I.E.L.D. tokens
export const BOARD_CARDS_PER_TIER = 4;
export const MAX_GEMS_IN_HAND = 10;
export const MAX_RESERVED_CARDS = 3;
export const TAKE_2_GEMS_MIN_IN_BANK = 4;
