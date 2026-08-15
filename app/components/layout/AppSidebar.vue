<script setup lang="ts">
import {
  PanelLeftClose as LucidePanelLeftClose,
  PanelLeftOpen as LucidePanelLeftOpen,
  LogOut as LucideLogOut,
  X as LucideX,
} from 'lucide-vue-next'
import { PORTAL_NAV, isPortalNavActive, type PortalNavItem } from '~/components/layout/portalNav'

/**
 * The portal's navigation, in both of its forms: a persistent rail/panel from
 * `md` up, and a drawer below it — deliberately the same shape as the
 * dashboard's `layout/AppSidebar.vue`, down to the `--layout-sidebar-width`
 * variable, the collapsed/expanded treatment and the active-link colours.
 *
 * It is NOT a copy of that component. The dashboard sidebar carries role
 * filtering, badges, a trial card and a contextual client sub-nav, none of
 * which mean anything to a family member. This renders one flat list, twice.
 *
 * The drawer replaced a horizontally-scrolling pill header. On a 390px phone
 * that header put seven destinations behind a sideways scroll with no
 * affordance saying so, and dropped Home entirely — so the way back to the
 * overview was to tap the logo, which nothing said. A drawer shows every
 * destination at full width, at a 44px touch target, in the order the rail
 * uses.
 */
const route = useRoute()
const { t } = useI18n()
const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = usePortalSidebar()
const { portalData, clearSession } = usePortalAuth()

const memberName = computed(() => portalData.value?.familyMember?.name || '')

/** A tap on a destination should also put the drawer away. */
watch(() => route.path, () => closeMobile())

/**
 * Mirrors AppSidebar.navLinkClass in the dashboard: white-on-tint in the rail,
 * luna when expanded. `forceExpanded` is what the drawer passes — it is a
 * desktop-width panel on a phone, never the 4rem rail.
 */
function navLinkClass(active: boolean, forceExpanded = false) {
  const rail = collapsed.value && !forceExpanded
  return [
    'relative flex items-center rounded-lg transition-colors',
    rail ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
    rail
      ? (active
          ? 'text-white bg-white/15'
          : 'text-white/75 hover:text-white hover:bg-white/10')
      : (active
          ? 'text-luna-600 dark:text-luna-300 bg-luna-500/[0.1]'
          : 'text-foreground/75 hover:text-foreground hover:bg-foreground/[0.06]'),
  ]
}

function itemClass(item: PortalNavItem, forceExpanded = false) {
  return navLinkClass(isPortalNavActive(item, route.path), forceExpanded)
}

async function signOut() {
  closeMobile()
  clearSession()
  await navigateTo('/login')
}
</script>

