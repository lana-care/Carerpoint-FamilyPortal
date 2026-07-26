<template>
  <div class="relative">
    <div class="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div class="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border/50">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="hidden sm:flex flex-col items-center justify-center size-11 rounded-xl bg-muted shrink-0"
              aria-hidden="true"
            >
              <span class="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground leading-none">
                {{ anchorMonthShort }}
              </span>
              <span class="text-sm font-bold text-foreground leading-none mt-0.5">
                {{ anchorDayNum }}
              </span>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-foreground truncate">{{ periodTitle }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ periodSubtitle }}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <SegmentedControl
              v-model="viewMode"
              :options="viewOptions"
              size="sm"
              shape="pill"
              aria-label="Calendar view"
            />
            <div class="inline-flex items-center rounded-full border border-border/60 bg-muted/40 p-0.5">
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-full"
                :aria-label="prevLabel"
                @click="goPrev"
              >
                <LucideChevronLeft class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                class="h-8 rounded-full px-3 text-xs font-semibold"
                @click="goToday"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-full"
                :aria-label="nextLabel"
                @click="goNext"
              >
                <LucideChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div v-if="scheduleLoading" class="space-y-3 p-4">
          <div class="h-8 w-40 rounded bg-muted animate-pulse" />
          <div class="h-48 rounded-xl bg-muted animate-pulse" />
        </div>

        <template v-else>
          <!-- Day -->
          <div v-if="viewMode === 'day'" class="p-4 space-y-2">
            <button
              v-for="v in dayVisits"
              :key="v.id || `${v.date}-${v.start}`"
              type="button"
              class="flex items-center gap-2 w-full rounded-full px-3 py-2.5 text-left transition-colors hover:brightness-[0.97] dark:hover:brightness-110 min-h-11"
              :class="visitPillClass(v.status)"
              :disabled="!v.id"
              :aria-label="visitAriaLabel(v)"
              @click="onVisitClick(v)"
            >
              <span class="size-1.5 rounded-full shrink-0" :class="visitDotClass(v.status)" aria-hidden="true" />
              <span class="min-w-0 flex-1 truncate text-xs font-semibold">Visit</span>
              <span class="shrink-0 text-xs font-medium opacity-70 tabular-nums">
                {{ formatTimeRange(v.start, v.end) }}
              </span>
              <SharedStatusBadge :status="v.status" class="shrink-0 scale-90 origin-right" />
            </button>
            <EmptyState
              v-if="dayVisits.length === 0"
              title="No visits on this day"
              description="Try another day, or switch to Week or Month."
              size="sm"
            />
          </div>

          <!-- Week: mobile list / desktop grid -->
          <div v-else-if="viewMode === 'week'">
          <div class="sm:hidden divide-y divide-border/50">
            <div
              v-for="day in weekDays"
              :key="day.dateStr"
              class="px-4 py-3"
              :class="day.isToday ? 'bg-luna-500/[0.04]' : ''"
            >
              <button
                type="button"
                class="flex items-center gap-2 mb-2 w-full text-left min-h-10"
                @click="openDay(day.dateStr)"
              >
                <span
                  class="inline-flex items-center justify-center size-8 text-sm font-semibold"
                  :class="day.isToday
                    ? 'rounded-full bg-foreground text-background'
                    : 'text-foreground'"
                >
                  {{ day.dayNum }}
                </span>
                <span class="text-sm font-medium">{{ day.dayName }}</span>
                <span class="text-xs text-muted-foreground ml-auto">{{ day.visits.length }} visit{{ day.visits.length === 1 ? '' : 's' }}</span>
              </button>
              <div class="space-y-1.5 pl-1">
                <button
                  v-for="visit in day.visits"
                  :key="visit.id || `${visit.date}-${visit.start}`"
                  type="button"
                  class="w-full flex items-center gap-2 rounded-full px-3 py-2 text-left min-h-10"
                  :class="visitPillClass(visit.status)"
                  :disabled="!visit.id"
                  :aria-label="visitAriaLabel(visit)"
                  @click="onVisitClick(visit)"
                >
                  <span class="size-1.5 rounded-full shrink-0" :class="visitDotClass(visit.status)" aria-hidden="true" />
                  <span class="min-w-0 flex-1 truncate text-xs font-semibold">Visit</span>
                  <span class="shrink-0 text-xs opacity-70 tabular-nums">{{ formatTime(visit.start) }}</span>
                </button>
                <p v-if="day.visits.length === 0" class="text-xs text-muted-foreground px-1">No visits</p>
              </div>
            </div>
          </div>

          <div
            class="hidden sm:grid grid-cols-7 divide-x divide-border/50"
          >
            <div
              v-for="day in weekDays"
              :key="day.dateStr"
              class="min-h-[9.5rem] flex flex-col"
              :class="[
                day.isWeekend ? 'bg-muted/25' : 'bg-background',
                day.isToday ? 'bg-luna-500/[0.04]' : '',
              ]"
            >
              <button
                type="button"
                class="flex flex-col items-center gap-1 px-1.5 pt-3 pb-2 w-full hover:bg-muted/30 transition-colors min-h-14"
                @click="openDay(day.dateStr)"
              >
                <span class="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {{ day.dayName }}
                </span>
                <span
                  class="inline-flex items-center justify-center size-7 text-sm font-semibold"
                  :class="day.isToday
                    ? 'rounded-full bg-foreground text-background'
                    : 'text-foreground'"
                >
                  {{ day.dayNum }}
                </span>
              </button>

              <div class="flex-1 px-1.5 pb-2 space-y-1 min-h-0">
                <button
                  v-for="visit in day.visibleVisits"
                  :key="visit.id || `${visit.date}-${visit.start}`"
                  type="button"
                  class="w-full flex items-center gap-1.5 rounded-full px-2 py-1.5 text-left transition-colors hover:brightness-[0.97] dark:hover:brightness-110"
                  :class="visitPillClass(visit.status)"
                  :disabled="!visit.id"
                  :title="visitTooltip(visit)"
                  :aria-label="visitAriaLabel(visit)"
                  @click="onVisitClick(visit)"
                >
                  <span
                    class="size-1.5 rounded-full shrink-0"
                    :class="visitDotClass(visit.status)"
                    aria-hidden="true"
                  />
                  <span class="min-w-0 flex-1 truncate text-[10px] font-semibold leading-tight">
                    Visit
                  </span>
                  <span class="shrink-0 text-[10px] font-medium opacity-70 tabular-nums">
                    {{ formatTime(visit.start) }}
                  </span>
                </button>

                <button
                  v-if="day.extraCount > 0"
                  type="button"
                  class="px-1.5 text-[10px] font-medium text-primary hover:underline"
                  @click="openDay(day.dateStr)"
                >
                  +{{ day.extraCount }} more…
                </button>
                <p
                  v-else-if="day.visits.length === 0"
                  class="pt-3 text-center text-muted-foreground/35 text-xs"
                  aria-hidden="true"
                >
                  —
                </p>
              </div>
            </div>
          </div>
          </div>

          <!-- Month -->
          <div v-else class="p-4 space-y-4">
            <CalendarMonth
              :year="currentYear"
              :month="currentMonth"
              :marked-days="visitDates"
              :selected-day="selectedDayOfMonth"
              :show-label="false"
              @select="onMonthDaySelect"
            />
            <div v-if="dayVisits.length" class="space-y-2">
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {{ selectedDateLabel }}
              </p>
              <button
                v-for="v in dayVisits"
                :key="v.id || `${v.date}-${v.start}`"
                type="button"
                class="flex items-center gap-2 w-full rounded-full px-3 py-2.5 text-left min-h-11"
                :class="visitPillClass(v.status)"
                :disabled="!v.id"
                :aria-label="visitAriaLabel(v)"
                @click="onVisitClick(v)"
              >
                <span class="size-1.5 rounded-full shrink-0" :class="visitDotClass(v.status)" aria-hidden="true" />
                <span class="min-w-0 flex-1 truncate text-xs font-semibold">Visit</span>
                <span class="shrink-0 text-xs font-medium opacity-70 tabular-nums">
                  {{ formatTimeRange(v.start, v.end) }}
                </span>
              </button>
            </div>
            <p v-else class="text-xs text-muted-foreground text-center py-2">
              Select a highlighted day to see visits.
            </p>
          </div>
        </template>

        <div class="flex flex-wrap items-center gap-3 sm:gap-5 px-4 py-3 border-t border-border/50 bg-muted/20">
          <div class="min-w-0">
            <p class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              {{ summaryLabel }}
            </p>
            <p class="text-sm font-bold text-foreground">
              {{ periodVisits.length }}
              <span class="font-medium text-muted-foreground">
                {{ periodVisits.length === 1 ? 'visit' : 'visits' }}
              </span>
            </p>
          </div>
          <div class="hidden sm:block h-8 w-px bg-border/70" />
          <div class="flex flex-wrap items-center gap-1.5">
            <span
              v-for="chip in statusChips"
              :key="chip.key"
              class="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              <span class="size-1.5 rounded-full shrink-0" :class="chip.dot" />
              <span class="font-semibold text-foreground tabular-nums">{{ chip.count }}</span>
              {{ chip.label }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft as LucideChevronLeft, ChevronRight as LucideChevronRight } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { CalendarMonth } from '~/components/ui/calendar'
