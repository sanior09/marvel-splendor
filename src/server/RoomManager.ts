// ============================================================
//  RoomManager.ts — Nexus Realm Room & Session Management
//
//  Manages all active game rooms, player sessions, and
//  broadcasts sanitized game state to connected clients.
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type { Server, Socket } from 'socket.io';
import type {
  GameState,
  RoomInfo,
  GameAction,
  ServerToClientEvents,
  ClientToServerEvents,
} from '../types/game.types';
import type { Card } from '../types/game.types';
import {
  initGame,
  validateAction,
  applyAction,
  sanitizeStateForPlayer,
} from '../engine/GameLogic';
import { computeBotAction } from '../engine/BotLogic';

// ─── Internal Types ───────────────────────────────────────────

interface PlayerSession {
  id: string;
  name: string;
  socketId: string;
  isBot?: boolean;
  botPersonality?: string;
}

interface Room {
  roomId: string;
  hostId: string;          // Player ID of the host
  sessions: PlayerSession[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  // Game state — null until game starts
  gameState: GameState | null;
  // Private decks (never sent to clients)
  decks: {
    tier1: Card[];
    tier2: Card[];
    tier3: Card[];
  };
}

// ─── RoomManager Class ────────────────────────────────────────

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  /** Maps socket.id → roomId the player is currently in */
  private socketToRoom: Map<string, string> = new Map();
  /** Maps socket.id → playerId */
  private socketToPlayer: Map<string, string> = new Map();

  constructor(private readonly io: Server<ClientToServerEvents, ServerToClientEvents>) {}

  // ─── Room Creation ──────────────────────────────────────────

  createRoom(socket: Socket, playerName: string): RoomInfo {
    const roomId = uuidv4().slice(0, 6).toUpperCase();
    const playerId = uuidv4();

    const session: PlayerSession = {
      id: playerId,
      name: playerName,
      socketId: socket.id,
    };

    const room: Room = {
      roomId,
      hostId: playerId,
      sessions: [session],
      maxPlayers: 4,
      status: 'waiting',
      gameState: null,
      decks: { tier1: [], tier2: [], tier3: [] },
    };

    this.rooms.set(roomId, room);
    this.socketToRoom.set(socket.id, roomId);
    this.socketToPlayer.set(socket.id, playerId);

    socket.join(roomId);

    console.log(`[RoomManager] Room ${roomId} created by ${playerName}`);
    return this.toRoomInfo(room);
  }

  // ─── Join Room ──────────────────────────────────────────────

  joinRoom(
    socket: Socket,
    roomId: string,
    playerName: string,
  ): { success: boolean; room?: RoomInfo; error?: string } {
    const room = this.rooms.get(roomId);

    if (!room) return { success: false, error: `Room ${roomId} not found` };
    if (room.status !== 'waiting') return { success: false, error: 'Game already in progress' };
    if (room.sessions.length >= room.maxPlayers) return { success: false, error: 'Room is full' };

    const playerId = uuidv4();
    const session: PlayerSession = {
      id: playerId,
      name: playerName,
      socketId: socket.id,
    };

    room.sessions.push(session);
    this.socketToRoom.set(socket.id, roomId);
    this.socketToPlayer.set(socket.id, playerId);

    socket.join(roomId);

    // Notify everyone in room
    const roomInfo = this.toRoomInfo(room);
    this.io.to(roomId).emit('room:updated', roomInfo);

    console.log(`[RoomManager] ${playerName} joined room ${roomId}`);
    return { success: true, room: roomInfo };
  }

  // ─── Leave Room ─────────────────────────────────────────────

  leaveRoom(socket: Socket): void {
    const roomId = this.socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const playerId = this.socketToPlayer.get(socket.id);
    room.sessions = room.sessions.filter((s) => s.socketId !== socket.id);

    this.socketToRoom.delete(socket.id);
    this.socketToPlayer.delete(socket.id);
    socket.leave(roomId);

    // Clean up empty rooms
    if (room.sessions.length === 0) {
      this.rooms.delete(roomId);
      console.log(`[RoomManager] Room ${roomId} deleted (empty)`);
      return;
    }

    // Transfer host if host left
    if (room.hostId === playerId && room.sessions.length > 0) {
      room.hostId = room.sessions[0].id;
    }

    this.io.to(roomId).emit('room:updated', this.toRoomInfo(room));
    console.log(`[RoomManager] Player ${playerId} left room ${roomId}`);
  }

  // ─── Start Game ─────────────────────────────────────────────

