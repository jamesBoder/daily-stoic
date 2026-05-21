// display user stats
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { profileService } from "../../services/api/profile";
import { UserStats } from "../../types/profile";
import { VerseCardSkeleton } from "../../components/common/Skeleton";

// --- Count-up hook ---
function useCountUp(target: number, duration = 1000): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return count;
}

// --- Individual animated stat card ---
interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  glowClass: string;
  gradientLight: string;
  gradientDark: string;
  labelColorLight: string;
  labelColorDark: string;
  numberColorLight: string;
  numberColorDark: string;
  borderColorLight: string;
  borderColorDark: string;
}

const AnimatedStatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  glowClass,
  gradientLight,
  gradientDark,
  labelColorLight,
  labelColorDark,
  numberColorLight,
  numberColorDark,
  borderColorLight,
  borderColorDark,
}) => {
  const animatedValue = useCountUp(value);

  return (
    <div
      className={`
        p-5 rounded-xl text-center cursor-default
        bg-gradient-to-br ${gradientLight} ${gradientDark}
        border ${borderColorLight} ${borderColorDark}
        transition-all duration-300 ease-out
        hover:scale-105 hover:-translate-y-1
        ${glowClass}
        animate-fade-in
      `}
    >
      <div className="text-3xl mb-2 select-none">{icon}</div>
      <h3 className={`text-sm font-semibold mb-2 ${labelColorLight} ${labelColorDark}`}>
        {label}
      </h3>
      <p className={`text-4xl font-bold tabular-nums ${numberColorLight} ${numberColorDark}`}>
        {animatedValue}
      </p>
    </div>
  );
};

// --- Main StatsCard ---
export const StatsCard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await profileService.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-surface shadow-md rounded-xl p-6">
        <VerseCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface shadow-md rounded-xl p-6">
        <div className="text-danger">Error: {error}</div>
      </div>
    );
  }

  const statCards = [
    {
      icon: "📖",
      label: t("profile.versesRead"),
      value: stats?.history_count || 0,
      glowClass: "stat-card-blue-glow",
      gradientLight: "from-blue-100 to-blue-200",
      gradientDark: "dark:from-blue-900/60 dark:to-blue-800/40",
      labelColorLight: "text-blue-700",
      labelColorDark: "dark:text-blue-200",
      numberColorLight: "text-blue-900",
      numberColorDark: "dark:text-blue-100",
      borderColorLight: "border-blue-200",
      borderColorDark: "dark:border-blue-700/50",
    },
    {
      icon: "❤️",
      label: t("profile.favorites"),
      value: stats?.favorite_count || 0,
      glowClass: "stat-card-red-glow",
      gradientLight: "from-red-100 to-rose-200",
      gradientDark: "dark:from-red-900/60 dark:to-rose-800/40",
      labelColorLight: "text-red-700",
      labelColorDark: "dark:text-red-200",
      numberColorLight: "text-red-900",
      numberColorDark: "dark:text-red-100",
      borderColorLight: "border-red-200",
      borderColorDark: "dark:border-red-700/50",
    },
    {
      icon: "📝",
      label: t("profile.notes"),
      value: stats?.comment_count || 0,
      glowClass: "stat-card-green-glow",
      gradientLight: "from-green-100 to-emerald-200",
      gradientDark: "dark:from-green-900/60 dark:to-emerald-800/40",
      labelColorLight: "text-green-700",
      labelColorDark: "dark:text-green-200",
      numberColorLight: "text-green-900",
      numberColorDark: "dark:text-green-100",
      borderColorLight: "border-green-200",
      borderColorDark: "dark:border-green-700/50",
    },
    {
      icon: "🔥",
      label: t("profile.daysActive"),
      value: stats?.account_age_days || 0,
      glowClass: "stat-card-purple-glow",
      gradientLight: "from-purple-100 to-violet-200",
      gradientDark: "dark:from-purple-900/60 dark:to-violet-800/40",
      labelColorLight: "text-purple-700",
      labelColorDark: "dark:text-purple-200",
      numberColorLight: "text-purple-900",
      numberColorDark: "dark:text-purple-100",
      borderColorLight: "border-purple-200",
      borderColorDark: "dark:border-purple-700/50",
    },
  ];

  return (
    <div className="bg-surface shadow-md rounded-xl p-6">
      {/* Glowing gradient title */}
      <h2 className="text-2xl font-semibold mb-6 text-center">
        <span
          className="bg-gradient-to-r from-[var(--color-info)] to-accent bg-clip-text text-transparent drop-shadow-[0_0_6px_var(--color-info-glow)]"
        >
          {t("profile.yourStatistics")}
        </span>
      </h2>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statCards.map((card) => (
            <AnimatedStatCard key={card.label} {...card} />
          ))}
        </div>
      ) : (
        <p className="text-fg-muted text-center">
          {t("profile.noStats")}
        </p>
      )}
    </div>
  );
};
