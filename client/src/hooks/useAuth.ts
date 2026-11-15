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
  isVerifyingToken: boolean;
  error: string | null;
}

const STORAGE_KEY_TOKEN = 'marvel_splendor_auth_token_v2';
const STORAGE_KEY_PROFILE = 'marvel_splendor_auth_profile_v2';
const LEGACY_STORAGE_KEY = 'marvel_splendor_auth_token';

const getBackendUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_SERVER_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) return envUrl.trim();
  if (typeof window !== 'undefined') {
    // If running on Vercel or custom domain, route backend calls to Render backend
    if (window.location.hostname.includes('vercel.app') || (window.location.hostname !== 'localhost' && !window.location.hostname.includes('onrender.com'))) {
      return 'https://marvel-splendor-1.onrender.com';
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
  isVerifyingToken: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  clearActiveRoom: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  // Synchronous restoration from localStorage for instantaneous 0ms session recovery
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      const storedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (storedToken && storedProfile) {
        return JSON.parse(storedProfile);
      }
    } catch {}
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(STORAGE_KEY_TOKEN);
    } catch {}
    return null;
  });

  // If both token and profile are in cache, enter game IMMEDIATELY in 0ms!
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      const storedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (storedToken && storedProfile) return false; // Instant bypass!
      if (storedToken) return true; // Only verify if no cached profile
    } catch {}
    return false;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Background token verification (Stale-While-Revalidate pattern)
  useEffect(() => {
    localStorage.removeItem(LEGACY_STORAGE_KEY);

    const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!storedToken) {
      setIsVerifyingToken(false);
      return;
    }

    let active = true;

    // Verify token with backend in background without prematurely kicking user out
    apiPost<{ success: boolean; profile?: UserProfile; error?: string }>(
      '/api/auth/verify',
      { token: storedToken },
      30000 // Allow up to 30s for Render cold start
    ).then((result) => {
      if (!active) return;
      if (result.success && result.profile) {
        setToken(storedToken);
        setProfile(result.profile);
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(result.profile));
      } else {
        // Token is genuinely invalid or expired on server
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_PROFILE);
        setToken(null);
        setProfile(null);
      }
    }).catch(() => {
      // Network error or timeout (server asleep) — keep cached session!
    }).finally(() => {
      if (active) {
        setIsVerifyingToken(false);
      }
    });

    return () => {
      active = false;
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
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(result.profile));
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
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(result.profile));
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
    localStorage.removeItem(STORAGE_KEY_PROFILE);
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
      if (result.success && result.profile) {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(result.profile));
        setProfile(result.profile);
      }
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

  return { profile, token, isLoading, isVerifyingToken, error, login, register, logout, clearError, refreshProfile, clearActiveRoom };
}
