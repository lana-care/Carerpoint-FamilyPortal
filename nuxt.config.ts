// https://nuxt.com/docs/api/configuration/nuxt-config
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
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:4000',
      appName: 'Carerpoint Family Portal',
      appVersion: 'v1.2.5',
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
