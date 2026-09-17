// ============================================================
//  game.types.ts — Nexus Realm Shared Type Definitions
//  All game entities, actions, and socket payloads are typed here.
// ============================================================

// ─── Crystal (Gem) Types ────────────────────────────────────

export type CrystalColor =
  | 'ruby'
  | 'sapphire'
  | 'emerald'
  | 'obsidian'
  | 'topaz'
  | 'amethyst'
  | 'gold'; // gold = wildcard / Ether Crystal

export const ALL_CRYSTAL_COLORS: CrystalColor[] = [
  'ruby',
  'sapphire',
  'emerald',
  'obsidian',
  'topaz',
  'amethyst',
];

export const ALL_COLORS_WITH_GOLD: CrystalColor[] = [
  ...ALL_CRYSTAL_COLORS,
  'gold',
];

/** The 5 standard Infinity Stones present in the central bank and on card bonuses/costs */
export const BANK_STONE_COLORS: CrystalColor[] = [
  'topaz',     // Mind Stone (Yellow)
  'sapphire',  // Space Stone (Blue)
  'obsidian',  // Soul Stone (Orange)
  'amethyst',  // Power Stone (Purple)
  'ruby',      // Reality Stone (Red)
];

/** Card bonuses are strictly the 5 standard Infinity Stones (Green Time Stone is token-only) */
export const CARD_BONUS_COLORS: CrystalColor[] = BANK_STONE_COLORS;

/** Key-value map of crystal color → quantity */
export type CrystalPool = Record<CrystalColor, number>;

// ─── Card Tier ───────────────────────────────────────────────

export type CardTier = 1 | 2 | 3;

// ─── Artifact Card ───────────────────────────────────────────

export interface Card {
  readonly id: string;
  readonly name: string;
  readonly tier: CardTier;
  /** Victory points this card grants when purchased */
  readonly points: number;
  /** The Crystal bonus color this card permanently provides */
  readonly bonusColor: CrystalColor;
  /** Crystal cost to purchase this card */
  readonly cost: CrystalPool;
  readonly avengersSymbol: boolean | number;
  readonly avengersCount?: number;
}

// ─── Ancient Guardian (Noble equivalent) ─────────────────────

export interface Guardian {
  readonly id: string;
  readonly name: string;
  /** Victory points granted when this Guardian visits */
  readonly points: number;
  /** Required card bonuses to attract this Guardian */
  readonly requirement: Partial<Record<CrystalColor, number>>;
}

// ─── Player ──────────────────────────────────────────────────

export interface Player {
  readonly id: string;
  name: string;
  /** Avatar image URL or path */
  avatarUrl?: string;
  /** Crystals in hand (max 10) */
  crystals: CrystalPool;
  /** Bonus crystals from owned cards (permanent discount) */
  bonuses: CrystalPool;
  /** Purchased artifact cards */
  ownedCards: Card[];
  /** Reserved (face-down) cards, max 3 */
  reservedCards: Card[];
  /** Guardians that have visited this player */
  guardians: Guardian[];
  /** Total victory points */
  score: number;
  /** Whether this player has met all win conditions */
  hasWon: boolean;
  /** Whether this player is an AI bot */
  isBot?: boolean;
  /** AI Bot personality archetype */
  botPersonality?: string;
}

// ─── Game Board State ─────────────────────────────────────────

export interface BoardState {
  /** Visible cards on board — 4 per tier */
  tier1: (Card | null)[];
  tier2: (Card | null)[];
  tier3: (Card | null)[];
  /** Remaining face-down deck counts */
  tier1DeckCount: number;
  tier2DeckCount: number;
  tier3DeckCount: number;
  /** Available crystals in the bank */
  crystalBank: CrystalPool;
  /** Guardian tiles available to be claimed */
  availableGuardians: Guardian[];
  /** Player ID who holds the Avengers Assemble tile */
  avengersAssembleHolder: string | null;
  /** Number of green Time Stones remaining beside the Infinity Gauntlet */
  timeStoneCount: number;
  /** Whether any green Time Stone is available beside the Infinity Gauntlet (awarded on 1st Tier-3 card) */
  timeStoneAvailable: boolean;
  /** Player ID who claimed the first Green Time Stone */
  timeStoneHolder: string | null;
  /** Player IDs who currently hold a Green Time Stone */
  timeStoneHolders?: string[];
}

