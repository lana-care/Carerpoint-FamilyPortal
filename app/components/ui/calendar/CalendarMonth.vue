<script setup lang="ts">
import { computed } from 'vue'

/**
 * Month grid (shadcn-style) — day numbers with optional visit marks,
 * today ring, and selectable day (for Day/Week/Month portal calendar).
 */
const props = withDefaults(
  defineProps<{
    year: number
    month: number
    /** Day-of-month numbers (1–31) to highlight as having visits */
    markedDays?: Set<number> | number[]
    /** Selected day-of-month (1–31), or null */
    selectedDay?: number | null
    /** Hide the built-in month heading when the parent toolbar already shows it */
    showLabel?: boolean
  }>(),
  {
    markedDays: () => new Set<number>(),
    selectedDay: null,
    showLabel: true,
  },
)

const emit = defineEmits<{
  select: [day: number]
}>()

const marked = computed(() => {
  const m = props.markedDays
  if (m instanceof Set) return m
  return new Set(m)
})

const firstDow = computed(() => {
  const d = new Date(props.year, props.month, 1).getDay()
  return d === 0 ? 6 : d - 1
})

const daysInMonth = computed(() => new Date(props.year, props.month + 1, 0).getDate())

const pad = computed(() => firstDow.value)

const label = computed(() =>
  new Date(props.year, props.month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
)

const today = computed(() => {
  const n = new Date()
  if (n.getFullYear() === props.year && n.getMonth() === props.month) return n.getDate()
  return null
})

function dayClass(d: number) {
  const isMarked = marked.value.has(d)
  const isSelected = props.selectedDay === d
  const isToday = today.value === d
  return [
    isSelected
      ? 'bg-foreground text-background font-semibold shadow-sm'
      : isMarked
        ? 'bg-primary/15 text-foreground font-semibold border border-primary/30'
        : 'text-muted-foreground hover:bg-muted/80',
    isToday && !isSelected ? 'ring-2 ring-luna-500/50 ring-offset-1 ring-offset-background' : '',
  ]
}
</script>

<template>
  <div class="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
    <p v-if="showLabel" class="text-sm font-semibold text-foreground mb-3">{{ label }}</p>
    <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground mb-2">
      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <template v-for="i in pad" :key="'p' + i">
        <div />
      </template>
      <button
        v-for="d in daysInMonth"
        :key="d"
        type="button"
        class="aspect-square flex items-center justify-center rounded-xl text-xs tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="dayClass(d)"
        :aria-pressed="selectedDay === d"
        :aria-label="`Day ${d}`"
        @click="emit('select', d)"
      >
        {{ d }}
      </button>
    </div>
  </div>
</template>
