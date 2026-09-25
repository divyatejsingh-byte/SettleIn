# SettleIn

A shared decision tool for three flatmates hunting for a 3BHK in Pune. Paste a listing and SettleIn instantly tells you whether it works for everyone, or exactly who is being asked to compromise and why.

- Next.js 16 (App Router) · Tailwind CSS 4 · Lucide icons · TypeScript (strict)
- No API keys and no backend. All evaluation runs client-side, and data is saved in `localStorage`.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

Deploy by importing the repo into Vercel; no environment variables are needed.

## Where things live

| Path | What |
| --- | --- |
| `lib/evaluate.ts` | The trade-off engine: dealbreaker checks, tiers, plain-English messages |
| `lib/roommates.ts` | Roommate identities, avatars, default budgets/thresholds |
| `lib/demo-listings.ts` | The 4 pre-loaded Pune listings |
| `lib/store.ts` | `localStorage`-backed store (`useSyncExternalStore`, hydration-safe) |
| `components/` | Hero, profiles, listing cards, add-listing and story modals |

## Rules

| Person | Dealbreaker | Preference (never disqualifies) |
| --- | --- | --- |
| Meera | Rent share ≤ ₹14,000; working lift if floor ≥ 2 | Pet-friendly |
| Kavita | Rent share ≤ ₹16,000; Hinjewadi commute ≤ 35 min | 2+ bathrooms |
| Riya | Rent share ≤ ₹15,000; dedicated parking | Gym within 20 min |

3/3 happy → **Unanimous Contender**, 2/3 → **Viable with Trade-off**, 0–1/3 → **Not Viable**. Budgets and thresholds are editable in the UI; **Load Roommate Defaults** restores them.
