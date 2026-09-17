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
  avatarUrl?: string;
  isBot?: boolean;
  botPersonality?: string;
}

interface Room {
  roomId: string;
  hostId: string;          // Player ID of the host
  sessions: PlayerSession[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  mapId: string;
  targetScore: number;
  // Game state — null until game starts
  gameState: GameState | null;
  // Private decks (never sent to clients)
  decks: {
    tier1: Card[];
    tier2: Card[];
    tier3: Card[];
  };
  lastActivity: number;
}

// ─── RoomManager Class ────────────────────────────────────────

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  /** Maps socket.id → roomId the player is currently in */
  private socketToRoom: Map<string, string> = new Map();
  /** Maps socket.id → playerId */
  private socketToPlayer: Map<string, string> = new Map();

  constructor(private readonly io: Server<ClientToServerEvents, ServerToClientEvents>) {
    // Periodic cleanup of abandoned rooms (> 5.5 minutes of complete inactivity)
    setInterval(() => {
      this.cleanupInactiveRooms();
    }, 60 * 1000);
  }

  private cleanupInactiveRooms(): void {
    const now = Date.now();
    const INACTIVITY_LIMIT_MS = 4 * 60 * 1000;

    for (const [roomId, room] of this.rooms.entries()) {
      if (now - (room.lastActivity ?? now) > INACTIVITY_LIMIT_MS) {
        console.log(`[RoomManager] Closing abandoned room ${roomId} due to 4min inactivity`);
        for (const session of room.sessions) {
          if (!session.isBot) {
            this.socketToRoom.delete(session.socketId);
            this.socketToPlayer.delete(session.socketId);
          }
        }
        this.rooms.delete(roomId);
      }
    }
  }

  // ─── Room Creation ──────────────────────────────────────────

  createRoom(socket: Socket, playerName: string, mapId = 'avengers_tower', avatarUrl?: string, targetScore = 16): RoomInfo {
    const roomId = uuidv4().slice(0, 6).toUpperCase();
    const playerId = uuidv4();

    const session: PlayerSession = {
      id: playerId,
      name: playerName,
      socketId: socket.id,
      avatarUrl,
    };

    const validTargetScore = Math.min(Math.max(10, Number(targetScore) || 16), 50);

    const room: Room = {
      roomId,
      hostId: playerId,
      sessions: [session],
      maxPlayers: 4,
      status: 'waiting',
      mapId: mapId || 'avengers_tower',
      targetScore: validTargetScore,
      gameState: null,
      decks: { tier1: [], tier2: [], tier3: [] },
      lastActivity: Date.now(),
    };

    this.rooms.set(roomId, room);
    this.socketToRoom.set(socket.id, roomId);
    this.socketToPlayer.set(socket.id, playerId);

    socket.join(roomId);

    console.log(`[RoomManager] Room ${roomId} created by ${playerName} with map ${room.mapId}`);
    return this.toRoomInfo(room);
  }

  // ─── Join Room ──────────────────────────────────────────────

  joinRoom(
    socket: Socket,
    roomId: string,
    playerName: string,
    avatarUrl?: string,
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
      avatarUrl,
    };

    room.sessions.push(session);
    room.lastActivity = Date.now();
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

    // ─── Active Game AFK / Disconnect Takeover ───────────────
    // If game is in progress, convert player to an AI Bot so the game continues smoothly!
    if (room.status === 'playing' && room.gameState && room.gameState.phase !== 'finished') {
      const session = room.sessions.find((s) => s.socketId === socket.id);
      const otherHumans = room.sessions.filter((s) => s.socketId !== socket.id && !s.isBot);

      // If no humans are left in the entire room, close the room
      if (otherHumans.length === 0) {
        this.socketToRoom.delete(socket.id);
        this.socketToPlayer.delete(socket.id);
        socket.leave(roomId);
        this.rooms.delete(roomId);
        console.log(`[RoomManager] Active room ${roomId} deleted (all humans left)`);
        return;
      }

      if (session) {
        session.isBot = true;
        session.socketId = `bot_${session.id}`;
        if (!session.name.includes('(AI)')) {
          session.name = `${session.name} (AI)`;
        }
        session.botPersonality = session.botPersonality || 'balanced';

        const gamePlayer = room.gameState.players.find((p) => p.id === session.id);
        if (gamePlayer) {
          gamePlayer.isBot = true;
          if (!gamePlayer.name.includes('(AI)')) {
            gamePlayer.name = `${gamePlayer.name} (AI)`;
          }
          gamePlayer.botPersonality = session.botPersonality;
        }

        // Transfer host if host was the one who left
        if (room.hostId === playerId) {
          room.hostId = otherHumans[0].id;
        }

        this.socketToRoom.delete(socket.id);
        this.socketToPlayer.delete(socket.id);
        socket.leave(roomId);

        room.lastActivity = Date.now();
        this.io.to(roomId).emit('room:updated', this.toRoomInfo(room));
        this.broadcastGameState(roomId);
        console.log(`[RoomManager] Player ${playerId} (${session.name}) converted to AI Bot in room ${roomId}`);

        // If it was this player's turn, trigger bot turn execution immediately!
        this.checkBotTurn(roomId);
        return;
      }
    }

    // ─── Waiting Room or Finished Game: Normal Removal ────────
    room.sessions = room.sessions.filter((s) => s.socketId !== socket.id);

    this.socketToRoom.delete(socket.id);
    this.socketToPlayer.delete(socket.id);
    socket.leave(roomId);

    // Clean up empty rooms or rooms where only bots remain
    if (room.sessions.length === 0 || room.sessions.every((s) => s.isBot)) {
      this.rooms.delete(roomId);
      console.log(`[RoomManager] Room ${roomId} deleted (empty or only bots left)`);
      return;
    }

