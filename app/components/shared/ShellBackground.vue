<template>
  <!-- Static ambient backdrop: the two aurora blobs and nothing else. Liquid Glass
       needs something to blur, but app screens stay still and low-contrast so
       text never competes with it (the drift animation is switched off in
       main.css; the interactive beam grid is not used here). -->
  <div :class="['pointer-events-none fixed inset-0 -z-10 overflow-hidden', wrapperClass]" aria-hidden="true">
    <div class="aurora-bg" :style="{ opacity: intensityOpacity }" />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  intensity?: 'soft' | 'normal' | 'strong'
  wrapperClass?: string
}>(), {
  intensity: 'soft',
  wrapperClass: '',
})

const intensityOpacity = computed(() => {
  if (props.intensity === 'soft') return 0.45
  if (props.intensity === 'strong') return 0.85
  return 0.65
})
</script>
