---
type: decision
date: 2026-10-23
review_after_days: 180
---

# Icons are the CarerPoint pack, vendored — not Lucide

Every icon in `app/` is a `Cp*` component imported from `~/lib/cp-icons`, mapped from
Lucide by the pack's `mapping.json` (`CalendarDays` → `CpCalendar`, `MessagesSquare` →
`CpMessages`, `FolderClosed` → `CpFolder`, `Receipt` → `CpInvoice`, `Link2Off` →
`CpLinkOff`). Sizes are set by Tailwind classes exactly as before. `animate` defaults to
`hover`, so do not pass it unless you want `loop` / `once` / `none`.

The pack is VENDORED because `@lana-care/icons` is not on the registry yet and the deploy
installs `@lana-care/*` from GitHub Packages. `scripts/vendor-cp-icons.ts` scans `app/`
for `~/lib/cp-icons` imports and writes `app/lib/cp-icons/` (data + `Cp*` components over
`app/components/CpIcon.vue`, identical to the Docs repo's) and `app/assets/css/cp-icons.css`
(motion, imported once in `main.css`). New icon: import it, then
`CP_UI_DIR=../carerpoint-ui bun scripts/vendor-cp-icons.ts`.

AI / CapoAI is the `CapoaiIcon` mark from `@lana-care/ui`, never a sparkle or bot (support
replies with `senderType: 'ai'` show it).

Gotchas:
- `lucide-vue-next` is gone from `package.json` but still installed: `@lana-care/ui` 0.2.2
  lists it as a peer and imports it (Button, Dialog, ThemeToggle…). Do not re-add it. Kit
  0.4.3 drops it: then bump the kit, delete the vendored copy and import `@lana-care/icons`.
- `components.json` says `iconLibrary: "carerpoint"`. `shadcn-vue add` does not know that
  value and will paste Lucide imports: rewrite them to `Cp*` by hand.
- `--icon-accent` is defined in `main.css` until design-tokens 0.4.x (lime-500 light,
  lime-300 dark).
