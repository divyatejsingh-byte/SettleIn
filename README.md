# SettleIn

A shared decision tool for three flatmates hunting for a 3BHK in Pune. Paste a listing and SettleIn instantly tells you whether it works for everyone, or exactly who is being asked to compromise and why.

- Next.js 16 (App Router) · Tailwind CSS 4 · Lucide icons · TypeScript (strict)
- All evaluation runs client-side. The shortlist is shared through a small API route backed by Upstash Redis, and falls back to `localStorage` when no database is connected.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

Deploy by importing the repo into Vercel.

## Shared memory (Upstash Redis)

Without a database, each browser keeps its own copy (the badge next to **Shortlist** reads *This device only*). To give all three flatmates one shared, live shortlist:

1. In your Vercel project, open **Storage → Create Database → Upstash (Redis)**, pick the free plan, and connect it to the project.
2. Redeploy. Vercel injects the connection variables automatically, and the badge switches to *Shared · live*.

The first request seeds the 4 demo flats. The app reads `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, or the `KV_REST_API_URL` / `KV_REST_API_TOKEN` pair. For local dev against the real database, run `vercel env pull .env.local`.

Anyone with the site link can view and edit the shortlist.

## Where things live

| Path | What |
| --- | --- |
| `lib/evaluate.ts` | The trade-off engine: dealbreaker checks, tiers, plain-English messages |
| `lib/roommates.ts` | Roommate identities, avatars, default budgets/thresholds |
| `lib/demo-listings.ts` | The 4 pre-loaded Pune listings |
| `lib/store.ts` | Client store: optimistic edits, polling sync, `localStorage` cache/fallback |
| `app/api/state/route.ts`, `lib/server/db.ts` | Shared-state API and Redis access |
| `lib/validate.ts` | Input validation shared by browser and server |
| `components/` | Hero, profiles, listing cards, add-listing and story modals |

## Rules

| Person | Dealbreaker | Preference (never disqualifies) |
| --- | --- | --- |
| Meera | Rent share ≤ ₹14,000; working lift if floor ≥ 2 | Pet-friendly |
| Kavita | Rent share ≤ ₹16,000; Hinjewadi commute ≤ 35 min | 2+ bathrooms |
| Riya | Rent share ≤ ₹15,000; dedicated parking | Gym within 20 min |

3/3 happy → **Unanimous Contender**, 2/3 → **Viable with Trade-off**, 0–1/3 → **Not Viable**. Budgets and thresholds are editable in the UI; **Load Roommate Defaults** restores them.
