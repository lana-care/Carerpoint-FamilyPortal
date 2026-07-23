<template>
  <div class="min-h-screen bg-background">
    <header class="glass-bar border-b border-border/60 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      <NuxtLink to="/" class="text-sm text-primary">← Home</NuxtLink>
      <h1 class="text-sm font-semibold">Visit detail</h1>
    </header>
    <div class="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
      <Card v-else-if="visit">
        <CardHeader class="space-y-2">
          <div class="flex items-start justify-between gap-3">
            <CardTitle class="text-base">{{ formatDate(visit.date) }}</CardTitle>
            <SharedStatusBadge :status="visit.status" class="shrink-0" />
          </div>
          <p v-if="visit.start || visit.end" class="text-sm text-muted-foreground tabular-nums">
            {{ formatTimeRange(visit.start, visit.end) }}
          </p>
        </CardHeader>
        <CardContent class="space-y-3 text-sm">
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
        </CardContent>
      </Card>
      <p v-else class="text-sm text-muted-foreground text-center py-12">Visit not found.</p>

      <Card v-if="visit && photos.length">
        <CardHeader>
          <CardTitle class="text-sm">Photos from this visit</CardTitle>
          <p class="text-xs text-muted-foreground font-normal">
            Shared by the care team.
          </p>
        </CardHeader>
        <CardContent>
          <SharedVisitPhotoGallery :photos="photos" />
        </CardContent>
      </Card>

      <Card v-if="visit && token">
        <CardHeader>
          <CardTitle class="text-sm">Your notes on this visit</CardTitle>
          <p class="text-xs text-muted-foreground font-normal">
            Available when the visit is completed or reviewed.
          </p>
        </CardHeader>
        <CardContent class="space-y-3 text-sm">
          <div v-for="n in familyNotes" :key="n.id" class="rounded-md border bg-muted/20 p-3">
            <p class="whitespace-pre-wrap">{{ n.note }}</p>
            <p class="text-[10px] text-muted-foreground mt-2">{{ formatDt(n.created_at) }}</p>
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
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '~/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { Textarea } from '~/components/ui/textarea'
import type { FamilyPortalVisit } from '~/composables/usePortalAuth'
import type { VisitPhoto } from '~/components/shared/VisitPhotoGallery.vue'

definePageMeta({ layout: false })

const route = useRoute()
const config = useRuntimeConfig()
const { token, portalData, fetchPortal } = usePortalAuth()
const loading = ref(true)
const visit = ref<(FamilyPortalVisit & { id?: string }) | null>(null)
const familyNotes = ref<{ id: string; note: string; created_at: string }[]>([])
const photos = ref<VisitPhoto[]>([])
const noteDraft = ref('')
const noteSaving = ref(false)

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

async function loadNotes(visitId: string) {
  if (!token.value) return
  try {
    const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
    const res = await $fetch<{ valid?: boolean; data?: typeof familyNotes.value }>(
      `${base}/api/v1/family-portal/visits/${visitId}/notes`,
      { headers: { Authorization: `Bearer ${token.value}` } },
    )
    familyNotes.value = res?.valid && Array.isArray(res.data) ? res.data : []
  } catch {
    familyNotes.value = []
  }
}

async function loadPhotos(visitId: string) {
  if (!token.value) return
  try {
    const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
    // Signed URLs are short-lived — always fetch fresh, never cache.
    const res = await $fetch<{ valid?: boolean; data?: VisitPhoto[] }>(
      `${base}/api/v1/family-portal/visits/${visitId}/photos`,
      { headers: { Authorization: `Bearer ${token.value}` } },
    )
    photos.value = res?.valid && Array.isArray(res.data) ? res.data : []
  } catch {
    photos.value = []
  }
}

async function submitNote() {
  const id = visit.value?.id
  if (!token.value || !id || !noteDraft.value.trim()) return
  noteSaving.value = true
  try {
    const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
    const res = await $fetch<{ success?: boolean; error?: string }>(
      `${base}/api/v1/family-portal/visits/${id}/notes`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: { note: noteDraft.value.trim() },
      },
    )
    if (!res?.success) {
      toast.error(res?.error || 'Could not save your note.')
      return
    }
    noteDraft.value = ''
    await loadNotes(id)
  } catch (e: unknown) {
    const err = e as { data?: { message?: unknown }; message?: string }
    toast.error(normalizePortalError(err?.data?.message) || err?.message || 'Could not save your note.')
  } finally {
    noteSaving.value = false
  }
}

onMounted(async () => {
  const id = route.params.id as string
  if (token.value && !portalData.value?.valid) {
    await fetchPortal()
  }
  const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
  if (token.value) {
    try {
      const summary = await $fetch<{ valid?: boolean; visit?: FamilyPortalVisit & { id: string } }>(
        `${base}/api/v1/family-portal/visits/${id}`,
        { headers: { Authorization: `Bearer ${token.value}` } },
      )
      if (summary?.valid && summary.visit) {
        visit.value = { ...summary.visit, id }
        await Promise.all([loadNotes(id), loadPhotos(id)])
        loading.value = false
        return
      }
    } catch {
      // fallback to bundle
    }
  }
  const all = [
    ...(portalData.value?.recentVisits || []),
    ...(portalData.value?.upcomingVisits || []),
  ] as FamilyPortalVisit[]
  visit.value = all.find((v) => v.id === id) || null
  if (visit.value?.id && token.value) {
    await Promise.all([loadNotes(visit.value.id as string), loadPhotos(visit.value.id as string)])
  }
  loading.value = false
})
</script>
