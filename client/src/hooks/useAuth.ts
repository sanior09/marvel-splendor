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

const STORAGE_KEY_TOKEN = 'marvel_splendor_auth_token_v2';
const LEGACY_STORAGE_KEY = 'marvel_splendor_auth_token';

const getBackendUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_SERVER_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) return envUrl.trim();
  if (typeof window !== 'undefined') {
    // If running on Vercel or custom domain, route backend calls to Render backend
    if (window.location.hostname.includes('vercel.app') || (window.location.hostname !== 'localhost' && !window.location.hostname.includes('onrender.com'))) {
      return 'https://marvel-splendor-2.onrender.com';
    }
    return window.location.origin;
  }
  return 'http://localhost:3001';
};

const API_BASE = getBackendUrl();

// ─── Helper ───────────────────────────────────────────────────

async function apiPost<T>(path: string, body: object, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
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

  // Auto-verify stored token on mount (with strict 3.0s fail-safe timeout against Render cold-sleep)
  useEffect(() => {
    localStorage.removeItem(LEGACY_STORAGE_KEY);

    const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    let active = true;

    // Fail-safe: Never block user screen for more than 3.0 seconds if Render backend is sleeping
    const safetyTimer = setTimeout(() => {
      if (active) {
        console.warn('[useAuth] Render server asleep / verify timed out. Falling back to login gate.');
        setIsLoading(false);
      }
    }, 3000);

    apiPost<{ success: boolean; profile?: UserProfile; error?: string }>(
      '/api/auth/verify',
      { token: storedToken },
      3500
    ).then((result) => {
      if (!active) return;
      if (result.success && result.profile) {
        setToken(storedToken);
        setProfile(result.profile);
      } else {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    }).catch(() => {
      // Network error or timeout — allow user to continue
    }).finally(() => {
      if (active) {
        clearTimeout(safetyTimer);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
      clearTimeout(safetyTimer);
    };
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