    // Transfer host if host left
    if (room.hostId === playerId && room.sessions.length > 0) {
      const nextHuman = room.sessions.find((s) => !s.isBot);
      room.hostId = nextHuman ? nextHuman.id : room.sessions[0].id;
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
      avatarUrl: s.avatarUrl,
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

      rawState.mapId = room.mapId;
      rawState.targetScore = room.targetScore ?? 16;
      room.gameState = rawState;
      room.status = 'playing';
      room.lastActivity = Date.now();

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
    avatarUrl?: string,
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
      { name: 'Doctor Doom', personality: 'stark', avatarUrl: '/images/avatars/doctor_doom.jpg' },
      { name: 'Loki', personality: 'ultron', avatarUrl: '/images/avatars/loki.jpg' },
      { name: 'Thanos Bot', personality: 'thanos', avatarUrl: '/images/avatars/thanos.jpg' },
      { name: 'Tony Stark AI', personality: 'stark', avatarUrl: '/images/avatars/iron_man.jpg' },
    ];
    const existingNames = new Set(room.sessions.map((s) => s.name));
    const nextDefault = defaultBots.find((b) => !existingNames.has(b.name)) ?? {
      name: `Marvel AI ${room.sessions.length}`,
      personality: 'balanced',
      avatarUrl: '/images/avatars/doctor_doom.jpg',
    };

    const finalBotName = botName ?? nextDefault.name;
    const resolvedAvatarUrl = avatarUrl ??
      (finalBotName.toLowerCase().includes('doom') ? '/images/avatars/doctor_doom.jpg' :
       finalBotName.toLowerCase().includes('loki') ? '/images/avatars/loki.jpg' :
       finalBotName.toLowerCase().includes('thanos') ? '/images/avatars/thanos.jpg' :
       finalBotName.toLowerCase().includes('stark') || finalBotName.toLowerCase().includes('iron') ? '/images/avatars/iron_man.jpg' :
       nextDefault.avatarUrl);

    room.sessions.push({
      id: botId,
      name: finalBotName,
      socketId: `bot_${botId}`,
      avatarUrl: resolvedAvatarUrl,
      isBot: true,
      botPersonality: personality ?? nextDefault.personality,
    });

    room.lastActivity = Date.now();
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
    room.lastActivity = Date.now();
    const roomInfo = this.toRoomInfo(room);
    this.io.to(roomId).emit('room:updated', roomInfo);
    return { success: true, room: roomInfo };
  }

  createSoloRoom(
    socket: Socket,
    playerName: string,
    botCount: number,
    botNames?: string[],
    mapId?: string,
    avatarUrl?: string,
    targetScore = 16,
  ): { success: boolean; room?: RoomInfo; error?: string } {
    const roomInfo = this.createRoom(socket, playerName, mapId, avatarUrl, targetScore);
    const room = this.rooms.get(roomInfo.roomId);
    if (!room) return { success: false, error: 'Failed to create room' };

    const botTemplates = [
      { name: 'Doctor Doom', personality: 'stark', avatarUrl: '/images/avatars/doctor_doom.jpg' },
      { name: 'Loki', personality: 'ultron', avatarUrl: '/images/avatars/loki.jpg' },
      { name: 'Thanos Bot', personality: 'thanos', avatarUrl: '/images/avatars/thanos.jpg' },
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
        avatarUrl: template.avatarUrl,
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

    // Realistic human-like bot thinking delay (4.5s to 5.8s)
    const isDropPhase = room.gameState.phase === 'dropGems';
    const thinkingDelay = isDropPhase
      ? Math.floor(Math.random() * 1000) + 2500 // 2.5s - 3.5s for dropping gems
      : Math.floor(Math.random() * 1300) + 4500; // 4.5s - 5.8s for regular turns

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
        currentRoom.lastActivity = Date.now();

        if (newState.phase === 'finished') {
          currentRoom.status = 'finished';
          this.io.to(roomId).emit('game:over', { winners: newState.winners });
        }

        this.broadcastGameState(roomId);
        this.checkBotTurn(roomId);
      } catch (err) {
        console.error(`[RoomManager] Bot turn execution error in room ${roomId}:`, err);
      }
    }, thinkingDelay);
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
      room.lastActivity = Date.now();

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

  setTargetScore(
    socket: Socket,
    targetScore: number,
  ): { success: boolean; room?: RoomInfo; error?: string } {
    const roomId = this.socketToRoom.get(socket.id);
    const playerId = this.socketToPlayer.get(socket.id);

    if (!roomId || !playerId) return { success: false, error: 'Not in a room' };
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };
    if (room.hostId !== playerId) return { success: false, error: 'Only the host can change target score' };
    if (room.status !== 'waiting') return { success: false, error: 'Game already in progress' };

    room.targetScore = Math.min(Math.max(10, Number(targetScore) || 16), 50);
    room.lastActivity = Date.now();

    const roomInfo = this.toRoomInfo(room);
    this.io.to(roomId).emit('room:updated', roomInfo);
    return { success: true, room: roomInfo };
  }

  // ─── Private Helpers ────────────────────────────────────────

  private toRoomInfo(room: Room): RoomInfo {
    return {
      roomId: room.roomId,
      hostId: room.hostId,
      players: room.sessions.map((s) => ({
        id: s.id,
        name: s.name,
        avatarUrl: s.avatarUrl,
        isBot: s.isBot,
        botPersonality: s.botPersonality,
      })),
      maxPlayers: room.maxPlayers,
      status: room.status,
      mapId: room.mapId,
      targetScore: room.targetScore ?? 16,
    };
  }
}
