// ============================================================
//  UserManager.ts — Marvel Splendor Account & Stats System
//  Powered by MongoDB Atlas — Cross-device persistent accounts
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ─── Rank System ─────────────────────────────────────────────

export interface Rank {
  name: string;
  nameEn: string;
  minXP: number;
  icon: string;
  color: string;
  isOwner?: boolean;
}

export const OWNER_USERNAMES = ['SANIOR'];

export const THE_ONE_ABOVE_ALL: Rank = {
  name: 'THE ONE ABOVE ALL',
  nameEn: 'The One Above All',
  minXP: 50000,
  icon: '👑',
  color: '#ffd700',
  isOwner: true,
};

// 7 Public Ranks obtainable by mortal players
export const PUBLIC_RANKS: Rank[] = [
  { name: 'นักสู้ใหม่',         nameEn: 'Recruit',             minXP: 0,      icon: '🥉', color: '#cd7f32' },
  { name: 'เจ้าหน้าที่ S.H.I.E.L.D.', nameEn: 'S.H.I.E.L.D. Agent', minXP: 300,  icon: '🥈', color: '#94a3b8' },
  { name: 'ซูเปอร์โซลเยอร์',     nameEn: 'Super Soldier',        minXP: 800,    icon: '🛡️', color: '#38bdf8' },
  { name: 'อเวนเจอร์',          nameEn: 'Avenger',             minXP: 1800,   icon: '🥇', color: '#ffd700' },
  { name: 'ผู้พิทักษ์กาแล็กซี',   nameEn: 'Guardian',            minXP: 3500,   icon: '💎', color: '#a855f7' },
  { name: 'จอมเวทสูงสุด',       nameEn: 'Sorcerer Supreme',     minXP: 6500,   icon: '🌌', color: '#06b6d4' },
  { name: 'ผู้ถือครองอินฟินิตี้', nameEn: 'Infinity Wielder',   minXP: 12000,  icon: '🔥', color: '#ff6a00' },
];

export const RANKS: Rank[] = [...PUBLIC_RANKS, THE_ONE_ABOVE_ALL];

export function getRank(xp: number, username?: string): Rank {
  if (username && OWNER_USERNAMES.includes(username.trim().toUpperCase())) {
    return THE_ONE_ABOVE_ALL;
  }
  for (let i = PUBLIC_RANKS.length - 1; i >= 0; i--) {
    if (xp >= PUBLIC_RANKS[i]!.minXP) return PUBLIC_RANKS[i]!;
  }
  return PUBLIC_RANKS[0]!;
}

export function getNextRank(xp: number, username?: string): Rank | null {
  if (username && OWNER_USERNAMES.includes(username.trim().toUpperCase())) {
    return null;
  }
  for (const rank of PUBLIC_RANKS) {
    if (xp < rank.minXP) return rank;
  }
  return null;
}

// ─── XP Awards ───────────────────────────────────────────────

export const XP_AWARDS = {
  GAME_PLAYED:    50,
  GAME_WIN:       150,
  RANK_1:         50,
  BUY_TIER3:      15,
  CLAIM_GUARDIAN: 25,
};

// ─── User Document ────────────────────────────────────────────

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  createdAt: Date;
  // Stats
  gamesPlayed: number;
  gamesWon: number;
  xp: number;
  totalScore: number;
  activeRoomId?: string;   // currently playing room
  activePlayerId?: string; // player ID inside the room
  lastSeen: Date;
}

