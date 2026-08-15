<script setup lang="ts">
import { Menu as LucideMenu } from 'lucide-vue-next'
import ThemeToggle from '@lana-care/ui/components/theme-toggle/ThemeToggle.vue'

/**
 * The bar above the page scroller: page title, and the two controls that have
 * to be reachable from every route — the drawer trigger (phones) and the theme
 * toggle.
 *
 * Same component and same role as the dashboard's `layout/PageToolbar.vue`,
 * including the `md:hidden` burger. It replaced a split where a glass-pill
 * header owned mobile and a separate bar owned desktop: two components, two
 * copies of the nav, and a title that only existed on one of them.
 *
 * Title comes from `definePageMeta`, resolved by the router before render — so
 * unlike the dashboard's `useState` title there is no SSR/hydration gate here.
 * Pages state a `titleKey` and it is translated; `title` stays supported for a
 * page whose heading is data rather than a phrase.
 */
const route = useRoute()
const { t } = useI18n()
const { portalData } = usePortalAuth()
const { openMobile } = usePortalSidebar()
const { colorMode, setColorMode } = useColorMode()

const pageTitle = computed(() => {
  const key = route.meta.titleKey as string | undefined
  if (key) return t(key)
  return (route.meta.title as string | undefined) || t('portal.title')
})
const memberName = computed(() => portalData.value?.familyMember?.name || '')
</script>

<template>
  <div
    class="page-toolbar flex items-center shrink-0 gap-2 px-3 sm:px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm min-h-14 py-1.5"
  >
    <!-- Mobile: open nav drawer. 44px square — it is the only way to the nav on
         a phone, and `p-2` around a 20px icon made it 36. -->
    <LayoutNavButton
      class="md:hidden inline-flex size-11 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0"
      :aria-label="t('nav.openNavigation')"
      @click="openMobile"
    >
      <LucideMenu class="w-5 h-5" />
    </LayoutNavButton>

    <div class="min-w-0 flex-1">
      <h1 class="truncate text-base sm:text-lg font-bold text-foreground tracking-tight leading-tight">
        {{ pageTitle }}
      </h1>
      <p
        v-if="memberName"
        class="truncate text-xs text-muted-foreground leading-snug mt-0.5"
      >
        {{ t('portal.welcome', { name: memberName }) }}
      </p>
    </div>

    <!-- `lg` is 40px. `sm` is 32, which is a small thing to hit on a phone and
         this bar is the only place the toggle lives. -->
    <ThemeToggle
      size="lg"
      class="shrink-0"
      :aria-label="t('theme.toggle')"
      :to-dark-label="t('theme.toDark')"
      :to-light-label="t('theme.toLight')"
      :model-value="colorMode"
      @update:model-value="setColorMode"
    />
  </div>
</template>
