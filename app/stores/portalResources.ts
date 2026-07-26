import { defineStore } from 'pinia'
import type { FamilyPortalVisit } from '~/composables/usePortalAuth'
import { FAMILY_PORTAL_TOKEN_COOKIE } from '~/composables/usePortalAuth'
import {
  dropKeys,
  makeEntry,
  showLoading,
  swrFetch,
  PORTAL_TTL,
  type CacheEntry,
} from '~/utils/swrCache'

export type PortalMessageChannel = 'group' | 'private'

export type PortalMsgRow = {
  id?: string
  content?: string
  direction?: string
  created_at?: string
  createdAt?: string
  channel_type?: string
  sender_name?: string | null
}

export type PortalMedRow = {
  id?: string
  name?: string
  strength?: string
  instructions?: string
}

export type PortalDocRow = {
  id: string
  title?: string
  file_url?: string
  fileUrl?: string
  document_type?: string
  documentType?: string
  created_at?: string
  createdAt?: string
}

export type PortalVisitNote = {
  id: string
  note: string
  created_at: string
}

export type PortalVisitPhoto = {
  id?: string
  url?: string
  thumbnailUrl?: string
  caption?: string
  [key: string]: unknown
}

function authHeaders(): HeadersInit {
  const cookie = useCookie<string | null>(FAMILY_PORTAL_TOKEN_COOKIE)
  return { Authorization: `Bearer ${cookie.value || ''}` }
}

function apiBase(): string {
  const config = useRuntimeConfig()
  return String(config.public.apiUrl || '').replace(/\/+$/, '')
}

function requireToken(): string {
  const cookie = useCookie<string | null>(FAMILY_PORTAL_TOKEN_COOKIE)
  if (!cookie.value) throw new Error('No access token')
  return cookie.value
}

function scheduleKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

/**
 * Keyed Family Portal resource caches (schedule, messages, care plan, …).
 */
