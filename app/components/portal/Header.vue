<script setup lang="ts">
import { Heart as LucideHeart } from 'lucide-vue-next'
import { Separator } from '~/components/ui/separator'

/**
 * The one header for the portal, mounted by `layouts/default.vue`.
 *
 * Before this, all nine pages carried their own `<header>` — the home page a
 * rich glass-pill with the nav, the other eight a copy-pasted glass-bar with a
 * back link. Adding anything to the chrome (the theme toggle being the first
 * case) meant nine edits, so it lives here now.
 *
 * Two variants, keyed on the route rather than a prop, because there is exactly
 * one home. Sub-pages take their title from `definePageMeta({ title })`.
 *
 * Strings are hardcoded English on purpose: `@nuxtjs/i18n` is a dependency of
 * this app but is NOT registered in `nuxt.config.ts`, so `useI18n` does not
 * exist here and `app/locales/*.json` are dead. Wiring i18n up is its own job —
 * see the note in CLAUDE.md.
 */
const route = useRoute()
const { portalData } = usePortalAuth()
const { colorMode, setColorMode } = useColorMode()

const isHome = computed(() => route.path === '/')
const pageTitle = computed(() => (route.meta.title as string | undefined) ?? '')

const NAV = [
  { to: '/schedule', label: 'Schedule' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/messages', label: 'Messages' },
  { to: '/care-plan', label: 'Care plan' },
  { to: '/medications', label: 'Medications' },
  { to: '/documents', label: 'Documents' },
  { to: '/feedback', label: 'Feedback' },
]
</script>

<template>
  <!-- Home: rich glass-pill with branding and the full nav. -->
  <header v-if="isHome" class="sticky top-0 z-10 px-3 sm:px-6 pt-3 pb-2">
    <div
      class="glass-pill max-w-5xl mx-auto shadow-[0_8px_30px_-12px_rgba(8,26,56,0.18)] dark:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.45)]"
    >
      <div class="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <LucideHeart class="w-4 h-4 text-primary" />
          </div>
          <div class="min-w-0">
            <h1 class="text-sm font-bold tracking-tight">Carerpoint Family Portal</h1>
            <p v-if="portalData?.familyMember" class="text-[10px] text-muted-foreground truncate">
              Welcome, {{ portalData.familyMember.name || 'Family Member' }}
            </p>
          </div>
        </div>
        <template v-if="portalData?.valid">
          <Separator class="hidden sm:block h-6 shrink-0" orientation="vertical" />
          <nav class="flex flex-wrap items-center gap-1 text-xs font-medium">
            <NuxtLink
              v-for="item in NAV"
              :key="item.to"
              :to="item.to"
              class="px-3 py-1.5 rounded-full text-foreground/75 hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
            >
              {{ item.label }}
            </NuxtLink>
            <ThemeToggle
              size="sm"
              class="ml-1"
              aria-label="Toggle theme"
              to-dark-label="Switch to dark theme"
              to-light-label="Switch to light theme"
              :model-value="colorMode"
              @update:model-value="setColorMode"
            />
          </nav>
        </template>
        <!-- No valid session yet: still offer the toggle, it needs no data. -->
        <ThemeToggle
          v-else
          size="sm"
          aria-label="Toggle theme"
          to-dark-label="Switch to dark theme"
          to-light-label="Switch to light theme"
          :model-value="colorMode"
          @update:model-value="setColorMode"
        />
      </div>
    </div>
  </header>

  <!-- Sub-pages: the flat glass bar, back link, title, toggle pinned right. -->
  <header
    v-else
    class="glass-bar border-b border-border/60 px-4 py-3 flex items-center gap-3 sticky top-0 z-10"
  >
    <NuxtLink to="/" class="text-sm text-primary">← Home</NuxtLink>
    <h1 class="text-sm font-semibold">{{ pageTitle }}</h1>
    <ThemeToggle
      size="sm"
      class="ml-auto"
      aria-label="Toggle theme"
      to-dark-label="Switch to dark theme"
      to-light-label="Switch to light theme"
      :model-value="colorMode"
      @update:model-value="setColorMode"
    />
  </header>
</template>
