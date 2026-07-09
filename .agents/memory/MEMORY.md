# Memory Index — Carerpoint-FamilyPortal

> Shared memory for all AI agents. One fact = one file in this folder + one line here.
> Line format: `- [Title](file.md) — one-line hook`
> **Lifecycle**: from the workspace root run `bun scripts/memory-check.mjs` at session start — it ages every entry against today's date and flags what to consolidate/prune. See AGENTS.md § memory. Memory files carry `type` (fact | decision | learning) + `date` frontmatter.

*(no memories yet)*
