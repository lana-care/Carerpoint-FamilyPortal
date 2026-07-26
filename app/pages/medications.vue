<template>
  <div class="relative">
    <div class="max-w-3xl mx-auto px-4 py-6 space-y-3">
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-20 rounded-xl bg-muted animate-pulse" />
      </div>

      <EmptyState
        v-else-if="error"
        title="Could not load medications"
        :description="error"
        size="sm"
      />

      <template v-else-if="meds.length">
        <Card v-for="(m, i) in meds" :key="m.id || i">
          <CardContent class="pt-4 text-sm">
            <p class="font-medium">{{ m.name }}</p>
            <p v-if="m.strength" class="text-muted-foreground text-xs">{{ m.strength }}</p>
            <p v-if="m.instructions" class="text-muted-foreground mt-1">{{ m.instructions }}</p>
          </CardContent>
        </Card>
      </template>

      <EmptyState
        v-else
        title="No active medications"
        description="No medications are listed for this person right now."
        size="sm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Card, CardContent } from '~/components/ui/card'
import { usePortalResourcesStore } from '~/stores/portalResources'
import { normalizePortalError } from '~/composables/usePortalAuth'

definePageMeta({ title: 'Medications' })

const { token } = usePortalAuth()
const resources = usePortalResourcesStore()

const error = ref<string | null>(null)
const ready = ref(resources.medications.initialized)
const meds = computed(() => resources.getMedications)
const loading = computed(() => (!ready.value || resources.isMedicationsLoading) && !error.value)

onMounted(async () => {
  if (!token.value) {
    error.value = 'Sign in with your access link to view medications.'
    ready.value = true
    return
  }
  try {
    await resources.fetchMedications()
    error.value = null
  } catch (e: unknown) {
    const err = e as { data?: { message?: unknown }; message?: string }
    error.value = normalizePortalError(err?.data?.message) || err?.message || 'Could not load medications.'
    toast.error(error.value)
  } finally {
    ready.value = true
  }
})
</script>
