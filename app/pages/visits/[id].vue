<template>
  <div class="relative">
    <div class="max-w-3xl mx-auto px-4 py-6">
      <SharedVisitDetailContent
        v-if="visitId"
        :visit-id="visitId"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'Visit detail' })

const route = useRoute()
const visitId = computed(() => String(route.params.id || ''))
</script>
