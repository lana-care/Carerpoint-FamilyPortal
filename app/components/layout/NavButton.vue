<template>
  <button type="button" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: true })
</script>
