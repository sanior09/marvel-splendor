// ============================================================
//  App.tsx — Root Application & Page Router
// ============================================================

import React, { useState, useCallback, useEffect } from 'react';
import { MaintenanceCard } from './components/MaintenanceCard';
import { LoginScreen } from './components/LoginScreen';
import { Lobby } from './components/Lobby';
import { Board } from './components/Board';
import { OrientationGuard } from './components/OrientationGuard';
import { InactivityWarningModal } from './components/InactivityWarningModal';
import { useGameState } from './hooks/useGameState';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import { useAuth } from './hooks/useAuth';
import { usePageTransition } from './hooks/usePageTransition';
import type { RoomInfo } from '@shared/types/game.types';

/**
 * 🔒 PROTOCOL: MAINTENANCE MODE
 * ตั้งเป็น true: ปิดปรับปรุงระบบ (Systems Offline / Maintenance Mode)
 * ตั้งเป็น false: เปิดระบบให้เข้าเล่นเกม Marvel Splendor ตามคำสั่งของเจ้านาย
 */
const MAINTENANCE_MODE = true;

export default function App(): React.ReactElement {
  useEffect(() => {
    if (MAINTENANCE_MODE) {
      document.title = 'ปิดปรับปรุงระบบชั่วคราว — Marvel Splendor';
    } else {
      document.title = 'Marvel Splendor — แย่งชิงถุงมืออินฟินิตี้';
    }
  }, []);

  if (MAINTENANCE_MODE) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#080c18] relative overflow-hidden select-none font-['Prompt',sans-serif]">
        {/* Soft Ambient Radial Lighting */}
        <div
          className="fixed inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 50% 25%, rgba(56, 189, 248, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse at 50% 80%, rgba(245, 158, 11, 0.05) 0%, transparent 60%)
            `,
          }}
        />

        <MaintenanceCard />
      </main>
    );
  }

  return <AuthGate />;
}

// ─── Auth Gate: show login or game ──────────────────────────────

function AuthGate(): React.ReactElement {
  const auth = useAuth();
  // isGuest: user explicitly skipped login
  const [isGuest, setIsGuest] = useState(false);

  // Auto-skip login screen once token verified
  const isAuthenticated = Boolean(auth.profile && auth.token);

  // While verifying stored token, show loading
  if (auth.isLoading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center page-enter"
        style={{ background: '#06070f', fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="text-center">
          <div
            className="text-3xl font-black tracking-widest mb-3"
            style={{
              background: 'linear-gradient(90deg, #ffd700, #e040fb, #4895ef, #ffd700)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 3s linear infinite',
            }}
          >
            MARVEL SPLENDOR
          </div>
          <div className="text-white/30 text-sm animate-pulse">กำลังตรวจสอบระบบ...</div>
        </div>
      </div>
    );
  }

  // Render login screen or game router
  return !isAuthenticated && !isGuest ? (
    <div className="page-enter" style={{ width: '100%', height: '100%' }}>
      <LoginScreen
        auth={auth}
        onContinueAsGuest={() => setIsGuest(true)}
      />
    </div>
  ) : (
    <GameRouter
      auth={auth}
      isGuest={isGuest}
      onLogout={() => {
        auth.logout();
        setIsGuest(false);
      }}
    />
  );
}

// ─── Game Router ────────────────────────────────────────────────

interface GameRouterProps {
  auth: ReturnType<typeof useAuth>;
  isGuest: boolean;
  onLogout: () => void;
}

function GameRouter({ auth, isGuest, onLogout }: GameRouterProps): React.ReactElement {
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [afkNotice, setAfkNotice] = useState<string | null>(null);
  // Controls which screen is actively rendered (with key to force remount = fresh enter animation)
  const [activeScreen, setActiveScreen] = useState<'lobby' | 'board'>('lobby');
  const { isExiting, triggerExit } = usePageTransition(300);

  const accountId = auth.profile?.id ?? undefined;

  const {
    gameState,
    roomInfo,
    connectionStatus,
    error,
    gameOverData,
    createRoom,
    createSolo,
    setTargetScore,
    joinRoom,
    leaveRoom,
    afkTimeout,
    startGame,
    toggleReady,
    addBot,
    removeBot,
    sendAction,
    listRooms,
    clearError,
  } = useGameState(myPlayerId);

  const isInRoomOrGame = Boolean(myPlayerId && (gameState || roomInfo));

  // Auto-kick / Bot takeover when idle for 3 minutes
  const handleInactivityTimeout = useCallback(() => {
    const activeRoomId = gameState?.roomId || roomInfo?.roomId;
    if (activeRoomId && myPlayerId) {
      afkTimeout(activeRoomId, myPlayerId);
    } else {
      leaveRoom();
    }
    setMyPlayerId(null);
    setAfkNotice('คุณถูกออกจากห้องอัตโนมัติเนื่องจากไม่มีการเคลื่อนไหวเกิน 3 นาที โดยระบบได้ส่งบอท AI เข้าเล่นแทนเรียบร้อยแล้ว (Auto-replaced by AI Bot due to 3 minutes of inactivity)');
  }, [gameState?.roomId, roomInfo?.roomId, myPlayerId, afkTimeout, leaveRoom]);

  const { remainingSeconds, isWarning, resetTimer } = useInactivityTimeout({
    timeoutMs: 3 * 60 * 1000,
    warningThresholdMs: 60 * 1000,
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
      }, mapId, avatarUrl, targetScore, accountId);
    },
    [createRoom, accountId],
  );

  // On Solo Game Create
  const handleCreateSolo = useCallback(
    (playerName: string, botCount: number, botNames?: string[], mapId?: string, avatarUrl?: string, targetScore?: number) => {
      setAfkNotice(null);
      createSolo(playerName, botCount, botNames, (room) => {
        setMyPlayerId(room.hostId);
      }, mapId, avatarUrl, targetScore, accountId);
    },
    [createSolo, accountId],
  );

  // On Room Join — capture joining player ID
  const handleJoinRoom = useCallback(
    (roomId: string, playerName: string, callback: (success: boolean, err?: string) => void, avatarUrl?: string) => {
      setAfkNotice(null);
      joinRoom(roomId, playerName, (success, err, room) => {
        if (success && room) {
          const me = room.players.find((p) => p.name === playerName);
          if (me) setMyPlayerId(me.id);
          callback(true);
        } else {
          callback(false, err);
        }
      }, avatarUrl, accountId);
    },
    [joinRoom, accountId],
  );

  // Resume game from other device: join with saved playerId from profile
  const handleResumeRoom = useCallback(
    (roomId: string, savedPlayerId?: string) => {
      const playerName = auth.profile?.username || 'Player';
      handleJoinRoom(roomId, playerName, (success, err) => {
        if (success) {
          if (savedPlayerId) setMyPlayerId(savedPlayerId);
        } else {
          console.warn('[Resume] Could not rejoin room:', err);
          auth.clearActiveRoom();
          alert(err || `ห้อง ${roomId} สิ้นสุดหรือไม่มีอยู่แล้ว ระบบได้ล้างสถานะห้องให้เรียบร้อยแล้ว`);
        }
      });
    },
    [auth.profile?.username, handleJoinRoom, auth.clearActiveRoom],
  );

  const handleLeave = useCallback(() => {
    const activeRoomId = gameState?.roomId || roomInfo?.roomId;
    triggerExit(() => {
      leaveRoom(activeRoomId && myPlayerId ? { roomId: activeRoomId, playerId: myPlayerId } : undefined);
      setMyPlayerId(null);
      setActiveScreen('lobby');
      // Refresh profile to clear active room
      if (!isGuest) auth.refreshProfile();
    });
  }, [gameState?.roomId, roomInfo?.roomId, myPlayerId, leaveRoom, isGuest, auth, triggerExit]);

  // Sync activeScreen when gameState arrives
  useEffect(() => {
    if (gameState && myPlayerId) setActiveScreen('board');
  }, [gameState, myPlayerId]);

  const showBoard = Boolean(activeScreen === 'board' && gameState && myPlayerId);

  return (
    <OrientationGuard enabled={showBoard}>
      <div className="relative w-screen h-screen overflow-hidden">
        {showBoard && gameState && myPlayerId ? (
          <div
            key="board"
            className={isExiting ? 'page-exit' : 'page-enter-slide'}
            style={{ width: '100%', height: '100%' }}
          >
            <Board
              state={gameState}
              myPlayerId={myPlayerId}
              onSendAction={sendAction}
              onLeave={handleLeave}
              error={error}
              onClearError={clearError}
              gameOverData={gameOverData}
              userProfile={auth.profile}
              refreshProfile={auth.refreshProfile}
            />
          </div>
        ) : (
          <div
            key="lobby"
            className={isExiting ? 'page-exit' : 'page-enter'}
            style={{ width: '100%', height: '100%' }}
          >
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
              // Auth / Profile props
              userProfile={auth.profile}
              isGuest={isGuest}
              onLogout={onLogout}
              onResumeRoom={handleResumeRoom}
              onClearActiveRoom={auth.clearActiveRoom}
            />
          </div>
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