// https://nuxt.com/docs/api/configuration/nuxt-config

/**
 * Single source of truth for the backend origin: feeds both
 * `runtimeConfig.public.apiUrl` and the CSP `connect-src` below, so the policy
 * can never drift from the origin the app actually calls.
 */
const apiUrl = process.env.NUXT_PUBLIC_API_URL || 'http://localhost:4000'

/**
 * The production backend, allowed unconditionally.
 *
 * routeRules headers are static strings baked in at build time, but
 * `runtimeConfig.public.apiUrl` can still be overridden by a Cloudflare runtime
 * binding. If `NUXT_PUBLIC_API_URL` were missing at BUILD time the CSP would pin
 * `http://localhost:4000` and block every API + websocket call in production —
 * a hard outage of a PHI portal caused by an unset env var. Pinning the known
 * prod origin here removes that failure mode at no real cost: it is our own
 * first-party API, and the marketing site's CSP hardcodes it the same way.
 */
const PRODUCTION_API_ORIGIN = 'https://api.carerpoint.care'

/** `https://api.example.com` → `['https://api.example.com', 'wss://api.example.com']` */
function apiConnectSources(url: string): string[] {
  try {
    const { protocol, host } = new URL(url)
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:'
    return [`${protocol}//${host}`, `${wsProtocol}//${host}`]
  } catch {
    return []
  }
}

/** Build-time origin + the pinned prod origin, de-duplicated. */
const connectSources = [
  ...new Set([...apiConnectSources(apiUrl), ...apiConnectSources(PRODUCTION_API_ORIGIN)]),
]

/**
 * Content-Security-Policy. The portal bearer token lives in a JS-readable cookie
 * (see `usePortalAuth`), so `connect-src` is the primary anti-exfiltration
 * control: even with an injected script, PHI cannot be POSTed to a third party.
 *
 * What the app actually loads:
 *  • its own JS/CSS/fonts (`'self'`, `/fonts/Oddval-*.ttf`)
 *  • Google Fonts — stylesheet from fonts.googleapis.com (`@import` in
 *    app/assets/css/main.css), font files from fonts.gstatic.com
 *  • the NestJS API (`$fetch`) and its socket.io websocket at `${apiUrl}/ws`
 *    (transports: websocket + polling, so both http(s) and ws(s) are needed)
 *  • no third-party scripts, no analytics, no iframes, no remote images
 *    (documents open as top-level navigations, which CSP does not restrict)
 *
 * `'unsafe-inline'` on script-src is required by Nuxt's SSR hydration payload
 * (no nonce support in the cloudflare-module preset); `'unsafe-eval'` is
 * deliberately NOT granted — the production Vue build needs no runtime compiler.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  ["connect-src 'self'", ...connectSources].join(' '),
].join('; ')

export default defineNuxtConfig({
  extends: ['@lana-care/ui'],
  build: { transpile: ['@lana-care/ui'] },
  compatibilityDate: '2024-12-01',
  ssr: true,
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },

  // Defense-in-depth security headers on every route. This is an externally
  // facing portal handling health data: deny framing (clickjacking), prevent
  // MIME sniffing, and avoid leaking the invite token via the Referer header.
  // (Moving the token out of the URL + an httpOnly session cookie is a separate
  // follow-up; no-referrer here limits the leak in the meantime.)
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': csp,
      },
    },
  },

  devServer: {
    port: 3003,
    host: 'localhost',
  },

  modules: ['@vueuse/nuxt', '@nuxt/eslint', 'shadcn-nuxt', '@pinia/nuxt'],

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  runtimeConfig: {
    public: {
      apiUrl,
      appName: 'Carerpoint Family Portal',
      appVersion: 'v1.3.5',
    },
  },

  app: {
    head: {
      title: 'Carerpoint — Family Portal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Family portal for home care' },
        { name: 'theme-color', content: '#1e5cab' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', href: '/icon.png' },
        { rel: 'apple-touch-icon', href: '/icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      ],
    },
    pageTransition: { name: 'page-slide', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },

  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      wrangler: {
        name: 'familyportal',
      },
    },
  },

  vite: {
    ssr: {
      external: [
        'vue',
        '@vue/runtime-core',
        '@vue/runtime-dom',
        '@vue/reactivity',
        '@vue/shared',
        '@vue/server-renderer',
      ],
    },
    build: {
      chunkSizeWarningLimit: 1500,
      sourcemap: false,
      minify: 'esbuild',
    },
  },
})
