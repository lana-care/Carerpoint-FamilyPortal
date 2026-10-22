---
type: decision
date: 2026-10-22
review_after_days: 180
---

# Icons come from `@lana-care/icons`, not Lucide

Every icon in `app/` is a `Cp*` component (`import { CpCalendar } from '@lana-care/icons'`),
mapped from Lucide by the pack's `mapping.json` (`CalendarDays` → `CpCalendar`,
`MessagesSquare` → `CpMessages`, `FolderClosed` → `CpFolder`, `Receipt` → `CpInvoice`,
`Link2Off` → `CpLinkOff`). Sizes are set by Tailwind classes exactly as before.
Motion (`icons.css`) is imported once in `main.css`; `animate` defaults to `hover`, so
do not pass it unless you want `loop` / `once` / `none`.

Gotchas:
- `lucide-vue-next` is gone from `package.json` but still installed: `@lana-care/ui`
  (≤ 0.4.1) lists it as a peer and imports it (Button, Dialog, ThemeToggle…). Do not
  re-add it to the app; it goes away when the kit migrates.
- `components.json` says `iconLibrary: "carerpoint"`. `shadcn-vue add` does not know that
  value and will paste Lucide imports: rewrite them to `Cp*` by hand.
- Dark-mode accent needs `--icon-accent` from `@lana-care/design-tokens` ≥ 0.4.1; on 0.2.x
  the icons fall back to lime-500 in dark mode too.
