// ============================================================
// index.ts — Nexus Realm Server Entry Point
// Express HTTP + Socket.io WebSocket server (Maintenance Mode)
// ============================================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
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

// HTML หน้าปิดปรับปรุงระบบ
const maintenanceHTML = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ปิดปรับปรุงระบบชั่วคราว - Splendor Marvel</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            background-color: #0f172a; 
            color: #f8fafc; 
            font-family: system-ui, -apple-system, sans-serif; 
            display: flex; 
            height: 100vh; 
            align-items: center; 
            justify-content: center; 
            padding: 1rem;
        }
        .card { 
            background: #1e293b; 
            padding: 2.5rem; 
            border-radius: 1rem; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.5); 
            max-width: 450px; 
            width: 100%;
            border: 1px solid #334155; 
            text-align: center;
        }
        h1 { color: #38bdf8; margin-bottom: 1rem; font-size: 1.5rem; }
        p { color: #94a3b8; line-height: 1.6; margin-bottom: 0.75rem; }
        .footer { font-size: 0.875rem; color: #64748b; margin-top: 1.5rem; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🛠️ ปิดปรับปรุงระบบชั่วคราว</h1>
        <p>ระบบเกม Splendor Marvel กำลังอยู่ระหว่างการปรับปรุงและอัปเดตระบบ</p>
        <p>ขออภัยในความไม่สะดวกครับ</p>
        <div class="footer">— J.A.R.V.I.S. Systems —</div>
    </div>
</body>
</html>
`;

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 🚨 FORCE ROUTE: ดักจับทุก Request แล้วส่งหน้า HTML Maintenance ทันที
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io') || req.path === '/health') {
    return next();
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(maintenanceHTML);
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