const UserSchema = new Schema<IUser>({
  username:      { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 20 },
  passwordHash:  { type: String, required: true },
  createdAt:     { type: Date, default: Date.now },
  gamesPlayed:   { type: Number, default: 0 },
  gamesWon:      { type: Number, default: 0 },
  xp:            { type: Number, default: 0 },
  totalScore:    { type: Number, default: 0 },
  activeRoomId:  { type: String, default: null },
  activePlayerId:{ type: String, default: null },
  lastSeen:      { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// ─── JWT secret (use env var on production) ───────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'marvel-splendor-jarvis-secret-2026';
const JWT_EXPIRY = '30d';

// ─── Auth Result types ────────────────────────────────────────

export interface AuthSuccess {
  success: true;
  token: string;
  profile: UserProfile;
}

export interface AuthError {
  success: false;
  error: string;
}

export type AuthResult = AuthSuccess | AuthError;

export interface UserProfile {
  id: string;
  username: string;
  gamesPlayed: number;
  gamesWon: number;
  xp: number;
  totalScore: number;
  winRate: number;
  rank: Rank;
  nextRank: Rank | null;
  xpToNextRank: number | null;
  activeRoomId?: string;
  activePlayerId?: string;
  createdAt: string;
}

// ─── UserManager Class ────────────────────────────────────────

export class UserManager {
  private connected = false;
  private lastError: string | null = null;
  private profileCache: Map<string, UserProfile> = new Map();

  public isConnected(): boolean {
    return this.connected && mongoose.connection.readyState === 1;
  }

  public getLastError(): string | null {
    return this.lastError;
  }

  public getProfileSync(userId: string): UserProfile | null {
    return this.profileCache.get(userId) ?? null;
  }

  async connect(uri: string): Promise<void> {
    if (this.connected && mongoose.connection.readyState === 1) return;
    try {
      this.lastError = null;
      await mongoose.connect(uri, { dbName: 'marvel_splendor', serverSelectionTimeoutMS: 5000 });
      this.connected = true;
      console.log('[UserManager] ✅ Connected to MongoDB Atlas');
    } catch (err: any) {
      this.connected = false;
      this.lastError = err.message || String(err);
      console.error('[UserManager] ❌ MongoDB connection failed:', this.lastError);
    }
  }

  // ─── Register ─────────────────────────────────────────────

  async register(username: string, password: string): Promise<AuthResult> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: `ระบบฐานข้อมูลยังเชื่อมต่อไม่สำเร็จ: ${this.lastError || 'กำลังเชื่อมต่อ'}`,
      };
    }
    try {
      if (!username || username.length < 2) return { success: false, error: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 2 ตัวอักษร' };
      if (!password || password.length < 6) return { success: false, error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' };

      // 1. ตรวจสอบว่ารหัสผ่านซ้ำกับชื่อผู้ใช้หรือไม่
      if (password.toLowerCase() === username.toLowerCase()) {
        return { success: false, error: 'รหัสผ่านต้องไม่ซ้ำกับชื่อผู้ใช้' };
      }

      // 2. ตรวจสอบว่าชื่อผู้ใช้ซ้ำกับคนอื่นหรือไม่
      const existing = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
      if (existing) return { success: false, error: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเลือกชื่ออื่น' };

      // 3. ตรวจสอบว่ารหัสผ่านซ้ำกับผู้ใช้อื่นในระบบหรือไม่
      const allUsers = await User.find({}, 'passwordHash').lean();
      for (const u of allUsers) {
        if (u.passwordHash) {
          const match = await bcrypt.compare(password, u.passwordHash);
          if (match) {
            return { success: false, error: 'รหัสผ่านนี้มีผู้ใช้อื่นใช้งานแล้ว กรุณาตั้งรหัสผ่านใหม่' };
          }
        }
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new User({ username, passwordHash });
      await user.save();

      const token = this.generateToken(user.id, username);
      return { success: true, token, profile: this.toProfile(user) };
    } catch (err: any) {
      if (err.code === 11000) return { success: false, error: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' };
      console.error('[UserManager] register error:', err);
      return { success: false, error: `สมัครไม่สำเร็จ: ${err.message || 'กรุณาลองใหม่'}` };
    }
  }

  // ─── Login ────────────────────────────────────────────────

  async login(username: string, password: string): Promise<AuthResult> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: `ระบบฐานข้อมูลยังเชื่อมต่อไม่สำเร็จ: ${this.lastError || 'กำลังเชื่อมต่อ'}`,
      };
    }
    try {
      const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
      if (!user) return { success: false, error: 'ไม่พบชื่อผู้ใช้นี้ในระบบ' };

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };

      user.lastSeen = new Date();
      await user.save();

      const token = this.generateToken(user.id, user.username);
      return { success: true, token, profile: this.toProfile(user) };
    } catch (err: any) {
      console.error('[UserManager] login error:', err);
      return { success: false, error: `เข้าสู่ระบบไม่สำเร็จ: ${err.message || 'กรุณาลองใหม่'}` };
    }
  }

  // ─── Verify Token ─────────────────────────────────────────

  async verifyToken(token: string): Promise<UserProfile | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId);
      if (!user) return null;
      return this.toProfile(user);
    } catch {
      return null;
    }
  }

  // ─── Get Profile ──────────────────────────────────────────

  async getProfile(userId: string): Promise<UserProfile | null> {
    const user = await User.findById(userId);
    return user ? this.toProfile(user) : null;
  }

  // ─── Set Active Room ──────────────────────────────────────

  async setActiveRoom(userId: string, roomId: string | null, playerId: string | null): Promise<void> {
    await User.findByIdAndUpdate(userId, { activeRoomId: roomId, activePlayerId: playerId, lastSeen: new Date() });
  }

  // ─── Update Stats after Game ──────────────────────────────

  async recordGameResult(userId: string, opts: {
    won: boolean;
    finalScore: number;
    isRankOne: boolean;
    bonusXP?: number;
  }): Promise<{ profile: UserProfile; xpGained: number; breakdown: { baseXP: number; winXP: number; rankXP: number; bonusXP: number } } | null> {
    const baseXP = XP_AWARDS.GAME_PLAYED;
    const winXP = opts.won ? XP_AWARDS.GAME_WIN : 0;
    const rankXP = opts.isRankOne ? XP_AWARDS.RANK_1 : 0;
    const bonusXP = opts.bonusXP ?? 0;
    const xpGained = baseXP + winXP + rankXP + bonusXP;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          gamesPlayed: 1,
          gamesWon: opts.won ? 1 : 0,
          xp: xpGained,
          totalScore: opts.finalScore,
        },
        $set: { activeRoomId: null, activePlayerId: null, lastSeen: new Date() },
      },
      { new: true }
    );

    if (!user) return null;
    return {
      profile: this.toProfile(user),
      xpGained,
      breakdown: { baseXP, winXP, rankXP, bonusXP },
    };
  }

  // ─── Award Bonus XP (for in-game milestones) ─────────────

  async awardXP(userId: string, amount: number): Promise<void> {
    await User.findByIdAndUpdate(userId, { $inc: { xp: amount } });
  }

  // ─── Clear Active Room on Disconnect ─────────────────────

  async clearActiveRoom(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { activeRoomId: null, activePlayerId: null });
  }

  // ─── Internal helpers ─────────────────────────────────────

  private generateToken(userId: string, username: string): string {
    return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  private toProfile(user: IUser): UserProfile {
    const isOwnerUser = OWNER_USERNAMES.includes(user.username.trim().toUpperCase());
    const rank = getRank(user.xp, user.username);
    const nextRank = isOwnerUser ? null : getNextRank(user.xp, user.username);
    const winRate = user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0;
    const profile: UserProfile = {
      id: (user._id as any).toString(),
      username: user.username,
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      xp: user.xp,
      totalScore: user.totalScore,
      winRate,
      rank,
      nextRank,
      xpToNextRank: isOwnerUser ? null : (nextRank ? nextRank.minXP - user.xp : null),
      activeRoomId: user.activeRoomId || undefined,
      activePlayerId: user.activePlayerId || undefined,
      createdAt: user.createdAt.toISOString(),
    };
    this.profileCache.set(profile.id, profile);
    return profile;
  }
}

export const userManager = new UserManager();
