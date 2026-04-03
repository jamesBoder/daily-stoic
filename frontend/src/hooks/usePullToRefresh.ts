import { useRef, useCallback, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  /** Distance in px to pull before refresh triggers. Default: 64 */
  threshold?: number;
}

interface PullToRefreshHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  /** How far (0–1) the pull has progressed toward the threshold */
  pullProgress: number;
  /** True while the refresh async operation is in flight */
  isRefreshing: boolean;
}

/**
 * usePullToRefresh — attach to a scrollable container.
 *
 * Only fires when the element is scrolled to the very top (scrollTop === 0)
 * and the user pulls down further. Shows no UI itself — use `pullProgress`
 * and `isRefreshing` to render PullRefreshIndicator.
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 64,
}: PullToRefreshOptions): PullToRefreshHandlers {
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Only engage if already at the top of the scroll container
    const target = e.currentTarget as HTMLElement;
    if (target.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current || isRefreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        setPullProgress(0);
        return;
      }
      // Dampen the movement so it feels natural (rubber-band effect)
      const dampened = Math.min(dy * 0.5, threshold * 1.2);
      setPullProgress(Math.min(dampened / threshold, 1));
    },
    [isRefreshing, threshold]
  );

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullProgress >= 1 && !isRefreshing) {
      setIsRefreshing(true);
      setPullProgress(0);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setPullProgress(0);
    }
  }, [pullProgress, isRefreshing, onRefresh]);

  return { onTouchStart, onTouchMove, onTouchEnd, pullProgress, isRefreshing };
}
