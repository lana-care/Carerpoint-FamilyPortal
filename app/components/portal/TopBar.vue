<script setup lang="ts">
/**
 * Desktop counterpart to the dashboard's PageToolbar: the thin bar above the
 * page scroller holding the page title and the theme toggle.
 *
 * The mobile glass-pill header (portal/Header.vue) still carries both on small
 * screens, so this is `hidden md:flex` and the two never show at once.
 *
 * Title comes from `definePageMeta({ title })`, which is resolved by the router
 * before render — unlike the dashboard's `useState` toolbar title, so there is
 * no SSR/hydration gate to worry about here.
 */
const route = useRoute()
const { portalData } = usePortalAuth()
const { colorMode, setColorMode } = useColorMode()

const pageTitle = computed(() => (route.meta.title as string | undefined) || 'Family Portal')
const memberName = computed(() => portalData.value?.familyMember?.name || '')
</script>

<template>
  <div
    class="hidden md:flex items-center shrink-0 gap-2 px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm min-h-14 py-1.5"
  >
    <div class="min-w-0 flex-1">
      <h1 class="truncate text-base sm:text-lg font-bold text-foreground tracking-tight leading-tight">
        {{ pageTitle }}
      </h1>
      <p
        v-if="memberName"
        class="truncate text-xs text-muted-foreground leading-snug mt-0.5"
      >
        Welcome, {{ memberName }}
      </p>
    </div>

    <ThemeToggle
      size="sm"
      class="shrink-0"
      aria-label="Toggle theme"
      to-dark-label="Switch to dark theme"
      to-light-label="Switch to light theme"
      :model-value="colorMode"
      @update:model-value="setColorMode"
    />
  </div>
</template>
