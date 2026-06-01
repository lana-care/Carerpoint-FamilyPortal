<template>
  <div class="min-h-screen bg-background">
    <header class="border-b px-4 py-3 flex items-center gap-3 sticky top-0 bg-background/95 z-10">
      <NuxtLink to="/" class="text-sm text-primary">← Home</NuxtLink>
      <h1 class="text-sm font-semibold">Care plan</h1>
    </header>
    <div class="max-w-3xl mx-auto px-4 py-6">
      <Card v-if="carePlan">
        <CardHeader>
          <CardTitle class="text-base">{{ String((carePlan as any).title || 'Care plan') }}</CardTitle>
        </CardHeader>
        <CardContent class="text-sm space-y-2 text-muted-foreground">
          <p v-if="(carePlan as any).summary">{{ (carePlan as any).summary }}</p>
          <p v-if="(carePlan as any).goals"><span class="font-medium text-foreground">Goals:</span> {{ (carePlan as any).goals }}</p>
          <p v-if="(carePlan as any).nextReviewDate || (carePlan as any).next_review_date" class="text-xs">
            Next review: {{ (carePlan as any).nextReviewDate || (carePlan as any).next_review_date }}
          </p>
        </CardContent>
      </Card>
      <p v-else class="text-sm text-muted-foreground text-center py-12">No active care plan on file.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'

definePageMeta({ layout: false })

const config = useRuntimeConfig()
const { token } = usePortalAuth()
const carePlan = ref<Record<string, unknown> | null>(null)

onMounted(async () => {
  if (!token.value) return
  try {
    const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
    const res = await $fetch<{ valid?: boolean; carePlan?: Record<string, unknown> | null }>(
      `${base}/api/v1/family-portal/care-plan`,
      { headers: { Authorization: `Bearer ${token.value}` } },
    )
    if (res?.valid) carePlan.value = res.carePlan ?? null
  } catch {
    carePlan.value = null
  }
})
</script>
