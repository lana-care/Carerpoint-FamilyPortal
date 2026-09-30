import { isPublicPortalPath } from '~/utils/portalRoutes'

export default defineNuxtRouteMiddleware((to) => {
  // Public routes only: the landing page (which handles the invite token), the
  // login page, and static files (robots.txt, favicon, fonts — they are not
  // portal pages, and redirecting them to /login broke robots.txt). Everything
  // else requires a portal token — guard by a public allowlist so new pages are
  // protected by default (was: a stale protected-paths allowlist that left
  // /messages, /care-plan, /medications and /calendar completely unguarded).
  if (isPublicPortalPath(to.path)) {
    return
  }

  const token = useCookie<string | null>('carerpoint_family_portal_token')
  if (!token.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