import type { FamilyPortalVisit } from '~/composables/usePortalAuth'
import { usePortalResourcesStore } from '~/stores/portalResources'
import { formatTime, formatTimeRange } from '~/utils/formatTime'

definePageMeta({ title: 'Calendar' })

type ViewMode = 'day' | 'week' | 'month'
const MAX_VISIBLE_VISITS = 3

const route = useRoute()
const router = useRouter()
const { portalData, fetchPortal, token } = usePortalAuth()
const resources = usePortalResourcesStore()
const visitDetail = useFamilyVisitDetail()
const { openVisit, close: closeVisitDetail } = visitDetail

const viewMode = ref<ViewMode>('week')
const viewOptions = [
  { value: 'day' as const, label: 'Day' },
  { value: 'week' as const, label: 'Week' },
  { value: 'month' as const, label: 'Month' },
]

const now = new Date()
now.setHours(0, 0, 0, 0)
const anchorDate = ref(new Date(now))
const scheduleLoading = ref(false)
const monthVisits = ref<FamilyPortalVisit[]>([])

const currentYear = computed(() => anchorDate.value.getFullYear())
const currentMonth = computed(() => anchorDate.value.getMonth())

function toDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDateStr(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

function getMonday(from: Date) {
  const d = new Date(from)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

const selectedDateStr = computed(() => toDateStr(anchorDate.value))
const selectedDayOfMonth = computed(() => {
  if (viewMode.value !== 'month') return null
  return anchorDate.value.getDate()
})
const selectedDateLabel = computed(() =>
  anchorDate.value.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }),
)
const weekMonday = computed(() => getMonday(anchorDate.value))
const weekRange = computed(() => {
  const mon = weekMonday.value
  const sun = new Date(mon)
  sun.setDate(sun.getDate() + 6)
  return { from: toDateStr(mon), to: toDateStr(sun) }
})
const anchorMonthShort = computed(() =>
  anchorDate.value.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
)
const anchorDayNum = computed(() => anchorDate.value.getDate())

