import { defineStore } from 'pinia'
import type { FamilyPortalData } from '~/composables/usePortalAuth'
import { normalizePortalError } from '~/composables/usePortalAuth'
import { FAMILY_PORTAL_TOKEN_COOKIE } from '~/composables/usePortalAuth'
import {
  makeEntry,
  showLoading,
  swrFetch,
  PORTAL_TTL,
  type CacheEntry,
} from '~/utils/swrCache'

/**
 * Bootstrap payload for the Family Portal (`GET /auth/family-portal`).
 * Token stays in the cookie via `usePortalAuth` — not duplicated here.
 */
export const usePortalSessionStore = defineStore('portalSession', {
  state: () => ({
    bootstrap: makeEntry<FamilyPortalData | null>(null) as CacheEntry<FamilyPortalData | null>,
  }),

  getters: {
    isBootstrapLoading: (state) => showLoading(state.bootstrap),
    portalData: (state) => state.bootstrap.data,
    isValid: (state) => Boolean(state.bootstrap.data?.valid),
    client: (state) => state.bootstrap.data?.client ?? null,
    familyMember: (state) => state.bootstrap.data?.familyMember ?? null,
    carePlan: (state) => state.bootstrap.data?.carePlan ?? null,
    recentVisits: (state) => state.bootstrap.data?.recentVisits ?? [],
    upcomingVisits: (state) => state.bootstrap.data?.upcomingVisits ?? [],
    bootstrapError: (state) => state.bootstrap.error || state.bootstrap.data?.error || null,
  },

  actions: {
    async fetchBootstrap(opts: { force?: boolean; token?: string | null } = {}) {
      const cookie = useCookie<string | null>(FAMILY_PORTAL_TOKEN_COOKIE)
      const tok = opts.token ?? cookie.value
      if (!tok) {
        this.bootstrap = makeEntry(null)
        return null
      }

      const config = useRuntimeConfig()
      const base = String(config.public.apiUrl || '').replace(/\/+$/, '')

      try {
        return await swrFetch(
          this.bootstrap,
          async () => {
            const res = await $fetch<FamilyPortalData>(
              `${base}/api/v1/auth/family-portal`,
              { headers: { Authorization: `Bearer ${tok}` } },
            )
            if (res?.valid) return res
            return {
              valid: false,
              error: res?.error || 'Invalid or expired access link.',
            } satisfies FamilyPortalData
          },
          { force: opts.force, ttlMs: PORTAL_TTL.bootstrap },
        )
      } catch (e: unknown) {
        const err = e as { data?: { message?: unknown }; message?: string }
        const failed: FamilyPortalData = {
          valid: false,
          error: normalizePortalError(err?.data?.message) || err?.message || 'Failed to load portal.',
        }
        this.bootstrap.data = failed
        this.bootstrap.initialized = true
        this.bootstrap.fetchedAt = Date.now()
        return failed
      }
    },

    invalidate() {
      this.bootstrap.fetchedAt = null
      this.bootstrap.initialized = false
    },

    clear() {
      this.bootstrap = makeEntry(null)
    },
  },
})
