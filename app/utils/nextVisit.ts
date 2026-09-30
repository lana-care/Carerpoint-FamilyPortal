/**
 * "Next visit" for the portal home card, worked out from the visits the portal
 * bundle already carries (`upcomingVisits`) — no extra request.
 *
 * Pure, so the picking rules are unit-testable without a browser.
 */

export interface NextVisitLike {
  id?: string
  /** `YYYY-MM-DD`, possibly with a time part. */
  date: string
  /** Bare `HH:mm` or a full ISO datetime (the API returns either). */
  start?: string | null
  end?: string | null
  status: string
  carerFirstName?: string | null
}

/**
 * Visits that will not happen (or already did, or are not published) are never
 * "the next visit". `draft` is the agency's unpublished rota: the API can still
 * list it, and showing a relative a visit nobody has confirmed would mislead.
 * `uncompleted` is what the overdue sweep writes for a missed visit (it never
 * writes `missed` itself), possibly before the planned end time has passed.
 */
const NOT_UPCOMING = new Set(['cancelled', 'canceled', 'missed', 'uncompleted', 'draft', 'completed', 'reviewed'])

/** Statuses that mean "the carer is there right now", even past the planned end. */
const HAPPENING_NOW = new Set(['in_progress', 'checked_in'])

const BARE_TIME = /^(\d{1,2}):(\d{2})(?::\d{2})?$/

/** A local Date for `date` + a time that is either bare `HH:mm` or a full ISO datetime. */
function combine(date: string, time: string | null | undefined): Date | null {
  const day = String(date ?? '').split('T')[0]
  const parts = day?.split('-').map(Number) ?? []
  const [y, m, d] = parts
  if (!y || !m || !d) return null
  if (time) {
    const bare = String(time).trim().match(BARE_TIME)
    if (bare) return new Date(y, m - 1, d, Number(bare[1]), Number(bare[2]))
    const iso = new Date(String(time))
    if (!Number.isNaN(iso.getTime())) return iso
  }
  // No usable time: the visit is "sometime that day" — start of day.
  return new Date(y, m - 1, d, 0, 0)
}

export function visitStartsAt(v: NextVisitLike): Date | null {
  return combine(v.date, v.start)
}

export function visitEndsAt(v: NextVisitLike): Date | null {
  const start = visitStartsAt(v)
  if (!start) return null
  if (v.end) {
    const end = combine(v.date, v.end)
    if (end && end.getTime() >= start.getTime()) return end
  }
  // No end time: a day-only visit runs until the end of that day, otherwise it ends when it starts.
  const hasTime = Boolean(v.start)
  if (!hasTime) {
    const eod = new Date(start)
    eod.setHours(23, 59, 59, 999)
    return eod
  }
  return start
}

/** The earliest visit that is still ahead of us (or under way), or null. */
export function pickNextVisit<T extends NextVisitLike>(visits: readonly T[] | null | undefined, now: Date = new Date()): T | null {
  let best: { v: T; at: number } | null = null
  for (const v of visits ?? []) {
    if (!v || NOT_UPCOMING.has(String(v.status).toLowerCase())) continue
    const start = visitStartsAt(v)
    const end = visitEndsAt(v)
    if (!start || !end) continue
    const status = String(v.status).toLowerCase()
    const stillAhead = end.getTime() >= now.getTime() || HAPPENING_NOW.has(status)
    if (!stillAhead) continue
    if (!best || start.getTime() < best.at) best = { v, at: start.getTime() }
  }
  return best?.v ?? null
}

/** Whether a local calendar day is today or tomorrow relative to `now`. */
export function relativeDay(day: Date, now: Date = new Date()): 'today' | 'tomorrow' | null {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = Math.round((startOf(day) - startOf(now)) / 86_400_000)
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  return null
}
