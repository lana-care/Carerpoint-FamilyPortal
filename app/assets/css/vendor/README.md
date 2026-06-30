# Vendored design tokens

`tokens.css` and `effects.css` here are **byte-for-byte copies** of
[`@lana-care/design-tokens`](https://github.com/lana-care/carerpoint-ui) **v0.1.4**
(`packages/design-tokens/src/{tokens,effects}.css`).

## Why vendored instead of `@import "@lana-care/design-tokens/..."`?

The package CSS subpath import was **not being bundled in the Cloudflare Workers
build** for this app: the deployed stylesheet was missing the entire design
system (semantic colours, brand tokens, `.glass-*` / `.btn-pill-*` recipes), so
the portal rendered effectively unstyled — no card backgrounds/borders, no brand
colours, unstyled buttons, status badges that were not pills. The same import
works locally and in the website/dashboard builds, so it is an environment-level
resolution issue, not a content one. Vendoring removes the dependency on the
package resolving at build time and guarantees the tokens ship.

`main.css` imports these via `@import "./vendor/..."`.

## Re-syncing on token bumps

These are a frozen snapshot. When the shared tokens change, refresh them:

```bash
# from the carerpoint-ui checkout, for the tag you want (e.g. v0.1.4)
git show v0.1.4:packages/design-tokens/src/tokens.css  > app/assets/css/vendor/tokens.css
git show v0.1.4:packages/design-tokens/src/effects.css > app/assets/css/vendor/effects.css
```

Once the Cloudflare build reliably bundles the package CSS again, this folder can
be deleted and `main.css` reverted to `@import "@lana-care/design-tokens/..."`.
