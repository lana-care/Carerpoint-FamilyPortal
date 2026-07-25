<template>
  <!--
    First layout in this app. Every page except `/login` (which opts out with
    `definePageMeta({ layout: false })`) now renders inside it, so the header
    exists in exactly one place.

    `min-h-screen` and the background live on the wrapper in `app.vue`, so this
    only owns the header + content stack.
  -->
  <div class="min-h-screen">
    <PortalHeader />
    <slot />
  </div>
</template>
