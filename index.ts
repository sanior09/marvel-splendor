import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/game.types';
import { RoomManager } from './RoomManager';

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

// —— Serve Frontend Static Files ——————————————————————————————
const clientBuildPath = path.join(__dirname, '../../client/dist');

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/socket.io') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.send('Backend Server is running. Client build not found.');
  });
}

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

const roomManager = new RoomManager(io);

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

httpServer.listen(PORT, () => {
  console.log(`\n👾 Nexus Realm Server running on port ${PORT}`);
});