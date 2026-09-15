// ============================================================
// index.ts — Nexus Realm Server Entry Point
// Express HTTP + Socket.io WebSocket server (Maintenance Mode)
// ============================================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/game.types';
import { RoomManager } from './RoomManager';

// —— Server Setup ————————————————————————————————————————————

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

// ค้นหาตำแหน่งไฟล์ under-construction.html แบบ dynamic ครอบคลุมทุกโฟลเดอร์รัน
const possiblePaths = [
  path.resolve(process.cwd(), 'public/under-construction.html'),
  path.resolve(__dirname, '../../public/under-construction.html'),
  path.resolve(__dirname, '../public/under-construction.html')
];

const underConstructionFile = possiblePaths.find(filePath => fs.existsSync(filePath));
const publicPath = underConstructionFile ? path.dirname(underConstructionFile) : path.resolve(process.cwd(), 'public');

// Serve static assets (เผื่อไฟล์ under-construction.html ดึงรูป/CSS จาก public)
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// 🚨 FORCE ROUTE: บังคับส่งหน้า Under Construction ทุก Request
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/socket.io') || req.path === '/health') {
    return next();
  }

  if (underConstructionFile && fs.existsSync(underConstructionFile)) {
    return res.sendFile(underConstructionFile);
  }

  res.status(500).send('Under Construction page file not found on server.');
});

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

// —— Room Manager ————————————————————————————————————————————

const roomManager = new RoomManager(io);

// —— Socket.io Event Handlers ———————————————————————————————

io.on('connection', (socket) => {
  console.log(`[Server] Client connected: ${socket.id}`);

  socket.on('room:create', ({ playerName, avatarUrl, mapId }, callback) => {
    try {
      const room = roomManager.createRoom(socket, playerName, mapId, avatarUrl);
      callback(room);
    } catch (err) {
      console.error('[Server] room:create error:', err);
      socket.emit('game:error', { message: 'Failed to create room' });
    }
  });

  socket.on('room:join', ({ roomId, playerName, avatarUrl }, callback) => {
    try {
      const result = roomManager.joinRoom(socket, roomId, playerName, avatarUrl);
      callback(result);
    } catch (err) {
      console.error('[Server] room:join error:', err);
      callback({ success: false, error: 'Failed to join room' });
    }
  });

  socket.on('room:leave', () => {
    roomManager.leaveRoom(socket);
  });

  socket.on('room:addBot', ({ botName, personality, avatarUrl }, callback) => {
    try {
      const result = roomManager.addBot(socket, botName, personality, avatarUrl);
      callback(result);
    } catch (err) {
      console.error('[Server] room:addBot error:', err);
      callback({ success: false, error: 'Failed to add bot' });
    }
  });

  socket.on('room:removeBot', ({ botId }, callback) => {
    try {
      const result = roomManager.removeBot(socket, botId);
      callback(result);
    } catch (err) {
      console.error('[Server] room:removeBot error:', err);
      callback({ success: false, error: 'Failed to remove bot' });
    }
  });

  socket.on('room:createSolo', ({ playerName, avatarUrl, botCount, botNames, mapId }, callback) => {
    try {
      const result = roomManager.createSoloRoom(socket, playerName, botCount, botNames, mapId, avatarUrl);
      callback(result);
    } catch (err) {
      console.error('[Server] room:createSolo error:', err);
      callback({ success: false, error: 'Failed to create solo room' });
    }
  });

  socket.on('room:listAll', (callback) => {
    callback(roomManager.listAllRooms());
  });

  socket.on('game:start', () => {
    const result = roomManager.startGame(socket);
    if (!result.success) {
      socket.emit('game:error', { message: result.error ?? 'Cannot start game' });
    }
  });

  socket.on('game:action', (action) => {
    roomManager.handleAction(socket, action);
  });

  socket.on('disconnect', () => {
    roomManager.handleDisconnect(socket);
  });
});

// —— Start Listening ———————————————————————————————————————

httpServer.listen(PORT, () => {
  console.log(`\n👾 Nexus Realm Server running on port ${PORT}`);
  console.log(`   → Maintenance Mode Active: Serving under-construction.html`);
  console.log(`   → Health: http://localhost:${PORT}/health`);
  console.log(`   → WS:     ws://localhost:${PORT}\n`);
});