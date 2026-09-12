// ============================================================
//  YouTubeMusicPlayer.tsx — Marvel Cinematic BGM Player (YouTube-styled)
//  Features:
//   - 25 iconic Marvel tracks from user playlist
//   - Pure audio playback (no video popups)
//   - Responsive: Compact/Mini floating badge or Full control bar
//   - Volume slider (left-right drag slider) & Mute toggle
//   - Interactive playlist modal/drawer via createPortal to document.body
//   - Auto-advance on track end
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MARVEL_PLAYLIST, type MarvelSong } from '../data/marvelPlaylist';

interface YouTubeMusicPlayerProps {
  className?: string;
  defaultVolume?: number;
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const YouTubeMusicPlayer: React.FC<YouTubeMusicPlayerProps> = ({
  className = '',
  defaultVolume = 60,
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(defaultVolume);
  const [showPlaylist, setShowPlaylist] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hasStartedPlaying, setHasStartedPlaying] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerHeight <= 550) {
      return true;
    }
    return false;
  });

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);

  const currentSong: MarvelSong = MARVEL_PLAYLIST[currentTrackIndex] ?? MARVEL_PLAYLIST[0]!;

  // Send postMessage command to YouTube iframe
  const sendIframeCommand = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*',
      );
    }
  }, []);

  // Update volume on iframe
  const applyVolume = useCallback(
    (vol: number, muted: boolean) => {
      if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(vol);
        if (muted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
        }
      } else {
        sendIframeCommand('setVolume', [vol]);
        if (muted) {
          sendIframeCommand('mute', []);
        } else {
          sendIframeCommand('unMute', []);
        }
      }
    },
    [sendIframeCommand],
  );

  // Switch song
  const playTrack = useCallback(
    (index: number) => {
      const targetIndex = (index + MARVEL_PLAYLIST.length) % MARVEL_PLAYLIST.length;
      setCurrentTrackIndex(targetIndex);
      setIsPlaying(true);
      setHasStartedPlaying(true);

      const targetSong = MARVEL_PLAYLIST[targetIndex]!;
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById(targetSong.youtubeId);
      } else {
        if (iframeRef.current) {
          iframeRef.current.src = `https://www.youtube.com/embed/${targetSong.youtubeId}?enablejsapi=1&autoplay=1&playsinline=1`;
        }
      }
    },
    [],
  );

  const handleNext = useCallback(() => {
    playTrack(currentTrackIndex + 1);
  }, [playTrack, currentTrackIndex]);

  const handlePrev = useCallback(() => {
    playTrack(currentTrackIndex - 1);
  }, [playTrack, currentTrackIndex]);

  // Listen for YouTube player state changes via window postMessage (e.g. video ended)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === 'infoDelivery' && parsed.info && parsed.info.playerState === 0) {
            handleNext();
          }
        } catch {
          // ignore non-JSON messages
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleNext]);

  const togglePlay = () => {
    if (!hasStartedPlaying) {
      playTrack(currentTrackIndex);
      return;
    }
    if (isPlaying) {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      } else {
        sendIframeCommand('pauseVideo');
      }
      setIsPlaying(false);
    } else {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      } else {
        sendIframeCommand('playVideo');
      }
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    applyVolume(volume, nextMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
    applyVolume(newVol, newVol === 0);
  };

  // Filter playlist
  const filteredPlaylist = MARVEL_PLAYLIST.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={`relative z-40 ${className}`}>
      {/* Hidden Background YouTube Iframe */}
      <div className="sr-only">
        <iframe
          ref={iframeRef}
          id="yt-marvel-bgm-iframe"
          title="Marvel BGM Player"
          width="200"
          height="112"
          src={`https://www.youtube.com/embed/${currentSong.youtubeId}?enablejsapi=1&autoplay=0&playsinline=1`}
          allow="autoplay; encrypted-media"
        />
      </div>

      {/* ── Collapsed Mini Floating Badge (Mobile Landscape / Compact) ── */}
      {isCollapsed ? (
        <div className="flex items-center gap-1.5 bg-neutral-950/90 border border-red-500/40 rounded-full px-2.5 py-1 shadow-2xl backdrop-blur-md transition-all">
          <button
            type="button"
            onClick={togglePlay}
            className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-xs font-bold cursor-pointer shadow"
            title={isPlaying ? 'หยุดชั่วคราว (Pause)' : 'เล่นเพลง (Play)'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <span className="text-[10px] font-bold text-white truncate max-w-[90px]">
            {currentSong.title}
          </span>
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="text-[10px] text-white/50 hover:text-white px-1 cursor-pointer"
            title="ขยายเครื่องเล่น (Expand player)"
          >
            ▼
          </button>
        </div>
      ) : (
        /* ── Expanded Main YouTube-Styled Player Bar ───────────────────── */
        <div className="flex items-center gap-1.5 sm:gap-3 bg-neutral-950/95 hover:bg-neutral-950 border border-red-500/40 hover:border-red-500/60 rounded-2xl px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-2xl backdrop-blur-md transition-all">
          {/* Track Thumbnail Art */}
          <div className="relative shrink-0 rounded-lg overflow-hidden border border-red-500/30 w-8 h-6 sm:w-11 sm:h-7 bg-black flex items-center justify-center shadow">
            <img
              src={`https://img.youtube.com/vi/${currentSong.youtubeId}/mqdefault.jpg`}
              alt={currentSong.title}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
              className="w-full h-full object-cover opacity-85"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="text-[9px] text-red-400 font-bold animate-pulse">🎵</span>
              </div>
            )}
          </div>

          {/* Track Title & Artist */}
          <div className="min-w-0 max-w-[90px] sm:max-w-[170px]">
            <div className="flex items-center gap-1">
              <span className="bg-red-600 text-white font-black text-[7px] sm:text-[8px] px-1 py-0.2 rounded font-sans uppercase tracking-wider shrink-0 hidden sm:inline-block">
                BGM
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-white truncate block">
                {currentSong.title}
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] text-white/50 truncate block">
              {currentSong.artist} • {currentSong.duration}
            </span>
          </div>

          {/* Playback Controls (Prev, Play/Pause, Next) */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-[10px] sm:text-xs cursor-pointer"
              title="เพลงก่อนหน้า (Previous)"
            >
              ⏮
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-md hover:scale-105 transition-all cursor-pointer"
              title={isPlaying ? 'หยุดชั่วคราว (Pause)' : 'เล่นเพลง (Play)'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-[10px] sm:text-xs cursor-pointer"
              title="เพลงถัดไป (Next)"
            >
              ⏭
            </button>
          </div>

          {/* Volume Controls: Mute Toggle + Horizontal Volume Slider */}
          <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-white/10">
            <button
              type="button"
              onClick={toggleMute}
              className="text-white/70 hover:text-white text-xs p-0.5 sm:p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title={isMuted ? 'เปิดเสียง (Unmute)' : 'ปิดเสียง (Mute)'}
            >
              {isMuted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
            </button>

            {/* Horizontal Slider Line */}
            <div className="hidden sm:flex items-center gap-1">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-14 sm:w-20 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-all"
                title={`ระดับเสียง: ${isMuted ? 0 : volume}%`}
              />
              <span className="text-[9px] font-mono text-white/40 w-5 text-right hidden sm:inline-block">
                {isMuted ? '0%' : `${volume}%`}
              </span>
            </div>
          </div>

          {/* Playlist Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => setShowPlaylist(true)}
            className="flex items-center gap-1 bg-white/5 hover:bg-red-600/30 border border-white/10 hover:border-red-500/40 rounded-xl px-1.5 py-0.5 sm:px-2 sm:py-1 text-white text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer shrink-0 shadow"
            title="เลือกเพลงจากเพลย์ลิสต์ (Select Songs)"
          >
            <span>📑</span>
            <span className="hidden sm:inline">เพลง ({MARVEL_PLAYLIST.length})</span>
          </button>

          {/* Minimize toggle button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="text-[9px] text-white/40 hover:text-white px-0.5 cursor-pointer"
            title="ย่อเครื่องเล่น (Minimize player)"
          >
            ▲
          </button>
        </div>
      )}

      {/* ── Interactive Playlist Selection Drawer / Modal ─────── */}
      {showPlaylist &&
        createPortal(
          <div
            onClick={() => setShowPlaylist(false)}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0c0d16] border-2 border-red-500/50 shadow-[0_0_60px_rgba(0,0,0,0.95)] rounded-3xl p-4 sm:p-5 max-w-lg w-full max-h-[82vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/15 pb-2.5 mb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="marvel-badge px-2 py-0.5 rounded text-xs font-black">
                    MARVEL
                  </span>
                  <h3 className="font-display font-black text-sm sm:text-base text-white">
                    เลือกเพลงคลอ (Soundtracks)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlaylist(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-red-600 text-white flex items-center justify-center text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  title="ปิดหน้าต่าง (Close)"
                >
                  ✕
                </button>
              </div>

              {/* Search Input */}
              <div className="mb-2 shrink-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อเพลงหรือศิลปิน (Search songs)..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 sm:py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              {/* Song List */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/10 pr-1 space-y-1 my-1">
                {filteredPlaylist.map((song) => {
                  const isCurrent = song.id === currentSong.id;
                  const originalIndex = MARVEL_PLAYLIST.findIndex((s) => s.id === song.id);

                  return (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => {
                        playTrack(originalIndex);
                        setShowPlaylist(false);
                      }}
                      className={[
                        'w-full flex items-center gap-2.5 sm:gap-3 p-2 rounded-xl text-left transition-all cursor-pointer group',
                        isCurrent
                          ? 'bg-red-600/30 border border-red-500/60 text-white shadow-lg'
                          : 'hover:bg-white/10 text-white/80 hover:text-white border border-transparent',
                      ].join(' ')}
                    >
                      {/* Track Thumbnail with Fallback */}
                      <div className="relative w-10 h-7 sm:w-12 sm:h-9 rounded-lg overflow-hidden shrink-0 bg-neutral-900 border border-white/15 flex items-center justify-center">
                        <img
                          src={`https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`}
                          alt={song.title}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                          className="w-full h-full object-cover"
                        />
                        {/* Fallback Icon */}
                        <div className="absolute inset-0 -z-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-xs text-white/50">
                          🎵
                        </div>
                        {isCurrent && isPlaying && (
                          <div className="absolute inset-0 bg-red-600/70 z-10 flex items-center justify-center">
                            <span className="animate-pulse text-xs">🔊</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-bold truncate ${
                            isCurrent ? 'text-red-300' : 'text-white'
                          }`}
                        >
                          {song.title}
                        </p>
                        <p className="text-[10px] text-white/50 truncate">{song.artist}</p>
                      </div>

                      {/* Duration & Status */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-white/40 block">
                          {song.duration}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">
                            กำลังเล่น
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="pt-2.5 border-t border-white/15 mt-1.5 flex items-center justify-between shrink-0">
                <span className="text-[10px] text-white/50">
                  เพลงทั้งหมด {MARVEL_PLAYLIST.length} เพลง
                </span>
                <button
                  type="button"
                  onClick={() => setShowPlaylist(false)}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow-lg hover:scale-105 transition-all"
                >
                  ปิดหน้าต่าง (Close)
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
