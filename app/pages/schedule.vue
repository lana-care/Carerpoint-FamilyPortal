<script setup lang="ts">
/**
 * Schedule is demoted — Calendar owns Day/Week/Month + upcoming visits.
 * Keep this route as a redirect for old bookmarks / quick links.
 */
await navigateTo({ path: '/calendar', query: { view: 'week' } }, { replace: true })
</script>

<template>
  <div />
</template>