const periodTitle = computed(() => {
  if (viewMode.value === 'day') {
    return anchorDate.value.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  }
  if (viewMode.value === 'week') {
    return weekMonday.value.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  }
  return new Date(currentYear.value, currentMonth.value, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
})

const periodSubtitle = computed(() => {
  if (viewMode.value === 'day') return 'Visits on this day'
  if (viewMode.value === 'week') {
    const mon = weekMonday.value
    const sun = new Date(mon)
    sun.setDate(sun.getDate() + 6)
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return `${fmt(mon)} — ${fmt(sun)}`
  }
  return 'Visit days this month (from your schedule)'
})

const summaryLabel = computed(() => {
  if (viewMode.value === 'day') return 'This day'
  if (viewMode.value === 'week') return 'This week'
  return 'This month'
})
const prevLabel = computed(() => {
  if (viewMode.value === 'day') return 'Previous day'
  if (viewMode.value === 'week') return 'Previous week'
  return 'Previous month'
})
const nextLabel = computed(() => {
  if (viewMode.value === 'day') return 'Next day'
  if (viewMode.value === 'week') return 'Next week'
  return 'Next month'
})

function visitDatePart(v: FamilyPortalVisit) {
  return String(v.date || '').split('T')[0] ?? ''
}

const periodVisits = computed(() => {
  if (viewMode.value === 'day') {
    return monthVisits.value.filter(v => visitDatePart(v) === selectedDateStr.value)
  }
  if (viewMode.value === 'week') {
    const { from, to } = weekRange.value
    return monthVisits.value.filter((v) => {
      const d = visitDatePart(v)
      return d >= from && d <= to
    })
  }
  return monthVisits.value.filter((v) => {
    const d = visitDatePart(v)
    if (!d) return false
    const parts = d.split('-').map(Number)
    return parts[0] === currentYear.value && parts[1] === currentMonth.value + 1
  })
})

const dayVisits = computed(() =>
  monthVisits.value
    .filter(v => visitDatePart(v) === selectedDateStr.value)
    .slice()
    .sort((a, b) => (a.start || '').localeCompare(b.start || '')),
)

const visitDates = computed(() => {
  const set = new Set<number>()
  for (const v of monthVisits.value) {
    const d = visitDatePart(v)
    const parts = d.split('-').map(Number)
    if (parts[0] === currentYear.value && parts[1] === currentMonth.value + 1 && parts[2]) {
      set.add(parts[2])
    }
  }
  return set
})

const weekDays = computed(() => {
  const mon = weekMonday.value
  const today = toDateStr(new Date())
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    const dateStr = toDateStr(d)
    const visits = monthVisits.value
      .filter(v => visitDatePart(v) === dateStr)
      .slice()
      .sort((a, b) => (a.start || '').localeCompare(b.start || ''))
    days.push({
      dateStr,
      dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: dateStr === today,
      isWeekend: i >= 5,
      visits,
      visibleVisits: visits.slice(0, MAX_VISIBLE_VISITS),
      extraCount: Math.max(0, visits.length - MAX_VISIBLE_VISITS),
    })
  }
  return days
})

