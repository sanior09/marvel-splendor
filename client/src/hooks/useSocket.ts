// ============================================================
//  useSocket.ts — Singleton Socket.io Connection Hook
// ============================================================

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@shared/types/game.types';

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

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

const SOCKET_URL = getBackendUrl();

// Module-level singleton — one connection for the whole app
let socketInstance: GameSocket | null = null;

function getSocket(): GameSocket {
  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    }) as GameSocket;
  }
  return socketInstance;
}

/** Hook to access the shared Socket.io instance */
export function useSocket(): GameSocket {
  const socketRef = useRef<GameSocket>(getSocket());

  useEffect(() => {
    // Effect registered to satisfy exhaustive deps — socket is a singleton ref
    return () => {
      // Do NOT disconnect on unmount — singleton persists app lifetime
    };
  }, []);

  return socketRef.current;
}

/** Explicitly disconnect (call on game exit / page unload) */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
