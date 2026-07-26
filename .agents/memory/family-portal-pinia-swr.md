---
type: fact
date: 2026-07-26
review_after_days: 90
---

# Family Portal Pinia SWR caches

Pinia stores limit refetch:

- `usePortalSessionStore` — bootstrap `GET /auth/family-portal` (TTL 2 min)
- `usePortalResourcesStore` — schedule / messages / care-plan / meds / docs / visits (keyed TTLs in `app/utils/swrCache.ts`)

`usePortalAuth` is a thin facade (cookie + stores). After message send, only refresh the channel — never bootstrap. Logout / new token clears both stores.
