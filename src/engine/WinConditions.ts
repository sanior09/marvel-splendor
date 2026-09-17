// ============================================================
//  WinConditions.ts — Nexus Realm Win & Guardian Logic
//  Pure functions — no side effects, no mutation.
// ============================================================

import type { Player, Guardian, CrystalColor } from '../types/game.types';
import { CARD_BONUS_COLORS } from '../types/game.types';

// ─── Constants ───────────────────────────────────────────────

export const WIN_SCORE_THRESHOLD = 16;

// ─── Player Score Calculator ─────────────────────────────────

/**
 * Calculates a player's total score from:
 * - Points from owned cards
 * - Points from attracted Guardians
 */
export function calculateScore(player: Player, holdsAvengersAssemble: boolean = false): number {
  const cardPoints = player.ownedCards.reduce((sum, card) => sum + card.points, 0);
  const guardianPoints = player.guardians.reduce((sum, g) => sum + g.points, 0);
  return cardPoints + guardianPoints + (holdsAvengersAssemble ? 3 : 0);
}

export function countAvengersSymbols(player: Player): number {
  return player.ownedCards.filter((c) => c.avengersSymbol).length;
}

// ─── Bonus Crystal Aggregator ────────────────────────────────

/**
 * Sums up the permanent crystal bonuses granted by all owned cards.
 * This acts as a discount on every future purchase.
 */
export function calculateBonuses(player: Player): Record<CrystalColor, number> {
  const bonuses: Record<CrystalColor, number> = {
    ruby: 0,
    sapphire: 0,
    emerald: 0,
    obsidian: 0,
    topaz: 0,
    amethyst: 0,
    gold: 0,
  };

  for (const card of player.ownedCards) {
    bonuses[card.bonusColor]++;
  }

  return bonuses;
}

// ─── Guardian Visit Check ─────────────────────────────────────

/**
 * Checks whether a player has enough card bonuses to attract a Guardian.
 * A Guardian is attracted when ALL its bonus color requirements are met.
 */
export function canAtractGuardian(player: Player, guardian: Guardian): boolean {
  return Object.entries(guardian.requirement).every(([color, required]) => {
    const crystalColor = color as CrystalColor;
    return (player.bonuses[crystalColor] ?? 0) >= (required ?? 0);
  });
}

/**
 * Returns all Guardians from the available pool that are eligible to visit
 * the player this turn.
 */
export function getEligibleGuardians(
  player: Player,
  availableGuardians: Guardian[],
): Guardian[] {
  return availableGuardians.filter((g) => canAtractGuardian(player, g));
}

// ─── Win Condition Checks ─────────────────────────────────────

/**
 * Condition 1: Score must be ≥ targetScore (default 16 Infinity Points).
 */
export function hasEnoughScore(
  player: Player,
  holdsAvengersAssemble: boolean = false,
  targetScore: number = WIN_SCORE_THRESHOLD,
): boolean {
  return calculateScore(player, holdsAvengersAssemble) >= targetScore;
}

/**
 * Condition 2: Player must have at least 1 bonus of each of the 5 Infinity Stones
 * (Mind, Space, Soul, Power, Reality).
 */
export function hasAllCrystalColors(player: Player): boolean {
  return CARD_BONUS_COLORS.every((color) => (player.bonuses[color] ?? 0) >= 1);
}

/**
 * Condition 3: Player must possess 1 Green Time Stone token.
 */
export function hasTimeStone(player: Player): boolean {
  return (player.crystals.emerald ?? 0) >= 1;
}

/**
 * Master win check: All three Infinity Gauntlet conditions must be simultaneously true.
 * 1. Has ≥ targetScore Infinity Points (default 16)
 * 2. Has all 5 stone bonuses on cards (Yellow, Blue, Orange, Purple, Red)
 * 3. Has 1 Green Time Stone token
 *
 * This triggers the final round.
 *
 * @returns true if the player has assembled the Infinity Gauntlet
 */
export function checkWinCondition(
  player: Player,
  holdsAvengersAssemble: boolean = false,
  targetScore: number = WIN_SCORE_THRESHOLD,
): boolean {
  return hasEnoughScore(player, holdsAvengersAssemble, targetScore) && hasAllCrystalColors(player) && hasTimeStone(player);
}

/**
 * Determines final winner(s) from multiple candidates.
 * Only players who met the full Infinity Gauntlet conditions are qualified to win.
 * If multiple qualify, highest score wins.
 * Tiebreaker: more Tier-3 cards, then fewer owned cards.
 */
export function resolveWinners(
  candidates: Player[],
  avengersAssembleHolder: string | null = null,
  targetScore: number = WIN_SCORE_THRESHOLD,
): Player[] {
  if (candidates.length === 0) return [];
  if (candidates.length === 1) return candidates;

  // Filter for players who completed the Gauntlet requirements
  const qualifiers = candidates.filter((p) => checkWinCondition(p, p.id === avengersAssembleHolder, targetScore));
  const pool = qualifiers.length > 0 ? qualifiers : candidates;

  if (pool.length === 1) return pool;

  const getScore = (p: Player) => calculateScore(p, p.id === avengersAssembleHolder);

  const maxScore = Math.max(...pool.map((p) => getScore(p)));
  const topScorers = pool.filter((p) => getScore(p) === maxScore);

  if (topScorers.length === 1) return topScorers;

  // Tiebreaker 1: more Tier-3 cards
  const maxTier3 = Math.max(
    ...topScorers.map((p) => p.ownedCards.filter((c) => c.tier === 3).length),
  );
  const tier3Leaders = topScorers.filter(
    (p) => p.ownedCards.filter((c) => c.tier === 3).length === maxTier3,
  );

  if (tier3Leaders.length === 1) return tier3Leaders;

  // Tiebreaker 2: fewer total owned cards (efficiency)
  const minCards = Math.min(...tier3Leaders.map((p) => p.ownedCards.length));
  return tier3Leaders.filter((p) => p.ownedCards.length === minCards);
}

