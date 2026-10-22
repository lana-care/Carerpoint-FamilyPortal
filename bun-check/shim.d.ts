// Only used by `bun check` (tsconfig.bun-check.json): it cannot read .vue files, so every
// SFC import is `any` (named exports like `alertVariants` included). `nuxt typecheck`
// (vue-tsc) types the SFCs.
declare module '*.vue'
