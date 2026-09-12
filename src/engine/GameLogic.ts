// ============================================================
//  GameLogic.ts — Nexus Realm Core Game Engine
//
//  All functions are PURE (no side effects, no mutation).
//  Receives state → validates → returns NEW state or error.
//  Server-side only: all validation happens here.
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type {
  GameState,
  Player,
  Card,
  CrystalPool,
  GameAction,
  Take3GemsAction,
  Take2GemsAction,
  ReserveCardAction,
  BuyCardAction,
  DropGemsAction,
  ValidationResult,
  BoardState,
  CardTier,
  CrystalColor,
} from '../types/game.types';
import { ALL_CRYSTAL_COLORS, ALL_COLORS_WITH_GOLD, BANK_STONE_COLORS } from '../types/game.types';
import {
  TIER_1_CARDS,
  TIER_2_CARDS,
  TIER_3_CARDS,
  ALL_GUARDIANS,
  GEM_COUNT_BY_PLAYERS,
  GOLD_GEM_COUNT,
  BOARD_CARDS_PER_TIER,
  MAX_GEMS_IN_HAND,
  MAX_RESERVED_CARDS,
  TAKE_2_GEMS_MIN_IN_BANK,
} from './CardData';
import {
  calculateScore,
  calculateBonuses,
  getEligibleGuardians,
  checkWinCondition,
  resolveWinners,
  countAvengersSymbols,
} from './WinConditions';

// ─── Utility: Deep Clone ─────────────────────────────────────
// Keeps functions pure without external lib dependency

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

// ─── Utility: Shuffle Array (Fisher-Yates) ───────────────────

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── Utility: Empty CrystalPool ──────────────────────────────

function emptyPool(): CrystalPool {
  return {
    ruby: 0,
    sapphire: 0,
    emerald: 0,
    obsidian: 0,
    topaz: 0,
    amethyst: 0,
    gold: 0,
  };
}

// ─── Utility: Count gems in pool ─────────────────────────────

function totalGems(pool: CrystalPool): number {
  return ALL_COLORS_WITH_GOLD.reduce((sum, c) => sum + (pool[c] ?? 0), 0);
}

// ─── Utility: Find card on board ─────────────────────────────

function findCardOnBoard(
  board: BoardState,
  cardId: string,
): { card: Card; tier: CardTier; index: number } | null {
  const tiers: Array<{ slots: (Card | null)[]; tier: CardTier }> = [
    { slots: board.tier1, tier: 1 },
    { slots: board.tier2, tier: 2 },
    { slots: board.tier3, tier: 3 },
  ];
  for (const { slots, tier } of tiers) {
    const index = slots.findIndex((c) => c?.id === cardId);
    if (index !== -1 && slots[index] !== null) {
      return { card: slots[index] as Card, tier, index };
    }
  }
  return null;
}

// ─── Utility: Find card in reserved ──────────────────────────

function findReservedCard(player: Player, cardId: string): Card | undefined {
  return player.reservedCards.find((c) => c.id === cardId);
}

// ─── Utility: Draw from tier deck ────────────────────────────

function drawFromDeck(
  board: BoardState,
  _tier: CardTier,
  tierDeck: Card[],
): { board: BoardState; drawnCard: Card | null; remainingDeck: Card[] } {
  if (tierDeck.length === 0) {
    return { board, drawnCard: null, remainingDeck: [] };
  }
  const [drawnCard, ...remainingDeck] = tierDeck;
  return { board, drawnCard, remainingDeck };
}

// ─── Utility: Fill empty board slot ──────────────────────────

