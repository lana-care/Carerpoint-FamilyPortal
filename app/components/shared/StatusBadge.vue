<template>
  <Badge :variant="variant" :class="['text-[10px] whitespace-nowrap', colorClass, props.class]">
    {{ displayLabel }}
  </Badge>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Badge } from '~/components/ui/badge'
import { formatSlug } from '~/utils/formatSlug'

const props = withDefaults(defineProps<{
  status: string
  label?: string
  class?: HTMLAttributes['class']
}>(), {})

type StatusKind = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const STATUS_MAP: Record<string, StatusKind> = {
  // success
  active: 'success',
  approved: 'success',
  completed: 'success',
  reviewed: 'success',
  paid: 'success',
  resolved: 'success',
  signed: 'success',
  given: 'success',
  checked_in: 'success',
  // warning
  draft: 'warning',
  pending: 'warning',
  invited: 'warning',
  in_review: 'warning',
  partial: 'warning',
  self_administered: 'warning',
  awaiting_checkin: 'warning',
  awaiting_checkouts: 'warning',
  // danger
  cancelled: 'danger',
  denied: 'danger',
  rejected: 'danger',
  failed: 'danger',
  expired: 'danger',
  suspended: 'danger',
  blocked: 'danger',
  overdue: 'danger',
  refused: 'danger',
  not_given: 'danger',
  missed: 'danger',
  // info (in-flight / actionable states)
  new: 'info',
  open: 'info',
  confirmed: 'info',
  in_progress: 'info',
  en_route: 'info',
  checked_out: 'info',
  // neutral (passive / not-yet-started / terminal-inactive states)
  scheduled: 'neutral',
  uncompleted: 'neutral',
  incomplete: 'neutral',
  inactive: 'neutral',
  archived: 'neutral',
  superseded: 'neutral',
  closed: 'neutral',
}

const kind = computed<StatusKind>(() => STATUS_MAP[String(props.status).toLowerCase()] || 'neutral')

const variant = computed(() => {
  switch (kind.value) {
    case 'success': return 'default'
    case 'danger': return 'destructive'
    case 'neutral': return 'secondary'
    default: return 'outline'
  }
})

const colorClass = computed(() => {
  switch (kind.value) {
    case 'success':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-transparent'
    case 'warning':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-transparent'
    case 'danger':
      return ''
    case 'info':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-transparent'
    case 'neutral':
    default:
      return ''
  }
})

// Always display a human-friendly label — explicit `label` wins, otherwise
// the status slug is normalised via formatSlug (snake_case / SCREAMING_SNAKE
// → Title Case) so values like `self_administered` or `SELF_ADMINISTERED`
// render as "Self Administered" instead of leaking the raw enum.
const displayLabel = computed(() => props.label ?? formatSlug(props.status))
</script>
