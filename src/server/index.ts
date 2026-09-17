import express, { type Request, type Response, type NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/game.types';
import { RoomManager } from './RoomManager';

const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? '*';
const corsOrigin =
  CLIENT_ORIGIN === '*'
    ? true
    : CLIENT_ORIGIN.split(',').map((s) => s.trim());

const app = express();

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// ── Health Check Endpoint ──────────────────────────────────
app.get('/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Serve Frontend Static Files (Dynamic Path Detection) ───
const candidatePaths = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(__dirname, './client/dist'),
];

const clientBuildPath = candidatePaths.find((candidate) => fs.existsSync(candidate)) ?? candidatePaths[0];

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req: Request, res: Response, next: NextFunction): void => {
    if (req.path.startsWith('/socket.io') || req.path === '/health') {
      next();
      return;
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (_req: Request, res: Response): void => {
    res.status(200).send('Marvel Splendor Backend Server is running. Client build not found.');
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
  socket.on('room:create', ({ playerName, avatarUrl, mapId, targetScore }, callback) => {
    try {
      const room = roomManager.createRoom(socket, playerName, mapId, avatarUrl, targetScore);
      callback(room);
    } catch (err) {
      socket.emit('game:error', { message: 'Failed to create room' });
    }
  });

  socket.on('room:join', ({ roomId, playerName, avatarUrl }, callback) => {
    try {
      const result = roomManager.joinRoom(socket, roomId, playerName, avatarUrl);
      callback(result);
    } catch (err) {
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
      callback({ success: false, error: 'Failed to add bot' });
    }
  });

  socket.on('room:removeBot', ({ botId }, callback) => {
    try {
      const result = roomManager.removeBot(socket, botId);
      callback(result);
    } catch (err) {
      callback({ success: false, error: 'Failed to remove bot' });
    }
  });

  socket.on('room:createSolo', ({ playerName, avatarUrl, botCount, botNames, mapId, targetScore }, callback) => {
    try {
      const result = roomManager.createSoloRoom(socket, playerName, botCount, botNames, mapId, avatarUrl, targetScore);
      callback(result);
    } catch (err) {
      callback({ success: false, error: 'Failed to create solo room' });
    }
  });

  socket.on('room:setTargetScore', ({ targetScore }, callback) => {
    try {
      const result = roomManager.setTargetScore(socket, targetScore);
      callback(result);
    } catch (err) {
      callback({ success: false, error: 'Failed to set target score' });
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
  console.log(`\n👾 Marvel Splendor Server running on port ${PORT}`);
});