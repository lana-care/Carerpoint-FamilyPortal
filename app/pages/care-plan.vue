<template>
  <div class="relative">
    <div class="max-w-3xl mx-auto px-4 py-6">
      <div v-if="loading" class="space-y-3">
        <div class="h-6 w-48 rounded bg-muted animate-pulse" />
        <div class="h-32 rounded-xl bg-muted animate-pulse" />
      </div>

      <EmptyState
        v-else-if="error"
        title="Could not load care plan"
        :description="error"
        size="sm"
      />

      <Card v-else-if="carePlan">
        <CardHeader>
          <CardTitle class="text-base">{{ String(carePlan.title || 'Care plan') }}</CardTitle>
        </CardHeader>
        <CardContent class="text-sm space-y-2 text-muted-foreground">
          <p v-if="carePlan.summary">{{ carePlan.summary }}</p>
          <p v-if="carePlan.goals">
            <span class="font-medium text-foreground">Goals:</span> {{ carePlan.goals }}
          </p>
          <p v-if="carePlan.nextReviewDate || carePlan.next_review_date" class="text-xs">
            Next review: {{ carePlan.nextReviewDate || carePlan.next_review_date }}
          </p>
        </CardContent>
      </Card>

      <EmptyState
        v-else
        title="No active care plan"
        description="Your care provider has not published an active care plan yet."
        size="sm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { usePortalResourcesStore } from '~/stores/portalResources'
import { normalizePortalError } from '~/composables/usePortalAuth'

definePageMeta({ title: 'Care plan' })

const { token, portalData, fetchPortal } = usePortalAuth()
const resources = usePortalResourcesStore()

const error = ref<string | null>(null)
const ready = ref(resources.carePlan.initialized)

const carePlan = computed(() => resources.getCarePlan)
const loading = computed(() => (!ready.value || resources.isCarePlanLoading) && !error.value && !carePlan.value)

onMounted(async () => {
  if (!token.value) {
    error.value = 'Sign in with your access link to view the care plan.'
    ready.value = true
    return
  }
  if (!portalData.value?.valid) await fetchPortal()
  resources.seedCarePlanFromBootstrap(
    portalData.value?.carePlan as Record<string, unknown> | null | undefined,
  )
  if (resources.carePlan.initialized) ready.value = true
  try {
    await resources.fetchCarePlan()
    error.value = null
  } catch (e: unknown) {
    if (!resources.getCarePlan) {
      const err = e as { data?: { message?: unknown }; message?: string }
      error.value = normalizePortalError(err?.data?.message) || err?.message || 'Could not load care plan.'
      toast.error(error.value)
    }
  } finally {
    ready.value = true
  }
})
</script>
