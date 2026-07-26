/**
 * SWR-style cache helpers for Family Portal Pinia stores.
 * Mirrors Carerpoint-Frontend `useClientResourcesStore` patterns.
 */

export interface CacheEntry<T> {
  data: T
  fetchedAt: number | null
  loading: boolean
  refreshing: boolean
  error: string | null
  initialized: boolean
}

export const PORTAL_TTL = {
  bootstrap: 2 * 60 * 1000,
  schedule: 2 * 60 * 1000,
  messages: 45 * 1000,
  carePlan: 5 * 60 * 1000,
  medications: 5 * 60 * 1000,
  documents: 5 * 60 * 1000,
  visit: 2 * 60 * 1000,
  visitNotes: 60 * 1000,
  visitPhotos: 5 * 60 * 1000,
} as const

export function makeEntry<T>(data: T): CacheEntry<T> {
  return {
    data,
    fetchedAt: null,
    loading: false,
    refreshing: false,
    error: null,
    initialized: false,
  }
}

export function isCacheValid(fetchedAt: number | null, ttlMs: number): boolean {
  if (fetchedAt == null) return false
  return Date.now() - fetchedAt < ttlMs
}

/** Skeleton only on first load — not on background refresh. */
export function showLoading<T>(entry: CacheEntry<T>): boolean {
  return entry.loading && !entry.initialized
}

function errorMessage(e: unknown, fallback: string): string {
  const err = e as { data?: { message?: unknown }; message?: string }
  const m = err?.data?.message
  if (Array.isArray(m)) return m.join(', ')
  if (typeof m === 'string') return m
  if (typeof err?.message === 'string') return err.message
  return fallback
}

/**
 * Fresh → return cache.
 * Stale + initialized → return stale, refresh in background.
 * Cold → await fetch.
 */
export async function swrFetch<T>(
  entry: CacheEntry<T>,
  fetcher: () => Promise<T>,
  opts: { force?: boolean; ttlMs?: number } = {},
): Promise<T> {
  const { force = false, ttlMs = PORTAL_TTL.bootstrap } = opts
  const valid = isCacheValid(entry.fetchedAt, ttlMs)

  if (!force && valid && entry.initialized) {
    return entry.data
  }

  if (!force && entry.initialized) {
    if (!entry.refreshing) {
      entry.refreshing = true
      entry.error = null
      fetcher()
        .then((data) => {
          entry.data = data
          entry.fetchedAt = Date.now()
        })
        .catch((e) => {
          entry.error = errorMessage(e, 'Failed to refresh')
        })
        .finally(() => {
          entry.refreshing = false
        })
    }
    return entry.data
  }

  entry.loading = true
  entry.error = null
  try {
    const data = await fetcher()
    entry.data = data
    entry.fetchedAt = Date.now()
    entry.initialized = true
    return data
  } catch (e) {
    entry.error = errorMessage(e, 'Failed to load')
    throw e
  } finally {
    entry.loading = false
  }
}

export function dropKeys(cache: Record<string, unknown>, matches: (key: string) => boolean): void {
  for (const key of Object.keys(cache)) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    if (matches(key)) delete cache[key]
  }
}