export const usePortalResourcesStore = defineStore('portalResources', {
  state: () => ({
    scheduleMonths: {} as Record<string, CacheEntry<FamilyPortalVisit[]>>,
    messages: {} as Record<PortalMessageChannel, CacheEntry<PortalMsgRow[]>>,
    carePlan: makeEntry<Record<string, unknown> | null>(null) as CacheEntry<Record<string, unknown> | null>,
    medications: makeEntry<PortalMedRow[]>([]) as CacheEntry<PortalMedRow[]>,
    documents: makeEntry<PortalDocRow[]>([]) as CacheEntry<PortalDocRow[]>,
    visits: {} as Record<string, CacheEntry<(FamilyPortalVisit & { id?: string }) | null>>,
    visitNotes: {} as Record<string, CacheEntry<PortalVisitNote[]>>,
    visitPhotos: {} as Record<string, CacheEntry<PortalVisitPhoto[]>>,
  }),

  getters: {
    isScheduleLoading: (state) => (key: string) => {
      const e = state.scheduleMonths[key]
      return e ? showLoading(e) : false
    },
    getScheduleMonth: (state) => (key: string) => state.scheduleMonths[key]?.data ?? [],

    isMessagesLoading: (state) => (channel: PortalMessageChannel) => {
      const e = state.messages[channel]
      return e ? showLoading(e) : false
    },
    getMessages: (state) => (channel: PortalMessageChannel) => state.messages[channel]?.data ?? [],

    isCarePlanLoading: (state) => showLoading(state.carePlan),
    getCarePlan: (state) => state.carePlan.data,
    carePlanError: (state) => state.carePlan.error,

    isMedicationsLoading: (state) => showLoading(state.medications),
    getMedications: (state) => state.medications.data,
    medicationsError: (state) => state.medications.error,

    isDocumentsLoading: (state) => showLoading(state.documents),
    getDocuments: (state) => state.documents.data,
    documentsError: (state) => state.documents.error,

    isVisitLoading: (state) => (id: string) => {
      const e = state.visits[id]
      return e ? showLoading(e) : false
    },
    getVisit: (state) => (id: string) => state.visits[id]?.data ?? null,

    getVisitNotes: (state) => (id: string) => state.visitNotes[id]?.data ?? [],
    getVisitPhotos: (state) => (id: string) => state.visitPhotos[id]?.data ?? [],
  },

  actions: {
    ensureScheduleEntry(key: string) {
      if (!this.scheduleMonths[key]) {
        this.scheduleMonths[key] = makeEntry<FamilyPortalVisit[]>([])
      }
      return this.scheduleMonths[key]
    },

    ensureMessagesEntry(channel: PortalMessageChannel) {
      if (!this.messages[channel]) {
        this.messages[channel] = makeEntry<PortalMsgRow[]>([])
      }
      return this.messages[channel]
    },

    ensureVisitEntry(id: string) {
      if (!this.visits[id]) {
        this.visits[id] = makeEntry<(FamilyPortalVisit & { id?: string }) | null>(null)
      }
      return this.visits[id]
    },

    ensureVisitNotesEntry(id: string) {
      if (!this.visitNotes[id]) {
        this.visitNotes[id] = makeEntry<PortalVisitNote[]>([])
      }
      return this.visitNotes[id]
    },

    ensureVisitPhotosEntry(id: string) {
      if (!this.visitPhotos[id]) {
        this.visitPhotos[id] = makeEntry<PortalVisitPhoto[]>([])
      }
      return this.visitPhotos[id]
    },

    async fetchScheduleMonth(year: number, monthIndex: number, opts: { force?: boolean } = {}) {
      requireToken()
      const key = scheduleKey(year, monthIndex)
      const entry = this.ensureScheduleEntry(key)
      const base = apiBase()
      const apiMonth = monthIndex + 1
      return swrFetch(
        entry,
        async () => {
          const res = await $fetch<{ valid?: boolean; upcomingVisits?: FamilyPortalVisit[] }>(
            `${base}/api/v1/family-portal/schedule?year=${year}&month=${apiMonth}`,
            { headers: authHeaders() },
          )
          if (res?.valid && Array.isArray(res.upcomingVisits)) return res.upcomingVisits
          return []
        },
        { force: opts.force, ttlMs: PORTAL_TTL.schedule },
      )
    },

    async fetchMessages(channel: PortalMessageChannel, opts: { force?: boolean } = {}) {
      requireToken()
      const entry = this.ensureMessagesEntry(channel)
      const base = apiBase()
      return swrFetch(
        entry,
        async () => {
          const res = await $fetch<{ valid?: boolean; messages?: PortalMsgRow[] }>(
            `${base}/api/v1/family-portal/messages?channel=${channel}`,
            { headers: authHeaders() },
          )
          if (res?.valid && Array.isArray(res.messages)) return res.messages
          throw new Error('Could not load messages.')
        },
        { force: opts.force, ttlMs: PORTAL_TTL.messages },
      )
    },

    mergeMessage(channel: PortalMessageChannel, row: PortalMsgRow) {
      if (!row?.id && !row?.content) return
      const rowChannel = row.channel_type === 'private' ? 'private' : 'group'
      if (rowChannel !== channel) return
      const entry = this.ensureMessagesEntry(channel)
      const list = entry.data || []
      if (row.id && list.some(m => m.id === row.id)) return
      entry.data = [...list, row]
      entry.initialized = true
      entry.fetchedAt = Date.now()
    },

    async postMessage(channel: PortalMessageChannel, message: string) {
      requireToken()
      const base = apiBase()
      const res = await $fetch<{ success?: boolean; error?: string }>(
        `${base}/api/v1/family-portal/messages`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: { message, channel_type: channel },
        },
      )
      if (!res?.success) {
        throw new Error(res?.error || 'Could not send message.')
      }
      // Refresh this channel only — do not refetch bootstrap.
      await this.fetchMessages(channel, { force: true })
      return res
    },

    /** Seed care-plan cache from bootstrap when already present (cold start). */
    seedCarePlanFromBootstrap(plan: Record<string, unknown> | null | undefined) {
      if (this.carePlan.initialized) return
      if (plan === undefined) return
      this.carePlan.data = plan
      this.carePlan.initialized = true
      this.carePlan.fetchedAt = Date.now()
    },

    async fetchCarePlan(opts: { force?: boolean } = {}) {
      requireToken()
      const base = apiBase()
      return swrFetch(
        this.carePlan,
        async () => {
          const res = await $fetch<{
            valid?: boolean
            carePlan?: Record<string, unknown> | null
            error?: string
          }>(`${base}/api/v1/family-portal/care-plan`, { headers: authHeaders() })
          if (res?.valid) return res.carePlan ?? null
          throw new Error(res?.error || 'Could not load care plan.')
        },
        { force: opts.force, ttlMs: PORTAL_TTL.carePlan },
      )
    },

    async fetchMedications(opts: { force?: boolean } = {}) {
      requireToken()
      const base = apiBase()
      return swrFetch(
        this.medications,
        async () => {
          const res = await $fetch<{ valid?: boolean; data?: PortalMedRow[]; error?: string }>(
            `${base}/api/v1/family-portal/medications`,
            { headers: authHeaders() },
          )
          if (res && res.valid === false) {
            throw new Error(res.error || 'Could not load medications.')
          }
          return Array.isArray(res?.data) ? res.data : []
        },
        { force: opts.force, ttlMs: PORTAL_TTL.medications },
      )
    },

    async fetchDocuments(opts: { force?: boolean } = {}) {
      requireToken()
      const base = apiBase()
      return swrFetch(
        this.documents,
        async () => {
          const res = await $fetch<{ valid?: boolean; data?: PortalDocRow[]; error?: string }>(
            `${base}/api/v1/family-portal/documents`,
            { headers: authHeaders() },
          )
          if (!res?.valid) {
            throw new Error(res?.error || 'Could not load documents.')
          }
          return Array.isArray(res.data) ? res.data : []
        },
        { force: opts.force, ttlMs: PORTAL_TTL.documents },
      )
    },

    async fetchVisit(visitId: string, opts: { force?: boolean; seed?: FamilyPortalVisit | null } = {}) {
      requireToken()
      const entry = this.ensureVisitEntry(visitId)
      if (opts.seed && !entry.initialized) {
        entry.data = { ...opts.seed, id: visitId }
      }
      const base = apiBase()
      return swrFetch(
        entry,
        async () => {
          const res = await $fetch<{ valid?: boolean; visit?: FamilyPortalVisit & { id: string } }>(
            `${base}/api/v1/family-portal/visits/${visitId}`,
            { headers: authHeaders() },
          )
          if (res?.valid && res.visit) return { ...res.visit, id: visitId }
          return entry.data
        },
        { force: opts.force, ttlMs: PORTAL_TTL.visit },
      )
    },

    async fetchVisitNotes(visitId: string, opts: { force?: boolean } = {}) {
      requireToken()
      const entry = this.ensureVisitNotesEntry(visitId)
      const base = apiBase()
      return swrFetch(
        entry,
        async () => {
          const res = await $fetch<{ valid?: boolean; data?: PortalVisitNote[] }>(
            `${base}/api/v1/family-portal/visits/${visitId}/notes`,
            { headers: authHeaders() },
          )
          return res?.valid && Array.isArray(res.data) ? res.data : []
        },
        { force: opts.force, ttlMs: PORTAL_TTL.visitNotes },
      )
    },

    async fetchVisitPhotos(visitId: string, opts: { force?: boolean } = {}) {
      requireToken()
      const entry = this.ensureVisitPhotosEntry(visitId)
      const base = apiBase()
      return swrFetch(
        entry,
        async () => {
          const res = await $fetch<{ valid?: boolean; data?: PortalVisitPhoto[] }>(
            `${base}/api/v1/family-portal/visits/${visitId}/photos`,
            { headers: authHeaders() },
          )
          return res?.valid && Array.isArray(res.data) ? res.data : []
        },
        { force: opts.force, ttlMs: PORTAL_TTL.visitPhotos },
      )
    },

    async postVisitNote(visitId: string, note: string) {
      requireToken()
      const base = apiBase()
      const res = await $fetch<{ success?: boolean; error?: string }>(
        `${base}/api/v1/family-portal/visits/${visitId}/notes`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: { note },
        },
      )
      if (!res?.success) {
        throw new Error(res?.error || 'Could not save your note.')
      }
      this.invalidateVisitNotes(visitId)
      await this.fetchVisitNotes(visitId, { force: true })
      return res
    },

    invalidateVisitNotes(visitId: string) {
      const entry = this.visitNotes[visitId]
      if (entry) {
        entry.fetchedAt = null
        entry.initialized = false
      }
    },

    invalidateAll() {
      this.scheduleMonths = {}
      this.messages = {} as Record<PortalMessageChannel, CacheEntry<PortalMsgRow[]>>
      this.carePlan = makeEntry(null)
      this.medications = makeEntry([])
      this.documents = makeEntry([])
      this.visits = {}
      this.visitNotes = {}
      this.visitPhotos = {}
    },

    /** Drop schedule entries matching a year-month prefix if needed later. */
    invalidateSchedule() {
      dropKeys(this.scheduleMonths as Record<string, unknown>, () => true)
    },
  },
})

export { scheduleKey }
