// ============================================================
//  BotLogic.ts — Marvel AI Opponent Engine
//
//  Computes intelligent and legal moves for AI bot players.
// ============================================================

import type {
  GameState,
  Player,
  Card,
  CrystalColor,
  GameAction,
  CrystalPool,
} from '../types/game.types';
import { ALL_CRYSTAL_COLORS, BANK_STONE_COLORS } from '../types/game.types';
import { canAtractGuardian } from './WinConditions';

export interface BotPersonality {
  name: string;
  avatar: string;
  focus: 'gauntlet' | 'avengers' | 'points' | 'balanced';
}

export const BOT_PERSONALITIES: Record<string, BotPersonality> = {
  stark: {
    name: 'Tony Stark AI',
    avatar: '🤖',
    focus: 'avengers',
  },
  ultron: {
    name: 'Ultron',
    avatar: '⚡',
    focus: 'points',
  },
  thanos: {
    name: 'Thanos Bot',
    avatar: '👑',
    focus: 'gauntlet',
  },
  friday: {
    name: 'F.R.I.D.A.Y.',
    avatar: '💠',
    focus: 'balanced',
  },
};

/**
 * Checks if a player can afford a specific card.
 */
function canAffordCard(
  card: Card,
  player: Player,
): { affordable: boolean; goldNeeded: number } {
  let goldNeeded = 0;
  for (const color of ALL_CRYSTAL_COLORS) {
    const cost = card.cost[color] ?? 0;
    const have = (player.crystals[color] ?? 0) + (player.bonuses[color] ?? 0);
    if (have < cost) {
      goldNeeded += cost - have;
    }
  }
  const affordable = goldNeeded <= (player.crystals.gold ?? 0);
  return { affordable, goldNeeded };
}

/**
 * Evaluates the strategic desirability of a card for this bot.
 */
function evaluateCardValue(card: Card, player: Player, state: GameState): number {
  let value = card.points * 35;

  // Crucial: Missing Infinity Stone color
  if ((player.bonuses[card.bonusColor] ?? 0) === 0) {
    value += 45;
  }

  // Crucial: Tier 3 requirement & Time Stone acquisition
  if (card.tier === 3) {
    if (state.board.timeStoneAvailable) {
      value += 90; // Top priority: claim the green Time Stone first!
    } else {
      value += 20;
    }
  }

  // Avengers symbol
  if (card.avengersSymbol) {
    const avengerCount = player.ownedCards.filter((c) => c.avengersSymbol).length;
    value += avengerCount < 3 ? 25 : 10;
  }

  // Helps attract a Location/Guardian
  for (const guardian of state.board.availableGuardians) {
    if (!canAtractGuardian(player, guardian)) {
      const required = guardian.requirement[card.bonusColor] ?? 0;
      if (required > 0 && (player.bonuses[card.bonusColor] ?? 0) < required) {
        value += 20;
      }
    }
  }

  // Cost penalty: slight discount for cheaper cards with similar value
  let totalCost = 0;
  for (const color of ALL_CRYSTAL_COLORS) {
    totalCost += card.cost[color] ?? 0;
  }
  value -= totalCost * 1.5;

  return value;
}

/**
 * Main AI decision engine: computes the best legal action for a bot.
 */
