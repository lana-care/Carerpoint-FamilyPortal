/**
 * Manual light/dark, deliberately NOT `@nuxtjs/color-mode` (see CLAUDE.md).
 *
 * Ported from Carerpoint-Frontend's composable of the same name so both apps
 * agree on the storage keys — cookie AND localStorage under `luna_color_mode`,
 * cross-tab sync over `BroadcastChannel('luna_theme')`. Before this, the portal
 * only ever *read* the cookie: there was no way to change the theme from here.
 *
 * NOTE: this shadows the `useColorMode` that `@vueuse/nuxt` auto-imports, which
 * is intentional and matches the Frontend. Anything in this app that says
 * `useColorMode()` gets THIS one.
 *
 * The cookie carries no `Domain` attribute, so it is host-only: the preference
 * does not follow the user between the portal and the dashboard. That is the
 * pre-existing behaviour in both apps, left as-is — sharing it would need a
 * deliberate decision about the apex domain.
 */
const COOKIE_KEY = 'luna_color_mode'
const STORAGE_KEY = 'luna_color_mode'

export type ColorMode = 'light' | 'dark'

const readCookie = (name: string): string | null => {
  if (!import.meta.client) return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

const writeCookie = (value: string) => {
  if (!import.meta.client) return
  document.cookie = `${COOKIE_KEY}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}

export const useColorMode = () => {
  // Seeded from the SSR cookie read in app.vue, so the class in the server HTML
  // and this state agree on the first paint (no flash, no mismatch).
  const colorMode = useState<ColorMode>('color-mode', () => 'light')

  const isDark = computed(() => colorMode.value === 'dark')

  const updateDOM = () => {
    if (!import.meta.client) return
    document.documentElement.classList.toggle('dark', colorMode.value === 'dark')
  }

  const persist = () => {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, colorMode.value)
    writeCookie(colorMode.value)
    if ('BroadcastChannel' in window) {
      new BroadcastChannel('luna_theme').postMessage(colorMode.value)
    }
  }

  const setColorMode = (mode: ColorMode) => {
    colorMode.value = mode
    // Synchronous, because <ThemeToggle> starts a view transition around this
    // call and the API snapshots the new state as soon as the flush completes.
    updateDOM()
    persist()
  }

  const toggleColorMode = () => setColorMode(colorMode.value === 'dark' ? 'light' : 'dark')

  const initColorMode = () => {
    if (!import.meta.client) return
    // Priority: shared cookie > localStorage > system preference.
    const cookie = readCookie(COOKIE_KEY) as ColorMode | null
    const stored = localStorage.getItem(STORAGE_KEY) as ColorMode | null
    if (cookie === 'light' || cookie === 'dark') {
      colorMode.value = cookie
    } else if (stored === 'light' || stored === 'dark') {
      colorMode.value = stored
    } else {
      colorMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    updateDOM()
    persist()
  }

  return { colorMode, isDark, setColorMode, toggleColorMode, initColorMode }
}
