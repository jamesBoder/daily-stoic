/**
 * Unit tests for the viewed_at → display date fallback logic introduced in
 * DailyVerse.tsx to handle pre-migration verses where daily_date is NULL.
 *
 * These tests are pure JS — no network, no database, no React. They validate
 * the date arithmetic in isolation so the logic can be verified locally
 * before deploying to fly.io.
 *
 * The algorithm under test (mirrored from DailyVerse.tsx):
 *   1. Primary:  parse verse.daily_date (YYYY-MM-DD from DB, validated with regex)
 *   2. Fallback: viewed_at - 10h, read with UTC getters (matches backend UTC-10 offset)
 *   3. Last:     new Date() — only for today's verse (historyIndex === 0)
 */

// ---------------------------------------------------------------------------
// Helper — mirrors the exact logic from DailyVerse.tsx
// ---------------------------------------------------------------------------

interface MockEntry {
  verse: { daily_date?: string | null };
  viewed_at: string;
}

function resolveDisplayDate(
  safeIndex: number,
  currentEntry: MockEntry | null
): Date {
  // Step 1 — daily_date path (primary)
  const rawDailyDate = currentEntry?.verse.daily_date;
  const datePart = rawDailyDate?.slice(0, 10);
  const isValidDateStr =
    typeof datePart === "string" && /^\d{4}-\d{2}-\d{2}$/.test(datePart);
  const parsedHistoryDate = isValidDateStr
    ? new Date(datePart + "T12:00:00")
    : null;
  const isValidHistoryDate =
    parsedHistoryDate !== null && !isNaN(parsedHistoryDate.getTime());

  // Step 2 — viewed_at fallback (pre-migration rows)
  let viewedAtFallback: Date | null = null;
  if (safeIndex > 0 && !isValidHistoryDate && currentEntry?.viewed_at) {
    const effectiveMs =
      new Date(currentEntry.viewed_at).getTime() - 10 * 60 * 60 * 1000;
    const d = new Date(effectiveMs);
    const ymd =
      `${d.getUTCFullYear()}-` +
      `${String(d.getUTCMonth() + 1).padStart(2, "0")}-` +
      `${String(d.getUTCDate()).padStart(2, "0")}`;
    const candidate = new Date(ymd + "T12:00:00");
    if (!isNaN(candidate.getTime())) viewedAtFallback = candidate;
  }

  // Step 3 — today's date (historyIndex === 0)
  return safeIndex > 0 && isValidHistoryDate
    ? parsedHistoryDate!
    : viewedAtFallback !== null
    ? viewedAtFallback
    : new Date();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("resolveDisplayDate — daily_date present (primary path)", () => {
  it("uses daily_date when it is a plain YYYY-MM-DD string", () => {
    const entry: MockEntry = {
      verse: { daily_date: "2026-02-14" },
      viewed_at: "2026-02-14T20:00:00Z",
    };
    const date = resolveDisplayDate(1, entry);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(1); // February (0-indexed)
    expect(date.getDate()).toBe(14);
  });

  it("uses daily_date when PostgreSQL returns a full ISO timestamp", () => {
    // PostgreSQL date columns arrive as "2026-02-14T00:00:00Z" through the driver.
    const entry: MockEntry = {
      verse: { daily_date: "2026-02-14T00:00:00Z" },
      viewed_at: "2026-02-14T20:00:00Z",
    };
    const date = resolveDisplayDate(1, entry);
    // slice(0,10) extracts "2026-02-14" before constructing Date
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(14);
  });

  it("does NOT fall back to viewed_at when daily_date is valid", () => {
    const entry: MockEntry = {
      verse: { daily_date: "2025-12-25" },
      // viewed_at is a totally different day — must be ignored
      viewed_at: "2025-11-01T05:00:00Z",
    };
    const date = resolveDisplayDate(1, entry);
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(11); // December
    expect(date.getDate()).toBe(25);
  });
});

describe("resolveDisplayDate — daily_date NULL, viewed_at fallback", () => {
  it("derives the correct date when viewed_at is well after midnight UTC", () => {
    // viewed_at = 2026-02-16T15:00:00Z  →  UTC-10 effective = 2026-02-16T05:00:00 UTC
    // The date portion is still Feb 16.
    const entry: MockEntry = {
      verse: { daily_date: null },
      viewed_at: "2026-02-16T15:00:00Z",
    };
    const date = resolveDisplayDate(1, entry);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(1); // February
    expect(date.getDate()).toBe(16);
  });

  it("rolls back one day when viewed_at is before 10:00 UTC (UTC-10 crosses midnight)", () => {
    // viewed_at = 2026-02-16T05:00:00Z  →  UTC-10 effective = 2026-02-15T19:00:00 UTC
    // Effective date is Feb 15.
    const entry: MockEntry = {
      verse: { daily_date: null },
      viewed_at: "2026-02-16T05:00:00Z",
    };
    const date = resolveDisplayDate(1, entry);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(15);
  });

  it("handles month-boundary rollback correctly (March 1 → February 28 in non-leap year)", () => {
    // viewed_at = 2025-03-01T08:00:00Z  →  UTC-10 = 2025-02-28T22:00:00 UTC → Feb 28
    const entry: MockEntry = {
      verse: { daily_date: null },
      viewed_at: "2025-03-01T08:00:00Z",
    };
    const date = resolveDisplayDate(1, entry);
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(1); // February
    expect(date.getDate()).toBe(28);
  });

  it("handles year-boundary rollback correctly (Jan 1 → Dec 31 of previous year)", () => {
    // viewed_at = 2026-01-01T05:00:00Z  →  UTC-10 = 2025-12-31T19:00:00 UTC → Dec 31 2025
    const entry: MockEntry = {
      verse: { daily_date: null },
      viewed_at: "2026-01-01T05:00:00Z",
    };
    const date = resolveDisplayDate(1, entry);
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(11); // December
    expect(date.getDate()).toBe(31);
  });

  it("uses fallback even when daily_date is an empty string", () => {
    const entry: MockEntry = {
      verse: { daily_date: "" },
      viewed_at: "2026-02-16T15:00:00Z",
    };
    const date = resolveDisplayDate(1, entry);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(16);
  });

  it("uses fallback even when daily_date is undefined", () => {
    const entry: MockEntry = {
      verse: {},
      viewed_at: "2026-02-20T12:00:00Z",
    };
    const date = resolveDisplayDate(1, entry);
    expect(date.getMonth()).toBe(1); // February
    expect(date.getDate()).toBe(20);
  });
});

describe("resolveDisplayDate — historyIndex === 0 (today's verse)", () => {
  it("returns a date close to now when safeIndex is 0", () => {
    const before = Date.now();
    const date = resolveDisplayDate(0, null);
    const after = Date.now();
    expect(date.getTime()).toBeGreaterThanOrEqual(before);
    expect(date.getTime()).toBeLessThanOrEqual(after);
  });

  it("ignores entry fields entirely when safeIndex is 0", () => {
    // Even if we pass an entry with a historical date, safeIndex=0 means today
    const entry: MockEntry = {
      verse: { daily_date: "2020-01-01" },
      viewed_at: "2020-01-01T12:00:00Z",
    };
    const date = resolveDisplayDate(0, entry);
    const now = new Date();
    // The year should be >= 2026 (today), not 2020
    expect(date.getFullYear()).toBeGreaterThanOrEqual(now.getFullYear());
  });
});

describe("resolveDisplayDate — no regression: T12:00:00 appended to bare date", () => {
  it("does not produce Invalid Date from a YYYY-MM-DD daily_date", () => {
    const entry: MockEntry = {
      verse: { daily_date: "2026-03-07" },
      viewed_at: "2026-03-07T15:00:00Z",
    };
    const date = resolveDisplayDate(1, entry);
    expect(isNaN(date.getTime())).toBe(false);
  });

  it("does not produce Invalid Date from a viewed_at fallback", () => {
    const entry: MockEntry = {
      verse: { daily_date: null },
      viewed_at: "2026-03-07T15:00:00Z",
    };
    const date = resolveDisplayDate(1, entry);
    expect(isNaN(date.getTime())).toBe(false);
  });
});
