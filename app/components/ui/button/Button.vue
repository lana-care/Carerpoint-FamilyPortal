<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Primitive, type PrimitiveProps } from 'reka-ui'
import { Loader2 } from 'lucide-vue-next'
import { type ButtonVariants, buttonVariants } from '.'
import { cn } from '~/lib/utils'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  /** Show a spinner, set aria-busy, and block interaction while a task runs. */
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  loading: false,
})

const isDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :disabled="isDisabled || undefined"
    :aria-busy="loading || undefined"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <Loader2 v-if="loading" class="animate-spin" aria-hidden="true" />
    <slot />
  </Primitive>
</template>
