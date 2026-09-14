// ============================================================
//  index.ts — Nexus Realm Server Entry Point
//  Express HTTP + Socket.io WebSocket server
// ============================================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/game.types';
import { RoomManager } from './RoomManager';

// ─── Server Setup ─────────────────────────────────────────────

const PORT = process.env.PORT ?? 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? '*';
const corsOrigin =
  CLIENT_ORIGIN === '*'
    ? true
    : CLIENT_ORIGIN.split(',').map((s) => s.trim());

const app = express();

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve client static build if available (all-in-one production deployment)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

// ─── Room Manager ─────────────────────────────────────────────

const roomManager = new RoomManager(io);

// ─── Socket.io Event Handlers ─────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[Server] Client connected: ${socket.id}`);

  // ── Room: Create ──────────────────────────────────────────
  socket.on('room:create', ({ playerName, mapId }, callback) => {
    try {
      const room = roomManager.createRoom(socket, playerName, mapId);
      callback(room);
    } catch (err) {
      console.error('[Server] room:create error:', err);
      socket.emit('game:error', { message: 'Failed to create room' });
    }
  });

  // ── Room: Join ────────────────────────────────────────────
  socket.on('room:join', ({ roomId, playerName }, callback) => {
    try {
      const result = roomManager.joinRoom(socket, roomId, playerName);
      callback(result);
    } catch (err) {
      console.error('[Server] room:join error:', err);
      callback({ success: false, error: 'Failed to join room' });
    }
  });

  // ── Room: Leave ───────────────────────────────────────────
  socket.on('room:leave', () => {
    roomManager.leaveRoom(socket);
  });

  // ── Room: Add Bot ─────────────────────────────────────────
  socket.on('room:addBot', ({ botName, personality }, callback) => {
    try {
      const result = roomManager.addBot(socket, botName, personality);
      callback(result);
    } catch (err) {
      console.error('[Server] room:addBot error:', err);
      callback({ success: false, error: 'Failed to add bot' });
    }
  });

  // ── Room: Remove Bot ──────────────────────────────────────
  socket.on('room:removeBot', ({ botId }, callback) => {
    try {
      const result = roomManager.removeBot(socket, botId);
      callback(result);
    } catch (err) {
      console.error('[Server] room:removeBot error:', err);
      callback({ success: false, error: 'Failed to remove bot' });
    }
  });

  // ── Room: Create Solo (vs Bots) ───────────────────────────
  socket.on('room:createSolo', ({ playerName, botCount, botNames, mapId }, callback) => {
    try {
      const result = roomManager.createSoloRoom(socket, playerName, botCount, botNames, mapId);
      callback(result);
    } catch (err) {
      console.error('[Server] room:createSolo error:', err);
      callback({ success: false, error: 'Failed to create solo room' });
    }
  });

  // ── Room: List All Open ───────────────────────────────────
  socket.on('room:listAll', (callback) => {
    callback(roomManager.listAllRooms());
  });

  // ── Game: Start ───────────────────────────────────────────
  socket.on('game:start', () => {
    const result = roomManager.startGame(socket);
    if (!result.success) {
      socket.emit('game:error', { message: result.error ?? 'Cannot start game' });
    }
  });

  // ── Game: Action ──────────────────────────────────────────
  socket.on('game:action', (action) => {
    roomManager.handleAction(socket, action);
  });

  // ── Disconnect ────────────────────────────────────────────
  socket.on('disconnect', () => {
    roomManager.handleDisconnect(socket);
  });
});

// ─── SPA Route Fallback ───────────────────────────────────────
if (fs.existsSync(clientDistPath)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/socket.io') || req.path === '/health') return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// ─── Start Listening ──────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`\n🎮 Nexus Realm Server running on port ${PORT}`);
  console.log(`   → Health: http://localhost:${PORT}/health`);
  console.log(`   → WS:     ws://localhost:${PORT}`);
  console.log(`   → CORS:   ${CLIENT_ORIGIN}\n`);
});
