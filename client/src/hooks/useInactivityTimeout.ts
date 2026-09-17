// ============================================================
//  useInactivityTimeout.ts — AFK 5-Minute Inactivity Auto-Kick Hook
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimeoutOptions {
  /** Inactivity timeout in milliseconds (default: 3 minutes = 180,000ms) */
  timeoutMs?: number;
  /** Warning threshold in milliseconds before timeout (default: 60 seconds = 60,000ms) */
  warningThresholdMs?: number;
  /** Whether the inactivity monitor is active */
  enabled: boolean;
  /** Callback fired when timeout expires */
  onTimeout: () => void;
}

interface UseInactivityTimeoutReturn {
  /** Remaining seconds until auto-kick */
  remainingSeconds: number;
  /** Whether the warning state is currently active (< warningThreshold) */
  isWarning: boolean;
  /** Explicitly reset the inactivity timer */
  resetTimer: () => void;
}

export function useInactivityTimeout({
  timeoutMs = 3 * 60 * 1000, // 3 minutes
  warningThresholdMs = 60 * 1000, // 60 seconds
  enabled,
  onTimeout,
}: UseInactivityTimeoutOptions): UseInactivityTimeoutReturn {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(Math.round(timeoutMs / 1000));
  const [isWarning, setIsWarning] = useState<boolean>(false);

  const lastActivityRef = useRef<number>(Date.now());
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setRemainingSeconds(Math.round(timeoutMs / 1000));
    setIsWarning(false);
  }, [timeoutMs]);

  // Activity listeners
  useEffect(() => {
    if (!enabled) {
      setIsWarning(false);
      return;
    }

    lastActivityRef.current = Date.now();
    setRemainingSeconds(Math.round(timeoutMs / 1000));
    setIsWarning(false);

    let lastThrottledTime = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle event handling to once every 1000ms to keep performance high
      if (now - lastThrottledTime > 1000) {
        lastThrottledTime = now;
        lastActivityRef.current = now;
        setIsWarning(false);
      }
    };

    const events = ['pointerdown', 'pointermove', 'touchstart', 'touchend', 'keydown', 'wheel', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Check timer every second
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remainingMs = Math.max(0, timeoutMs - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);

      setRemainingSeconds(remainingSec);

      if (remainingMs <= 0) {
        clearInterval(interval);
        onTimeoutRef.current();
      } else if (remainingMs <= warningThresholdMs) {
        setIsWarning(true);
      } else {
        setIsWarning(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [enabled, timeoutMs, warningThresholdMs]);

  return {
    remainingSeconds,
    isWarning,
    resetTimer,
  };
}