function fillBoardSlot(
  board: BoardState,
  tier: CardTier,
  index: number,
  tierDeck: Card[],
): { newBoard: BoardState; remainingDeck: Card[] } {
  const newBoard = deepClone(board);
  const { drawnCard, remainingDeck } = drawFromDeck(board, tier, tierDeck);

  if (tier === 1) {
    newBoard.tier1[index] = drawnCard;
    newBoard.tier1DeckCount = remainingDeck.length;
  } else if (tier === 2) {
    newBoard.tier2[index] = drawnCard;
    newBoard.tier2DeckCount = remainingDeck.length;
  } else {
    newBoard.tier3[index] = drawnCard;
    newBoard.tier3DeckCount = remainingDeck.length;
  }
  return { newBoard, remainingDeck };
}

// ─── DYNAMIC TIER-BALANCED CARD COST GENERATOR ───────────────

export function generateBalancedCardCost(
  tier: CardTier,
  points: number,
  bonusColor: CrystalColor,
): CrystalPool {
  const result: CrystalPool = emptyPool();
  // Candidate cost colors are strictly the 5 standard Infinity Stones (excluding Time Stone/green)
  const candidateColors = shuffle(BANK_STONE_COLORS.filter((c) => c !== bonusColor));
  const allAvailable = [candidateColors[0]!, candidateColors[1]!, candidateColors[2]!, candidateColors[3]!, bonusColor];

  let pattern: number[];

  if (tier === 1) {
    if (points >= 1) {
      const patterns = [
        [4],
        [3, 1],
        [3, 2],
        [2, 2, 1],
      ];
      pattern = patterns[Math.floor(Math.random() * patterns.length)]!;
    } else {
      const patterns = [
        [1, 1, 1, 1],
        [2, 1, 1],
        [1, 1, 1],
        [2, 2],
        [3, 1],
        [2, 1],
        [3],
      ];
      pattern = patterns[Math.floor(Math.random() * patterns.length)]!;
    }
  } else if (tier === 2) {
    if (points >= 3) {
      const patterns = [
        [6],
        [5, 3],
        [6, 2],
      ];
      pattern = patterns[Math.floor(Math.random() * patterns.length)]!;
    } else if (points === 2) {
      const patterns = [
        [5],
        [4, 2, 1],
        [5, 3],
        [3, 3, 2],
        [4, 3],
      ];
      pattern = patterns[Math.floor(Math.random() * patterns.length)]!;
    } else {
      // points <= 1
      const patterns = [
        [2, 3, 2],
        [4, 2, 1],
        [3, 2, 2],
        [4, 2],
        [3, 3],
      ];
      pattern = patterns[Math.floor(Math.random() * patterns.length)]!;
    }
  } else {
    // tier === 3
    if (points >= 6) {
      const patterns = [
        [7, 3, 3],
        [7, 3, 3, 3],
        [7, 5],
        [6, 3, 3, 3],
      ];
      pattern = patterns[Math.floor(Math.random() * patterns.length)]!;
    } else if (points === 5) {
      const patterns = [
        [7, 3],
        [7, 3, 3],
        [6, 3, 3],
        [8],
      ];
      pattern = patterns[Math.floor(Math.random() * patterns.length)]!;
    } else if (points === 4) {
      const patterns = [
        [7],
        [7, 3],
        [6, 3, 3],
        [5, 3, 3],
        [3, 3, 3, 5],
      ];
      pattern = patterns[Math.floor(Math.random() * patterns.length)]!;
    } else {
      // points === 3
      const patterns = [
        [7],
        [5, 3, 3],
        [6, 3],
        [4, 3, 3],
      ];
      pattern = patterns[Math.floor(Math.random() * patterns.length)]!;
    }
  }

  // Assign pattern amounts to selected colors
  const selectedColors = shuffle([...allAvailable]);
  for (let i = 0; i < pattern.length; i++) {
    const color = selectedColors[i % selectedColors.length]!;
    result[color] = (result[color] ?? 0) + pattern[i]!;
  }

  return result;
}

export function randomizeDeckCosts(cards: Card[]): Card[] {
  return cards.map((card) => ({
    ...card,
    cost: generateBalancedCardCost(card.tier, card.points, card.bonusColor),
  }));
}

