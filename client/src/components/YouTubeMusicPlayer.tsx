// ============================================================
//  YouTubeMusicPlayer.tsx — Marvel Cinematic BGM Player (Official YouTube API)
//  Features:
//   - 25 verified iconic Marvel & Classic Rock tracks
//   - Real live playback via official YouTube Iframe Player API
//   - Real-time time progress counter (0:15 / 2:04) & progress bar line
//   - Auto-advance on track finish & auto-skip on embed error
//   - Left-right volume slider & mute toggle
//   - Collapsible mini pill for mobile landscape (zero obstruction)
//   - Interactive playlist drawer with search via createPortal
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

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function parseDurationSeconds(durationStr: string): number {
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0] ?? '0', 10) * 60 + parseInt(parts[1] ?? '0', 10);
  }
  return 120;
}

export const YouTubeMusicPlayer: React.FC<YouTubeMusicPlayerProps> = ({
  className = '',
  defaultVolume = 70,
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(defaultVolume);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(124);
  const [showPlaylist, setShowPlaylist] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerHeight <= 550) {
      return true;
    }
    return false;
  });

  const playerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const currentSong: MarvelSong = MARVEL_PLAYLIST[currentTrackIndex] ?? MARVEL_PLAYLIST[0]!;

  // ── Load YouTube Iframe API ──────────────────────────────────
  useEffect(() => {
    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('marvel-yt-bgm-container', {
        height: '80',
        width: '80',
        videoId: currentSong.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(defaultVolume);
            const total = event.target.getDuration();
            if (total && total > 0) {
              setDuration(total);
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: PLAYING=1, PAUSED=2, ENDED=0, BUFFERING=3
            if (event.data === 1) {
              setIsPlaying(true);
            } else if (event.data === 2) {
              setIsPlaying(false);
            } else if (event.data === 0) {
              handleNext();
            }
          },
          onError: (err: any) => {
            console.warn('YouTube Player error code:', err?.data);
            // If video restricted (150/101) or unavailable, auto-advance smoothly
            setTimeout(() => {
              handleNext();
            }, 1200);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };

      if (!document.getElementById('yt-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Progress Polling Timer ──────────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const curr = playerRef.current.getCurrentTime() || 0;
          setCurrentTime(curr);
          const dur = playerRef.current.getDuration() || parseDurationSeconds(currentSong.duration);
          if (dur > 0) setDuration(dur);
        }
      }, 500);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSong]);

  // ── Play Specific Track ─────────────────────────────────────
  const playTrack = useCallback(
    (index: number) => {
      const targetIndex = (index + MARVEL_PLAYLIST.length) % MARVEL_PLAYLIST.length;
      setCurrentTrackIndex(targetIndex);
      setCurrentTime(0);

      const targetSong = MARVEL_PLAYLIST[targetIndex]!;
      setDuration(parseDurationSeconds(targetSong.duration));

      if (playerRef.current) {
        if (typeof playerRef.current.loadVideoById === 'function') {
          playerRef.current.loadVideoById(targetSong.youtubeId);
          setIsPlaying(true);
        } else if (typeof playerRef.current.cueVideoById === 'function') {
          playerRef.current.cueVideoById(targetSong.youtubeId);
          playerRef.current.playVideo();
          setIsPlaying(true);
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

  // ── Toggle Play / Pause ──────────────────────────────────────
  const togglePlay = () => {
    if (!playerRef.current) {
      playTrack(currentTrackIndex);
      return;
    }

    if (isPlaying) {
      if (typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
      setIsPlaying(false);
    } else {
      if (typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      } else {
        playTrack(currentTrackIndex);
      }
      setIsPlaying(true);
    }
  };

  // ── Volume & Mute ───────────────────────────────────────────
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (playerRef.current) {
      if (nextMuted) {
        if (typeof playerRef.current.mute === 'function') playerRef.current.mute();
      } else {
        if (typeof playerRef.current.unMute === 'function') playerRef.current.unMute();
      }
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
    if (playerRef.current) {
      if (typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(newVol);
      }
      if (newVol === 0) {
        if (typeof playerRef.current.mute === 'function') playerRef.current.mute();
      } else if (isMuted) {
        if (typeof playerRef.current.unMute === 'function') playerRef.current.unMute();
      }
    }
  };

  // ── Filter Playlist ─────────────────────────────────────────
  const filteredPlaylist = MARVEL_PLAYLIST.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className={`relative z-40 ${className}`}>
      {/* ── Offscreen YouTube Player Container ────────────────── */}
      <div
        style={{
          position: 'fixed',
          bottom: -150,
          right: -150,
          width: 80,
          height: 80,
          opacity: 0.001,
          pointerEvents: 'none',
          zIndex: -50,
        }}
      >
        <div id="marvel-yt-bgm-container" />
      </div>

      {/* ── Collapsed Mini Pill (Mobile Landscape / Low Height) ── */}
      {isCollapsed ? (
        <div className="flex items-center gap-1.5 bg-neutral-950/95 border border-red-500/50 rounded-full px-2.5 py-1 shadow-2xl backdrop-blur-md transition-all">
          <button
            type="button"
            onClick={togglePlay}
            className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-xs font-bold cursor-pointer shadow"
            title={isPlaying ? 'หยุดชั่วคราว (Pause)' : 'เล่นเพลง (Play)'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className="flex flex-col min-w-0 max-w-[100px]">
            <span className="text-[10px] font-bold text-white truncate leading-tight">
              {currentSong.title}
            </span>
            <span className="text-[8px] font-mono text-red-300 truncate leading-tight">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
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
        /* ── Expanded Full YouTube-Styled Control Bar ───────────── */
        <div className="flex flex-col bg-neutral-950/95 hover:bg-neutral-950 border border-red-500/40 hover:border-red-500/60 rounded-2xl p-1.5 sm:px-3 sm:py-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Track Thumbnail Art */}
            <div className="relative shrink-0 rounded-lg overflow-hidden border border-red-500/30 w-9 h-7 sm:w-11 sm:h-8 bg-black flex items-center justify-center shadow">
              <img
                src={`https://img.youtube.com/vi/${currentSong.youtubeId}/mqdefault.jpg`}
                alt={currentSong.title}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-cover opacity-85"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                  <span className="text-[9px] text-white font-bold animate-pulse">🎵</span>
                </div>
              )}
            </div>

            {/* Track Info & Live Timer */}
            <div className="min-w-0 max-w-[105px] sm:max-w-[170px]">
              <div className="flex items-center gap-1">
                <span className="bg-red-600 text-white font-black text-[7px] sm:text-[8px] px-1 py-0.2 rounded font-sans uppercase tracking-wider shrink-0 hidden sm:inline-block">
                  BGM
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-white truncate block">
                  {currentSong.title}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[8px] sm:text-[9px]">
                <span className="text-white/50 truncate max-w-[65px] sm:max-w-[90px]">
                  {currentSong.artist}
                </span>
                <span className="text-red-400 font-mono font-bold shrink-0">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
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

            {/* Volume Controls: Mute Toggle + Horizontal Slider */}
            <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-white/10">
              <button
                type="button"
                onClick={toggleMute}
                className="text-white/70 hover:text-white text-xs p-0.5 sm:p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                title={isMuted ? 'เปิดเสียง (Unmute)' : 'ปิดเสียง (Mute)'}
              >
                {isMuted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
              </button>

              <div className="hidden sm:flex items-center gap-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-14 sm:w-18 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-all"
                  title={`ระดับเสียง: ${isMuted ? 0 : volume}%`}
                />
                <span className="text-[9px] font-mono text-white/40 w-5 text-right hidden sm:inline-block">
                  {isMuted ? '0%' : `${volume}%`}
                </span>
              </div>
            </div>

            {/* Playlist Drawer Button */}
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

          {/* ── Active Progress Bar Line ──────────────────────── */}
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
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
