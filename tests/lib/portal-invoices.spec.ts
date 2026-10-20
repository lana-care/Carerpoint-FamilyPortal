import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { KNOWN_STATUSES, formatMoney, invoiceTone, safeStatus } from '~/utils/portalInvoices'
import { PORTAL_NAV } from '~/components/layout/portalNav'
import { isPublicPortalPath } from '~/utils/portalRoutes'

const LOCALES = resolve(import.meta.dirname, '../../i18n/locales')
const page = readFileSync(resolve(import.meta.dirname, '../../app/pages/invoices.vue'), 'utf8')
const lookup = (m: Record<string, unknown>, key: string) =>
  key.split('.').reduce<unknown>((n, p) => (n && typeof n === 'object' ? (n as Record<string, unknown>)[p] : undefined), m)

describe('portal invoices helpers', () => {
  it('formats pence as GBP', () => {
    expect(formatMoney(123456)).toBe('£1,234.56')
    expect(formatMoney(5)).toBe('£0.05')
    expect(formatMoney(null)).toBe('£0.00')
  })

  it('tones: paid green, part paid amber, overdue red, the rest neutral', () => {
    expect(invoiceTone('paid')).toBe('success')
    expect(invoiceTone('part_paid')).toBe('warning')
    expect(invoiceTone('overdue')).toBe('danger')
    expect(invoiceTone('issued')).toBe('neutral')
  })

  it('never shows a raw enum: unknown statuses fall back to issued', () => {
    expect(safeStatus('paid')).toBe('paid')
    expect(safeStatus('draft')).toBe('issued')
    expect(safeStatus('void')).toBe('issued')
  })
})

describe('portal invoices page', () => {
  it('is in the navigation and behind the token', () => {
    expect(PORTAL_NAV.some((i) => i.to === '/invoices')).toBe(true)
    expect(isPublicPortalPath('/invoices')).toBe(false)
  })

  it('has every i18n key it uses in all six locales', () => {
    const keys = new Set<string>(['portal.invoicesTitle'])
    for (const m of page.matchAll(/(?:\$t|[^a-zA-Z]t)\('(invoices\.[A-Za-z0-9_.]+)'/g)) keys.add(m[1]!)
    for (const s of KNOWN_STATUSES) keys.add(`invoices.status.${s}`)
    expect(keys.size).toBeGreaterThan(15)
    const files = readdirSync(LOCALES)
    expect(files).toHaveLength(6)
    for (const file of files) {
      const messages = JSON.parse(readFileSync(resolve(LOCALES, file), 'utf8'))
      for (const key of keys) expect(lookup(messages, key), `${file} is missing ${key}`).toBeTypeOf('string')
    }
  })
})
