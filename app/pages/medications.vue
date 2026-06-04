<template>
  <div class="min-h-screen bg-background">
    <header class="glass-bar border-b border-border/60 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      <NuxtLink to="/" class="text-sm text-primary">← Home</NuxtLink>
      <h1 class="text-sm font-semibold">Medications</h1>
    </header>
    <div class="max-w-3xl mx-auto px-4 py-6 space-y-3">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
      <Card v-for="(m, i) in meds" v-else :key="(m as any).id || i">
        <CardContent class="pt-4 text-sm">
          <p class="font-medium">{{ (m as any).name }}</p>
          <p v-if="(m as any).strength" class="text-muted-foreground text-xs">{{ (m as any).strength }}</p>
          <p v-if="(m as any).instructions" class="text-muted-foreground mt-1">{{ (m as any).instructions }}</p>
        </CardContent>
      </Card>
      <p v-if="!loading && !meds.length" class="text-sm text-muted-foreground text-center py-12">
        No active medications listed.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'

definePageMeta({ layout: false })

const config = useRuntimeConfig()
const { token } = usePortalAuth()
const loading = ref(true)
const meds = ref<unknown[]>([])

onMounted(async () => {
  if (!token.value) {
    loading.value = false
    return
  }
  try {
    const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
    const res = await $fetch<{ valid?: boolean; data?: unknown[] }>(
      `${base}/api/v1/family-portal/medications`,
      { headers: { Authorization: `Bearer ${token.value}` } },
    )
    meds.value = res?.data || []
  } catch {
    meds.value = []
  } finally {
    loading.value = false
  }
})
</script>
