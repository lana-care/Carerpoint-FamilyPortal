# AGENTS.md — rules for all AI agents (Claude, Cursor, Codex, Copilot…)

> **Rule #1: read this file at the start of EVERY session, before any action.**

1. **Repo source of truth**: read `CLAUDE.md` — its instructions apply to ALL agents, not just Claude.
2. **Tooling**: **Bun only** — never npm, pnpm or yarn (install, scripts, CI).
3. **Product direction**: it lives at the workspace root — `../ROADMAP.md` (current target: **v1.3.0**), `../CHANGELOG.md`, `../PRODUCT-STATUS.md`, `../COMPETITIVE-ANALYSIS.md`. Align every feature with the roadmap; when unsure, cite it.
4. **Versions**: the product version (**1.2.5**) is synced across all repos with `bun ../scripts/set-version.mjs <x.y.z>` from the workspace root. NEVER edit a version number by hand. (`carerpoint-ui` keeps its own package semver.)
5. **Cross-cutting**: secrets never committed; health data (PHI) → respect multi-tenant isolation (RLS); i18n via locale files, never hardcoded strings; shared UI in `carerpoint-ui` (@lana-care/*).

## Shared agent memory (mandatory)

**At the start of every session:**
1. Read `.agents/memory/MEMORY.md` (this repo's index) and, from the workspace root, run `bun ../scripts/memory-check.mjs` — it reads today's real date and lists **stale** memories (older than their `review_after_days`, default 90) and index problems.
2. **Decide and act on what it flags**: consolidate duplicate/overlapping facts into one file, prune what is now obsolete or contradicted by the code, and fix any orphan/dangling index links. The script only reports — you do the cleanup.

**During the session**, whenever you learn something durable, write it as ONE file in `.agents/memory/` and add a line to `MEMORY.md`. Every memory file starts with frontmatter:
```
---
type: fact | decision | learning   # learning = a lesson/gotcha to reuse next time
date: YYYY-MM-DD                    # today (the script uses this to age it)
review_after_days: 90              # optional; raise for long-lived learnings
---
```
- **fact/decision** — a stable truth or a choice made (why + how to apply).
- **learning** — a mistake made and how to avoid it, a non-obvious gotcha, a pattern that worked. These are how the fleet gets smarter over time; capture them liberally.
Don't record what the code, git history or CLAUDE.md already says.
