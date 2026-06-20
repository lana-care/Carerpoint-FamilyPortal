<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ref } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  /** `ghost` = seamless/borderless (search bars, chat composers); consumer supplies bg/rounding. */
  variant?: 'default' | 'ghost'
  class?: HTMLAttributes['class']
}>(), {
  variant: 'default',
})

const emits = defineEmits<{
  'update:modelValue': [payload: string | number]
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const base = 'flex h-10 w-full px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
const variants = {
  default: 'rounded-xl border border-input/80 bg-background/80 backdrop-blur-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-luna-400/40 transition-colors',
  ghost: 'bg-transparent',
}

// Expose focus() so callers that previously held a raw <input> ref keep working.
const el = ref<HTMLInputElement | null>(null)
defineExpose({
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
  el,
})
</script>

<template>
  <input
    ref="el"
    v-model="modelValue"
    :class="cn(base, variants[props.variant], props.class)"
  >
</template>
