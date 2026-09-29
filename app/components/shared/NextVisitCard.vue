<template>
  <!-- "Next visit": the question relatives ask first. Built from the visits the
       portal already loaded, so it costs no extra request. -->
  <section
    class="glass-card hairline-border rounded-2xl px-5 sm:px-6 py-4 flex flex-wrap items-center gap-x-4 gap-y-3"
    aria-labelledby="next-visit-heading"
  >
    <div class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary">
      <LucideCalendarClock class="w-5 h-5" aria-hidden="true" />
    </div>

    <div class="min-w-0 flex-1">
      <h2
        id="next-visit-heading"
        class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
      >
        {{ t('portalHome.nextVisit.title') }}
      </h2>

      <template v-if="next">
        <p class="text-base font-semibold mt-0.5">
          {{ dayLabel }}<span v-if="timeLabel" class="tabular-nums"> · {{ timeLabel }}</span>
        </p>
        <p v-if="next.carerFirstName" class="text-sm text-muted-foreground">
          {{ t('portalHome.nextVisit.with', { name: next.carerFirstName }) }}
        </p>
      </template>
      <p v-else class="text-sm text-muted-foreground mt-0.5">
        {{ t('portalHome.nextVisit.none') }}
      </p>
    </div>

    <SharedStatusBadge v-if="next" :status="next.status" :label="statusLabel" />

    <NuxtLink
      to="/calendar"
      class="text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline"
    >
      {{ t('portalHome.nextVisit.calendar') }}
      <LucideChevronRight class="w-3 h-3" aria-hidden="true" />
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
import { CalendarClock as LucideCalendarClock, ChevronRight as LucideChevronRight } from 'lucide-vue-next'
import { pickNextVisit, relativeDay, visitStartsAt, type NextVisitLike } from '~/utils/nextVisit'
import { formatTimeRange } from '~/utils/formatTime'

const props = defineProps<{
  visits?: NextVisitLike[] | null
}>()

const { t, te, locale } = useI18n()

const next = computed(() => pickNextVisit(props.visits))

const dayLabel = computed(() => {
  const start = next.value ? visitStartsAt(next.value) : null
  if (!start) return ''
  const rel = relativeDay(start)
  if (rel) return t(`portalHome.nextVisit.${rel}`)
  return start.toLocaleDateString(locale.value || 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
})

const timeLabel = computed(() => (next.value ? formatTimeRange(next.value.start, next.value.end) : ''))

// A translated label for the statuses a relative can see here; anything else
// falls back to the badge's own Title-Cased slug rather than a raw enum.
const statusLabel = computed(() => {
  const key = `portalHome.nextVisit.status.${String(next.value?.status ?? '').toLowerCase()}`
  return te(key) ? t(key) : undefined
})
</script>
