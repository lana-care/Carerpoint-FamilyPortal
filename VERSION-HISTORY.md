# Carerpoint-FamilyPortal — internal version history

> **INTERNAL — NOT PUBLIC.** This is the engineering record for **this repo only** — the Nuxt 4 family portal. It names files, endpoints and known weaknesses, including one about how the portal token travels.
>
> For the cross-repo view (what shipped where, in which version, across all seven repos), see the workspace root `../VERSION-HISTORY.md`.
>
> The customer-facing surfaces are the **Website changelog page** (`Carerpoint-Website` → `changelogPage.entries`) and the **public roadmap** (`Carerpoint-Docs` → `content/3.roadmap/`). **Nothing here goes into either** — this repo serves health data to families, and its open questions are not marketing copy.
>
> Last updated: 20 July 2026.

---

## Version map (this repo)

| Version | Date | What changed in the Family Portal |
|---|---|---|
| [1.3.5](#135--no-functional-change) | 20 Jul 2026 | **Version bump only** |
| [1.3.0](#130--ci-and-a-version-bump) | 11–13 Jul 2026 | Version bump + first CI workflow |
| [1.2.5](#125--security-design-system-alignment) | 9 Jul 2026 | Route guarding, header-based token, `@lana-care/ui` adoption, version cleanup |
| [1.1.x](#11x--the-repo-itself) | Mar 2026 | The entire portal: pages, auth, realtime messaging, documents |

**71 commits total**, first on **28 March 2026**. This repo has **no 1.0.0 and no 1.1.0** — it did not exist yet. It also has no 1.2.1 (mobile-only). `main` is in sync with `origin/main`; tags `v1.2.5` and `v1.3.0` are both ancestors of `main`; the working tree is clean.

---

## 1.3.5 — No functional change

**Nothing shipped in this repo for 1.3.5.** The only commit is `chore(release): v1.3.5 (#17)` on 20 Jul — a version bump so the portal stays aligned with the other apps.

The 1.3.5 release was Capoai credits and human oversight: Backend, Frontend, Website and Docs. The family portal has no AI surface, no billing surface and no automation surface, so there was nothing for it to do. Stated explicitly here so nobody goes looking for a credits feature that was never built.

---

## 1.3.0 — CI and a version bump

- **#15** `chore(release): bump to v1.3.0` — version only.
- **#16** `chore(ci): add build + unit-test workflow` (13 Jul) — this repo's **first CI**, four months after it was created. Note that the unit-test job currently has no tests to run (see gaps).

No feature work.

---

## 1.2.5 — Security, design system, alignment

**Shipped 9 July 2026**, tag `v1.2.5`. The portal's share of the frozen April–July cycle:

**Security** (June — Phase 0)
- **#1** `fix(security): send family-portal token via Authorization header, not the URL` — the portal bearer token had been travelling as a query parameter, which meant it landed in server logs, referrer headers and browser history. This is the most important commit in the repo.
- `fix(security): guard all routes by default + add security headers` — `app/middleware/auth.global.ts` flipped to an allowlist model. The public allowlist is now exactly `/` and `/login`; **every new page is protected unless someone deliberately opens it**.
- `.env.example` synced (`NODE_ENV` for secure cookies).

**Design system**
- **#12** consume `@lana-care/design-tokens`; **#14** consume `@lana-care/ui` components and delete the local copies; `@lana-care/*` bumped to 0.1.4 for the `PillButton` internal-link `href` fix.
- Three consecutive Tailwind-v4 packaging fixes that are worth remembering because they were not obvious: `fix(portal): vendor design tokens so the design system actually ships`, `fix(portal): emit @lana-care/ui component classes via Tailwind @source`, and `fix(css): scan @lana-care/ui source so Tailwind emits its utilities`. **The package ships Vue sources and no utility CSS — the consuming app must include it in its Tailwind content globs or the components render unstyled.**
- Liquid Glass alignment with the Website: glass Textarea/Input parity, glass semantic pill buttons, dialog centring on Tailwind v4, opaque `surface-overlay` for dialogs/selects/cards, `Button` loading prop.

**Housekeeping**
- `chore: align product version to 1.2.5 (fix internal v1.0/v1.1)` — the portal had been carrying **three different version numbers at once**: `runtimeConfig` said `v1.1`, `app.config` said `v1.0`, `package.json` said `1.2.0`. All three now come from `scripts/set-version.mjs`.
- **#11** `fix(portal): surface server rejections and normalize validation errors` — the portal was swallowing backend errors and showing nothing.
- **#4** clarified that the portal needs **no Supabase keys at all** (it is purely token-based). The dead Supabase vars in `.env.example` were the source of repeated confusion.
- `bun.lock` untracked so Cloudflare regenerates it per deploy.

---

## 1.1.x — The repo itself

**28–30 March 2026, 34 commits.** The portal was built essentially in one push and has barely changed since.

- Scaffold: Nuxt 4, ESLint, component registry, styling, UI component library (Avatar, Separator, Skeleton, Textarea, Dialog, Tabs, Calendar).
- **Auth**: invitation-token model — no login, no password, no client-side Supabase. Cookie `carerpoint_family_portal_token` (30 days), composable `app/composables/usePortalAuth.ts`.
- **Pages**: dashboard, schedule, calendar with monthly navigation, care plan, medications, messages, documents, visit detail with user notes.
- **Realtime messaging**: socket.io against `${apiUrl}/ws` with `auth: { portalToken }`, `family_message:new`, plus channel switching and grouped messaging.
- Persistent theme detection (manual dark mode: cookie `luna_color_mode` + `.dark` on `<html>` — deliberately **not** `@nuxtjs/color-mode`).
- Two removals that shaped the repo: `@nuxtjs/supabase` dropped (the portal never authenticated against Supabase), and `@nuxtjs/i18n` removed to fix the Cloudflare build.
- Cloudflare Worker name set to `familyportal` in the Nitro config.

Internal version labels during this period were `v1.0` then `v1.1`, later reconciled to the product version in 1.2.5.

---

## Known gaps / follow-ups

- **The token is still in the URL on first load.** `index.vue` / `login.vue` read `?token=` and then strip it with `router.replace`, but the initial request — and therefore the server access log and any referrer — has already seen it. The header fix (#1) covered every subsequent call; the invitation link itself is unchanged. This is the portal's outstanding security item.
- **No tests exist.** `bun run test` runs vitest against zero test files, and CI (#16) runs that empty job. The portal serves PHI to non-technical users and has no automated coverage of its auth guard.
- **Pinia is installed but there is no `stores/` directory.** Shared state goes through `useState`. Either adopt it or drop the dependency.
- **No central HTTP wrapper.** Every page does its own `$fetch` with a manually-assembled `Authorization: Bearer` header and slash trimming. The Frontend has `useApi.ts`; this repo has copy-paste. It has stayed consistent so far by discipline alone.
- **`@nuxtjs/i18n` is in `package.json` and `app/locales/{en,fr}.json` exists, but the module is actually provided by the `@lana-care/ui` layer.** The direct dependency is misleading.
- **Dead Supabase vars in `.env.example`** — flagged in #4, still present. The portal needs none of them.
- **71 commits in four months, 9 of them since June.** This repo is effectively in maintenance. Nobody should be surprised to find it lagging the Frontend's patterns.

---

## Conventions that outlive any single version

- **Bun only.** `GITHUB_PACKAGES_TOKEN` is required to install `@lana-care/*` from GitHub Packages.
- **No Supabase on the client, ever.** The portal authenticates with a backend-issued bearer token and nothing else. If a change needs Supabase keys here, the change is wrong.
- **The route allowlist is `/` and `/login`.** `app/middleware/auth.global.ts` protects everything else by default. Adding to the allowlist means deliberately publishing a page that serves health data — justify it in the PR.
- **The token goes in the `Authorization` header, never in a URL.** This was fixed once; do not regress it.
- **Shared components live in `@lana-care/ui`** — fix upstream, bump, republish. When Tailwind stops emitting the package's classes, the answer is the `@source` glob, not a local copy of the component.
- **Liquid Glass on elevated surfaces only** (headers, login). Main content stays on solid, legible cards — the audience is often elderly, and contrast beats aesthetics here. Test light *and* dark.
- **Accessibility is a product requirement, not a nicety**, for the same reason.
- **Deployed as a Cloudflare Worker** (`nitro.preset: 'cloudflare-module'`, wrangler name `familyportal`), port 3003 in dev.
- **Versions are synced from the workspace root** with `bun scripts/set-version.mjs <x.y.z>` — this repo has already been through one three-way version mismatch; never bump by hand.