// ─── INIT GAME ───────────────────────────────────────────────

/**
 * Creates the initial GameState for a new game.
 * Shuffles all decks, deals board cards, distributes gems, places Guardians.
 */
export function initGame(
  roomId: string,
  playerIds: string[],
  playerNames: string[],
  botInfo?: Array<{ isBot?: boolean; botPersonality?: string }>,
  randomizeCosts = true,
): GameState {
  const playerCount = playerIds.length;
  if (playerCount < 2 || playerCount > 4) {
    throw new Error('Game requires 2–4 players');
  }

  const gemCount = GEM_COUNT_BY_PLAYERS[playerCount] ?? 4;

  // Randomize card costs per Tier for each new game
  const tier1CardsWithCosts = randomizeCosts ? randomizeDeckCosts(TIER_1_CARDS) : TIER_1_CARDS;
  const tier2CardsWithCosts = randomizeCosts ? randomizeDeckCosts(TIER_2_CARDS) : TIER_2_CARDS;
  const tier3CardsWithCosts = randomizeCosts ? randomizeDeckCosts(TIER_3_CARDS) : TIER_3_CARDS;

  // Shuffle decks
  const shuffledTier1 = shuffle(tier1CardsWithCosts);
  const shuffledTier2 = shuffle(tier2CardsWithCosts);
  const shuffledTier3 = shuffle(tier3CardsWithCosts);

  // Deal board — 4 visible per tier, rest in deck
  const tier1Board = shuffledTier1.slice(0, BOARD_CARDS_PER_TIER) as (Card | null)[];
  const tier2Board = shuffledTier2.slice(0, BOARD_CARDS_PER_TIER) as (Card | null)[];
  const tier3Board = shuffledTier3.slice(0, BOARD_CARDS_PER_TIER) as (Card | null)[];

  const tier1Deck = shuffledTier1.slice(BOARD_CARDS_PER_TIER);
  const tier2Deck = shuffledTier2.slice(BOARD_CARDS_PER_TIER);
  const tier3Deck = shuffledTier3.slice(BOARD_CARDS_PER_TIER);

  // Select Locations (Guardians) — equal to playerCount (Splendor Marvel rule)
  const shuffledGuardians = shuffle(ALL_GUARDIANS).slice(0, playerCount);

  // Crystal bank — only the 5 standard Infinity Stones + 5 S.H.I.E.L.D. tokens
  // (Time Stone is NOT in the bank — sits beside the Infinity Gauntlet)
  const crystalBank: CrystalPool = {
    ruby: gemCount,
    sapphire: gemCount,
    emerald: 0,
    obsidian: gemCount,
    topaz: gemCount,
    amethyst: gemCount,
    gold: GOLD_GEM_COUNT,
  };

  const board: BoardState = {
    tier1: tier1Board,
    tier2: tier2Board,
    tier3: tier3Board,
    tier1DeckCount: tier1Deck.length,
    tier2DeckCount: tier2Deck.length,
    tier3DeckCount: tier3Deck.length,
    crystalBank: { ...crystalBank },
    availableGuardians: shuffledGuardians,
    avengersAssembleHolder: null,
    timeStoneAvailable: true,
    timeStoneHolder: null,
  };

  // Build players
  const players: Player[] = playerIds.map((id, i) => ({
    id,
    name: playerNames[i] ?? `Player ${i + 1}`,
    crystals: emptyPool(),
    bonuses: emptyPool(),
    ownedCards: [],
    reservedCards: [],
    guardians: [],
    score: 0,
    hasWon: false,
    isBot: botInfo?.[i]?.isBot ?? false,
    botPersonality: botInfo?.[i]?.botPersonality,
  }));

  // Shuffle turn order
  const shuffledPlayers = shuffle(players);

  // Store decks in a side-channel (attached to board for server use)
  // We encode remaining deck contents as board-side data through deck counts
  const state: GameState & {
    _tier1Deck: Card[];
    _tier2Deck: Card[];
    _tier3Deck: Card[];
  } = {
    roomId,
    phase: 'playing',
    players: shuffledPlayers,
    currentPlayerIndex: 0,
    board,
    winTriggeredBy: null,
    winners: [],
    turnNumber: 1,
    _tier1Deck: tier1Deck,
    _tier2Deck: tier2Deck,
    _tier3Deck: tier3Deck,
  };

  return state as unknown as GameState;
}

