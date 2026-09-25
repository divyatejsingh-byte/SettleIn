"use client";

import { Heart, RotateCcw, ShieldAlert, Users } from "lucide-react";
import type { ReactNode } from "react";
import { formatINR } from "@/lib/evaluate";
import { DEFAULT_SETTINGS, MEERA_LIFT_FROM_FLOOR, ROOMMATE_BY_ID } from "@/lib/roommates";
import type { RoommateId, Settings } from "@/lib/types";
import Avatar from "./Avatar";
import NumberField from "./NumberField";

interface RoommateProfilesProps {
  settings: Settings;
  onChange: (patch: (prev: Settings) => Settings) => void;
  onLoadDefaults: () => void;
}

function isDefault(settings: Settings): boolean {
  const d = DEFAULT_SETTINGS;
  return (
    settings.budgets.riya === d.budgets.riya &&
    settings.budgets.meera === d.budgets.meera &&
    settings.budgets.kavita === d.budgets.kavita &&
    settings.kavitaMaxCommute === d.kavitaMaxCommute &&
    settings.riyaMaxGymCommute === d.riyaMaxGymCommute
  );
}

export default function RoommateProfiles({ settings, onChange, onLoadDefaults }: RoommateProfilesProps) {
  const setBudget = (id: RoommateId, value: number) =>
    onChange((prev) => ({ ...prev, budgets: { ...prev.budgets, [id]: value } }));

  const profiles: { id: RoommateId; dealbreaker: ReactNode; preference: ReactNode }[] = [
    {
      id: "meera",
      dealbreaker: (
        <>Must have a working elevator if the flat is on floor {MEERA_LIFT_FROM_FLOOR} or above (knee condition).</>
      ),
      preference: <>Pet-friendly building</>,
    },
    {
      id: "kavita",
      dealbreaker: (
        <div className="space-y-2">
          <p>Hinjewadi commute must be at most:</p>
          <NumberField
            id="kavita-commute"
            aria-label="Kavita's maximum Hinjewadi commute in minutes"
            value={settings.kavitaMaxCommute}
            onCommit={(v) => onChange((prev) => ({ ...prev, kavitaMaxCommute: v }))}
            suffix="mins"
            className="max-w-36"
          />
        </div>
      ),
      preference: <>2+ bathrooms</>,
    },
    {
      id: "riya",
      dealbreaker: <>Must have a dedicated parking space.</>,
      preference: (
        <div className="space-y-2">
          <p>Gym (and family) commute at most:</p>
          <NumberField
            id="riya-gym"
            aria-label="Riya's preferred maximum gym commute in minutes"
            value={settings.riyaMaxGymCommute}
            onCommit={(v) => onChange((prev) => ({ ...prev, riyaMaxGymCommute: v }))}
            suffix="mins"
            className="max-w-36"
          />
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="profiles-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="profiles-heading" className="flex items-center gap-2 text-xl font-bold text-stone-900">
            <Users className="size-5 text-rose-400" aria-hidden="true" />
            Roommate profiles
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Dealbreakers are non-negotiable. Preferences are nice-to-haves that never disqualify a flat.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadDefaults}
          disabled={isDefault(settings)}
          className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 transition hover:ring-rose-200 disabled:cursor-default disabled:opacity-50 sm:self-auto"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Load Roommate Defaults
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {profiles.map(({ id, dealbreaker, preference }) => {
          const roommate = ROOMMATE_BY_ID[id];
          return (
            <article
              key={id}
              className="flex flex-col gap-4 rounded-3xl border border-stone-100 bg-white p-5 shadow-sm"
            >
              <header className="flex items-center gap-3">
                <Avatar roommate={roommate} size={48} className="size-12" />
                <div>
                  <h3 className="font-bold text-stone-900">{roommate.name}</h3>
                  <p className="text-xs text-stone-500">
                    Budget up to {formatINR(settings.budgets[id])}/mo
                  </p>
                </div>
              </header>

              <div>
                <label htmlFor={`budget-${id}`} className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Max rent share
                </label>
                <NumberField
                  id={`budget-${id}`}
                  value={settings.budgets[id]}
                  onCommit={(v) => setBudget(id, v)}
                  step={500}
                  prefix="₹"
                  suffix="/ month"
                  className="mt-1"
                />
              </div>

              <div className="rounded-2xl bg-rose-50/60 p-3 text-sm text-stone-700 ring-1 ring-rose-100">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-500">
                  <ShieldAlert className="size-3.5" aria-hidden="true" /> Dealbreaker
                </p>
                {dealbreaker}
              </div>

              <div className={`rounded-2xl p-3 text-sm text-stone-700 ring-1 ${roommate.theme.soft} ${roommate.theme.ring}`}>
                <p className={`mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${roommate.theme.text}`}>
                  <Heart className="size-3.5" aria-hidden="true" /> Prefers
                </p>
                {preference}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
