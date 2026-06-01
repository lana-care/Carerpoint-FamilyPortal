<template>
  <div class="min-h-screen bg-background">
    <header class="border-b px-4 py-3 flex items-center gap-3 sticky top-0 bg-background/95 z-10">
      <NuxtLink to="/" class="text-sm text-primary">← Home</NuxtLink>
      <h1 class="text-sm font-semibold">Calendar</h1>
    </header>
    <div class="max-w-3xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between gap-2 mb-4">
        <button
          type="button"
          class="text-sm text-primary font-medium px-2 py-1 rounded-md hover:bg-muted/80"
          @click="prevMonth"
        >
          ← Prev
        </button>
        <p class="text-sm font-semibold tabular-nums">
          {{ monthLabel }}
        </p>
        <button
          type="button"
          class="text-sm text-primary font-medium px-2 py-1 rounded-md hover:bg-muted/80"
          @click="nextMonth"
        >
          Next →
        </button>
      </div>
      <p class="text-xs text-muted-foreground mb-4">
        Visit days this month (from your schedule)
      </p>
      <div v-if="scheduleLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
      <template v-else>
        <div class="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-2">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <template v-for="(d, i) in daysInMonth" :key="i">
            <div
              class="aspect-square rounded border text-xs flex flex-col items-center justify-center p-0.5"
              :class="d.hasVisit ? 'bg-primary/15 border-primary/30 font-semibold' : 'border-transparent text-muted-foreground'"
            >
              {{ d.day }}
            </div>
          </template>
        </div>
      </template>
      <p class="text-xs text-muted-foreground mt-6">
        <NuxtLink to="/schedule" class="text-primary underline">Open full schedule</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FamilyPortalVisit } from '~/composables/usePortalAuth'

definePageMeta({ layout: false })

const { portalData, fetchPortal, token } = usePortalAuth()
const config = useRuntimeConfig()

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())
const scheduleLoading = ref(false)
/** Visits for the displayed month (from schedule API or merged portal data). */
const monthVisits = ref<FamilyPortalVisit[]>([])

const monthLabel = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  }),
)

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}

const daysInMonthCount = computed(() =>
  new Date(currentYear.value, currentMonth.value + 1, 0).getDate(),
)

const firstDow = computed(() => {
  const d = new Date(currentYear.value, currentMonth.value, 1).getDay()
  return d === 0 ? 6 : d - 1
})

function visitInDisplayedMonth(v: FamilyPortalVisit | undefined) {
  if (!v?.date) return false
  const datePart = String(v.date).split('T')[0] ?? ''
  const parts = datePart.split('-').map(Number)
  const y = parts[0]
  const m = parts[1]
  if (y === undefined || m === undefined) return false
  return y === currentYear.value && m - 1 === currentMonth.value
}

const visitDates = computed(() => {
  const set = new Set<string>()
  const add = (v: FamilyPortalVisit | undefined) => {
    if (!v?.date) return
    const datePart = String(v.date).split('T')[0] ?? ''
    const parts = datePart.split('-').map(Number)
    const y = parts[0]
    const m = parts[1]
    const d = parts[2]
    if (y === undefined || m === undefined || d === undefined) return
    if (y === currentYear.value && m - 1 === currentMonth.value) set.add(String(d))
  }
  for (const v of monthVisits.value) add(v as FamilyPortalVisit)
  return set
})

const daysInMonth = computed(() => {
  const out: { day: number | ''; hasVisit: boolean }[] = []
  const pad = firstDow.value
  for (let i = 0; i < pad; i++) out.push({ day: '', hasVisit: false })
  const dim = daysInMonthCount.value
  for (let d = 1; d <= dim; d++) {
    out.push({ day: d, hasVisit: visitDates.value.has(String(d)) })
  }
  return out
})

async function loadScheduleForMonth() {
  if (!token.value) {
    monthVisits.value = []
    return
  }
  scheduleLoading.value = true
  try {
    const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
    const apiMonth = currentMonth.value + 1
    const res = await $fetch<{
      valid?: boolean
      upcomingVisits?: FamilyPortalVisit[]
    }>(
      `${base}/api/v1/family-portal/schedule?year=${currentYear.value}&month=${apiMonth}`,
      { headers: { Authorization: `Bearer ${token.value}` } },
    )
    if (res?.valid && Array.isArray(res.upcomingVisits)) {
      monthVisits.value = res.upcomingVisits as FamilyPortalVisit[]
      return
    }
  } catch {
    // fallback below
  } finally {
    scheduleLoading.value = false
  }
  await fetchPortal()
  const merged: FamilyPortalVisit[] = []
  const add = (v: FamilyPortalVisit) => {
    if (visitInDisplayedMonth(v)) merged.push(v)
  }
  for (const v of portalData.value?.upcomingVisits || []) add(v as FamilyPortalVisit)
  for (const v of portalData.value?.recentVisits || []) add(v as FamilyPortalVisit)
  monthVisits.value = merged
}

watch([currentYear, currentMonth], () => {
  void loadScheduleForMonth()
})

onMounted(async () => {
  if (token.value && !portalData.value?.valid) await fetchPortal()
  await loadScheduleForMonth()
})
</script>