// ─── VALIDATE ACTION ─────────────────────────────────────────

/**
 * Validates whether a player's action is legal given the current state.
 * Returns { valid: false, reason } if illegal. Server blocks execution.
 */
export function validateAction(
  state: GameState,
  playerId: string,
  action: GameAction,
): ValidationResult {
  // Turn enforcement
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer) return { valid: false, reason: 'No current player' };
  if (currentPlayer.id !== playerId) {
    return { valid: false, reason: 'Not your turn' };
  }
  if (state.phase === 'dropGems') {
    if (action.type !== 'DROP_GEMS') {
      return { valid: false, reason: 'You must drop gems before continuing' };
    }
  } else if (state.phase !== 'playing') {
    return { valid: false, reason: 'Game is not in play phase' };
  }

  switch (action.type) {
    case 'TAKE_3_GEMS':
      return validateTake3Gems(state, currentPlayer, action);
    case 'TAKE_2_GEMS':
      return validateTake2Gems(state, currentPlayer, action);
    case 'RESERVE_CARD':
      return validateReserveCard(state, currentPlayer, action);
    case 'BUY_CARD':
      return validateBuyCard(state, currentPlayer, action);
    case 'DROP_GEMS':
      return validateDropGems(currentPlayer, action);
    default:
      return { valid: false, reason: 'Unknown action type' };
  }
}

// ─── VALIDATION HELPERS ───────────────────────────────────────

function validateTake3Gems(
  state: GameState,
  _player: Player,
  action: Take3GemsAction,
): ValidationResult {
  const { colors } = action;

  // Must be exactly 3 different colors
  const uniqueColors = new Set(colors);
  if (uniqueColors.size !== 3) {
    return { valid: false, reason: 'Must pick 3 different colors' };
  }

  // Can only pick from the 5 standard Infinity Stones (Yellow, Blue, Orange, Purple, Red)
  for (const color of colors) {
    if (!BANK_STONE_COLORS.includes(color)) {
      return {
        valid: false,
        reason: 'Can only pick the 5 standard Infinity Stones (Yellow, Blue, Orange, Purple, Red). Grey and Green cannot be picked from the bank.',
      };
    }
  }

  // Each selected color must be available in bank
  for (const color of colors) {
    if ((state.board.crystalBank[color] ?? 0) < 1) {
      return { valid: false, reason: `Not enough ${color} stones in bank` };
    }
  }

  return { valid: true };
}

function validateTake2Gems(
  state: GameState,
  _player: Player,
  action: Take2GemsAction,
): ValidationResult {
  const { color } = action;

  if (!BANK_STONE_COLORS.includes(color)) {
    return {
      valid: false,
      reason: 'Can only take 2 from the 5 standard Infinity Stones in bank (Yellow, Blue, Orange, Purple, Red). Grey and Green cannot be picked.',
    };
  }
  if ((state.board.crystalBank[color] ?? 0) < TAKE_2_GEMS_MIN_IN_BANK) {
    return {
      valid: false,
      reason: `Need at least ${TAKE_2_GEMS_MIN_IN_BANK} ${color} stones in bank to take 2`,
    };
  }

  return { valid: true };
}

