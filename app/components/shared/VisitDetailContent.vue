<template>
  <div class="space-y-4">
    <div v-if="loading" class="space-y-3 py-4">
      <div class="h-5 w-48 rounded bg-muted animate-pulse" />
      <div class="h-4 w-28 rounded bg-muted animate-pulse" />
      <div class="h-24 rounded-xl bg-muted animate-pulse" />
    </div>

    <template v-else-if="visit">
      <div class="space-y-2">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-base font-semibold">{{ formatDate(visit.date) }}</p>
            <p v-if="visit.start || visit.end" class="text-sm text-muted-foreground tabular-nums">
              {{ formatTimeRange(visit.start, visit.end) }}
            </p>
          </div>
          <SharedStatusBadge :status="visit.status" class="shrink-0" />
        </div>
      </div>

      <div class="space-y-3 text-sm rounded-xl border border-border/60 bg-card p-4">
        <div v-if="visit.mood">
          <span class="text-xs font-semibold text-muted-foreground uppercase">Mood</span>
          <p>{{ visit.mood }}</p>
        </div>
        <div v-if="visit.foodIntake">
          <span class="text-xs font-semibold text-muted-foreground uppercase">Food</span>
          <p>{{ visit.foodIntake }}</p>
        </div>
        <div v-if="visit.notes">
          <span class="text-xs font-semibold text-muted-foreground uppercase">Carer notes</span>
          <p class="whitespace-pre-wrap">{{ visit.notes }}</p>
        </div>
        <p
          v-if="!visit.mood && !visit.foodIntake && !visit.notes"
          class="text-xs text-muted-foreground"
        >
          No carer notes for this visit yet.
        </p>
      </div>

      <div v-if="photos.length" class="rounded-xl border border-border/60 bg-card p-4 space-y-2">
        <p class="text-sm font-semibold">Photos from this visit</p>
        <p class="text-xs text-muted-foreground">Shared by the care team.</p>
        <SharedVisitPhotoGallery :photos="photos" />
      </div>

      <div v-if="token" class="rounded-xl border border-border/60 bg-card p-4 space-y-3 text-sm">
        <div>
          <p class="text-sm font-semibold">Your notes on this visit</p>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{ canAddNote
              ? 'Share a note with the care team.'
              : 'Notes can be added once the visit is completed or reviewed.' }}
          </p>
        </div>
        <div v-for="n in familyNotes" :key="n.id" class="rounded-md border bg-muted/20 p-3">
          <p class="whitespace-pre-wrap">{{ n.note }}</p>
          <p class="text-xs text-muted-foreground mt-2">{{ formatDt(n.created_at) }}</p>
        </div>
        <template v-if="canAddNote">
          <Textarea
            v-model="noteDraft"
            rows="3"
            placeholder="Leave a note for the care team…"
          />
          <Button
            size="sm"
            class="w-full sm:w-auto"
            :disabled="noteSaving || !noteDraft.trim()"
            @click="submitNote"
          >
            {{ noteSaving ? 'Saving…' : 'Submit note' }}
          </Button>
        </template>
      </div>
    </template>

    <EmptyState
      v-else
      title="Visit not found"
      description="This visit may have been removed, or your access link does not include it."
      size="sm"
    />
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import type { FamilyPortalVisit } from '~/composables/usePortalAuth'
import type { VisitPhoto } from '~/components/shared/VisitPhotoGallery.vue'
import { formatTimeRange } from '~/utils/formatTime'
import { normalizePortalError } from '~/composables/usePortalAuth'
import { usePortalResourcesStore } from '~/stores/portalResources'

const props = defineProps<{
  visitId: string
  seed?: FamilyPortalVisit | null
}>()

const { token, portalData, fetchPortal } = usePortalAuth()
const resources = usePortalResourcesStore()

const loading = ref(true)
const noteDraft = ref('')
const noteSaving = ref(false)

const visit = computed(() => resources.getVisit(props.visitId))
const familyNotes = computed(() => resources.getVisitNotes(props.visitId))
const photos = computed(() => resources.getVisitPhotos(props.visitId) as VisitPhoto[])

const canAddNote = computed(() => {
  const s = String(visit.value?.status || '').toLowerCase()
  return ['completed', 'reviewed'].includes(s)
})

function formatDate(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDt(s: string) {
  try {
    return new Date(s).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return s
  }
}

async function submitNote() {
  const id = visit.value?.id || props.visitId
  if (!token.value || !id || !noteDraft.value.trim()) return
  noteSaving.value = true
  try {
    await resources.postVisitNote(id, noteDraft.value.trim())
    noteDraft.value = ''
  } catch (e: unknown) {
    const err = e as { data?: { message?: unknown }; message?: string }
    toast.error(normalizePortalError(err?.data?.message) || err?.message || 'Could not save your note.')
  } finally {
    noteSaving.value = false
  }
}

async function loadVisit(id: string) {
  loading.value = true
  if (token.value && !portalData.value?.valid) {
    await fetchPortal()
  }
  if (token.value) {
    try {
      await resources.fetchVisit(id, { seed: props.seed })
      await Promise.all([
        resources.fetchVisitNotes(id),
        resources.fetchVisitPhotos(id),
      ])
      loading.value = false
      return
    } catch {
      // fallback to bootstrap lists
    }
  }
  const all = [
    ...(portalData.value?.recentVisits || []),
    ...(portalData.value?.upcomingVisits || []),
  ] as FamilyPortalVisit[]
  const found = all.find(v => v.id === id) || props.seed
  if (found) {
    const entry = resources.ensureVisitEntry(id)
    entry.data = { ...found, id }
    entry.initialized = true
    entry.fetchedAt = Date.now()
  }
  if (token.value) {
    await Promise.all([
      resources.fetchVisitNotes(id).catch(() => []),
      resources.fetchVisitPhotos(id).catch(() => []),
    ])
  }
  loading.value = false
}

watch(
  () => props.visitId,
  (id) => {
    if (id) void loadVisit(id)
  },
  { immediate: true },
)
</script>
