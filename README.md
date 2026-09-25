# SettleIn

A shared decision tool for three flatmates hunting for a 3BHK in Pune. Paste a listing and SettleIn instantly tells you whether it works for everyone, or exactly who is being asked to compromise and why.

- Next.js 16 (App Router) · Tailwind CSS 4 · Lucide icons · TypeScript (strict)
- All evaluation runs client-side. The shortlist is shared through a small API route backed by Supabase (Postgres), and falls back to `localStorage` when no database is connected.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

Deploy by importing the repo into Vercel.

## Shared memory (Supabase)

Without a database, each browser keeps its own copy (the badge next to **Shortlist** reads *This device only*). To give all three flatmates one shared, live shortlist:

1. **Create the tables.** In Supabase, open **SQL Editor → New query**, paste [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates `listings` and `app_settings`, turns on row-level security, and adds the 4 demo flats.
2. **Give Vercel the connection details**, either way:
   - *Integration:* Supabase dashboard → **Integrations → Vercel**, and connect the SettleIn project. The variables are synced for you.
   - *By hand:* Vercel project → **Settings → Environment Variables**, and add `SUPABASE_URL` (Project URL) and `SUPABASE_SECRET_KEY` (a **secret** key, or the legacy `service_role` key) from Supabase → **Project Settings → API Keys**.
3. **Redeploy.** The badge switches to *Shared · live*.

The app also accepts `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The key is only read on the server (`lib/server/db.ts`) and never reaches the browser. For local dev, put the same two variables in `.env.local`, which git ignores.

Anyone with the site link can view and edit the shortlist.

## Where things live

| Path | What |
| --- | --- |
| `lib/evaluate.ts` | The trade-off engine: dealbreaker checks, tiers, plain-English messages |
| `lib/roommates.ts` | Roommate identities, avatars, default budgets/thresholds |
| `lib/demo-listings.ts` | The 4 pre-loaded Pune listings |
| `lib/store.ts` | Client store: optimistic edits, polling sync, `localStorage` cache/fallback |
| `app/api/state/route.ts`, `lib/server/db.ts` | Shared-state API and Supabase access |
| `supabase/schema.sql` | Tables, row-level security, demo data |
| `lib/validate.ts` | Input validation shared by browser and server |
| `components/` | Hero, profiles, listing cards, add-listing and story modals |

## Rules

| Person | Dealbreaker | Preference (never disqualifies) |
| --- | --- | --- |
| Meera | Rent share ≤ ₹14,000; working lift if floor ≥ 2 | Pet-friendly |
| Kavita | Rent share ≤ ₹16,000; Hinjewadi commute ≤ 35 min | 2+ bathrooms |
| Riya | Rent share ≤ ₹15,000; dedicated parking | Gym within 20 min |

3/3 happy → **Unanimous Contender**, 2/3 → **Viable with Trade-off**, 0–1/3 → **Not Viable**. Budgets and thresholds are editable in the UI; **Load Roommate Defaults** restores them.