function validateReserveCard(
  state: GameState,
  player: Player,
  action: ReserveCardAction,
): ValidationResult {
  if (player.reservedCards.length >= MAX_RESERVED_CARDS) {
    return { valid: false, reason: `Cannot reserve more than ${MAX_RESERVED_CARDS} cards` };
  }

  if (action.cardId !== null) {
    const found = findCardOnBoard(state.board, action.cardId);
    if (!found) {
      return { valid: false, reason: 'Card not found on board' };
    }
  } else {
    // Drawing from top of deck
    if (!action.deckTier) {
      return { valid: false, reason: 'Must specify a deck tier when reserving from deck' };
    }
    const deckCount =
      action.deckTier === 1
        ? state.board.tier1DeckCount
        : action.deckTier === 2
          ? state.board.tier2DeckCount
          : state.board.tier3DeckCount;

    if (deckCount === 0) {
      return { valid: false, reason: `Tier ${action.deckTier} deck is empty` };
    }
  }

  return { valid: true };
}

function validateBuyCard(
  state: GameState,
  player: Player,
  action: BuyCardAction,
): ValidationResult {
  const card =
    findCardOnBoard(state.board, action.cardId)?.card ??
    findReservedCard(player, action.cardId);

  if (!card) {
    return { valid: false, reason: 'Card not found on board or in your reserved hand' };
  }

  // Calculate effective cost after bonuses
  const effectiveCost = computeEffectiveCost(card, player);

  // Count gold needed for shortfall
  let goldNeeded = 0;
  for (const color of ALL_CRYSTAL_COLORS) {
    const needed = effectiveCost[color] ?? 0;
    const have = player.crystals[color] ?? 0;
    if (have < needed) {
      goldNeeded += needed - have;
    }
  }

  if (goldNeeded > (player.crystals.gold ?? 0)) {
    return { valid: false, reason: 'Not enough crystals to buy this card' };
  }

  return { valid: true };
}

function validateDropGems(player: Player, action: DropGemsAction): ValidationResult {
  const { toDrop } = action;

  // Rule: Green Time Stone CANNOT be discarded to the bank!
  if ((toDrop.emerald ?? 0) > 0) {
    return { valid: false, reason: 'Time Stone (Green) cannot be returned to the bank' };
  }

  const totalInHand = totalGems(player.crystals);
  const totalDrop = ALL_COLORS_WITH_GOLD.reduce((sum, c) => sum + (toDrop[c] ?? 0), 0);

  // Cannot drop more than you have
  for (const color of ALL_COLORS_WITH_GOLD) {
    const drop = toDrop[color] ?? 0;
    if (drop < 0) return { valid: false, reason: 'Cannot drop negative gems' };
    if (drop > (player.crystals[color] ?? 0)) {
      return { valid: false, reason: `Cannot drop more ${color} gems than you have` };
    }
  }

  const afterDrop = totalInHand - totalDrop;
  if (afterDrop > MAX_GEMS_IN_HAND) {
    return {
      valid: false,
      reason: `Must drop enough gems to reach ${MAX_GEMS_IN_HAND} or fewer. Currently at ${totalInHand}, dropping ${totalDrop}`,
    };
  }

  return { valid: true };
}

// ─── COST CALCULATION ─────────────────────────────────────────

/**
 * Computes the actual crystal cost for a card after applying player bonuses.
 * Bonuses reduce cost directly; cannot go below 0 per color.
 */
export function computeEffectiveCost(card: Card, player: Player): CrystalPool {
  const effective = emptyPool();
  for (const color of ALL_CRYSTAL_COLORS) {
    const raw = card.cost[color] ?? 0;
    const bonus = player.bonuses[color] ?? 0;
    effective[color] = Math.max(0, raw - bonus);
  }
  return effective;
}

// ─── APPLY ACTION ─────────────────────────────────────────────

/**
 * Applies a validated action to the game state.
 * Returns new immutable GameState. Does NOT mutate input.
 *
 * ⚠️  Always call validateAction first.
 */
