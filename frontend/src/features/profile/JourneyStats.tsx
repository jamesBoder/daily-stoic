import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface JourneyStatsProps {
  currentStreak: number;
  longestStreak: number;
  totalReads: number;
}

/** Animates a number from 0 to `target` over `duration`ms with ease-out. */
function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startRef.current = null;
    };
  }, [target, duration]);

  return value;
}

interface StatTileProps {
  value: number;
  label: string;
  icon: string;
  format?: (n: number) => string;
}

const StatTile: React.FC<StatTileProps> = ({ value, label, icon, format }) => {
  const animatedValue = useCountUp(value);
  const displayValue = format ? format(animatedValue) : String(animatedValue);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 sm:py-5 px-2 sm:px-3 rounded-xl bg-primary-50 dark:bg-primary-800/50 border-b-[3px] border-accent"
    >
      <span className="text-2xl sm:text-3xl leading-none" role="img" aria-hidden>{icon}</span>
      <span className="text-2xl sm:text-3xl font-bold text-primary-900 dark:text-primary-100 tabular-nums leading-none">
        {displayValue}
      </span>
      <span className="text-[11px] sm:text-xs font-medium text-primary-500 dark:text-primary-400 text-center leading-tight">
        {label}
      </span>
    </div>
  );
};

const JourneyStats: React.FC<JourneyStatsProps> = ({
  currentStreak,
  longestStreak,
  totalReads,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-3">
      <StatTile
        value={currentStreak}
        label={t('profile.dayStreak', 'Day Streak')}
        icon="🕯"
      />
      <StatTile
        value={longestStreak}
        label={t('profile.longest', 'Longest')}
        icon="🔥"
      />
      <StatTile
        value={totalReads}
        label={t('profile.totalReads', 'Total Reads')}
        icon="📖"
        format={n => n.toLocaleString()}
      />
    </div>
  );
};

export default JourneyStats;
