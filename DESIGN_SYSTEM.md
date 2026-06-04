# CarerPoint Design System — Family Portal (Lana-FamilyPortal)

This app shares one design language with the rest of the CarerPoint ecosystem:
the **website** (`Luna-Website`, the visual reference), the **dashboard**
(`Luna-Frontend`) and the **mobile app** (`Carerpoint-mobile`, Flutter).

The family portal is the simplest, friendliest surface of the product, so glass
is used sparingly — on the sticky page headers and the login hero — while the
content (visits, care plan, medications, messages) stays on solid, readable
cards.

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

"Liquid Glass" = soft translucency + light blur + subtle border + soft shadow,
used **only on elevated surfaces**.

| Class / component | Use for |
|---|---|
| `.glass-bar` | Frosted sticky page header (used by every page) |
| `.glass-card` / `<GlassCard>` | Frosted card (login hero) |
| `.glass-pill` | Frosted pill |
| `<PillButton>` | Pill CTA (`primary` / `glass` / `ghost`) |
| `.glow-luna` / `.glow-lime`, `.hairline-border`, `.tint-*` | Depth & tints |

Each utility has a `@supports not (backdrop-filter…)` solid fallback and a
`.dark` variant.

```vue
<script setup lang="ts">
import { GlassCard } from '~/components/ui/glass-card'
</script>

<template>
  <GlassCard radius="2xl" padding="lg" glow="luna">
    <slot />
  </GlassCard>
</template>
```

`GlassCard` props: `glow` (`luna|lime|none`), `radius` (`lg|xl|2xl|3xl`),
`padding` (`none|sm|md|lg`). `PillButton` props: `variant`, `size`, `to`, `glow`.

The standard shadcn `Button`, `Card`, `Input`, `Badge`, `Dialog` etc. are the
same components (and variants) used in the dashboard and website.

## Accessibility

- Keep important content off overly transparent backgrounds.
- No glass on long forms — solid cards/inputs there.
- Test light **and** dark mode.

## Cross-platform parity

| Surface | Web | Mobile (Flutter) |
|---|---|---|
| Glass card | `.glass-card` / `<GlassCard>` | `AdaptiveGlass` |
| Glass bar | `.glass-bar` | `LunaAppBar`, `GlassBottomNav` |
| Glass icon / back button | `.glass-pill` chip | `GlassIconButton` |
| Tokens | `main.css` `@theme` | `lana_theme.dart` |