// ─── Game Phase ───────────────────────────────────────────────

export type GamePhase =
  | 'lobby'       // Waiting for players
  | 'playing'     // Active gameplay
  | 'dropGems'    // Player must discard gems (> 10)
  | 'finished';   // Game over

// ─── Full Game State ──────────────────────────────────────────

export interface GameState {
  readonly roomId: string;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  board: BoardState;
  /** Player ID who triggered the last winning turn (final round in progress) */
  winTriggeredBy: string | null;
  /** Final winner(s) after all players complete the round */
  winners: string[];
  turnNumber: number;
  /** Chosen Marvel battlefield background map ID (immutable once game starts) */
  mapId?: string;
  /** Target score needed to trigger win condition (default: 16) */
  targetScore?: number;
}

// ─── Actions ─────────────────────────────────────────────────

export type ActionType =
  | 'TAKE_3_GEMS'
  | 'TAKE_2_GEMS'
  | 'RESERVE_CARD'
  | 'BUY_CARD'
  | 'DROP_GEMS';

export interface Take3GemsAction {
  type: 'TAKE_3_GEMS';
  /** Exactly 3 different non-gold colors */
  colors: [CrystalColor, CrystalColor, CrystalColor];
}

export interface Take2GemsAction {
  type: 'TAKE_2_GEMS';
  /** One color of which ≥ 4 must be in bank */
  color: CrystalColor;
}

export interface ReserveCardAction {
  type: 'RESERVE_CARD';
  /** Card ID from board, or null to draw from a deck */
  cardId: string | null;
  /** Which tier deck to draw from (when cardId is null) */
  deckTier?: CardTier;
}

export interface BuyCardAction {
  type: 'BUY_CARD';
  /** Card ID — either from board or from player's reserved cards */
  cardId: string;
}

export interface DropGemsAction {
  type: 'DROP_GEMS';
  /** Crystals to return to bank. Total must reduce hand to ≤ 10 */
  toDrop: Partial<CrystalPool>;
}

export type GameAction =
  | Take3GemsAction
  | Take2GemsAction
  | ReserveCardAction
  | BuyCardAction
  | DropGemsAction;

// ─── Validation Result ───────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

// ─── Room ────────────────────────────────────────────────────

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface RoomPlayer {
  id: string;
  name: string;
  avatarUrl?: string;
  isBot?: boolean;
  botPersonality?: string;
}

export interface RoomInfo {
  roomId: string;
  hostId: string;
  players: RoomPlayer[];
  maxPlayers: number;
  status: RoomStatus;
  mapId?: string;
  targetScore?: number;
}

// ─── Socket Event Payloads ───────────────────────────────────

export interface ServerToClientEvents {
  'room:updated': (room: RoomInfo) => void;
  'game:stateUpdate': (state: GameState) => void;
  'game:error': (payload: { message: string }) => void;
  'game:over': (payload: { winners: string[] }) => void;
  'room:list': (rooms: RoomInfo[]) => void;
}

export interface ClientToServerEvents {
  'room:create': (payload: { playerName: string; avatarUrl?: string; mapId?: string; targetScore?: number }, callback: (room: RoomInfo) => void) => void;
  'room:join': (payload: { roomId: string; playerName: string; avatarUrl?: string }, callback: (result: { success: boolean; room?: RoomInfo; error?: string }) => void) => void;
  'room:leave': () => void;
  'room:addBot': (payload: { botName?: string; personality?: string; avatarUrl?: string }, callback: (result: { success: boolean; room?: RoomInfo; error?: string }) => void) => void;
  'room:removeBot': (payload: { botId: string }, callback: (result: { success: boolean; room?: RoomInfo; error?: string }) => void) => void;
  'room:createSolo': (payload: { playerName: string; avatarUrl?: string; botCount: number; botNames?: string[]; mapId?: string; targetScore?: number }, callback: (result: { success: boolean; room?: RoomInfo; error?: string }) => void) => void;
  'room:setTargetScore': (payload: { targetScore: number }, callback: (result: { success: boolean; room?: RoomInfo; error?: string }) => void) => void;
  'game:start': () => void;
  'game:action': (action: GameAction) => void;
  'room:listAll': (callback: (rooms: RoomInfo[]) => void) => void;
}
