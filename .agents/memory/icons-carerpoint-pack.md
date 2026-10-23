---
type: decision
date: 2026-10-23
review_after_days: 180
---

# Icons are the CarerPoint pack (`@lana-care/icons`) — not Lucide

Every icon in `app/` is a `Cp*` component imported from `@lana-care/icons`, mapped from
Lucide by the pack's `mapping.json` (`CalendarDays` → `CpCalendar`, `MessagesSquare` →
`CpMessages`, `FolderClosed` → `CpFolder`, `Receipt` → `CpInvoice`, `Link2Off` →
`CpLinkOff`). Sizes are set by Tailwind classes exactly as before. `animate` defaults to
`hover`, so do not pass it unless you want `loop` / `once` / `none`.

Kit ^0.4.3 (2026-10-23; before that a vendored copy in `app/lib/cp-icons`, now deleted).
`main.css` imports `@lana-care/icons/icons.css` (motion) once; the portal does not load
`@lana-care/ui/style.css`, which imports it too (`tests/no-lucide.spec.ts` pins this).

AI / CapoAI is the `CapoaiIcon` mark from `@lana-care/ui`, never a sparkle or bot (support
replies with `senderType: 'ai'` show it).

Gotchas:
- Kit 0.4.3's `@lana-care/ui` draws these icons too, so `lucide-vue-next` is no longer
  installed. Do not re-add it.
- `components.json` says `iconLibrary: "carerpoint"`. `shadcn-vue add` does not know that
  value and will paste Lucide imports: rewrite them to `Cp*` by hand.
- `--icon-accent` (lime-500 light, lime-300 dark) is in tokens 0.4.3; `main.css` keeps the
  same values.
