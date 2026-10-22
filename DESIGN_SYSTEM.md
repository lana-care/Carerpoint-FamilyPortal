# CarerPoint Design System — Family Portal (Lana-FamilyPortal)

This app shares one design language with the rest of the CarerPoint ecosystem:
the **website** (`Luna-Website`, the visual reference), the **dashboard**
(`Luna-Frontend`) and the **mobile app** (`Carerpoint-mobile`, Flutter).

The family portal is the simplest, friendliest surface of the product, and Liquid
Glass is its design concept: the shell (sidebar, toolbar) is frosted over a static
ambient backdrop, and cards, panels, list containers, empty states, tabs and chips
are glass. Readability comes first, because many relatives are older: text stays at
AA contrast (4.5:1) on the glass in light and dark, and anything stacked over content
(drawer, dialogs, selects, toasts, the support panel) stays opaque.

## Where the tokens live

All design tokens live in `app/assets/css/main.css` (Tailwind v4 `@theme` + CSS
variables) and are identical (same hex values) across the three Nuxt apps, and
mirrored in Dart in the mobile app's `lib/core/theme/lana_theme.dart`.

### Brand palette

| Role | Light | Dark |
|---|---|---|
| Primary (Luna blue) | `#1e5cab` | `#5583b7` |
| Accent (Lime) | `#dbf26d` | `#dbf26d` |
| Muted (Sage teal) | `#79a5a5` | `#79a5a5` |
| Background | `#fdfef9` (cream) | `#0a1929` (navy) |
| Card | `#ffffff` | `#0f2744` |

Base radius `0.625rem` (10px). Fonts: **Space Grotesk** (body), **Oddval**
(display via `.font-display`).

## Liquid Glass

"Liquid Glass" = soft translucency + light blur + subtle border + soft shadow.
It needs something to blur, so `<SharedShellBackground>` (in `app.vue`, and on the
login page) paints two low-contrast aurora blobs, **static** (no animation on app
screens). Nothing between it and the page may have an opaque background: do not put
`bg-background` on the layout wrappers.

| Class / component | Use for |
|---|---|
| `.glass-bar` | Sidebar (expanded) and the page toolbar |
| `.glass-card` / `<GlassCard>` | Cards, panels, the messages thread and composer, document/invoice list containers, empty states, login |
| `.glass-pill` | Tabs, segmented controls, the calendar stepper and status chips |
| `<PillButton>` | Pill CTA (`primary` / `glass` / `ghost`) |
| `.surface-overlay` + `.dialog-scrim` | The mobile drawer, dialogs, selects, the support panel: **opaque** |
| `.glow-luna` / `.glow-lime`, `.hairline-border`, `.tint-*` | Depth & tints |

Rules we keep:

- One blurred container per list (documents, invoices, the thread), never a
  blurred row each. Dense grids (the week view) keep opaque cell backgrounds inside
  the glass container.
- No opaque `bg-card` / `via-card` fills on top of a glass surface: they hide it.
- Form inputs stay readable (kit fill); the feedback rating stays a square
  segmented control.
- `@media (prefers-reduced-transparency: reduce)` (in `assets/css/main.css`) turns
  glass into the opaque `--card` / `--background` surfaces and hides the backdrop;
  `tokens.css` already has the `@supports not (backdrop-filter)` fallback.
- The collapsed sidebar rail is a solid brand tint (white icons), not glass.

```vue
<script setup lang="ts">
import { GlassCard } from '~/components/ui/glass-card'
</script>

<template>
  <GlassCard radius="xl" padding="none">
    <slot />
  </GlassCard>
</template>
```

`GlassCard` props: `glow` (`luna|lime|none`), `radius` (`lg|xl|2xl|3xl`),
`padding` (`none|sm|md|lg`). `PillButton` props: `variant`, `size`, `to`, `glow`.

The standard shadcn `Button`, `Input`, `Badge`, `Dialog` etc. are the same
components (and variants) used in the dashboard and website.

## Accessibility

- Body text ≥ 4.5:1 on the glass, in **both** themes, over the real backdrop.
  Links on glass use `text-primary dark:text-luna-300`.
- No glass on dialogs, dropdowns or toasts.
- Test light **and** dark mode, and with reduced transparency on.

## Cross-platform parity

| Surface | Web | Mobile (Flutter) |
|---|---|---|
| Glass card | `.glass-card` / `<GlassCard>` | `AdaptiveGlass` |
| Glass bar | `.glass-bar` | `LunaAppBar`, `GlassBottomNav` |
| Glass icon / back button | `.glass-pill` chip | `GlassIconButton` |
| Tokens | `main.css` `@theme` | `lana_theme.dart` |
