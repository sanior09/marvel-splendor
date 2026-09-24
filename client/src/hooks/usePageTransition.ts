// ============================================================
//  usePageTransition.ts — Smooth exit animation before unmount
// ============================================================

import { useState, useCallback } from 'react';

/**
 * Provides a controlled exit animation before navigating away.
 *
 * Usage:
 *   const { isExiting, triggerExit } = usePageTransition();
 *   // Apply `page-exit` class when isExiting === true
 *   // Call triggerExit(() => doNavigation()) to animate then navigate
 */
export function usePageTransition(exitDurationMs = 280) {
  const [isExiting, setIsExiting] = useState(false);

  const triggerExit = useCallback(
    (onComplete: () => void) => {
      setIsExiting(true);
      setTimeout(() => {
        setIsExiting(false);
        onComplete();
      }, exitDurationMs);
    },
    [exitDurationMs],
  );

  return { isExiting, triggerExit };
}
