<template>
  <!--
    Same app shell as the staff dashboard (Carerpoint-Frontend/app/layouts/default.vue):
    a fixed-height `h-dvh` row, a persistent sidebar, and ONE inner scroller so
    the chrome stays put while only the page content moves.

    This replaced a `min-h-screen` document-flow layout with a floating header.
    Two consequences worth knowing:
      - pages must not set their own full-height/scroll containers; the scroller
        below owns that,
      - the header is now the mobile chrome only (`md:hidden`), because the rail
        replaces it from `md` up.
  -->
  <div
    class="relative h-dvh flex overflow-hidden text-foreground bg-background layout-shell"
    :class="collapsed ? 'layout-shell--rail' : 'layout-shell--expanded'"
    :style="shellStyle"
  >
    <PortalSidebar />

    <div class="relative z-0 flex-1 flex flex-col min-w-0 min-h-0 w-full">
      <div
        class="main-surface flex-1 flex flex-col min-h-0 min-w-0 w-full overflow-hidden bg-background md:border-l md:border-border/60"
      >
        <PortalHeader class="shrink-0 md:hidden" />
        <PortalTopBar />

        <main class="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">
          <div class="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
            <!--
              `min-h-full` (not a `calc(100dvh - …)` guess) so pages that want to
              fill the viewport — messages, with its pinned composer — can just
              say `min-h-full` and stay correct however tall the chrome is. It
              resolves because the scroller above has a definite height, and
              border-box means the padding does not add to it.
            -->
            <div class="w-full min-h-full pb-10">
              <slot />
            </div>
          </div>
        </main>
      </div>
    </div>

    <SharedVisitDetailDialog />
  </div>
</template>

<script setup lang="ts">
const { width: sidebarWidth, collapsed, readPersisted } = usePortalSidebar()

const shellStyle = computed(() => ({
  '--layout-sidebar-width': sidebarWidth.value,
}))

onMounted(() => {
  readPersisted()
})
</script>

<style scoped>
/* Collapsed rail: solid tint behind the icon strip, matching the dashboard. */
.layout-shell--rail {
  background-color: color-mix(in oklab, var(--primary) 72%, #0b1a33);
}

:global(.dark) .layout-shell--rail {
  background-color: color-mix(in oklab, var(--primary) 45%, #050b14);
}
</style>