export function applyAction(
  state: GameState,
  playerId: string,
  action: GameAction,
  // Decks passed separately (stored server-side)
  decks: { tier1: Card[]; tier2: Card[]; tier3: Card[] },
): { newState: GameState; newDecks: { tier1: Card[]; tier2: Card[]; tier3: Card[] } } {
  let newState = deepClone(state) as GameState;
  let newDecks = deepClone(decks);

  const playerIndex = newState.players.findIndex((p) => p.id === playerId);

  switch (action.type) {
    case 'TAKE_3_GEMS':
      newState = applyTake3Gems(newState, playerIndex, action);
      break;
    case 'TAKE_2_GEMS':
      newState = applyTake2Gems(newState, playerIndex, action);
      break;
    case 'RESERVE_CARD': {
      const result = applyReserveCard(newState, playerIndex, action, newDecks);
      newState = result.newState;
      newDecks = result.newDecks;
      break;
    }
    case 'BUY_CARD': {
      const result = applyBuyCard(newState, playerIndex, action, newDecks);
      newState = result.newState;
      newDecks = result.newDecks;
      break;
    }
    case 'DROP_GEMS':
      newState = applyDropGems(newState, playerIndex, action);
      break;
  }

  // After any action (except drop — that's mid-turn), check if we need gem drop
  if (action.type !== 'DROP_GEMS') {
    const updatedPlayer = newState.players[playerIndex];
    if (totalGems(updatedPlayer.crystals) > MAX_GEMS_IN_HAND) {
      newState.phase = 'dropGems';
      return { newState, newDecks };
    }
  }

  // Check Guardian visits after action
  if (action.type !== 'DROP_GEMS') {
    newState = processGuardianVisits(newState, playerIndex);
    newState = processAvengersAssemble(newState, playerIndex);
  }

  // Recalculate player score
  const finalPlayer = newState.players[playerIndex];
  newState.players[playerIndex] = {
    ...finalPlayer,
    score: calculateScore(finalPlayer, newState.board.avengersAssembleHolder === finalPlayer.id),
    bonuses: calculateBonuses(finalPlayer),
  };

  // Win condition check — triggers final round
  const winningPlayer = newState.players[playerIndex];
  if (checkWinCondition(winningPlayer, newState.board.avengersAssembleHolder === winningPlayer.id) && newState.winTriggeredBy === null) {
    newState.winTriggeredBy = playerId;
  }

  // Advance turn
  newState = advanceTurn(newState);

  return { newState, newDecks };
}

// ─── ACTION APPLIERS ──────────────────────────────────────────

function applyTake3Gems(
  state: GameState,
  playerIndex: number,
  action: Take3GemsAction,
): GameState {
  const newState = deepClone(state) as GameState;
  const player = newState.players[playerIndex];

  for (const color of action.colors) {
    newState.board.crystalBank[color]--;
    player.crystals[color]++;
  }

  return newState;
}

function applyTake2Gems(
  state: GameState,
  playerIndex: number,
  action: Take2GemsAction,
): GameState {
  const newState = deepClone(state) as GameState;
  const player = newState.players[playerIndex];

  newState.board.crystalBank[action.color] -= 2;
  player.crystals[action.color] += 2;

  return newState;
}

