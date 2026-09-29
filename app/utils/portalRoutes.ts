/**
 * Which paths the portal's auth middleware lets through without a token.
 *
 * Kept pure (no Nuxt imports) so the rule is unit-testable.
 */

/** Pages that must work without a session: the landing page (invite token) and login. */
const PUBLIC_PAGES = ['/', '/login']

/**
 * A path whose last segment has a file extension (`/robots.txt`, `/favicon.ico`,
 * `/fonts/Oddval-SemiBold.ttf`) is a static file, not a portal page. The
 * middleware used to send those to /login, so crawlers asking for `robots.txt`
 * were redirected to an HTML page and the file could not do its job. Portal
 * pages have no dots in their paths, so nothing private is exposed by this:
 * a static file that does not exist simply 404s.
 */
export function isStaticAssetPath(path: string): boolean {
  const last = path.split('?')[0]!.split('#')[0]!.split('/').pop() ?? ''
  return /^[^.]+(?:\.[A-Za-z0-9_-]+)+$/.test(last) && !last.startsWith('.')
}

export function isPublicPortalPath(path: string): boolean {
  return PUBLIC_PAGES.includes(path) || isStaticAssetPath(path)
}
