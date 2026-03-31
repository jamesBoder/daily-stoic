import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
  /** Minimum horizontal or vertical pixel distance to trigger a swipe. Default: 50 */
  threshold?: number;
  /**
   * Ratio of the off-axis movement at which the swipe is ignored.
   * A value of 0.75 means: if vertical movement is more than 75% of horizontal
   * movement, the horizontal swipe is ignored (and vice-versa).
   * Default: 0.75
   */
  axisBias?: number;
}

interface SwipeTouchHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * useSwipe — reusable touch-gesture hook.
 *
 * Returns { onTouchStart, onTouchEnd } to spread onto any element.
 *
 * Usage:
 *   const swipe = useSwipe({ onSwipeLeft: goNext, onSwipeRight: goPrev });
 *   <div {...swipe}>...</div>
 *
 * For swipe-down-to-dismiss on a modal:
 *   const swipe = useSwipe({ onSwipeDown: onClose });
 *   <div {...swipe}>...</div>
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown,
  onSwipeUp,
  threshold = 50,
  axisBias = 0.75,
}: SwipeHandlers): SwipeTouchHandlers {
  const startX = useRef(0);
  const startY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = startX.current - e.changedTouches[0].clientX;
      const dy = startY.current - e.changedTouches[0].clientY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Determine dominant axis
      if (absDx >= absDy) {
        // Horizontal swipe candidate
        if (absDx < threshold) return;
        if (absDy > absDx * axisBias) return; // too vertical
        if (dx > 0) onSwipeLeft?.();
        else onSwipeRight?.();
      } else {
        // Vertical swipe candidate
        if (absDy < threshold) return;
        if (absDx > absDy * axisBias) return; // too horizontal
        if (dy > 0) onSwipeUp?.();
        else onSwipeDown?.();
      }
    },
    [onSwipeLeft, onSwipeRight, onSwipeDown, onSwipeUp, threshold, axisBias]
  );

  return { onTouchStart, onTouchEnd };
}