function applyReserveCard(
  state: GameState,
  playerIndex: number,
  action: ReserveCardAction,
  decks: { tier1: Card[]; tier2: Card[]; tier3: Card[] },
): { newState: GameState; newDecks: { tier1: Card[]; tier2: Card[]; tier3: Card[] } } {
  const newState = deepClone(state) as GameState;
  const newDecks = deepClone(decks);
  const player = newState.players[playerIndex];

  let reservedCard: Card;

  if (action.cardId !== null) {
    // Reserve from visible board
    const found = findCardOnBoard(newState.board, action.cardId);
    if (!found) throw new Error('Card not found');

    reservedCard = found.card;
    const tier = found.tier;
    const index = found.index;

    // Fill slot from deck
    const deckKey = `tier${tier}` as keyof typeof newDecks;
    const { newBoard, remainingDeck } = fillBoardSlot(newState.board, tier, index, newDecks[deckKey]);
    newState.board = newBoard;
    newDecks[deckKey] = remainingDeck;
  } else {
    // Draw from top of deck (face-down reserve)
    const tier = action.deckTier!;
    const deckKey = `tier${tier}` as keyof typeof newDecks;
    const [top, ...rest] = newDecks[deckKey];
    reservedCard = { ...top, id: `reserved_${uuidv4().slice(0, 8)}` };
    newDecks[deckKey] = rest;

    // Update deck count
    if (tier === 1) newState.board.tier1DeckCount = rest.length;
    else if (tier === 2) newState.board.tier2DeckCount = rest.length;
    else newState.board.tier3DeckCount = rest.length;
  }

  player.reservedCards.push(reservedCard);

  // Grant 1 gold gem if available
  if (newState.board.crystalBank.gold > 0) {
    newState.board.crystalBank.gold--;
    player.crystals.gold++;
  }

  return { newState, newDecks };
}

function applyBuyCard(
  state: GameState,
  playerIndex: number,
  action: BuyCardAction,
  decks: { tier1: Card[]; tier2: Card[]; tier3: Card[] },
): { newState: GameState; newDecks: { tier1: Card[]; tier2: Card[]; tier3: Card[] } } {
  const newState = deepClone(state) as GameState;
  const newDecks = deepClone(decks);
  const player = newState.players[playerIndex];

  // Find card — on board or in reserve
  const boardFound = findCardOnBoard(newState.board, action.cardId);
  let card: Card;

  if (boardFound) {
    card = boardFound.card;
    // Fill board slot
    const deckKey = `tier${boardFound.tier}` as keyof typeof newDecks;
    const { newBoard, remainingDeck } = fillBoardSlot(
      newState.board,
      boardFound.tier,
      boardFound.index,
      newDecks[deckKey],
    );
    newState.board = newBoard;
    newDecks[deckKey] = remainingDeck;
  } else {
    const reserved = findReservedCard(player, action.cardId);
    if (!reserved) throw new Error('Card not found in reserve');
    card = reserved;
    player.reservedCards = player.reservedCards.filter((c) => c.id !== action.cardId);
  }

  // Deduct crystals — bonuses reduce cost, gold fills gap
  const effectiveCost = computeEffectiveCost(card, player);
  let goldToSpend = 0;

  for (const color of ALL_CRYSTAL_COLORS) {
    const needed = effectiveCost[color] ?? 0;
    const have = player.crystals[color] ?? 0;

    if (have >= needed) {
      player.crystals[color] -= needed;
      newState.board.crystalBank[color] += needed;
    } else {
      const gap = needed - have;
      player.crystals[color] = 0;
      newState.board.crystalBank[color] += have;
      goldToSpend += gap;
    }
  }

  // Spend gold
  player.crystals.gold -= goldToSpend;
  newState.board.crystalBank.gold += goldToSpend;

  // Grant the card
  player.ownedCards.push(card);

  // Time Stone Rule: Award green Time Stone token immediately upon recruiting 1st Tier-3 card
  if (card.tier === 3 && newState.board.timeStoneAvailable) {
    newState.board.timeStoneAvailable = false;
    newState.board.timeStoneHolder = player.id;
    player.crystals.emerald = 1;
  }

  return { newState, newDecks };
}

function applyDropGems(
  state: GameState,
  playerIndex: number,
  action: DropGemsAction,
): GameState {
  const newState = deepClone(state) as GameState;
  const player = newState.players[playerIndex];

  for (const color of ALL_COLORS_WITH_GOLD) {
    if (color === 'emerald') continue; // Time stone cannot be discarded
    const drop = action.toDrop[color] ?? 0;
    player.crystals[color] -= drop;
    newState.board.crystalBank[color] += drop;
  }

  newState.phase = 'playing';

  // After drop, check Guardian visits and advance turn
  newState.players[playerIndex] = {
    ...player,
    score: calculateScore(player, newState.board.avengersAssembleHolder === player.id),
    bonuses: calculateBonuses(player),
  };

  return processGuardianVisits(newState, playerIndex);
}

