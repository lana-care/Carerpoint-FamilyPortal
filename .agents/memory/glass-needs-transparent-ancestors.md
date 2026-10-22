---
type: learning
date: 2026-10-22
review_after_days: 365
---
# Glass is invisible if any ancestor paints an opaque background

The portal's Liquid Glass (owner decision, 22 Oct 2026) only shows when the static aurora (`SharedShellBackground`, `fixed -z-10`) is not covered. `bg-background` on `app.vue`'s root, the layout shell or `.main-surface` hid it entirely. `body` already carries `bg-background` (tokens base layer).

Gotcha: a scoped `:global(.dark) .x { ... }` in a Vue SFC compiled to a bare `.dark { ... }` rule. The old collapsed-rail tint therefore painted `<html>` in dark mode (the aurora stayed hidden even after the wrappers went transparent). Put `.dark .x` rules in plain CSS (`assets/css/main.css`) instead.

Also: Tailwind utilities and token classes share `@layer utilities`, so `bg-card` vs `.glass-card` order is not reliable; swap `Card` for `GlassCard` (padding `none` keeps CardHeader/CardContent spacing) rather than stacking classes. Unlayered app CSS wins over both (used for the `prefers-reduced-transparency` fallback).
