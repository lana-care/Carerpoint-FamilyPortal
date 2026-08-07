<script setup lang="ts">
import {
  Home as LucideHome,
  CalendarDays as LucideCalendarDays,
  MessagesSquare as LucideMessagesSquare,
  ClipboardList as LucideClipboardList,
  Pill as LucidePill,
  FolderClosed as LucideFolderClosed,
  Star as LucideStar,
  PanelLeftClose as LucidePanelLeftClose,
  PanelLeftOpen as LucidePanelLeftOpen,
  LogOut as LucideLogOut,
} from 'lucide-vue-next'

/**
 * Desktop rail, deliberately the same shape as the dashboard's AppSidebar:
 * fixed `h-dvh` column, `--layout-sidebar-width` driving the width, the same
 * collapsed/expanded treatment and the same active-link colours.
 *
 * It is NOT a copy of that component. The dashboard sidebar carries role
 * filtering, badges and a contextual client sub-nav, none of which mean
 * anything to a family member. This renders one flat list.
 *
 * Mobile keeps the existing glass-pill header (portal/Header.vue); this is
 * `hidden md:flex`, exactly as the dashboard does it.
 */
const { collapsed, toggleCollapsed } = usePortalSidebar()
const { portalData, clearSession } = usePortalAuth()
const route = useRoute()

const NAV = [
  { to: '/', label: 'Home', icon: LucideHome, exact: true },
  { to: '/calendar', label: 'Calendar', icon: LucideCalendarDays },
  { to: '/messages', label: 'Messages', icon: LucideMessagesSquare },
  { to: '/care-plan', label: 'Care plan', icon: LucideClipboardList },
  { to: '/medications', label: 'Medications', icon: LucidePill },
  { to: '/documents', label: 'Documents', icon: LucideFolderClosed },
  { to: '/feedback', label: 'Feedback', icon: LucideStar },
] as const

function isActive(item: { to: string, exact?: boolean }) {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

/** Mirrors AppSidebar.navLinkClass: white-on-tint in the rail, luna when expanded. */
function navLinkClass(item: { to: string, exact?: boolean }) {
  const active = isActive(item)
  const rail = collapsed.value
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

async function signOut() {
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
    aria-label="Family portal navigation"
  >
    <div
      class="flex items-center h-14 px-3 shrink-0"
      :class="collapsed ? 'justify-center' : 'gap-2'"
    >
      <NuxtLink
        to="/"
        class="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="collapsed ? 'justify-center' : 'min-w-0 flex-1'"
        aria-label="Carerpoint Family Portal home"
      >
        <img
          src="/icon.png"
          alt=""
          class="size-8 w-8 h-8 max-w-8 max-h-8 object-contain rounded-lg shrink-0"
          width="32"
          height="32"
        >
        <span
          v-if="!collapsed"
          class="text-base font-bold tracking-tight truncate"
        >Carerpoint</span>
      </NuxtLink>
    </div>

    <nav class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-0.5">
      <p
        v-if="!collapsed"
        class="px-3 pt-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
      >
        Family portal
      </p>
      <NuxtLink
        v-for="item in NAV"
        :key="item.to"
        :to="item.to"
        :aria-label="item.label"
        :aria-current="isActive(item) ? 'page' : undefined"
        :class="navLinkClass(item)"
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
        >{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div
      class="shrink-0 px-2 py-2 space-y-0.5 border-t"
      :class="collapsed ? 'border-white/15' : 'border-border/50'"
    >
      <p
        v-if="!collapsed && portalData?.familyMember?.name"
        class="px-3 pb-1 text-xs text-muted-foreground truncate"
      >
        Signed in as {{ portalData.familyMember.name }}
      </p>

      <button
        type="button"
        :class="navLinkClass({ to: '__signout' })"
        class="w-full"
        :aria-label="'Sign out'"
        @click="signOut"
      >
        <span class="relative grid size-5 shrink-0 place-items-center">
          <LucideLogOut :size="20" class="size-5 block" />
        </span>
        <span
          v-show="!collapsed"
          class="truncate flex-1 text-sm font-medium leading-5 text-left"
        >Sign out</span>
      </button>

      <button
        type="button"
        :class="navLinkClass({ to: '__collapse' })"
        class="w-full"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
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
        >Collapse</span>
      </button>
    </div>
  </aside>
</template>
