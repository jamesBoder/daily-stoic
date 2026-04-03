import React from 'react';

interface PullRefreshIndicatorProps {
  /** 0–1: how far the pull has progressed */
  progress: number;
  isRefreshing: boolean;
}

/**
 * PullRefreshIndicator — shows a small amber arc above the content
 * when the user is pulling down to refresh or a refresh is in flight.
 * Attach this as the first child inside the pull container.
 */
const PullRefreshIndicator: React.FC<PullRefreshIndicatorProps> = ({
  progress,
  isRefreshing,
}) => {
  const visible = isRefreshing || progress > 0;
  if (!visible) return null;

  const size = 28;
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = isRefreshing ? circ * 0.75 : circ * progress;

  return (
    <div
      className="flex justify-center items-center transition-all duration-150"
      style={{ height: isRefreshing ? 40 : Math.max(progress * 40, 0) }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={isRefreshing ? 'animate-spin' : ''}
        style={{ opacity: isRefreshing ? 1 : progress }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#8b7355"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
    </div>
  );
};

export default PullRefreshIndicator;
