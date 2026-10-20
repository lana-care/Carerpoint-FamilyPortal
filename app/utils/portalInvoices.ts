/**
 * Pure helpers for the family-facing invoice list. Money arrives as integer
 * pence; the portal never does arithmetic on it beyond display.
 */

/** £1,234.50 — always GBP. */
export function formatMoney(pence: number | null | undefined): string {
  const n = Math.round(Number(pence ?? 0))
  const abs = Math.abs(n)
  const pounds = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${n < 0 ? '-' : ''}£${pounds}.${String(abs % 100).padStart(2, '0')}`
}

export type InvoiceTone = 'success' | 'warning' | 'danger' | 'neutral'

/** Colour family of a status pill. `display_status` already folds in "overdue". */
export function invoiceTone(status: string): InvoiceTone {
  switch (status) {
    case 'paid': return 'success'
    case 'part_paid': return 'warning'
    case 'overdue': return 'danger'
    default: return 'neutral'
  }
}

/** Status keys the page can show; anything unexpected falls back to the neutral "issued". */
export const KNOWN_STATUSES = ['issued', 'sent', 'part_paid', 'paid', 'overdue'] as const
export function safeStatus(status: string): (typeof KNOWN_STATUSES)[number] {
  return (KNOWN_STATUSES as readonly string[]).includes(status) ? (status as (typeof KNOWN_STATUSES)[number]) : 'issued'
}
