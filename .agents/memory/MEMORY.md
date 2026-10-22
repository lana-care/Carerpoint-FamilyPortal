# Memory Index — Carerpoint-FamilyPortal

> Shared memory for all AI agents. One fact = one file in this folder + one line here.
> Line format: `- [Title](file.md) — one-line hook`
> **Lifecycle**: from the workspace root run `bun scripts/memory-check.mjs` at session start — it ages every entry against today's date and flags what to consolidate/prune. See AGENTS.md § memory. Memory files carry `type` (fact | decision | learning) + `date` frontmatter.

*(no memories yet)*
- [Layout + color mode du portail](portal-layout-and-color-mode.md) — `layouts/default.vue` existe enfin (avant : 9 headers dupliqués, tous en `layout:false`) ; `useColorMode` local shadow celui de VueUse ; cookie résolu en SSR (fini le FOUC)
- [Pinia SWR anti-refetch](family-portal-pinia-swr.md) — `portalSession` + `portalResources` caches; `usePortalAuth` façade cookie; pas de bootstrap après send message
- [bun check = moitié .ts du typecheck](bun-check-ts-half-of-typecheck.md) — `typecheck` = `bun check -p bun-check && nuxt typecheck` ; shim `*.vue` ; vue-tsc reste le superset
- [Le verre exige des ancêtres transparents](glass-needs-transparent-ancestors.md) — aucun `bg-background` entre l'aurora et les `.glass-*` ; `:global(.dark) .x` scopé compile en `.dark` nu ; `Card` → `GlassCard`
