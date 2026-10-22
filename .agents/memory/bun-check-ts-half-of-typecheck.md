---
type: decision
date: 2026-10-22
review_after_days: 180
---
# `typecheck` = `bun check` (.ts) then `nuxt typecheck` (.vue)

`bun run typecheck` is `bun check -p bun-check && nuxt typecheck`. `bun check` (Bun >= 1.4.3, TS 7-based) cannot read `.vue`, so it only covers the 38 `.ts` files of the app program (~0.3 s) and fails fast; `nuxt typecheck` (vue-tsc, a superset, ~12 s) still types every SFC and the `.ts` again. Wall time is therefore NOT saved when everything passes; the gain is an early exit on a `.ts` error.

- `bun-check/tsconfig.json` extends `tsconfig.json` (-> `.nuxt/tsconfig.json`, so `~/`, `#imports` and auto-imports resolve; needs `nuxt prepare`, which `postinstall` runs) and adds `bun-check/shim.d.ts`: `declare module '*.vue'` makes every SFC import `any`, named exports included. Without it: false TS2307 on every `.vue` import. The dir is not the repo root because Nuxt's app program includes `../*.d.ts` and vue-tsc must not see the shim.
- Parity checked: identical lines/columns/codes to vue-tsc for `.ts` errors, incl. auto-imported `ref`/`useRoute`.
- `tests/` is not in the Nuxt app program, so neither checker types it (unchanged).
- Main is clean (0 errors) and CI runs `bun run typecheck` before the unit tests.
