"use client";

import { Filter, House, Plus, RotateCcw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { evaluateListing } from "@/lib/evaluate";
import { actions, useAppState } from "@/lib/store";
import type { Listing, ListingInput, Tier, TierFilter } from "@/lib/types";
import AddListingModal from "./AddListingModal";
import Hero from "./Hero";
import ListingCard from "./ListingCard";
import RoommateProfiles from "./RoommateProfiles";
import StoryModal from "./StoryModal";
import { TIER_STYLES } from "./tiers";

const TIER_ORDER: Record<Tier, number> = { green: 0, orange: 1, red: 2 };

const FILTERS: { id: TierFilter; label: string; active: string }[] = [
  { id: "all", label: "All Listings", active: "bg-stone-900 text-white ring-stone-900" },
  { id: "green", label: TIER_STYLES.green.filterLabel, active: TIER_STYLES.green.filterActive },
  { id: "orange", label: TIER_STYLES.orange.filterLabel, active: TIER_STYLES.orange.filterActive },
  { id: "red", label: TIER_STYLES.red.filterLabel, active: TIER_STYLES.red.filterActive },
];

export default function SettleInApp() {
  const { listings, settings } = useAppState();
  const [filter, setFilter] = useState<TierFilter>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);

  const evaluated = useMemo(
    () =>
      listings
        .map((listing) => ({ listing, evaluation: evaluateListing(listing, settings) }))
        .sort(
          (a, b) =>
            TIER_ORDER[a.evaluation.tier] - TIER_ORDER[b.evaluation.tier] || b.listing.createdAt - a.listing.createdAt,
        ),
    [listings, settings],
  );

  const counts = useMemo(() => {
    const c: Record<TierFilter, number> = { all: evaluated.length, green: 0, orange: 0, red: 0 };
    for (const { evaluation } of evaluated) c[evaluation.tier] += 1;
    return c;
  }, [evaluated]);

  const visible = filter === "all" ? evaluated : evaluated.filter((e) => e.evaluation.tier === filter);
  const hasAllDemos = listings.filter((l) => l.id.startsWith("demo-")).length === 4;

  const openAdd = useCallback(() => setAddOpen(true), []);
  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closeStory = useCallback(() => setStoryOpen(false), []);

  const handleAdd = useCallback((input: ListingInput) => {
    actions.addListing(input);
    setAddOpen(false);
    setFilter("all");
  }, []);

  const handleRemove = useCallback((listing: Listing) => {
    if (window.confirm(`Remove “${listing.title}” from the shortlist?`)) actions.removeListing(listing.id);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-4 sm:px-6 sm:pt-8">
      <Hero
        totalListings={counts.all}
        unanimousCount={counts.green}
        onAddListing={openAdd}
        onOpenStory={() => setStoryOpen(true)}
      />

      <RoommateProfiles
        settings={settings}
        onChange={actions.updateSettings}
        onLoadDefaults={actions.loadDefaultSettings}
      />

      <section aria-labelledby="listings-heading" className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="listings-heading" className="flex items-center gap-2 text-xl font-bold text-stone-900">
              <House className="size-5 text-rose-400" aria-hidden="true" />
              Shortlist
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Sorted so the flats that work for everyone come first. Verdicts update as you tweak the profiles.
            </p>
          </div>
          <div className="flex gap-2">
            {!hasAllDemos && (
              <button
                type="button"
                onClick={actions.restoreDemoListings}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-600 ring-1 ring-stone-200 transition hover:ring-rose-200"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Restore demo flats
              </button>
            )}
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add listing
            </button>
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter listings by verdict"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <Filter className="mt-2 size-4 shrink-0 text-stone-400 max-sm:hidden" aria-hidden="true" />
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                  active ? f.active : "bg-white text-stone-600 ring-stone-200 hover:ring-stone-300"
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-1.5 text-xs ${active ? "bg-white/25" : "bg-stone-100 text-stone-500"}`}
                >
                  {counts[f.id]}
                </span>
              </button>
            );
          })}
        </div>

        {visible.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {visible.map(({ listing, evaluation }) => (
              <ListingCard key={listing.id} listing={listing} evaluation={evaluation} onRemove={handleRemove} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-stone-200 bg-white/60 px-6 py-14 text-center">
            <p className="font-semibold text-stone-700">
              {counts.all === 0 ? "No flats on the shortlist yet." : "No flats in this tier right now."}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {counts.all === 0
                ? "Spotted something promising? Add it and see the verdict instantly."
                : "Try another filter, or add a listing you found today."}
            </p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add a listing
            </button>
          </div>
        )}
      </section>

      <footer className="text-center text-xs text-stone-400">
        Made for Riya, Meera &amp; Kavita. Everything stays in this browser, with no accounts and no API keys.
      </footer>

      <AddListingModal open={addOpen} settings={settings} onClose={closeAdd} onSubmit={handleAdd} />
      <StoryModal open={storyOpen} onClose={closeStory} />
    </main>
  );
}
