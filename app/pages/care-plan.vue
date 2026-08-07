<template>
  <div class="relative">
    <div class="max-w-3xl mx-auto px-4 py-6 space-y-4">
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

      <template v-else-if="carePlan">
        <Card>
          <CardHeader>
            <CardTitle class="text-base">{{ String(carePlan.title || 'Care plan') }}</CardTitle>
            <CardDescription v-if="nextReview">
              Next review: {{ nextReview }}
            </CardDescription>
          </CardHeader>
          <CardContent class="text-sm space-y-4">
            <p v-if="carePlan.summary" class="text-muted-foreground">
              {{ carePlan.summary }}
            </p>

            <!-- `goals` is a text[]; rendering it directly printed "a,b,c". -->
            <div v-if="goals.length" class="space-y-2">
              <h2 class="font-medium text-foreground">
                Goals
              </h2>
              <ul class="space-y-1.5">
                <li
                  v-for="(goal, i) in goals"
                  :key="i"
                  class="flex gap-2 text-muted-foreground"
                >
                  <LucideTarget class="size-4 shrink-0 mt-0.5 text-luna-600 dark:text-luna-300" />
                  <span>{{ goal }}</span>
                </li>
              </ul>
            </div>

            <p v-if="!carePlan.summary && !goals.length" class="text-muted-foreground">
              This plan has no published summary or goals yet.
            </p>
          </CardContent>
        </Card>

        <!--
          Client context. Every field here already ships to the portal in the
          `/auth/family-portal` bootstrap payload and was simply never rendered,
          so showing it exposes nothing new.

          Deliberately NOT surfaced: the care_plans table also holds DNR status,
          emergency-treatment outcomes and anticipatory-medication fields. Those
          are clinical records, and widening a family-facing PHI payload to
          include them is a governance decision, not a UI one.
        -->
        <Card v-if="hasClientContext">
          <CardHeader>
            <CardTitle class="text-base">About {{ firstName || 'your relative' }}</CardTitle>
          </CardHeader>
          <CardContent class="text-sm space-y-3">
            <div v-if="allergies.length">
              <h2 class="font-medium text-foreground mb-1">
                Allergies
              </h2>
              <div class="flex flex-wrap gap-1.5">
                <Badge
                  v-for="(a, i) in allergies"
                  :key="i"
                  variant="destructive"
                >
                  {{ a }}
                </Badge>
              </div>
            </div>

            <div v-if="conditions.length">
              <h2 class="font-medium text-foreground mb-1">
                Conditions
              </h2>
              <div class="flex flex-wrap gap-1.5">
                <Badge
                  v-for="(c, i) in conditions"
                  :key="i"
                  variant="secondary"
                >
                  {{ c }}
                </Badge>
              </div>
            </div>

            <p v-if="mobility" class="text-muted-foreground">
              <span class="font-medium text-foreground">Mobility:</span> {{ mobility }}
            </p>
          </CardContent>
        </Card>
      </template>

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
import { Target as LucideTarget } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { usePortalResourcesStore } from '~/stores/portalResources'
import { normalizePortalError } from '~/composables/usePortalAuth'

definePageMeta({ title: 'Care plan' })

const { token, portalData, fetchPortal } = usePortalAuth()
const resources = usePortalResourcesStore()

const error = ref<string | null>(null)
const ready = ref(resources.carePlan.initialized)

const carePlan = computed(() => resources.getCarePlan)
const loading = computed(() => (!ready.value || resources.isCarePlanLoading) && !error.value && !carePlan.value)

/** Tolerates the array the API sends, a single string, or nothing. */
function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

const goals = computed(() => toList(carePlan.value?.goals))

const nextReview = computed(() => {
  const raw = carePlan.value?.nextReviewDate ?? carePlan.value?.next_review_date
  if (!raw) return ''
  const d = new Date(String(raw))
  if (Number.isNaN(d.getTime())) return String(raw)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
})

const client = computed(() => portalData.value?.client as Record<string, unknown> | undefined)
const firstName = computed(() => String(client.value?.preferredName || client.value?.firstName || ''))
const allergies = computed(() => toList(client.value?.allergies))
const conditions = computed(() => toList(client.value?.medicalConditions))
const mobility = computed(() => String(client.value?.mobilityLevel || ''))
const hasClientContext = computed(
  () => allergies.value.length > 0 || conditions.value.length > 0 || Boolean(mobility.value),
)

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
      const err = e as { data?: { message?: unknown }, message?: string }
      error.value = normalizePortalError(err?.data?.message) || err?.message || 'Could not load care plan.'
      toast.error(error.value)
    }
  } finally {
    ready.value = true
  }
})
</script>
