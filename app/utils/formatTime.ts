/**
 * Render a visit time as a short, human "HH:mm" label.
 *
 * The family-portal API returns visit `start` / `end` either as a bare
 * "HH:mm" string or as a full ISO datetime ("2026-06-30T08:00:00+00:00").
 * In both cases we want a compact local time, never the raw ISO blob.
 *
 *   formatTime('2026-06-30T08:00:00+00:00') // → '08:00'
 *   formatTime('09:30')                     // → '09:30'
 *   formatTime(undefined)                   // → ''
 */
export function formatTime(value: string | null | undefined): string {
  if (!value) return ''
  const s = String(value).trim()
  if (!s) return ''
  // Already a bare HH:mm (optionally HH:mm:ss) — return the HH:mm portion.
  const bare = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (bare) return `${bare[1]!.padStart(2, '0')}:${bare[2]}`
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Join a start/end pair into a "08:00 – 09:00" range, gracefully degrading
 * when one side is missing.
 */
export function formatTimeRange(start?: string | null, end?: string | null): string {
  const a = formatTime(start)
  const b = formatTime(end)
  if (a && b) return `${a} – ${b}`
  return a || b || ''
}
