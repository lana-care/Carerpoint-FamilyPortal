<template>
  <div class="relative min-h-screen bg-background">
    <SharedShellBackground intensity="soft" />
    <NuxtPage />
    <ClientOnly>
      <Toaster position="top-center" rich-colors />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'

const colorMode = useCookie('luna_color_mode')

function applyTheme() {
  const prefer = colorMode.value
  if (prefer === 'dark' || (!prefer && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

onMounted(() => {
  applyTheme()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!colorMode.value) applyTheme()
  })
})
</script>
