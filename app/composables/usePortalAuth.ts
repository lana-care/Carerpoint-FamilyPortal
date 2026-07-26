export const FAMILY_PORTAL_TOKEN_COOKIE = 'carerpoint_family_portal_token'

// NestJS validation errors return `message` as a string[]; flatten it so toasts
// don't render "[object Object]".
export function normalizePortalError(m: unknown): string | undefined {
  if (Array.isArray(m)) return m.join(', ')
  return typeof m === 'string' ? m : undefined
}

export interface FamilyPortalVisit {
  id?: string
  date: string
  start?: string
  end?: string
  status: string
  notes?: string
  mood?: string
  foodIntake?: string
}

export interface FamilyPortalData {
  valid: boolean
  error?: string
  familyMember?: { name?: string; relationship?: string }
  client?: Record<string, unknown>
  carePlan?: Record<string, unknown> | null
  recentVisits?: FamilyPortalVisit[]
  upcomingVisits?: FamilyPortalVisit[]
  messages?: Array<{
    id?: string
    content?: string
    direction?: string
    created_at?: string
    createdAt?: string
    sender_name?: string | null
    channel_type?: 'group' | 'private'
  }>
}

/**
 * Thin facade: cookie token + session/resources Pinia stores.
 * Keeps the previous public API so pages/middleware stay unchanged.
 */
export function usePortalAuth() {
  const token = useCookie<string | null>(FAMILY_PORTAL_TOKEN_COOKIE, {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  const session = usePortalSessionStore()
  const resources = usePortalResourcesStore()

  const portalData = computed(() => session.portalData)

  async function fetchPortal(t?: string | null): Promise<FamilyPortalData | null> {
    if (t) {
      token.value = t
      resources.invalidateAll()
      session.invalidate()
      return session.fetchBootstrap({ force: true, token: t })
    }
    if (!token.value) {
      session.clear()
      return null
    }
    return session.fetchBootstrap({ force: false })
  }

  function setToken(t: string | null) {
    if (t !== token.value) {
      resources.invalidateAll()
      session.invalidate()
    }
    token.value = t
  }

  function clearSession() {
    token.value = null
    session.clear()
    resources.invalidateAll()
  }

  return {
    token,
    portalData,
    fetchPortal,
    setToken,
    clearSession,
  }
}