  startGame(socket: Socket): { success: boolean; error?: string } {
    const roomId = this.socketToRoom.get(socket.id);
    const playerId = this.socketToPlayer.get(socket.id);

    if (!roomId || !playerId) return { success: false, error: 'Not in a room' };

    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };
    if (room.hostId !== playerId) return { success: false, error: 'Only the host can start the game' };
    if (room.sessions.length < 2) return { success: false, error: 'Need at least 2 players' };
    if (room.status !== 'waiting') return { success: false, error: 'Game already started' };

    const playerIds = room.sessions.map((s) => s.id);
    const playerNames = room.sessions.map((s) => s.name);
    const botInfo = room.sessions.map((s) => ({
      isBot: s.isBot,
      botPersonality: s.botPersonality,
    }));

    try {
      // initGame returns state with _tierXDeck side-channel
      const rawState = initGame(roomId, playerIds, playerNames, botInfo) as GameState & {
        _tier1Deck?: Card[];
        _tier2Deck?: Card[];
        _tier3Deck?: Card[];
      };

      // Extract private decks
      room.decks = {
        tier1: rawState._tier1Deck ?? [],
        tier2: rawState._tier2Deck ?? [],
        tier3: rawState._tier3Deck ?? [],
      };

      // Strip private fields from state
      delete (rawState as Partial<typeof rawState>)._tier1Deck;
      delete (rawState as Partial<typeof rawState>)._tier2Deck;
      delete (rawState as Partial<typeof rawState>)._tier3Deck;

      room.gameState = rawState;
      room.status = 'playing';

      this.broadcastGameState(roomId);
      console.log(`[RoomManager] Game started in room ${roomId}`);
      this.checkBotTurn(roomId);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, error: msg };
    }
  }

  // ─── Bot Management ─────────────────────────────────────────

  addBot(
    socket: Socket,
    botName?: string,
    personality?: string,
  ): { success: boolean; room?: RoomInfo; error?: string } {
    const roomId = this.socketToRoom.get(socket.id);
    const playerId = this.socketToPlayer.get(socket.id);

    if (!roomId || !playerId) return { success: false, error: 'Not in a room' };
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };
    if (room.hostId !== playerId) return { success: false, error: 'Only host can add bots' };
    if (room.sessions.length >= room.maxPlayers) return { success: false, error: 'Room is full' };

    const botId = uuidv4();
    const defaultBots = [
      { name: 'Tony Stark AI', personality: 'stark' },
      { name: 'Ultron', personality: 'ultron' },
      { name: 'Thanos Bot', personality: 'thanos' },
      { name: 'F.R.I.D.A.Y.', personality: 'friday' },
    ];
    const existingNames = new Set(room.sessions.map((s) => s.name));
    const nextDefault = defaultBots.find((b) => !existingNames.has(b.name)) ?? {
      name: `Marvel AI ${room.sessions.length}`,
      personality: 'balanced',
    };

    room.sessions.push({
      id: botId,
      name: botName ?? nextDefault.name,
      socketId: `bot_${botId}`,
      isBot: true,
      botPersonality: personality ?? nextDefault.personality,
    });

    const roomInfo = this.toRoomInfo(room);
    this.io.to(roomId).emit('room:updated', roomInfo);
    console.log(`[RoomManager] Added bot ${botName ?? nextDefault.name} to room ${roomId}`);
    return { success: true, room: roomInfo };
  }

  removeBot(
    socket: Socket,
    botId: string,
  ): { success: boolean; room?: RoomInfo; error?: string } {
    const roomId = this.socketToRoom.get(socket.id);
    const playerId = this.socketToPlayer.get(socket.id);

    if (!roomId || !playerId) return { success: false, error: 'Not in a room' };
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };
    if (room.hostId !== playerId) return { success: false, error: 'Only host can remove bots' };

    room.sessions = room.sessions.filter((s) => s.id !== botId);
    const roomInfo = this.toRoomInfo(room);
    this.io.to(roomId).emit('room:updated', roomInfo);
    return { success: true, room: roomInfo };
  }

  createSoloRoom(
    socket: Socket,
    playerName: string,
    botCount: number,
    botNames?: string[],
  ): { success: boolean; room?: RoomInfo; error?: string } {
    const roomInfo = this.createRoom(socket, playerName);
    const room = this.rooms.get(roomInfo.roomId);
    if (!room) return { success: false, error: 'Failed to create room' };

    const botTemplates = [
      { name: 'Doctor Doom', personality: 'stark' },
      { name: 'Loki', personality: 'ultron' },
      { name: 'Thanos Bot', personality: 'thanos' },
    ];

    const actualCount = Math.min(Math.max(1, botCount), 3);
    for (let i = 0; i < actualCount; i++) {
      const template = botTemplates[i];
      const customName = botNames?.[i]?.trim();
      const botId = uuidv4();
      room.sessions.push({
        id: botId,
        name: customName || template.name,
        socketId: `bot_${botId}`,
        isBot: true,
        botPersonality: template.personality,
      });
    }

    const startResult = this.startGame(socket);
    if (!startResult.success) {
      return { success: false, error: startResult.error };
    }

    return { success: true, room: this.toRoomInfo(room) };
  }

  // ─── Bot Turn Execution ─────────────────────────────────────

  private checkBotTurn(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room?.gameState || room.gameState.phase === 'finished') return;

    const currentPlayer = room.gameState.players[room.gameState.currentPlayerIndex];
    if (!currentPlayer?.isBot) return;

    // Realistic bot reaction time delay
    setTimeout(() => {
      const currentRoom = this.rooms.get(roomId);
      if (!currentRoom?.gameState || currentRoom.gameState.phase === 'finished') return;

      const activePlayer = currentRoom.gameState.players[currentRoom.gameState.currentPlayerIndex];
      if (!activePlayer?.isBot || activePlayer.id !== currentPlayer.id) return;

      const botAction = computeBotAction(currentRoom.gameState, activePlayer.id);
      if (!botAction) {
        console.warn(`[RoomManager] Bot ${activePlayer.name} could not compute valid action.`);
        return;
      }

      console.log(`[RoomManager] Bot ${activePlayer.name} executing action:`, botAction.type);

      try {
        const { newState, newDecks } = applyAction(
          currentRoom.gameState,
          activePlayer.id,
          botAction,
          currentRoom.decks,
        );

        currentRoom.gameState = newState;
        currentRoom.decks = newDecks;

        if (newState.phase === 'finished') {
          currentRoom.status = 'finished';
          this.io.to(roomId).emit('game:over', { winners: newState.winners });
        }

        this.broadcastGameState(roomId);
        this.checkBotTurn(roomId);
      } catch (err) {
        console.error(`[RoomManager] Bot turn execution error in room ${roomId}:`, err);
      }
    }, 1100);
  }

  // ─── Handle Game Action ─────────────────────────────────────

  handleAction(socket: Socket, action: GameAction): void {
    const roomId = this.socketToRoom.get(socket.id);
    const playerId = this.socketToPlayer.get(socket.id);

    if (!roomId || !playerId) {
      socket.emit('game:error', { message: 'Not in a room' });
      return;
    }

    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) {
      socket.emit('game:error', { message: 'Game not started' });
      return;
    }

    // Validate — server-side authority
    const validation = validateAction(room.gameState, playerId, action);
    if (!validation.valid) {
      socket.emit('game:error', { message: validation.reason ?? 'Invalid action' });
      return;
    }

    // Apply action
    try {
      const { newState, newDecks } = applyAction(
        room.gameState,
        playerId,
        action,
        room.decks,
      );

      room.gameState = newState;
      room.decks = newDecks;

      if (newState.phase === 'finished') {
        room.status = 'finished';
        this.io.to(roomId).emit('game:over', { winners: newState.winners });
      }

      this.broadcastGameState(roomId);
      this.checkBotTurn(roomId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Action execution error';
      console.error(`[RoomManager] Action error in room ${roomId}:`, err);
      socket.emit('game:error', { message: msg });
    }
  }

  // ─── Broadcast State ────────────────────────────────────────

  /**
   * Sends a sanitized view of the game state to each player.
   * Players see their own reserved cards, but opponents' reserves are masked.
   */
  private broadcastGameState(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room?.gameState) return;

    for (const session of room.sessions) {
      if (session.isBot) continue; // Bots don't need socket messages
      const sanitized = sanitizeStateForPlayer(room.gameState, session.id);
      this.io.to(session.socketId).emit('game:stateUpdate', sanitized);
    }
  }

  // ─── List Rooms ─────────────────────────────────────────────

  listAllRooms(): RoomInfo[] {
    return Array.from(this.rooms.values())
      .filter((r) => r.status === 'waiting')
      .map((r) => this.toRoomInfo(r));
  }

  // ─── Handle Disconnect ──────────────────────────────────────

  handleDisconnect(socket: Socket): void {
    console.log(`[RoomManager] Socket disconnected: ${socket.id}`);
    this.leaveRoom(socket);
  }

  // ─── Private Helpers ────────────────────────────────────────

  private toRoomInfo(room: Room): RoomInfo {
    return {
      roomId: room.roomId,
      hostId: room.hostId,
      players: room.sessions.map((s) => ({
        id: s.id,
        name: s.name,
        isBot: s.isBot,
        botPersonality: s.botPersonality,
      })),
      maxPlayers: room.maxPlayers,
      status: room.status,
    };
  }
}