const statusChips = computed(() => [
  {
    key: 'completed',
    label: 'completed',
    count: periodVisits.value.filter(v => v.status === 'completed' || v.status === 'reviewed').length,
    dot: 'bg-emerald-500',
  },
  {
    key: 'scheduled',
    label: 'scheduled',
    count: periodVisits.value.filter(v => !v.status || v.status === 'scheduled' || v.status === 'confirmed').length,
    dot: 'bg-sky-500',
  },
  {
    key: 'in_progress',
    label: 'in progress',
    count: periodVisits.value.filter(v => v.status === 'in_progress').length,
    dot: 'bg-amber-500',
  },
])

function goPrev() {
  const d = new Date(anchorDate.value)
  if (viewMode.value === 'day') d.setDate(d.getDate() - 1)
  else if (viewMode.value === 'week') d.setDate(d.getDate() - 7)
  else d.setMonth(d.getMonth() - 1)
  anchorDate.value = d
}

function goNext() {
  const d = new Date(anchorDate.value)
  if (viewMode.value === 'day') d.setDate(d.getDate() + 1)
  else if (viewMode.value === 'week') d.setDate(d.getDate() + 7)
  else d.setMonth(d.getMonth() + 1)
  anchorDate.value = d
}

function goToday() {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  anchorDate.value = t
}

function openDay(dateStr: string) {
  anchorDate.value = parseDateStr(dateStr)
  viewMode.value = 'day'
}

function onMonthDaySelect(day: number) {
  anchorDate.value = new Date(currentYear.value, currentMonth.value, day)
}

