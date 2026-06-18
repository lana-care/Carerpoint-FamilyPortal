<template>
  <div :class="['pointer-events-none fixed inset-0 -z-10 overflow-hidden', wrapperClass]">
    <div class="aurora-bg" :style="{ opacity: intensityOpacity }" />
    <div ref="gridRef" class="beam-grid-wrap text-foreground">
      <div class="beam-grid" />
      <div v-if="interactive" class="beam-grid-spotlight" />
      <div v-if="interactive" class="beam-grid-halo" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  intensity?: 'soft' | 'normal' | 'strong'
  wrapperClass?: string
  interactive?: boolean
}>(), {
  intensity: 'soft',
  wrapperClass: '',
  interactive: true,
})

const intensityOpacity = computed(() => {
  if (props.intensity === 'soft') return 0.45
  if (props.intensity === 'strong') return 0.85
  return 0.65
})

const gridRef = ref<HTMLElement | null>(null)
let rafId: number | null = null
let pendingX = 0
let pendingY = 0

const onMove = (e: MouseEvent) => {
  const el = gridRef.value
  if (!el) return
  const r = el.getBoundingClientRect()
  pendingX = e.clientX - r.left
  pendingY = e.clientY - r.top
  if (rafId !== null) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    el.style.setProperty('--mouse-x', `${pendingX}px`)
    el.style.setProperty('--mouse-y', `${pendingY}px`)
  })
}

onMounted(() => {
  if (!props.interactive) return
  window.addEventListener('mousemove', onMove, { passive: true })
})

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  window.removeEventListener('mousemove', onMove)
})
</script>
