---
type: decision
date: 2026-07-25
review_after_days: 365
---

# The portal now has a layout, and can actually change its own theme

Two things that were missing until 25 Jul 2026.

## `app/layouts/default.vue` exists

Before, **every page carried `definePageMeta({ layout: false })`** and
re-implemented its own `<header>`: the home page a rich glass-pill with the nav,
the other eight a copy-pasted glass-bar with a `← Home` link. Adding anything to
the chrome meant nine edits.

Now: `layouts/default.vue` mounts `components/portal/Header.vue`, which picks its
variant from the route (`/` = rich, everything else = glass bar) and takes the
sub-page title from `definePageMeta({ title })`. Only `/login` still opts out
with `layout: false`.

Sub-page wrappers dropped `min-h-screen bg-background`: `min-h-screen` is the
layout's job, and the opaque background was hiding `SharedShellBackground` — the
home page already rendered without it.

**Adding a page**: give it a `title` in `definePageMeta` and nothing else. Do not
add a `<header>`.

## Colour mode is writable, and resolved during SSR

`app.vue` used to only *read* the `luna_color_mode` cookie and apply the class in
`onMounted` — with `ssr: true`, that guaranteed a flash of light theme for every
dark-mode visitor, and nothing could write the preference.

- `app.vue` resolves the cookie on the server into `useHead({ htmlAttrs })`, so
  `.dark` is in the first-paint HTML.
- `app/composables/useColorMode.ts` (ported from Carerpoint-Frontend, same keys:
  cookie + localStorage `luna_color_mode`, `BroadcastChannel('luna_theme')`)
  owns the writes.

⚠️ That composable **shadows the `useColorMode` auto-imported from
`@vueuse/core`** via `@vueuse/nuxt`. Deliberate, and it matches the Frontend, but
it means `useColorMode()` in this app is not VueUse's.

`setColorMode` must stay synchronous: `<ThemeToggle>` calls it inside
`document.startViewTransition()`, which snapshots the new state as soon as the
callback's flush completes.

The cookie has no `Domain`, so it is host-only — the theme does NOT follow the
user between the portal and the dashboard. Pre-existing in both apps; changing it
needs a decision about the apex domain.
