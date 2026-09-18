// ============================================================
//  useAuth.ts — Marvel Splendor Account Auth Hook
//  Manages login, register, logout, token verification
//  and cross-device active room detection
// ============================================================

import { useState, useCallback, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────

export interface Rank {
  name: string;
  nameEn: string;
  minXP: number;
  icon: string;
  color: string;
  isOwner?: boolean;
}

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

export interface AuthState {
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY_TOKEN = 'marvel_splendor_auth_token';

const API_BASE =
  (import.meta as any).env?.VITE_SERVER_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

// ─── Helper ───────────────────────────────────────────────────

async function apiPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

// ─── Hook ─────────────────────────────────────────────────────

export interface UseAuthReturn {
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  clearActiveRoom: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-verify stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    apiPost<{ success: boolean; profile?: UserProfile; error?: string }>(
      '/api/auth/verify',
      { token: storedToken }
    ).then((result) => {
      if (result.success && result.profile) {
        setToken(storedToken);
        setProfile(result.profile);
      } else {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    }).catch(() => {
      // Network error — keep token, try later
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiPost<{ success: boolean; token?: string; profile?: UserProfile; error?: string }>(
        '/api/auth/login',
        { username, password }
      );
      if (result.success && result.token && result.profile) {
        localStorage.setItem(STORAGE_KEY_TOKEN, result.token);
        setToken(result.token);
        setProfile(result.profile);
        return true;
      } else {
        setError(result.error || 'เข้าสู่ระบบไม่สำเร็จ');
        return false;
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiPost<{ success: boolean; token?: string; profile?: UserProfile; error?: string }>(
        '/api/auth/register',
        { username, password }
      );
      if (result.success && result.token && result.profile) {
        localStorage.setItem(STORAGE_KEY_TOKEN, result.token);
        setToken(result.token);
        setProfile(result.profile);
        return true;
      } else {
        setError(result.error || 'สมัครสมาชิกไม่สำเร็จ');
        return false;
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    setToken(null);
    setProfile(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const refreshProfile = useCallback(async () => {
    const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!storedToken) return;
    try {
      const result = await apiPost<{ success: boolean; profile?: UserProfile }>(
        '/api/auth/verify',
        { token: storedToken }
      );
      if (result.success && result.profile) setProfile(result.profile);
    } catch { /* ignore */ }
  }, []);

  const clearActiveRoom = useCallback(async () => {
    const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!storedToken) return;
    try {
      const result = await apiPost<{ success: boolean; profile?: UserProfile }>(
        '/api/auth/clear-active-room',
        { token: storedToken }
      );
      if (result.success && result.profile) {
        setProfile(result.profile);
      } else {
        setProfile((prev) => (prev ? { ...prev, activeRoomId: undefined, activePlayerId: undefined } : null));
      }
    } catch {
      setProfile((prev) => (prev ? { ...prev, activeRoomId: undefined, activePlayerId: undefined } : null));
    }
  }, []);

  return { profile, token, isLoading, error, login, register, logout, clearError, refreshProfile, clearActiveRoom };
}
