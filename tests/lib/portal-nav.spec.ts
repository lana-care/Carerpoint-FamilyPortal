import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { PORTAL_NAV, isPortalNavActive } from '~/components/layout/portalNav'

const LOCALES = resolve(import.meta.dirname, '../../i18n/locales')
const read = (file: string) => JSON.parse(readFileSync(resolve(LOCALES, file), 'utf8'))

/** `nav.calendar` -> the string, or undefined. */
function lookup(messages: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>(
    (node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined),
    messages,
  )
}

describe('portal navigation', () => {
  it('starts at Home, so a phone always has a way back to the overview', () => {
    // The mobile header this replaced dropped Home: the only route back was
    // tapping the logo, which nothing announced.
    expect(PORTAL_NAV[0]?.to).toBe('/')
    expect(PORTAL_NAV[0]?.exact).toBe(true)
  })

  it('has one entry per destination', () => {
    const paths = PORTAL_NAV.map((item) => item.to)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('translates every label in every locale', () => {
    // A missing key renders as the raw key ("nav.carePlan") in the sidebar,
    // which no test of the component would catch.
    for (const file of readdirSync(LOCALES)) {
      const messages = read(file)
      for (const item of PORTAL_NAV) {
        expect(lookup(messages, item.labelKey), `${file} is missing ${item.labelKey}`)
          .toBeTypeOf('string')
      }
    }
  })
})

describe('isPortalNavActive', () => {
  it('matches Home only on Home', () => {
    const home = PORTAL_NAV[0]!
    expect(isPortalNavActive(home, '/')).toBe(true)
    expect(isPortalNavActive(home, '/calendar')).toBe(false)
  })

  it('keeps a section lit on its own detail routes', () => {
    const calendar = PORTAL_NAV.find((item) => item.to === '/calendar')!
    expect(isPortalNavActive(calendar, '/calendar')).toBe(true)
    expect(isPortalNavActive(calendar, '/calendar/2026-08')).toBe(true)
  })

  it('does not light a section up for a path that merely starts the same', () => {
    const carePlan = PORTAL_NAV.find((item) => item.to === '/care-plan')!
    expect(isPortalNavActive(carePlan, '/care-plan-archive')).toBe(false)
  })
})
