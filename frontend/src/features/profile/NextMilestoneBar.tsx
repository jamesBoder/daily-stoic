import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Milestone {
  key: string;
  name: string;
  days_required: number;
}

// Stoic practice milestones — mirrors the backend milestone keys in useMilestone.ts
const MILESTONES: Milestone[] = [
  { key: 'first_week',   name: 'First Week',    days_required: 7   },
  { key: 'first_month',  name: 'First Month',   days_required: 30  },
  { key: 'philosopher',  name: 'Philosopher',   days_required: 90  },
  { key: 'sage',         name: 'Sage',          days_required: 365 },
];

interface NextMilestoneBarProps {
  currentStreak: number;
}

const NextMilestoneBar: React.FC<NextMilestoneBarProps> = ({ currentStreak }) => {
  const { t } = useTranslation();
  const [barWidth, setBarWidth] = useState(0);

  const nextMilestone = MILESTONES.find(m => m.days_required > currentStreak) ?? null;

  useEffect(() => {
    if (!nextMilestone) return;
    const pct = Math.min((currentStreak / nextMilestone.days_required) * 100, 100);
    const raf = requestAnimationFrame(() => setBarWidth(pct));
    return () => cancelAnimationFrame(raf);
  }, [currentStreak, nextMilestone]);

  // All milestones complete — a full year of practice
  if (!nextMilestone) {
    return (
      <p className="text-sm font-semibold text-center py-2 text-accent">
        {t('profile.allMilestonesComplete', "A year of Stoic practice — Marcus Aurelius would approve.")}
      </p>
    );
  }

  const pct = Math.min((currentStreak / nextMilestone.days_required) * 100, 100);
  const daysRemaining = Math.max(nextMilestone.days_required - currentStreak, 0);
  const milestoneName = t(`milestone.${nextMilestone.key}`, nextMilestone.name);
  const isLargeMilestone = nextMilestone.days_required > 60;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary-400 dark:text-primary-500">
          {t('profile.nextMilestone', 'Next milestone')}
        </span>
        <span className="text-xs font-medium text-primary-400 dark:text-primary-500 tabular-nums">
          {isLargeMilestone
            ? `${currentStreak} / ${nextMilestone.days_required} ${t('profile.daysLabel', 'days')}`
            : `${daysRemaining} ${t('profile.daysRemaining', 'days to go')}`}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-1 min-w-0">
        <span className="text-sm font-semibold text-primary-800 dark:text-primary-200 truncate">{milestoneName}</span>
      </div>

      {/* Progress track */}
      <div
        className="w-full h-3 rounded-full bg-primary-100 dark:bg-primary-700 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${barWidth}%`,
            background: 'linear-gradient(90deg, #8b7355, #c4a882)',
            transition: 'width 1s ease-out',
            willChange: 'width',
          }}
        />
      </div>

      <span className="sr-only">{Math.round(pct)}% towards {milestoneName}</span>
    </div>
  );
};

export default NextMilestoneBar;
