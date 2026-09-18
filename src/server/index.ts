import express, { type Request, type Response, type NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import mongoose from 'mongoose';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/game.types';
import { RoomManager } from './RoomManager';
import { userManager } from './UserManager';

// Ensure reliable DNS resolution for MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setting servers isn't supported
}

const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? '*';
const corsOrigin =
  CLIENT_ORIGIN === '*'
    ? true
    : CLIENT_ORIGIN.split(',').map((s) => s.trim());

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://xenia5523_db_user:Marvel1234@cluster0.ggyfbtj.mongodb.net/?appName=Cluster0';

const app = express();

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// ── Connect MongoDB ────────────────────────────────────────────
userManager.connect(MONGODB_URI).catch((err) => {
  console.error('[Server] MongoDB connection error:', err);
});

// ── Health Check & DB Status ────────────────────────────────────
app.get('/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/db-status', (_req: Request, res: Response): void => {
  res.json({
    connected: userManager.isConnected(),
    readyState: mongoose.connection.readyState,
    lastError: userManager.getLastError(),
  });
});

// ── Auth REST API ───────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ success: false, error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    return;
  }
  const result = await userManager.register(username.trim(), password);
  res.status(result.success ? 201 : 400).json(result);
});

// POST /api/auth/login
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ success: false, error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    return;
  }
  const result = await userManager.login(username.trim(), password);
  if (result.success && result.profile?.activeRoomId) {
    if (!roomManager.isRoomActive(result.profile.activeRoomId)) {
      await userManager.setActiveRoom(result.profile.id, null, null);
      result.profile.activeRoomId = undefined;
      result.profile.activePlayerId = undefined;
    }
  }
  res.status(result.success ? 200 : 401).json(result);
});

// POST /api/auth/verify
app.post('/api/auth/verify', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body as { token?: string };
  if (!token) { res.status(400).json({ success: false, error: 'No token' }); return; }
  const profile = await userManager.verifyToken(token);
  if (!profile) { res.status(401).json({ success: false, error: 'Token ไม่ถูกต้องหรือหมดอายุ' }); return; }
  if (profile.activeRoomId && !roomManager.isRoomActive(profile.activeRoomId)) {
    await userManager.setActiveRoom(profile.id, null, null);
    profile.activeRoomId = undefined;
    profile.activePlayerId = undefined;
  }
  res.json({ success: true, profile });
});

// POST /api/auth/clear-active-room
app.post('/api/auth/clear-active-room', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body as { token?: string };
  if (!token) { res.status(400).json({ success: false, error: 'No token' }); return; }
  const profile = await userManager.verifyToken(token);
  if (!profile) { res.status(401).json({ success: false, error: 'Token ไม่ถูกต้อง' }); return; }
  await userManager.setActiveRoom(profile.id, null, null);
  const updated = await userManager.getProfile(profile.id);
  res.json({ success: true, profile: updated });
});

// ── Serve Frontend Static Files ──────────────────────────────────
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
    if (req.path.startsWith('/socket.io') || req.path === '/health' || req.path.startsWith('/api/')) {
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
  socket.on('room:create', (data: any, callback) => {
    try {
      const { playerName, avatarUrl, mapId, targetScore } = data;
      const accountId = data.accountId as string | undefined;
      const room = roomManager.createRoom(socket, playerName, mapId, avatarUrl, targetScore, accountId);
      // Link account → room
      if (accountId) {
        const session = room.players.find((p) => p.name === playerName);
        if (session) userManager.setActiveRoom(accountId, room.roomId, session.id);
      }
      callback(room);
    } catch (err) {
      socket.emit('game:error', { message: 'Failed to create room' });
    }
  });

  socket.on('room:join', (data: any, callback) => {
    try {
      const { roomId, playerName, avatarUrl } = data;
      const accountId = data.accountId as string | undefined;
      const result = roomManager.joinRoom(socket, roomId, playerName, avatarUrl, accountId);
      // Link account → room
      if (accountId && result.success && result.room) {
        const session = result.room.players.find((p) => p.name === playerName);
        if (session) userManager.setActiveRoom(accountId, roomId, session.id);
      }
      callback(result);
    } catch (err) {
      callback({ success: false, error: 'Failed to join room' });
    }
  });

  socket.on('room:leave', (payload) => {
    roomManager.leaveRoom(socket, payload);
  });

  socket.on('room:afkTimeout', ({ roomId, playerId }, callback) => {
    try {
      const success = roomManager.convertPlayerToBot(roomId, playerId, 'client_afk_timeout');
      callback?.({ success });
    } catch (err) {
      callback?.({ success: false });
    }
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

  socket.on('room:createSolo', (data: any, callback) => {
    try {
      const { playerName, avatarUrl, botCount, botNames, mapId, targetScore } = data;
      const accountId = data.accountId as string | undefined;
      const result = roomManager.createSoloRoom(socket, playerName, botCount, botNames, mapId, avatarUrl, targetScore, accountId);
      if (result.success && result.room && accountId) {
        const session = result.room.players.find((p) => p.name === playerName);
        if (session) userManager.setActiveRoom(accountId, result.room.roomId, session.id);
      }
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

  socket.on('room:toggleReady', (callback) => {
    try {
      const result = roomManager.toggleReady(socket);
      callback?.(result);
    } catch (err) {
      callback?.({ success: false, error: 'Failed to toggle ready status' });
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