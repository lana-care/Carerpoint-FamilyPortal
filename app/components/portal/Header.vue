<script setup lang="ts">
import { Separator } from '~/components/ui/separator'

/**
 * The one header for the portal, mounted by `layouts/default.vue`.
 *
 * Persistent glass-pill chrome on every route (not only home) so families
 * never need Home → nav to switch sections. Schedule is demoted — calendar
 * owns that IA; `/schedule` redirects separately.
 *
 * Strings are hardcoded English on purpose: `@nuxtjs/i18n` is a dependency of
 * this app but is NOT registered in `nuxt.config.ts`.
 */
const route = useRoute()
const { portalData } = usePortalAuth()
const { colorMode, setColorMode } = useColorMode()

const pageTitle = computed(() => (route.meta.title as string | undefined) ?? '')
const isHome = computed(() => route.path === '/')

const NAV = [
  { to: '/calendar', label: 'Calendar' },
  { to: '/messages', label: 'Messages' },
  { to: '/care-plan', label: 'Care plan' },
  { to: '/medications', label: 'Medications' },
  { to: '/documents', label: 'Documents' },
  { to: '/feedback', label: 'Feedback' },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <header class="sticky top-0 z-10 px-3 sm:px-6 pt-3 pb-2">
    <div
      class="glass-pill max-w-5xl mx-auto shadow-[0_8px_30px_-12px_rgba(8,26,56,0.18)] dark:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.45)]"
    >
      <div class="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <NuxtLink to="/" class="flex items-center gap-3 min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <img
              src="/icon.png"
              alt="Carerpoint"
              class="size-9 rounded-xl shrink-0"
              width="36"
              height="36"
            >
            <div class="min-w-0">
              <p class="text-sm font-bold tracking-tight truncate">
                {{ isHome ? 'Carerpoint Family Portal' : (pageTitle || 'Family Portal') }}
              </p>
              <p
                v-if="portalData?.familyMember"
                class="text-xs text-muted-foreground truncate"
              >
                Welcome, {{ portalData.familyMember.name || 'Family Member' }}
              </p>
            </div>
          </NuxtLink>
        </div>

        <template v-if="portalData?.valid">
          <Separator class="hidden sm:block h-6 shrink-0" orientation="vertical" />
          <nav
            class="flex items-center gap-1 text-sm font-medium max-w-full overflow-x-auto scrollbar-none -mx-1 px-1"
            aria-label="Family portal"
          >
            <NuxtLink
              v-for="item in NAV"
              :key="item.to"
              :to="item.to"
              class="shrink-0 px-3 py-2.5 min-h-10 rounded-full transition-colors"
              :class="isActive(item.to)
                ? 'bg-luna-500/15 text-luna-700 dark:text-luna-300 font-semibold'
                : 'text-foreground/75 hover:text-foreground hover:bg-foreground/[0.06]'"
              :aria-current="isActive(item.to) ? 'page' : undefined"
            >
              {{ item.label }}
            </NuxtLink>
            <ThemeToggle
              size="sm"
              class="ml-1 shrink-0"
              aria-label="Toggle theme"
              to-dark-label="Switch to dark theme"
              to-light-label="Switch to light theme"
              :model-value="colorMode"
              @update:model-value="setColorMode"
            />
          </nav>
        </template>
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
</template>
