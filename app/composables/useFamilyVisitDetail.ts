import type { FamilyPortalVisit } from '~/composables/usePortalAuth'

/**
 * Shared visit-detail panel state (calendar / schedule / home).
 * Mirrors staff `useVisitDetailSheet` — open by id, optional seed for instant chrome.
 */
export function useFamilyVisitDetail() {
  const open = useState('family-visit-detail-open', () => false)
  const visitId = useState<string | null>('family-visit-detail-id', () => null)
  const seed = useState<FamilyPortalVisit | null>('family-visit-detail-seed', () => null)

  function openVisit(id: string, seedVisit?: FamilyPortalVisit | null) {
    if (!id) return
    visitId.value = id
    seed.value = seedVisit ?? null
    open.value = true
  }

  function close() {
    open.value = false
    visitId.value = null
    seed.value = null
  }

  return { open, visitId, seed, openVisit, close }
}
