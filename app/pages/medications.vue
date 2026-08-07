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
        <p class="text-xs text-muted-foreground">
          {{ meds.length }} active {{ meds.length === 1 ? 'medication' : 'medications' }}. This
          list is maintained by the care team — contact them with any questions.
        </p>

        <Card v-for="(m, i) in meds" :key="m.id || i">
          <CardContent class="pt-4 text-sm">
            <div class="flex items-start gap-3">
              <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-luna-500/[0.1] text-luna-600 dark:text-luna-300">
                <LucidePill class="size-4.5" />
              </span>
              <div class="min-w-0 flex-1 space-y-1">
                <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p class="font-medium">
                    {{ m.name }}
                  </p>
                  <p v-if="m.strength" class="text-muted-foreground text-xs">
                    {{ m.strength }}
                  </p>
                </div>
                <!-- dose_quantity / dose_unit were already returned by the API
                     and simply never rendered. -->
                <Badge v-if="doseOf(m)" variant="secondary">
                  {{ doseOf(m) }}
                </Badge>
                <p v-if="m.instructions" class="text-muted-foreground">
                  {{ m.instructions }}
                </p>
              </div>
            </div>
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
import { Pill as LucidePill } from 'lucide-vue-next'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { usePortalResourcesStore } from '~/stores/portalResources'
import { normalizePortalError } from '~/composables/usePortalAuth'

definePageMeta({ title: 'Medications' })

/** "2 tablets" from dose_quantity + dose_unit, either of which may be absent. */
function doseOf(m: Record<string, unknown>): string {
  const qty = m.doseQuantity ?? m.dose_quantity
  const unit = m.doseUnit ?? m.dose_unit
  return [qty, unit].filter(v => v !== null && v !== undefined && String(v).trim()).join(' ').trim()
}

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
