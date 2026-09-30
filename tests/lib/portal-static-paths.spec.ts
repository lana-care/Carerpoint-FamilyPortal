import { describe, it, expect } from 'vitest'
import { isPublicPortalPath, isStaticAssetPath } from '~/utils/portalRoutes'

describe('isStaticAssetPath', () => {
  it('recognises the static files the portal serves', () => {
    for (const p of ['/robots.txt', '/favicon.ico', '/logo.svg', '/icon.png', '/fonts/Oddval-SemiBold.ttf']) {
      expect(isStaticAssetPath(p)).toBe(true)
    }
  })

  it('does not treat portal pages as static files', () => {
    for (const p of ['/', '/login', '/messages', '/care-plan', '/visits/3f9c1e2a-7b6d-4f0a-9c1d-0a1b2c3d4e5f', '/calendar/']) {
      expect(isStaticAssetPath(p)).toBe(false)
    }
  })

  it('ignores a query string or fragment when looking at the extension', () => {
    expect(isStaticAssetPath('/robots.txt?x=1')).toBe(true)
    expect(isStaticAssetPath('/messages?file=a.txt')).toBe(false)
  })
})

describe('isPublicPortalPath', () => {
  it('lets the landing page, login and static files through without a token', () => {
    expect(isPublicPortalPath('/')).toBe(true)
    expect(isPublicPortalPath('/login')).toBe(true)
    expect(isPublicPortalPath('/robots.txt')).toBe(true)
  })

  it('keeps every other page behind the token', () => {
    for (const p of ['/messages', '/care-plan', '/medications', '/calendar', '/documents', '/feedback', '/schedule']) {
      expect(isPublicPortalPath(p)).toBe(false)
    }
  })
})
