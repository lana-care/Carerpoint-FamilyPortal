<template>
  <div class="relative min-h-screen bg-background">
    <SharedShellBackground intensity="soft" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <Toaster position="top-center" rich-colors />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'

/**
 * Colour mode is resolved on the SERVER from the cookie and written into
 * `htmlAttrs`, so the `.dark` class is in the first-paint HTML. This app used to
 * apply it in `onMounted` while running with `ssr: true`, which meant a
 * guaranteed flash of light theme for every dark-mode visitor. Same approach as
 * Carerpoint-Frontend's app.vue.
 *
 * `useColorMode()` (app/composables/useColorMode.ts) shares this exact `useState`
 * key, so the toggle and this class never disagree.
 */
const persistedMode = useCookie<'light' | 'dark' | null>('luna_color_mode', { sameSite: 'lax' })
const colorMode = useState<'light' | 'dark'>('color-mode', () =>
  persistedMode.value === 'dark' ? 'dark' : 'light',
)

if (persistedMode.value === 'dark' || persistedMode.value === 'light') {
  colorMode.value = persistedMode.value
}

useHead({
  htmlAttrs: {
    class: computed(() => (colorMode.value === 'dark' ? 'dark' : '')),
  },
})

// No cookie yet = no explicit choice, so follow the OS and keep following it.
// The first use of the toggle writes the cookie and ends this.
onMounted(() => {
  if (persistedMode.value) return
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const apply = () => {
    colorMode.value = mq.matches ? 'dark' : 'light'
  }
  apply()
  mq.addEventListener('change', apply)
})
</script>