<template>
  <aside
    class="portal-sidebar relative z-40 hidden md:flex flex-col shrink-0 h-dvh transition-[width,background-color,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
    :class="collapsed
      ? 'border-r-0 bg-transparent text-white'
      : 'border-r border-border/50 bg-muted/30 dark:bg-muted/20'"
    :style="{ width: 'var(--layout-sidebar-width)' }"
    :aria-label="t('nav.sectionFamilyPortal')"
  >
    <div
      class="flex items-center h-14 px-3 shrink-0"
      :class="collapsed ? 'justify-center' : 'gap-2'"
    >
      <NuxtLink
        to="/"
        class="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="collapsed ? 'justify-center' : 'min-w-0 flex-1'"
        :aria-label="t('portal.home')"
      >
        <!-- Labelled by the link, so the mark itself is left unnamed. -->
        <CarerpointLogo :size="32" class="shrink-0" aria-label="" />
        <span
          v-if="!collapsed"
          class="text-base font-bold tracking-tight truncate"
        >{{ t('brand.name') }}</span>
      </NuxtLink>
    </div>

    <nav class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-0.5">
      <p
        v-if="!collapsed"
        class="px-3 pt-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
      >
        {{ t('nav.sectionFamilyPortal') }}
      </p>
      <NuxtLink
        v-for="item in PORTAL_NAV"
        :key="item.to"
        :to="item.to"
        :aria-label="t(item.labelKey)"
        :aria-current="isPortalNavActive(item, route.path) ? 'page' : undefined"
        :class="itemClass(item)"
      >
        <span class="relative grid size-5 shrink-0 place-items-center">
          <component
            :is="item.icon"
            :size="20"
            class="size-5 block"
          />
        </span>
        <span
          v-show="!collapsed"
          class="truncate flex-1 text-sm font-medium leading-5"
        >{{ t(item.labelKey) }}</span>
      </NuxtLink>
    </nav>

    <div
      class="shrink-0 px-2 py-2 space-y-0.5 border-t"
      :class="collapsed ? 'border-white/15' : 'border-border/50'"
    >
      <p
        v-if="!collapsed && memberName"
        class="px-3 pb-1 text-xs text-muted-foreground truncate"
      >
        {{ t('nav.signedInAs', { name: memberName }) }}
      </p>

      <LayoutNavButton
        :class="[navLinkClass(false), 'w-full']"
        :aria-label="t('nav.signOut')"
        @click="signOut"
      >
        <span class="relative grid size-5 shrink-0 place-items-center">
          <LucideLogOut :size="20" class="size-5 block" />
        </span>
        <span
          v-show="!collapsed"
          class="truncate flex-1 text-sm font-medium leading-5 text-left"
        >{{ t('nav.signOut') }}</span>
      </LayoutNavButton>

      <LayoutNavButton
        :class="[navLinkClass(false), 'w-full']"
        :aria-label="collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')"
        :aria-expanded="!collapsed"
        @click="toggleCollapsed"
      >
        <span class="relative grid size-5 shrink-0 place-items-center">
          <component
            :is="collapsed ? LucidePanelLeftOpen : LucidePanelLeftClose"
            :size="20"
            class="size-5 block"
          />
        </span>
        <span
          v-show="!collapsed"
          class="truncate flex-1 text-sm font-medium leading-5 text-left"
        >{{ t('nav.collapse') }}</span>
      </LayoutNavButton>
    </div>
  </aside>

  <!-- Mobile drawer -->
  <Teleport to="body">
    <div
      v-if="mobileOpen"
      class="md:hidden fixed inset-0 z-50 flex"
    >
      <button
        type="button"
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        :aria-label="t('nav.closeNavigation')"
        @click="closeMobile"
      />
      <aside
        class="relative z-10 flex flex-col w-[min(18rem,88vw)] h-full bg-background border-r border-border shadow-xl"
        :aria-label="t('nav.sectionFamilyPortal')"
      >
        <div class="flex items-center gap-2 h-14 px-3 shrink-0 border-b border-border/50">
          <NuxtLink
            to="/"
            class="flex items-center gap-2.5 min-w-0 flex-1"
            :aria-label="t('portal.home')"
            @click="closeMobile"
          >
            <CarerpointLogo :size="32" class="shrink-0" aria-label="" />
            <span class="text-base font-bold tracking-tight truncate">{{ t('brand.name') }}</span>
          </NuxtLink>
          <LayoutNavButton
            class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
            :aria-label="t('nav.closeNavigation')"
            @click="closeMobile"
          >
            <LucideX class="w-5 h-5" />
          </LayoutNavButton>
        </div>

        <nav class="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          <p class="px-3 pt-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {{ t('nav.sectionFamilyPortal') }}
          </p>
          <NuxtLink
            v-for="item in PORTAL_NAV"
            :key="item.to"
            :to="item.to"
            :aria-current="isPortalNavActive(item, route.path) ? 'page' : undefined"
            :class="itemClass(item, true)"
            @click="closeMobile"
          >
            <span class="grid size-5 shrink-0 place-items-center">
              <component :is="item.icon" :size="20" class="size-5 block" />
            </span>
            <span class="text-sm font-medium leading-5">{{ t(item.labelKey) }}</span>
          </NuxtLink>
        </nav>

        <div class="shrink-0 px-2 py-2 border-t border-border/50 space-y-0.5">
          <p
            v-if="memberName"
            class="px-3 pb-1 text-xs text-muted-foreground truncate"
          >
            {{ t('nav.signedInAs', { name: memberName }) }}
          </p>
          <LayoutNavButton
            :class="[navLinkClass(false, true), 'w-full']"
            :aria-label="t('nav.signOut')"
            @click="signOut"
          >
            <span class="grid size-5 shrink-0 place-items-center">
              <LucideLogOut :size="20" class="size-5 block" />
            </span>
            <span class="text-sm font-medium leading-5 text-left">{{ t('nav.signOut') }}</span>
          </LayoutNavButton>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
