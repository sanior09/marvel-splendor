// ============================================================
//  App.tsx — Root Application & Page Router
// ============================================================

import React, { useState, useCallback } from 'react';
import { Lobby } from './components/Lobby';
import { Board } from './components/Board';
import { YouTubeMusicPlayer } from './components/YouTubeMusicPlayer';
import { OrientationGuard } from './components/OrientationGuard';
import { useGameState } from './hooks/useGameState';
import type { RoomInfo } from '@shared/types/game.types';

export default function App(): React.ReactElement {
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  const {
    gameState,
    roomInfo,
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
  } = useGameState(myPlayerId);

  // On room create — capture host player ID
  const handleCreateRoom = useCallback(
    (playerName: string, callback: (room: RoomInfo) => void) => {
      createRoom(playerName, (room) => {
        setMyPlayerId(room.hostId);
        callback(room);
      });
    },
    [createRoom],
  );

  // On Solo Game Create
  const handleCreateSolo = useCallback(
    (playerName: string, botCount: number, botNames?: string[]) => {
      createSolo(playerName, botCount, botNames, (room) => {
        setMyPlayerId(room.hostId);
      });
    },
    [createSolo],
  );

  const handleJoinRoom = useCallback(
    (roomId: string, playerName: string, callback: (success: boolean, err?: string) => void) => {
      joinRoom(roomId, playerName, (success, err, room) => {
        if (success && room) {
          const lastPlayer = room.players[room.players.length - 1];
          if (lastPlayer) {
            setMyPlayerId(lastPlayer.id);
          }
        }
        callback(success, err);
      });
    },
    [joinRoom],
  );

  const handleLeave = useCallback(() => {
    leaveRoom();
    setMyPlayerId(null);
  }, [leaveRoom]);

  // ── Routing ───────────────────────────────────────────────

  return (
    <OrientationGuard>
      <div className="relative w-screen h-screen overflow-hidden">
        {gameState && myPlayerId ? (
          <Board
            state={gameState}
            myPlayerId={myPlayerId}
            onSendAction={sendAction}
            onLeave={handleLeave}
            error={error}
            onClearError={clearError}
          />
        ) : (
          <Lobby
            onCreateRoom={handleCreateRoom}
            onCreateSolo={handleCreateSolo}
            onJoinRoom={handleJoinRoom}
            onStartGame={startGame}
            onAddBot={addBot}
            onRemoveBot={removeBot}
            onListRooms={listRooms}
            currentRoom={roomInfo}
            myPlayerId={myPlayerId}
            connectionStatus={connectionStatus}
          />
        )}

        {/* Persistent YouTube-styled Marvel BGM Music Player */}
        <div className="fixed top-1 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 pointer-events-auto">
          <YouTubeMusicPlayer />
        </div>
      </div>
    </OrientationGuard>
  );
}
