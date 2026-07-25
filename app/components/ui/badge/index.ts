export { default as Badge } from '@lana-care/ui/components/badge/Badge.vue'
// Same reason as ui/button/index.ts: the bare `@lana-care/ui` specifier resolves
// to the Nuxt layer config under Rolldown (Vite 8) and has no named exports.
export { badgeVariants } from '@lana-care/ui/components/badge/index.ts'
export type { BadgeVariants } from '@lana-care/ui/components/badge/index.ts'
