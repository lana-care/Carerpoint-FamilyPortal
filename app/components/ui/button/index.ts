export { default as Button } from '@lana-care/ui/components/button/Button.vue'
// Import the cva helper from the component's own barrel, not the bare package
// specifier: `@lana-care/ui` maps its "import" condition to nuxt.config.ts (the
// Nuxt layer entry), which has no named exports. Vite 7/Rollup happened to pick
// the package's "module" condition and land on dist/index.js anyway; Rolldown
// (Vite 8) honours "import", so the bare specifier now fails with MISSING_EXPORT.
export { buttonVariants } from '@lana-care/ui/components/button/index.ts'
export type { ButtonVariants } from '@lana-care/ui/components/button/index.ts'
