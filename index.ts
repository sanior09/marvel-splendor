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

// ค้นหาตำแหน่งไฟล์ under-construction.html
const possiblePaths = [
  path.resolve(process.cwd(), 'public/under-construction.html'),
  path.resolve(__dirname, '../../public/under-construction.html'),
  path.resolve(__dirname, '../public/under-construction.html')
];

const underConstructionFile = possiblePaths.find(filePath => fs.existsSync(filePath));

// โค้ด HTML สำรองกรณีหาไฟล์ public ไม่เจอจริงๆ
const fallbackHTML = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ปิดปรับปรุงระบบชั่วคราว - Splendor Marvel</title>
    <style>
        body { background-color: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; height: 100vh; margin: 0; align-items: center; justify-content: center; text-align: center; }
        .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 450px; border: 1px solid #334155; }
        h1 { color: #38bdf8; margin-bottom: 0.5rem; }
        p { color: #94a3b8; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🛠️ ปิดปรับปรุงระบบชั่วคราว</h1>
        <p>ระบบเกม Splendor Marvel กำลังอยู่ระหว่างการปรับปรุงและอัปเดตเวอร์ชันใหม่</p>
        <p style="font-size: 0.875rem; color: #64748b; margin-top: 1.5rem;">— J.A.R.V.I.S. Systems —</p>
    </div>
</body>
</html>
`;

// 🚨 FORCE ROUTE: บังคับส่งหน้า Under Construction ทุก Request
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/socket.io') || req.path === '/health') {
    return next();
  }

  if (underConstructionFile && fs.existsSync(underConstructionFile)) {
    return res.sendFile(underConstructionFile);
  }

  res.send(fallbackHTML);
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
  console.log(`   → Maintenance Mode Active`);
  console.log(`   → Health: http://localhost:${PORT}/health\n`);
});