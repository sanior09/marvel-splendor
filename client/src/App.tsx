// ============================================================
//  App.tsx — Root Application & Page Router
// ============================================================

import React, { useState, useCallback } from 'react';
import { Lobby } from './components/Lobby';
import { Board } from './components/Board';
// import { YouTubeMusicPlayer } from './components/YouTubeMusicPlayer';
import { OrientationGuard } from './components/OrientationGuard';
import { InactivityWarningModal } from './components/InactivityWarningModal';
import { useGameState } from './hooks/useGameState';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import type { RoomInfo } from '@shared/types/game.types';

export default function App(): React.ReactElement {
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [afkNotice, setAfkNotice] = useState<string | null>(null);

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

  const isInRoomOrGame = Boolean(myPlayerId && (gameState || roomInfo));

  // Auto-kick when idle for 5 minutes without any activity/moves
  const handleInactivityTimeout = useCallback(() => {
    leaveRoom();
    setMyPlayerId(null);
    setAfkNotice('คุณถูกออกจากห้องอัตโนมัติ เนื่องจากไม่มีการเคลื่อนไหวหรือไม่ได้เล่นเกิน 5 นาที (Auto-kicked due to 5 minutes of inactivity)');
  }, [leaveRoom]);

  const { remainingSeconds, isWarning, resetTimer } = useInactivityTimeout({
    timeoutMs: 5 * 60 * 1000, // 5 minutes
    warningThresholdMs: 60 * 1000, // 60 seconds warning grace period
    enabled: isInRoomOrGame,
    onTimeout: handleInactivityTimeout,
  });

  // On room create — capture host player ID
  const handleCreateRoom = useCallback(
    (playerName: string, callback: (room: RoomInfo) => void, mapId?: string, avatarUrl?: string) => {
      setAfkNotice(null);
      createRoom(playerName, (room) => {
        setMyPlayerId(room.hostId);
        callback(room);
      }, mapId, avatarUrl);
    },
    [createRoom],
  );

  // On Solo Game Create
  const handleCreateSolo = useCallback(
    (playerName: string, botCount: number, botNames?: string[], mapId?: string, avatarUrl?: string) => {
      setAfkNotice(null);
      createSolo(playerName, botCount, botNames, (room) => {
        setMyPlayerId(room.hostId);
      }, mapId, avatarUrl);
    },
    [createSolo],
  );

  const handleJoinRoom = useCallback(
    (roomId: string, playerName: string, callback: (success: boolean, err?: string) => void, avatarUrl?: string) => {
      setAfkNotice(null);
      joinRoom(roomId, playerName, (success, err, room) => {
        if (success && room) {
          const lastPlayer = room.players[room.players.length - 1];
          if (lastPlayer) {
            setMyPlayerId(lastPlayer.id);
          }
        }
        callback(success, err);
      }, avatarUrl);
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
            afkNotice={afkNotice}
            onClearAfkNotice={() => setAfkNotice(null)}
          />
        )}

        {/* 60s Inactivity Grace Warning Modal */}
        {isWarning && isInRoomOrGame && (
          <InactivityWarningModal
            remainingSeconds={remainingSeconds}
            onStay={resetTimer}
          />
        )}

        {/* Persistent YouTube-styled Marvel BGM Music Player (ปิดไว้ชั่วคราว นำคอมเมนต์ออกเพื่อเปิดใช้งานใหม่ได้) */}
        {/* <div className="fixed top-1 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 pointer-events-auto">
          <YouTubeMusicPlayer />
        </div> */}
      </div>
    </OrientationGuard>
  );
}
