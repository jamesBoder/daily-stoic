// UTC-10 (Hawaii Standard Time — no DST)
const APP_TZ = 'Pacific/Honolulu'

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  // Normalize PostgreSQL "2026-04-22 00:00:00.123456+00" → "2026-04-22T00:00:00.123456Z"
  const normalized = value
    .replace(' ', 'T')
    .replace(/(\.\d+)?\+00(:?00)?$/, '$1Z')
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d
}

export function formatDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
): string {
  const d = parseDate(value)
  if (!d) return ''
  return d.toLocaleDateString('en-US', { timeZone: APP_TZ, ...options })
}

export function formatDateShort(value: string | null | undefined): string {
  return formatDate(value, { month: 'short', day: 'numeric' })
}

export function todayDisplay(
  options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' }
): string {
  return new Date().toLocaleDateString('en-US', { timeZone: APP_TZ, ...options })
}
