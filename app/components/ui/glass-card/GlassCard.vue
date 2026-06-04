<template>
  <div
    :class="[
      'glass-card hairline-border relative overflow-hidden',
      radiusClass,
      paddingClass,
      glowClass,
      $attrs.class,
    ]"
    v-bind="rootAttrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  glow?: 'luna' | 'lime' | 'none'
  radius?: 'lg' | 'xl' | '2xl' | '3xl'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}>(), {
  glow: 'none',
  radius: '2xl',
  padding: 'md',
})

const radiusClass = computed(() => {
  switch (props.radius) {
    case 'lg': return 'rounded-xl'
    case 'xl': return 'rounded-2xl'
    case '3xl': return 'rounded-[28px]'
    default: return 'rounded-2xl sm:rounded-3xl'
  }
})

const paddingClass = computed(() => {
  switch (props.padding) {
    case 'none': return ''
    case 'sm': return 'p-4 sm:p-5'
    case 'lg': return 'p-6 sm:p-8'
    default: return 'p-5 sm:p-6'
  }
})

const glowClass = computed(() => {
  if (props.glow === 'luna') return 'glow-luna'
  if (props.glow === 'lime') return 'glow-lime'
  return ''
})

const attrs = useAttrs()
const rootAttrs = computed(() => {
  const { class: _c, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>
