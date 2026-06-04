<template>
  <div class="min-h-screen bg-background">
    <header class="glass-bar border-b border-border/60 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      <NuxtLink to="/" class="text-sm text-primary">← Home</NuxtLink>
      <h1 class="text-sm font-semibold">Upcoming schedule</h1>
    </header>
    <div class="max-w-3xl mx-auto px-4 py-6">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
      <div v-else-if="upcoming.length" class="space-y-2">
        <NuxtLink
          v-for="v in upcoming"
          :key="v.id || v.date + (v.start || '')"
          :to="v.id ? `/visits/${v.id}` : '#'"
          class="block p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
        >
          <div class="flex justify-between items-start gap-2">
            <div>
              <p class="font-medium">{{ formatDate(v.date) }}</p>
              <p v-if="v.start || v.end" class="text-xs text-muted-foreground">
                {{ v.start || '' }} – {{ v.end || '' }}
              </p>
            </div>
            <Badge variant="secondary">{{ v.status }}</Badge>
          </div>
        </NuxtLink>
      </div>
      <p v-else class="text-sm text-muted-foreground text-center py-12">No upcoming visits scheduled.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '~/components/ui/badge'
import type { FamilyPortalVisit } from '~/composables/usePortalAuth'

definePageMeta({ layout: false })

const { token, portalData, fetchPortal } = usePortalAuth()
const loading = ref(true)

const upcoming = computed(() => {
  const list = portalData.value?.upcomingVisits || []
  const today = new Date().toISOString().split('T')[0]
  return list.filter((v: FamilyPortalVisit) => v.date >= today)
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

onMounted(async () => {
  if (token.value && !portalData.value?.valid) {
    await fetchPortal()
  }
  loading.value = false
})
</script>
