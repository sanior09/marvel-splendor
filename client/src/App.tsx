// ============================================================
//  App.tsx — Root Application & Page Router
// ============================================================

import React, { useState, useCallback, useEffect } from 'react';
import { MaintenanceCard } from './components/MaintenanceCard';
import { Lobby } from './components/Lobby';
import { Board } from './components/Board';
import { OrientationGuard } from './components/OrientationGuard';
import { InactivityWarningModal } from './components/InactivityWarningModal';
import { useGameState } from './hooks/useGameState';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import type { RoomInfo } from '@shared/types/game.types';

/**
 * 🔒 J.A.R.V.I.S. PROTOCOL: MAINTENANCE MODE
 * ตั้งเป็น true: ปิดปรับปรุงระบบ (Systems Offline / Maintenance Mode)
 * ตั้งเป็น false: เปิดระบบให้เข้าเล่นเกม Marvel Splendor ตามคำสั่งของเจ้านาย
 */
const MAINTENANCE_MODE = false;

export default function App(): React.ReactElement {
  useEffect(() => {
    if (MAINTENANCE_MODE) {
      document.title = 'ปิดปรับปรุงระบบชั่วคราว - Marvel Splendor';
    } else {
      document.title = 'Marvel Splendor — แย่งชิงถุงมืออินฟินิตี้';
    }
  }, []);

  if (MAINTENANCE_MODE) {
    return (
      <main
        style={{
          backgroundColor: '#0b0f19',
          color: '#f8fafc',
          fontFamily: "'Outfit', 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          display: 'flex',
          minHeight: '100vh',
          width: '100vw',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box',
          backgroundImage:
            'radial-gradient(ellipse at 50% 20%, rgba(56, 189, 248, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(226, 54, 54, 0.06) 0%, transparent 60%)',
        }}
      >
        <MaintenanceCard />
      </main>
    );
  }

  return <GameRouter />;
}

function GameRouter(): React.ReactElement {
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [afkNotice, setAfkNotice] = useState<string | null>(null);

  const {
    gameState,
    roomInfo,
    connectionStatus,
    error,
    createRoom,
    createSolo,
    setTargetScore,
    joinRoom,
    leaveRoom,
    startGame,
    toggleReady,
    addBot,
    removeBot,
    sendAction,
    listRooms,
    clearError,
  } = useGameState(myPlayerId);

  const isInRoomOrGame = Boolean(myPlayerId && (gameState || roomInfo));

  // Auto-kick / Bot takeover when idle for 3 minutes without any activity/moves
  const handleInactivityTimeout = useCallback(() => {
    leaveRoom();
    setMyPlayerId(null);
    setAfkNotice('คุณถูกออกจากห้องอัตโนมัติเนื่องจากไม่มีการเคลื่อนไหวเกิน 3 นาที โดยระบบได้ส่งบอท AI เข้าเล่นแทนเรียบร้อยแล้ว (Auto-replaced by AI Bot due to 3 minutes of inactivity)');
  }, [leaveRoom]);

  const { remainingSeconds, isWarning, resetTimer } = useInactivityTimeout({
    timeoutMs: 3 * 60 * 1000, // 3 minutes
    warningThresholdMs: 60 * 1000, // 60 seconds warning grace period
    enabled: isInRoomOrGame,
    onTimeout: handleInactivityTimeout,
  });

  // On room create — capture host player ID
  const handleCreateRoom = useCallback(
    (playerName: string, callback: (room: RoomInfo) => void, mapId?: string, avatarUrl?: string, targetScore?: number) => {
      setAfkNotice(null);
      createRoom(playerName, (room) => {
        setMyPlayerId(room.hostId);
        callback(room);
      }, mapId, avatarUrl, targetScore);
    },
    [createRoom],
  );

  // On Solo Game Create
  const handleCreateSolo = useCallback(
    (playerName: string, botCount: number, botNames?: string[], mapId?: string, avatarUrl?: string, targetScore?: number) => {
      setAfkNotice(null);
      createSolo(playerName, botCount, botNames, (room) => {
        setMyPlayerId(room.hostId);
      }, mapId, avatarUrl, targetScore);
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
            onLeaveRoom={handleLeave}
            onStartGame={startGame}
            onToggleReady={toggleReady}
            onAddBot={addBot}
            onRemoveBot={removeBot}
            onSetTargetScore={setTargetScore}
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
      </div>
    </OrientationGuard>
  );
}