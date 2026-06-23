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

export function usePortalAuth() {
  const token = useCookie<string | null>(FAMILY_PORTAL_TOKEN_COOKIE, {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  const portalData = useState<FamilyPortalData | null>('familyPortalData', () => null)

  const config = useRuntimeConfig()

  async function fetchPortal(t?: string | null): Promise<FamilyPortalData | null> {
    const tok = t ?? token.value
    if (!tok) {
      portalData.value = null
      return null
    }
    try {
      const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
      const res = await $fetch<FamilyPortalData>(
        `${base}/api/v1/auth/family-portal`,
        { headers: { Authorization: `Bearer ${tok}` } },
      )
      if (res?.valid) {
        portalData.value = res
        return res
      }
      portalData.value = { valid: false, error: res?.error || 'Invalid or expired access link.' }
      return portalData.value
    } catch (e: unknown) {
      const err = e as { data?: { message?: unknown }; message?: string }
      portalData.value = {
        valid: false,
        error: normalizePortalError(err?.data?.message) || err?.message || 'Failed to load portal.',
      }
      return portalData.value
    }
  }

  function setToken(t: string | null) {
    token.value = t
  }

  function clearSession() {
    token.value = null
    portalData.value = null
  }

  return {
    token,
    portalData,
    fetchPortal,
    setToken,
    clearSession,
  }
}
