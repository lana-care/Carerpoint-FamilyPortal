<template>
  <component
    :is="tag"
    :to="to && isInternal ? to : undefined"
    :href="!isInternal && to ? to : undefined"
    :type="!to ? type : undefined"
    :class="[
      'btn-pill inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      sizeClass,
      variantClass,
      glow ? 'animate-pulse-soft' : '',
      $attrs.class,
    ]"
    v-bind="rootAttrs"
  >
    <span v-if="$slots.icon" class="-ml-0.5 inline-flex items-center">
      <slot name="icon" />
    </span>
    <slot />
    <span v-if="$slots['icon-trailing']" class="-mr-0.5 inline-flex items-center">
      <slot name="icon-trailing" />
    </span>
  </component>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  to?: string
  variant?: 'primary' | 'glass' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), {
  to: '',
  variant: 'primary',
  size: 'md',
  glow: false,
  type: 'button',
})

const isInternal = computed(() => {
  if (!props.to) return false
  return props.to.startsWith('/') && !props.to.startsWith('//')
})

const tag = computed(() => {
  if (!props.to) return 'button'
  return isInternal.value ? resolveComponent('NuxtLink') : 'a'
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'h-9 px-4 text-sm'
    case 'lg': return 'h-12 px-7 text-base'
    default: return 'h-11 px-6 text-sm'
  }
})

const variantClass = computed(() => {
  switch (props.variant) {
    case 'glass': return 'btn-pill-glass'
    case 'ghost': return 'btn-pill-ghost'
    default: return 'btn-pill-primary'
  }
})

const attrs = useAttrs()
const rootAttrs = computed(() => {
  const { class: _c, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>