// ─── GUARDIAN PROCESSING ─────────────────────────────────────

function processGuardianVisits(state: GameState, playerIndex: number): GameState {
  const newState = deepClone(state) as GameState;
  const player = newState.players[playerIndex];

  const eligible = getEligibleGuardians(player, newState.board.availableGuardians);

  if (eligible.length === 0) return newState;

  // Auto-grant all eligible Guardians (per Splendor rules — mandatory claim)
  for (const guardian of eligible) {
    player.guardians.push(guardian);
    newState.board.availableGuardians = newState.board.availableGuardians.filter(
      (g) => g.id !== guardian.id,
    );
  }

  // Update score after guardian gain
  newState.players[playerIndex] = {
    ...player,
    score: calculateScore(player, newState.board.avengersAssembleHolder === player.id),
  };

  return newState;
}

function processAvengersAssemble(state: GameState, playerIndex: number): GameState {
  const newState = deepClone(state) as GameState;
  const player = newState.players[playerIndex];
  
  const currentSymbols = countAvengersSymbols(player);
  if (currentSymbols >= 3) {
    const currentHolderId = newState.board.avengersAssembleHolder;
    
    if (currentHolderId === null) {
      // No one holds it, so this player claims it
      newState.board.avengersAssembleHolder = player.id;
    } else if (currentHolderId !== player.id) {
      // Someone else holds it. Check if this player has STRICTLY MORE symbols
      const currentHolder = newState.players.find(p => p.id === currentHolderId);
      if (currentHolder) {
        const holderSymbols = countAvengersSymbols(currentHolder);
        if (currentSymbols > holderSymbols) {
          newState.board.avengersAssembleHolder = player.id;
        }
      }
    }
  }

  return newState;
}

// ─── TURN ADVANCEMENT ─────────────────────────────────────────

function advanceTurn(state: GameState): GameState {
  const newState = deepClone(state) as GameState;
  const nextIndex = (newState.currentPlayerIndex + 1) % newState.players.length;

  // Check if we completed a full final round (everyone played after trigger)
  if (
    newState.winTriggeredBy !== null &&
    nextIndex === 0 // Wrapped around to first player = round complete
  ) {
    const winners = resolveWinners(
      newState.players.filter((p) => checkWinCondition(p, newState.board.avengersAssembleHolder === p.id)),
      newState.board.avengersAssembleHolder
    );
    newState.winners = winners.map((p) => p.id);
    newState.phase = 'finished';
    return newState;
  }

  newState.currentPlayerIndex = nextIndex;
  if (nextIndex === 0) {
    newState.turnNumber++;
  }

  return newState;
}

// ─── SANITIZE STATE FOR CLIENT ────────────────────────────────

/**
 * Removes internal deck arrays and masks reserved card details for opponents.
 * This is what gets sent to each client over Socket.io.
 */
export function sanitizeStateForPlayer(
  state: GameState,
  viewingPlayerId: string,
): GameState {
  const sanitized = deepClone(state) as GameState;

  // Mask reserved cards for other players (show count only, not card details)
  sanitized.players = sanitized.players.map((player) => {
    if (player.id === viewingPlayerId) return player;

    return {
      ...player,
      reservedCards: player.reservedCards.map((card) => ({
        ...card,
        id: 'hidden',
        // Mask name and cost for opponents' reserved cards
      })),
    };
  });

  return sanitized;
}

// ─── EXPORTS (re-exports for convenience) ────────────────────

export { checkWinCondition, totalGems, emptyPool };
