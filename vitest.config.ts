import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '~~': resolve(root),
      '~': resolve(root, 'app'),
      '@': resolve(root, 'app'),
      '@@': resolve(root),
    },
  },
})