export function computeBotAction(
  state: GameState,
  botPlayerId: string,
): GameAction | null {
  const bot = state.players.find((p) => p.id === botPlayerId);
  if (!bot) return null;

  const currentGemsCount = Object.values(bot.crystals).reduce((a, b) => a + b, 0);

  // ─── 1. Handling Gem Discard (DROP_GEMS phase) ───────────────
  if (state.phase === 'dropGems') {
    let excess = currentGemsCount - 10;
    if (excess <= 0) return null;

    const toDrop: Partial<CrystalPool> = {};
    // Drop least needed stones first (5 bank stones only — Time Stone CANNOT be discarded!)
    const sortedColors = [...BANK_STONE_COLORS].sort(
      (a, b) => (bot.crystals[b] ?? 0) - (bot.crystals[a] ?? 0),
    );

    for (const color of sortedColors) {
      if (excess <= 0) break;
      const count = bot.crystals[color] ?? 0;
      if (count > 0) {
        const take = Math.min(count, excess);
        toDrop[color] = take;
        excess -= take;
      }
    }

    if (excess > 0 && (bot.crystals.gold ?? 0) > 0) {
      toDrop.gold = Math.min(bot.crystals.gold ?? 0, excess);
    }

    return { type: 'DROP_GEMS', toDrop };
  }

  // ─── 2. Playing Phase: Candidate Cards ───────────────────────
  const visibleCards: Card[] = [
    ...state.board.tier3.filter((c): c is Card => c !== null),
    ...state.board.tier2.filter((c): c is Card => c !== null),
    ...state.board.tier1.filter((c): c is Card => c !== null),
  ];
  const allCandidateCards = [...visibleCards, ...bot.reservedCards];

  // Check affordable cards
  const affordableCards = allCandidateCards
    .map((card) => ({
      card,
      ...canAffordCard(card, bot),
      value: evaluateCardValue(card, bot, state),
    }))
    .filter((entry) => entry.affordable)
    .sort((a, b) => b.value - a.value);

  // If we can buy a good card, buy it!
  if (affordableCards.length > 0 && affordableCards[0].value > 5) {
    return { type: 'BUY_CARD', cardId: affordableCards[0].card.id };
  }

  // ─── 3. Target Card Selection ────────────────────────────────
  // Find the most desired card on the board to save gems for
  const desiredCards = visibleCards
    .map((card) => ({
      card,
      value: evaluateCardValue(card, bot, state),
    }))
    .sort((a, b) => b.value - a.value);

  const targetCard = desiredCards[0]?.card;

  // ─── 4. Consider Reserving a Card ────────────────────────────
  // If target card is Tier 3 or high value, and bank has gold, and reserved < 3
  if (
    targetCard &&
    targetCard.tier === 3 &&
    bot.reservedCards.length < 3 &&
    state.board.crystalBank.gold > 0 &&
    currentGemsCount < 10
  ) {
    // 35% tactical chance to reserve high-tier target
    if (Math.random() < 0.4) {
      return { type: 'RESERVE_CARD', cardId: targetCard.id };
    }
  }

  // ─── 5. Calculate Color Needs for Target Card ────────────────
  const neededColors: Record<CrystalColor, number> = {
    ruby: 0,
    sapphire: 0,
    emerald: 0,
    obsidian: 0,
    topaz: 0,
    amethyst: 0,
    gold: 0,
  };

  if (targetCard) {
    for (const color of ALL_CRYSTAL_COLORS) {
      const needed =
        (targetCard.cost[color] ?? 0) -
        ((bot.crystals[color] ?? 0) + (bot.bonuses[color] ?? 0));
      if (needed > 0) neededColors[color] = needed;
    }
  }

  // ─── 6. Take 2 of the Same Color ────────────────────────────
  // If we need a color badly and bank has >= 4
  const eligibleTake2Colors = BANK_STONE_COLORS.filter(
    (color) =>
      (state.board.crystalBank[color] ?? 0) >= 4 &&
      currentGemsCount <= 8 &&
      neededColors[color] >= 2,
  );

  if (eligibleTake2Colors.length > 0) {
    const bestColor = eligibleTake2Colors.sort(
      (a, b) => neededColors[b] - neededColors[a],
    )[0];
    return { type: 'TAKE_2_GEMS', color: bestColor };
  }

  // ─── 7. Take 3 Different Colors ─────────────────────────────
  const availableBankColors = BANK_STONE_COLORS.filter(
    (c) => (state.board.crystalBank[c] ?? 0) > 0,
  );

  if (availableBankColors.length >= 3 && currentGemsCount <= 7) {
    // Sort available colors by how much bot needs them
    const sorted = [...availableBankColors].sort(
      (a, b) => neededColors[b] - neededColors[a],
    );
    const chosen3: [CrystalColor, CrystalColor, CrystalColor] = [
      sorted[0],
      sorted[1],
      sorted[2],
    ];
    return { type: 'TAKE_3_GEMS', colors: chosen3 };
  }

  // If available colors < 3 but >= 1 and we have room
  if (availableBankColors.length >= 3) {
    const chosen3: [CrystalColor, CrystalColor, CrystalColor] = [
      availableBankColors[0],
      availableBankColors[1],
      availableBankColors[2],
    ];
    return { type: 'TAKE_3_GEMS', colors: chosen3 };
  }

  // ─── 8. Fallback: Reserve Card from Board or Deck ────────────
  if (bot.reservedCards.length < 3 && visibleCards.length > 0) {
    const cardToReserve = targetCard ?? visibleCards[0];
    return { type: 'RESERVE_CARD', cardId: cardToReserve.id };
  }

  // If really nothing else, buy any affordable card
  if (affordableCards.length > 0) {
    return { type: 'BUY_CARD', cardId: affordableCards[0].card.id };
  }

  return null;
}
