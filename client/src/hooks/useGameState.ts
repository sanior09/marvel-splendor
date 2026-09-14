// ============================================================
//  useGameState.ts — Game State Subscription Hook
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { GameState, GameAction, RoomInfo } from '@shared/types/game.types';
import { useSocket } from './useSocket';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface UseGameStateReturn {
  gameState: GameState | null;
  roomInfo: RoomInfo | null;
  myPlayerId: string | null;
  connectionStatus: ConnectionStatus;
  error: string | null;
  // Actions
  createRoom: (playerName: string, callback: (room: RoomInfo) => void, mapId?: string) => void;
  createSolo: (playerName: string, botCount: number, botNames?: string[], callback?: (room: RoomInfo) => void, mapId?: string) => void;
  joinRoom: (roomId: string, playerName: string, callback: (success: boolean, error?: string, room?: RoomInfo) => void) => void;
  leaveRoom: () => void;
  startGame: () => void;
  addBot: (botName?: string, personality?: string, callback?: (success: boolean) => void) => void;
  removeBot: (botId: string, callback?: (success: boolean) => void) => void;
  sendAction: (action: GameAction) => void;
  listRooms: (callback: (rooms: RoomInfo[]) => void) => void;
  clearError: () => void;
}

export function useGameState(myPlayerId: string | null): UseGameStateReturn {
  const socket = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onConnect = (): void => setConnectionStatus('connected');
    const onDisconnect = (): void => setConnectionStatus('disconnected');
    const onConnectError = (): void => setConnectionStatus('error');

    const onStateUpdate = (state: GameState): void => setGameState(state);
    const onRoomUpdated = (room: RoomInfo): void => setRoomInfo(room);
    const onGameError = ({ message }: { message: string }): void => setError(message);
    const onGameOver = (): void => {
      // Game state will update with phase: 'finished'
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('game:stateUpdate', onStateUpdate);
    socket.on('room:updated', onRoomUpdated);
    socket.on('game:error', onGameError);
    socket.on('game:over', onGameOver);

    if (socket.connected) setConnectionStatus('connected');

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('game:stateUpdate', onStateUpdate);
      socket.off('room:updated', onRoomUpdated);
      socket.off('game:error', onGameError);
      socket.off('game:over', onGameOver);
    };
  }, [socket]);

  const createRoom = useCallback(
    (playerName: string, callback: (room: RoomInfo) => void, mapId?: string) => {
      socket.emit('room:create', { playerName, mapId }, (room) => {
        setRoomInfo(room);
        callback(room);
      });
    },
    [socket],
  );

  const createSolo = useCallback(
    (
      playerName: string,
      botCount: number,
      botNames?: string[],
      callback?: (room: RoomInfo) => void,
      mapId?: string,
    ) => {
      socket.emit('room:createSolo', { playerName, botCount, botNames, mapId }, (result) => {
        if (result.success && result.room) {
          setRoomInfo(result.room);
          callback?.(result.room);
        } else {
          setError(result.error ?? 'Failed to start solo game');
        }
      });
    },
    [socket],
  );

  const joinRoom = useCallback(
    (roomId: string, playerName: string, callback: (success: boolean, error?: string, room?: RoomInfo) => void) => {
      socket.emit('room:join', { roomId, playerName }, (result) => {
        if (result.success && result.room) {
          setRoomInfo(result.room);
          callback(true, undefined, result.room);
        } else {
          callback(false, result.error);
        }
      });
    },
    [socket],
  );

  const leaveRoom = useCallback(() => {
    socket.emit('room:leave');
    setGameState(null);
    setRoomInfo(null);
  }, [socket]);

  const startGame = useCallback(() => {
    socket.emit('game:start');
  }, [socket]);

  const addBot = useCallback(
    (botName?: string, personality?: string, callback?: (success: boolean) => void) => {
      socket.emit('room:addBot', { botName, personality }, (result) => {
        if (result.success && result.room) {
          setRoomInfo(result.room);
          callback?.(true);
        } else {
          setError(result.error ?? 'Failed to add bot');
          callback?.(false);
        }
      });
    },
    [socket],
  );

  const removeBot = useCallback(
    (botId: string, callback?: (success: boolean) => void) => {
      socket.emit('room:removeBot', { botId }, (result) => {
        if (result.success && result.room) {
          setRoomInfo(result.room);
          callback?.(true);
        } else {
          setError(result.error ?? 'Failed to remove bot');
          callback?.(false);
        }
      });
    },
    [socket],
  );

  const sendAction = useCallback(
    (action: GameAction) => {
      setError(null);
      socket.emit('game:action', action);
    },
    [socket],
  );

  const listRooms = useCallback(
    (callback: (rooms: RoomInfo[]) => void) => {
      socket.emit('room:listAll', callback);
    },
    [socket],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    gameState,
    roomInfo,
    myPlayerId,
    connectionStatus,
    error,
    createRoom,
    createSolo,
    joinRoom,
    leaveRoom,
    startGame,
    addBot,
    removeBot,
    sendAction,
    listRooms,
    clearError,
  };
}
