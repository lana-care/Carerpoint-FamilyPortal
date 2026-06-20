<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, type DialogContentEmits, type DialogContentProps, useForwardPropsEmits } from 'reka-ui'
import { X } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

interface Props extends DialogContentProps {
  class?: HTMLAttributes['class']
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full'
  /** When true, overlay is invisible and does not block clicks (e.g. for slide-over panels). */
  noOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
})

const emits = defineEmits<DialogContentEmits>()
const forwarded = useForwardPropsEmits(props, emits)

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  default: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
}

const panelClasses = computed(() => cn(
  'surface-overlay hairline-border relative grid w-full gap-4 p-6 rounded-2xl sm:rounded-3xl outline-none',
  'max-h-[min(85dvh,calc(100vh-2rem))] overflow-y-auto',
  sizeClasses[props.size || 'default'],
  props.class,
))

function handlePointerDownOutside(event: CustomEvent) {
  const originalEvent = event.detail.originalEvent as PointerEvent
  const target = originalEvent.target as HTMLElement
  if (originalEvent.offsetX > target.clientWidth || originalEvent.offsetY > target.clientHeight) {
    event.preventDefault()
  }
}
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      :class="cn(
        'dialog-scrim fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        props.noOverlay ? 'pointer-events-none invisible' : '',
      )"
    />
    <DialogContent
      v-if="props.noOverlay"
      v-bind="forwarded"
      :class="cn(
        'surface-overlay hairline-border fixed z-50 grid w-full max-w-[calc(100%-2rem)] gap-4 p-6 duration-200 rounded-2xl sm:rounded-3xl outline-none',
        'max-h-[85dvh] overflow-y-auto',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        sizeClasses[props.size || 'default'],
        props.class,
      )"
      @pointer-down-outside="handlePointerDownOutside"
    >
      <slot />
      <DialogClose
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
    <DialogContent
      v-else
      v-bind="forwarded"
      :class="cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none',
        'bg-transparent border-0 shadow-none outline-none overflow-y-auto',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      )"
      @pointer-down-outside="handlePointerDownOutside"
    >
      <div :class="cn(panelClasses, 'pointer-events-auto')">
        <slot />
        <DialogClose
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </DialogClose>
      </div>
    </DialogContent>
  </DialogPortal>
</template>
