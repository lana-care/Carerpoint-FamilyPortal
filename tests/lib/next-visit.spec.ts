import { describe, it, expect } from 'vitest'
import { pickNextVisit, relativeDay, visitEndsAt, visitStartsAt, type NextVisitLike } from '~/utils/nextVisit'
import { isForeignInboundMessage } from '~/utils/portalMessages'

// Local time on purpose: the portal shows visits in the reader's own clock.
const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min)
const NOW = at(2026, 9, 29, 12, 0)

const v = (over: Partial<NextVisitLike>): NextVisitLike => ({
  id: 'v', date: '2026-09-29', start: '14:00', end: '15:00', status: 'scheduled', ...over,
})

describe('pickNextVisit', () => {
  it('picks the earliest visit still ahead', () => {
    const next = pickNextVisit(
      [v({ id: 'later', date: '2026-10-02' }), v({ id: 'soon', date: '2026-09-30', start: '08:00', end: '09:00' })],
      NOW,
    )
    expect(next?.id).toBe('soon')
  })

  it('skips visits that will not happen or are not published', () => {
    const next = pickNextVisit(
      [
        v({ id: 'c', status: 'cancelled', start: '13:00', end: '14:00' }),
        v({ id: 'm', status: 'missed', start: '13:00', end: '14:00' }),
        // What the overdue sweep actually writes for a missed visit.
        v({ id: 'u', status: 'uncompleted', start: '13:00', end: '14:00' }),
        v({ id: 'd', status: 'draft', start: '13:00', end: '14:00' }),
        v({ id: 'ok', date: '2026-10-01' }),
      ],
      NOW,
    )
    expect(next?.id).toBe('ok')
  })

  it("skips today's visits that already ended", () => {
    const next = pickNextVisit([v({ id: 'done', start: '08:00', end: '09:00' }), v({ id: 'tomorrow', date: '2026-09-30' })], NOW)
    expect(next?.id).toBe('tomorrow')
  })

  it('keeps a visit that is under way even if it overran its planned end', () => {
    const next = pickNextVisit([v({ id: 'now', start: '10:00', end: '11:00', status: 'in_progress' })], NOW)
    expect(next?.id).toBe('now')
  })

  it('reads full ISO datetimes as well as bare HH:mm', () => {
    const iso = at(2026, 9, 29, 16, 0).toISOString()
    const isoEnd = at(2026, 9, 29, 17, 0).toISOString()
    expect(pickNextVisit([v({ id: 'iso', start: iso, end: isoEnd })], NOW)?.id).toBe('iso')
  })

  it('returns null when nothing is ahead, and for empty or missing input', () => {
    expect(pickNextVisit([v({ status: 'completed' })], NOW)).toBeNull()
    expect(pickNextVisit([], NOW)).toBeNull()
    expect(pickNextVisit(undefined, NOW)).toBeNull()
  })

  it('treats a day-only visit as lasting until the end of that day', () => {
    const next = pickNextVisit([v({ id: 'allday', start: null, end: null })], NOW)
    expect(next?.id).toBe('allday')
  })

  it('carries the carer first name through untouched', () => {
    expect(pickNextVisit([v({ carerFirstName: 'Amara' })], NOW)?.carerFirstName).toBe('Amara')
  })
})

describe('visitStartsAt / visitEndsAt', () => {
  it('combines the visit date with a bare time', () => {
    expect(visitStartsAt(v({ start: '09:30' }))?.getTime()).toBe(at(2026, 9, 29, 9, 30).getTime())
    expect(visitEndsAt(v({ start: '09:30', end: '10:15' }))?.getTime()).toBe(at(2026, 9, 29, 10, 15).getTime())
  })

  it('returns null for an unreadable date', () => {
    expect(visitStartsAt(v({ date: 'nope' }))).toBeNull()
  })
})

describe('relativeDay', () => {
  it('names today and tomorrow, nothing else', () => {
    expect(relativeDay(at(2026, 9, 29, 23, 59), NOW)).toBe('today')
    expect(relativeDay(at(2026, 9, 30, 0, 1), NOW)).toBe('tomorrow')
    expect(relativeDay(at(2026, 10, 1), NOW)).toBeNull()
    expect(relativeDay(at(2026, 9, 28), NOW)).toBeNull()
  })
})

describe('isForeignInboundMessage (client safety net)', () => {
  it("flags another relative's post, never my own or an agency message", () => {
    expect(isForeignInboundMessage({ direction: 'inbound', family_portal_member_id: 'm2' }, 'm1')).toBe(true)
    expect(isForeignInboundMessage({ direction: 'inbound', family_portal_member_id: 'm1' }, 'm1')).toBe(false)
    expect(isForeignInboundMessage({ direction: 'outbound' }, 'm1')).toBe(false)
  })

  it('does nothing when it does not know who I am', () => {
    expect(isForeignInboundMessage({ direction: 'inbound', family_portal_member_id: 'm2' }, undefined)).toBe(false)
  })

  it('understands legacy links', () => {
    expect(isForeignInboundMessage({ direction: 'inbound', family_link_id: 'l2' }, 'l1')).toBe(true)
  })
})
