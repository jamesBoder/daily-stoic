import React, { useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../../hooks/useFavorites";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { CommentSection } from "../verse/CommentSection";
import { VerseCardSkeleton } from "../../components/common/Skeleton";
import { useTranslation } from "react-i18next";
import { showToast } from "../../utils/toast";

type SortField = "date" | "reference" | "book" | "translation" | "chapter" | "verseNumber";
type SortDirection = "asc" | "desc";

const SORT_FIELDS: SortField[] = ["date", "book", "reference", "translation", "chapter", "verseNumber"];

// ── Share helpers ────────────────────────────────────────────────────────────
interface VerseData {
  text?: string;
  reference?: string;
  version?: string;
  translation?: string;
}

const buildShareText = (verse: VerseData): string => {
  const version = verse.version || verse.translation;
  return `"${verse.text}" — ${verse.reference}${version ? ` (${version})` : ""}\n\nvia Daily Stoic app`;
};

// ── Share Panel Component ─────────────────────────────────────────────────────
interface SharePanelProps {
  verse: VerseData;
  cardId: number;
  copiedId: number | null;
  onCopy: (verse: VerseData, id: number, e: React.MouseEvent) => void;
  onTwitter: (verse: VerseData, e: React.MouseEvent) => void;
  onWhatsApp: (verse: VerseData, e: React.MouseEvent) => void;
  onFacebook: (verse: VerseData, e: React.MouseEvent) => void;
  onInstagram: (verse: VerseData, id: number, e: React.MouseEvent) => void;
  onNativeShare: (verse: VerseData, e: React.MouseEvent) => void;
}

const SharePanel: React.FC<SharePanelProps> = ({
  verse, cardId, copiedId,
  onCopy, onTwitter, onWhatsApp, onFacebook, onInstagram, onNativeShare,
}) => {
  const { t } = useTranslation();
  const isCopied = copiedId === cardId;
  const supportsNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const btnBase =
    "inline-flex items-center justify-center w-9 h-9 rounded-full " +
    "transition-all duration-200 active:scale-95 " +
    "focus:outline-none focus:ring-2 focus:ring-offset-1";

  return (
    <div
      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        {t('favorites.shareVerse')}
      </p>
      <div className="flex items-center gap-2">
        {/* Copy */}
        <button
          onClick={(e) => onCopy(verse, cardId, e)}
          aria-label="Copy verse to clipboard"
          title="Copy verse to clipboard"
          className={`${btnBase} ${
            isCopied
              ? "bg-green-500 text-white focus:ring-green-400"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400"
          }`}
        >
          {isCopied ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        {/* Twitter / X */}
        <button
          onClick={(e) => onTwitter(verse, e)}
          aria-label="Share on Twitter / X"
          title="Share on Twitter / X"
          className={`${btnBase} bg-black text-white hover:bg-gray-800 dark:bg-gray-900 dark:hover:bg-black focus:ring-gray-600`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* WhatsApp */}
        <button
          onClick={(e) => onWhatsApp(verse, e)}
          aria-label="Share on WhatsApp"
          title="Share on WhatsApp"
          className={`${btnBase} bg-[#25D366] text-white hover:bg-[#1ebe5d] focus:ring-[#25D366]`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>

        {/* Facebook */}
        <button
          onClick={(e) => onFacebook(verse, e)}
          aria-label="Share on Facebook"
          title="Share on Facebook"
          className={`${btnBase} bg-[#1877F2] text-white hover:bg-[#166fe5] focus:ring-[#1877F2]`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>

        {/* Instagram */}
        <button
          onClick={(e) => onInstagram(verse, cardId, e)}
          aria-label="Share on Instagram (copies text, opens Instagram)"
          title="Share on Instagram (copies text, opens Instagram)"
          className={`${btnBase} bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:opacity-90 focus:ring-[#ee2a7b]`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        </button>

        {/* Native Share (only if supported) */}
        {supportsNativeShare && (
          <button
            onClick={(e) => onNativeShare(verse, e)}
            aria-label="Share via device share sheet"
            title="Share via device share sheet"
            className={`${btnBase} bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:ring-primary-400`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const FavoritesList: React.FC = () => {
  const { t } = useTranslation();

  const SORT_OPTIONS: { value: SortField; label: string }[] = [
    { value: "date",        label: t('favorites.sortOptions.date')        },
    { value: "book",        label: t('favorites.sortOptions.book')        },
    { value: "reference",   label: t('favorites.sortOptions.reference')   },
    { value: "translation", label: t('favorites.sortOptions.translation') },
    { value: "chapter",     label: t('favorites.sortOptions.chapter')     },
    { value: "verseNumber", label: t('favorites.sortOptions.verseNumber') },
  ];
  const { favorites, isLoading, error, removeFavorite } = useFavorites();
  const navigate = useNavigate();
  const [removingId, setRemovingId] = React.useState<number | null>(null);
  const [confirmingRemoveId, setConfirmingRemoveId] = React.useState<number | null>(null);

  // Card selection state
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [copiedId, setCopiedId]     = React.useState<number | null>(null);
  const containerRef                = useRef<HTMLDivElement>(null);

  // Sort & filter state
  const [sortField, setSortField]         = React.useState<SortField>("date");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [keyword, setKeyword]             = React.useState<string>("");

  // Click-outside to deselect (supports both mouse and touch for mobile)
  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedId(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  const handleCardClick = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  // ── Share handlers ──────────────────────────────────────────────────────────
  const handleCopy = async (verse: VerseData, id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(buildShareText(verse));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleTwitterShare = (verse: VerseData, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(buildShareText(verse));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleWhatsAppShare = (verse: VerseData, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(buildShareText(verse));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleFacebookShare = (verse: VerseData, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(buildShareText(verse));
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleInstagramShare = async (verse: VerseData, id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Instagram has no public URL share API — copy text then open Instagram
    try {
      await navigator.clipboard.writeText(buildShareText(verse));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async (verse: VerseData, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.share({ title: "Bible Verse", text: buildShareText(verse) });
    } catch {}
  };

  const toggleDirection = () =>
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));

  // Derived: filter then sort
  const sortedFavorites = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    // 1. Filter by keyword
    const filtered = kw
      ? favorites.filter((fav) => {
          const v = fav.verse;
          return (
            v?.text?.toLowerCase().includes(kw) ||
            v?.reference?.toLowerCase().includes(kw) ||
            v?.book?.toLowerCase().includes(kw) ||
            v?.version?.toLowerCase().includes(kw) ||
            v?.translation?.toLowerCase().includes(kw)
          );
        })
      : favorites;

    // 2. Sort
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "date":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "reference":
          cmp = (a.verse?.reference ?? "").localeCompare(b.verse?.reference ?? "");
          break;
        case "book":
          cmp = (a.verse?.book ?? "").localeCompare(b.verse?.book ?? "");
          break;
        case "translation":
          cmp = (a.verse?.version ?? "").localeCompare(b.verse?.version ?? "");
          break;
        case "chapter":
          cmp = (a.verse?.chapter ?? 0) - (b.verse?.chapter ?? 0);
          break;
        case "verseNumber":
          cmp = (a.verse?.verse ?? 0) - (b.verse?.verse ?? 0);
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [favorites, sortField, sortDirection, keyword]);

  const handleRemove = async (favoriteId: number) => {
    setConfirmingRemoveId(null);
    setRemovingId(favoriteId);
    try {
      await removeFavorite(favoriteId);
    } catch (err) {
      showToast.error(t('favorites.removeFailed'));
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return <VerseCardSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header row: title left, sort controls right */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        {/* Left: title + count */}
        <div>
          <h1 className="text-4xl font-display font-bold text-primary-600 dark:text-primary-400 mb-1 transition-all duration-300 hover:brightness-125 hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.3)] dark:hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.3)] cursor-default">
            {t('favorites.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {keyword.trim()
              ? `${sortedFavorites.length} ${t('favorites.of')} ${favorites.length} ${favorites.length === 1 ? t('favorites.verse') : t('favorites.verses')}`
              : `${favorites.length} ${favorites.length === 1 ? t('favorites.verse') : t('favorites.verses')} ${t('favorites.saved')}`}
          </p>
        </div>

        {/* Right: sort controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <label
            htmlFor="sort-field"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap"
          >
            {t('favorites.sortBy')}:
          </label>
          <select
            id="sort-field"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Asc / Desc toggle */}
          <button
            onClick={toggleDirection}
            title={sortDirection === "asc" ? t('favorites.ascending') : t('favorites.descending')}
            className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {sortDirection === "asc" ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5m8 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span>{t('favorites.ascending')}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5m8 8l4-4m0 0l4 4m-4-4V8" />
                </svg>
                <span>{t('favorites.descending')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyword filter input */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t('favorites.filterPlaceholder')}
          className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow duration-200"
        />
        {keyword && (
          <button
            onClick={() => setKeyword("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            title="Clear filter"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4 animate-float"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('favorites.empty')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('favorites.emptyDescription')}
            </p>
            <Button
              onClick={() => navigate("/daily")}
              variant="primary"
            >
              {t('favorites.viewDailyVerse')}
            </Button>
          </div>
        </Card>
      ) : sortedFavorites.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              {t('favorites.noMatch')} <span className="font-medium">"{keyword}"</span>
            </p>
            <button
              onClick={() => setKeyword("")}
              className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              {t('favorites.clearFilter')}
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4" ref={containerRef}>
          {sortedFavorites.map((favorite, index) => {
            const isSelected = selectedId === favorite.id;
            const isAnySelected = selectedId !== null;
            return (
              <div
                key={favorite.id}
                onClick={() => handleCardClick(favorite.id)}
                className={`
                  cursor-pointer rounded-lg transition-all duration-300 ease-out
                  ${isSelected
                    ? "scale-[1.02] z-10 relative"
                    : isAnySelected
                    ? "opacity-60 scale-100"
                    : "scale-100 opacity-100 hover:-translate-y-1 hover:shadow-xl"
                  }
                  ${index < 10 ? "opacity-0 animate-fade-in" : ""}
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card
                  className={`transition-all duration-300 ease-out ${
                    isSelected ? "card-selected-glow" : "shadow-lg"
                  }`}
                >
                  {/* Verse content — always visible */}
                  <div className="mb-3">
                    <p className="text-lg text-gray-800 dark:text-gray-200 font-serif leading-relaxed mb-3">
                      {favorite.verse?.text}
                    </p>
                    <p className="text-lg font-display font-semibold text-primary-700 dark:text-primary-400 transition-all duration-300 hover:brightness-125 hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.3)] dark:hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.3)] cursor-default">
                      {favorite.verse?.reference}
                    </p>
                    {favorite.verse?.version && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {favorite.verse.version}
                      </p>
                    )}
                  </div>

                  {/* Date — always visible */}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {t('favorites.added')} {new Date(favorite.created_at).toLocaleDateString()}
                  </p>

                  {/* Expanded content — only visible when card is selected */}
                  {isSelected && (
                    <>
                      {/* Share Panel */}
                      {favorite.verse && (
                        <SharePanel
                          verse={favorite.verse}
                          cardId={favorite.id}
                          copiedId={copiedId}
                          onCopy={handleCopy}
                          onTwitter={handleTwitterShare}
                          onWhatsApp={handleWhatsAppShare}
                          onFacebook={handleFacebookShare}
                          onInstagram={handleInstagramShare}
                          onNativeShare={handleNativeShare}
                        />
                      )}

                      {/* Remove button */}
                      <div
                        className="flex justify-end items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {confirmingRemoveId === favorite.id ? (
                          <>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t('favorites.removeConfirm')}
                            </span>
                            <Button
                              onClick={() => handleRemove(favorite.id)}
                              variant="danger"
                              isLoading={removingId === favorite.id}
                              className="text-sm"
                            >
                              {t('common.confirm')}
                            </Button>
                            <Button
                              onClick={() => setConfirmingRemoveId(null)}
                              variant="secondary"
                              className="text-sm"
                            >
                              {t('common.cancel')}
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => setConfirmingRemoveId(favorite.id)}
                            variant="danger"
                            className="text-sm"
                          >
                            {t('favorites.remove')}
                          </Button>
                        )}
                      </div>

                      {/* Comment Section (Notes) */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <CommentSection
                          verseId={favorite.verse_id}
                          verseReference={favorite.verse?.reference || ""}
                        />
                      </div>
                    </>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