function onVisitClick(v: FamilyPortalVisit) {
  if (!v.id) return
  openVisit(v.id, v)
  void router.replace({ query: { ...route.query, visit: v.id } })
}

function visitTooltip(visit: FamilyPortalVisit) {
  return formatTimeRange(visit.start, visit.end) || 'Visit'
}

function visitAriaLabel(visit: FamilyPortalVisit) {
  const time = formatTimeRange(visit.start, visit.end)
  return time ? `Visit ${time}, ${visit.status}` : `Visit, ${visit.status}`
}

function visitPillClass(status?: string) {
  switch (status) {
    case 'completed':
    case 'reviewed':
      return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
    case 'in_progress':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
    case 'cancelled':
    case 'missed':
      return 'bg-rose-100 text-rose-900 opacity-70 dark:bg-rose-950/40 dark:text-rose-200'
    case 'confirmed':
    case 'scheduled':
      return 'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200'
    default:
      return 'bg-teal-100 text-teal-900 dark:bg-teal-950/50 dark:text-teal-200'
  }
}

function visitDotClass(status?: string) {
  switch (status) {
    case 'completed':
    case 'reviewed':
      return 'bg-emerald-500'
    case 'in_progress':
      return 'bg-amber-500'
    case 'cancelled':
    case 'missed':
      return 'bg-rose-500'
    case 'confirmed':
    case 'scheduled':
      return 'bg-sky-500'
    default:
      return 'bg-teal-500'
  }
}

async function loadSchedule() {
  if (!token.value) {
    monthVisits.value = []
    return
  }
  scheduleLoading.value = true
  try {
    const monthsNeeded = new Map<string, { y: number; m: number }>()
    if (viewMode.value === 'week') {
      const mon = weekMonday.value
      for (let i = 0; i < 7; i++) {
        const d = new Date(mon)
        d.setDate(mon.getDate() + i)
        monthsNeeded.set(`${d.getFullYear()}-${d.getMonth()}`, { y: d.getFullYear(), m: d.getMonth() })
      }
    } else {
      monthsNeeded.set(`${currentYear.value}-${currentMonth.value}`, {
        y: currentYear.value,
        m: currentMonth.value,
      })
    }

    const chunks = await Promise.all(
      [...monthsNeeded.values()].map(({ y, m }) =>
        resources.fetchScheduleMonth(y, m).catch(() => [] as FamilyPortalVisit[]),
      ),
    )
    const byKey = new Map<string, FamilyPortalVisit>()
    for (const list of chunks) {
      for (const v of list) {
        byKey.set(v.id || `${visitDatePart(v)}-${v.start || ''}`, v)
      }
    }
    if (byKey.size > 0) {
      monthVisits.value = [...byKey.values()]
      return
    }
  } catch {
    // fallback
  } finally {
    scheduleLoading.value = false
  }

  // Prefer cached bootstrap visits — do not force-refetch bootstrap.
  if (!portalData.value?.valid) await fetchPortal()
  const merged: FamilyPortalVisit[] = []
  for (const v of portalData.value?.upcomingVisits || []) merged.push(v as FamilyPortalVisit)
  for (const v of portalData.value?.recentVisits || []) merged.push(v as FamilyPortalVisit)
  monthVisits.value = merged
}

function applyQuery() {
  const v = route.query.view
  if (v === 'day' || v === 'week' || v === 'month') viewMode.value = v
  const visitQ = route.query.visit
  if (typeof visitQ === 'string' && visitQ) {
    openVisit(visitQ)
  }
}

watch([anchorDate, viewMode], () => {
  void loadSchedule()
})

watch(
  () => visitDetail.open.value,
  (isOpen) => {
    if (!isOpen && route.query.visit) {
      const q = { ...route.query }
      delete q.visit
      void router.replace({ query: q })
    }
  },
)

onMounted(async () => {
  applyQuery()
  if (token.value && !portalData.value?.valid) await fetchPortal()
  await loadSchedule()
})

onBeforeUnmount(() => {
  // keep dialog state if navigating away with deep link — close to avoid orphan
  if (!route.path.startsWith('/calendar')) closeVisitDetail()
})
</script>
